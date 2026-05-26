import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../payments/payments.service';
import { NotificationService } from '../notifications/notification.service';
import { Like } from 'typeorm';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepo: Repository<WalletEntity>,
    @InjectRepository(WalletTransactionEntity)
    private readonly walletTransactionRepo: Repository<WalletTransactionEntity>,
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
  ) {}

  async getWallet(userId: string): Promise<WalletEntity> {
    let wallet = await this.walletRepo.findOne({ where: { userId } });
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = this.walletRepo.create({
        userId,
        balance: 0,
        currency: this.configService.get<string>('WALLET_DEFAULT_CURRENCY', 'INR'),
      });
      wallet = await this.walletRepo.save(wallet);
    }
    
    return wallet;
  }

  async creditWallet(userId: string, amount: number, description: string, referenceId?: string): Promise<WalletTransactionEntity> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const wallet = await this.getWallet(userId);
    
    // Update wallet balance
    wallet.balance += amount;
    wallet.updatedAt = new Date();
    await this.walletRepo.save(wallet);

    // Create transaction record
    const transaction = this.walletTransactionRepo.create({
      walletId: wallet.id,
      amount,
      type: 'credit',
      description,
      referenceId,
    });

    const savedTransaction = await this.walletTransactionRepo.save(transaction);
    
    // Send notification for significant amounts
    if (amount >= this.configService.get<number>('WALLET_NOTIFICATION_THRESHOLD', 100)) {
      await this.notificationService.sendPush(
        userId,
        'Wallet Credited',
        `₹${amount} has been added to your wallet. New balance: ₹${wallet.balance}`,
        { walletId: wallet.id }
      );
    }

    return savedTransaction;
  }

  async debitWallet(userId: string, amount: number, description: string, referenceId?: string): Promise<WalletTransactionEntity> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const wallet = await this.getWallet(userId);
    
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Update wallet balance
    wallet.balance -= amount;
    wallet.updatedAt = new Date();
    await this.walletRepo.save(wallet);

    // Create transaction record
    const transaction = this.walletTransactionRepo.create({
      walletId: wallet.id,
      amount,
      type: 'debit',
      description,
      referenceId,
    });

    const savedTransaction = await this.walletTransactionRepo.save(transaction);
    
    // Send notification for low balance
    if (wallet.balance < this.configService.get<number>('WALLET_LOW_BALANCE_THRESHOLD', 50)) {
      await this.notificationService.sendPush(
        userId,
        'Low Wallet Balance',
        `Your wallet balance is low: ₹${wallet.balance}. Please add funds to continue using wallet payments.`,
        { walletId: wallet.id }
      );
    }

    return savedTransaction;
  }

  async compensateUser(userId: string, amount: number, reason: string): Promise<WalletTransactionEntity> {
    // This is used for refund rollback or goodwill gestures
    return this.creditWallet(
      userId,
      amount,
      `Compensation: ${reason}`,
      `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }

  async processCODPayment(orderId: string, amount: string | number, userId: string): Promise<boolean> {
    // Convert amount to number if it's a string
    const codAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(codAmount) || codAmount <= 0) {
      throw new BadRequestException('Invalid COD amount');
    }

    try {
      // In a real implementation, this would integrate with delivery partner app
      // to confirm COD collection. For now, we'll simulate success.
      
      // For COD, we don't debit the wallet immediately - we wait for confirmation
      // from delivery that payment was collected
      
      // Create a pending COD transaction record
      const wallet = await this.getWallet(userId);
      
      const transaction = this.walletTransactionRepo.create({
        walletId: wallet.id,
        amount: codAmount,
        type: 'credit', // Will be credited upon successful COD collection
        description: `COD Payment Pending for Order #${orderId}`,
        referenceId: orderId,
      });
      
      await this.walletTransactionRepo.save(transaction);
      
      // In production, this would trigger a notification to delivery partner
      // to collect COD from customer
      
      return true;
    } catch (error) {
      this.logger.error(`COD processing failed for order ${orderId}:`, error);
      return false;
    }
  }

  async confirmCODCollection(orderId: string, amount: string | number, userId: string): Promise<WalletTransactionEntity> {
    // Confirm that COD was successfully collected from customer
    const codAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(codAmount) || codAmount <= 0) {
      throw new BadRequestException('Invalid COD amount');
    }

    const wallet = await this.getWallet(userId);
    
    // Find the pending COD transaction
    const pendingTransaction = await this.walletTransactionRepo.findOne({
      where: {
        walletId: wallet.id,
        referenceId: orderId,
        description: Like(`%COD Payment Pending%`),
      },
      order: { createdAt: 'DESC' },
    });

    if (!pendingTransaction) {
      throw new NotFoundException('No pending COD transaction found for this order');
    }

    // Update the transaction to reflect actual collection
    pendingTransaction.amount = codAmount;
    pendingTransaction.description = `COD Payment Collected for Order #${orderId}`;
    // Note: We don't change type from credit to debit here because
    // the wallet already received the funds when COD was confirmed
    
    const updatedTransaction = await this.walletTransactionRepo.save(pendingTransaction);
    
    // Update wallet balance (add the COD amount)
    wallet.balance += codAmount;
    wallet.updatedAt = new Date();
    await this.walletRepo.save(wallet);
    
    // Send notification
    await this.notificationService.sendPush(
      userId,
      'COD Payment Confirmed',
      `Your COD payment of ₹${codAmount} for order #${orderId} has been confirmed. Wallet balance: ₹${wallet.balance}`,
      { walletId: wallet.id }
    );
    
    return updatedTransaction;
  }

  async refundCOD(orderId: string, amount: string | number, userId: string, reason: string): Promise<WalletTransactionEntity> {
    // Refund a COD transaction (when order is cancelled after COD confirmation)
    const codAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(codAmount) || codAmount <= 0) {
      throw new BadRequestException('Invalid COD amount');
    }

    const wallet = await this.getWallet(userId);
    
    // Find the confirmed COD transaction
    const codTransaction = await this.walletTransactionRepo.findOne({
      where: {
        walletId: wallet.id,
        referenceId: orderId,
        description: Like(`%COD Payment Collected%`),
      },
      order: { createdAt: 'DESC' },
    });

    if (!codTransaction) {
      throw new NotFoundException('No confirmed COD transaction found for this order');
    }

    // Debit the wallet for the refund
    return this.debitWallet(
      userId,
      codAmount,
      `COD Refund: ${reason}`,
      `COD-REF-${orderId}-${Date.now()}`
    );
  }

  async getWalletTransactions(userId: string, limit: number = 20, offset: number = 0): Promise<WalletTransactionEntity[]> {
    const wallet = await this.getWallet(userId);
    
    return await this.walletTransactionRepo.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getWalletBalance(userId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await this.getWallet(userId);
    return {
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }

  async preventDoublePayment(userId: string, orderId: string, amount: number): Promise<boolean> {
    // Check for recent payments for the same order/user combination
    const recentTransactions = await this.walletTransactionRepo.find({
      where: {
        walletId: (await this.getWallet(userId)).id,
        referenceId: orderId,
        createdAt: new Date(Date.now() - 300000), // Last 5 minutes
      },
    });

    // If we already have a successful transaction for this order recently, flag as potential duplicate
    if (recentTransactions.length > 0) {
      const successfulTransactions = recentTransactions.filter(t => 
        t.description.toLowerCase().includes('confirmed') || 
        t.description.toLowerCase().includes('completed')
      );
      
      if (successfulTransactions.length > 0) {
        this.logger.warn(`Potential duplicate payment detected for user ${userId}, order ${orderId}`);
        return false; // Indicates potential duplicate
      }
    }
    
    return true; // No duplicate detected
  }

  async reconcilePayments(): Promise<{ 
    totalProcessed: number; 
    successful: number; 
    failed: number; 
    discrepancies: Array<{ orderId: string; expected: number; actual: number }> 
  }> {
    // This would be run as a periodic job to reconcile payment records
    // between our database, payment gateway, and wallet transactions
    
    // For now, returning a placeholder implementation
    // In production, this would:
    // 1. Fetch all payment records from Stripe/Payment gateway for a period
    // 2. Compare with our order payment statuses
    // 3. Compare with wallet transactions
    // 4. Identify and flag discrepancies
    // 5. Auto-correct where possible or alert for manual intervention
    
    return {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      discrepancies: [],
    };
  }
}