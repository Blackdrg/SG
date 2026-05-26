"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("../../db/entities/wallet.entity");
const wallet_transaction_entity_1 = require("../../db/entities/wallet-transaction.entity");
const config_1 = require("@nestjs/config");
const payments_service_1 = require("../payments/payments.service");
const notification_service_1 = require("../notifications/notification.service");
const typeorm_3 = require("typeorm");
let WalletService = WalletService_1 = class WalletService {
    constructor(walletRepo, walletTransactionRepo, configService, paymentService, notificationService) {
        this.walletRepo = walletRepo;
        this.walletTransactionRepo = walletTransactionRepo;
        this.configService = configService;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(WalletService_1.name);
    }
    async getWallet(userId) {
        let wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) {
            wallet = this.walletRepo.create({
                userId,
                balance: 0,
                currency: this.configService.get('WALLET_DEFAULT_CURRENCY', 'INR'),
            });
            wallet = await this.walletRepo.save(wallet);
        }
        return wallet;
    }
    async creditWallet(userId, amount, description, referenceId) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than zero');
        }
        const wallet = await this.getWallet(userId);
        wallet.balance += amount;
        wallet.updatedAt = new Date();
        await this.walletRepo.save(wallet);
        const transaction = this.walletTransactionRepo.create({
            walletId: wallet.id,
            amount,
            type: 'credit',
            description,
            referenceId,
        });
        const savedTransaction = await this.walletTransactionRepo.save(transaction);
        if (amount >= this.configService.get('WALLET_NOTIFICATION_THRESHOLD', 100)) {
            await this.notificationService.sendPush(userId, 'Wallet Credited', `₹${amount} has been added to your wallet. New balance: ₹${wallet.balance}`, { walletId: wallet.id });
        }
        return savedTransaction;
    }
    async debitWallet(userId, amount, description, referenceId) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than zero');
        }
        const wallet = await this.getWallet(userId);
        if (wallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient wallet balance');
        }
        wallet.balance -= amount;
        wallet.updatedAt = new Date();
        await this.walletRepo.save(wallet);
        const transaction = this.walletTransactionRepo.create({
            walletId: wallet.id,
            amount,
            type: 'debit',
            description,
            referenceId,
        });
        const savedTransaction = await this.walletTransactionRepo.save(transaction);
        if (wallet.balance < this.configService.get('WALLET_LOW_BALANCE_THRESHOLD', 50)) {
            await this.notificationService.sendPush(userId, 'Low Wallet Balance', `Your wallet balance is low: ₹${wallet.balance}. Please add funds to continue using wallet payments.`, { walletId: wallet.id });
        }
        return savedTransaction;
    }
    async compensateUser(userId, amount, reason) {
        return this.creditWallet(userId, amount, `Compensation: ${reason}`, `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    }
    async processCODPayment(orderId, amount, userId) {
        const codAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(codAmount) || codAmount <= 0) {
            throw new common_1.BadRequestException('Invalid COD amount');
        }
        try {
            const wallet = await this.getWallet(userId);
            const transaction = this.walletTransactionRepo.create({
                walletId: wallet.id,
                amount: codAmount,
                type: 'credit',
                description: `COD Payment Pending for Order #${orderId}`,
                referenceId: orderId,
            });
            await this.walletTransactionRepo.save(transaction);
            return true;
        }
        catch (error) {
            this.logger.error(`COD processing failed for order ${orderId}:`, error);
            return false;
        }
    }
    async confirmCODCollection(orderId, amount, userId) {
        const codAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(codAmount) || codAmount <= 0) {
            throw new common_1.BadRequestException('Invalid COD amount');
        }
        const wallet = await this.getWallet(userId);
        const pendingTransaction = await this.walletTransactionRepo.findOne({
            where: {
                walletId: wallet.id,
                referenceId: orderId,
                description: (0, typeorm_3.Like)(`%COD Payment Pending%`),
            },
            order: { createdAt: 'DESC' },
        });
        if (!pendingTransaction) {
            throw new common_1.NotFoundException('No pending COD transaction found for this order');
        }
        pendingTransaction.amount = codAmount;
        pendingTransaction.description = `COD Payment Collected for Order #${orderId}`;
        const updatedTransaction = await this.walletTransactionRepo.save(pendingTransaction);
        wallet.balance += codAmount;
        wallet.updatedAt = new Date();
        await this.walletRepo.save(wallet);
        await this.notificationService.sendPush(userId, 'COD Payment Confirmed', `Your COD payment of ₹${codAmount} for order #${orderId} has been confirmed. Wallet balance: ₹${wallet.balance}`, { walletId: wallet.id });
        return updatedTransaction;
    }
    async refundCOD(orderId, amount, userId, reason) {
        const codAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(codAmount) || codAmount <= 0) {
            throw new common_1.BadRequestException('Invalid COD amount');
        }
        const wallet = await this.getWallet(userId);
        const codTransaction = await this.walletTransactionRepo.findOne({
            where: {
                walletId: wallet.id,
                referenceId: orderId,
                description: (0, typeorm_3.Like)(`%COD Payment Collected%`),
            },
            order: { createdAt: 'DESC' },
        });
        if (!codTransaction) {
            throw new common_1.NotFoundException('No confirmed COD transaction found for this order');
        }
        return this.debitWallet(userId, codAmount, `COD Refund: ${reason}`, `COD-REF-${orderId}-${Date.now()}`);
    }
    async getWalletTransactions(userId, limit = 20, offset = 0) {
        const wallet = await this.getWallet(userId);
        return await this.walletTransactionRepo.find({
            where: { walletId: wallet.id },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async getWalletBalance(userId) {
        const wallet = await this.getWallet(userId);
        return {
            balance: wallet.balance,
            currency: wallet.currency,
        };
    }
    async preventDoublePayment(userId, orderId, amount) {
        const recentTransactions = await this.walletTransactionRepo.find({
            where: {
                walletId: (await this.getWallet(userId)).id,
                referenceId: orderId,
                createdAt: new Date(Date.now() - 300000),
            },
        });
        if (recentTransactions.length > 0) {
            const successfulTransactions = recentTransactions.filter(t => t.description.toLowerCase().includes('confirmed') ||
                t.description.toLowerCase().includes('completed'));
            if (successfulTransactions.length > 0) {
                this.logger.warn(`Potential duplicate payment detected for user ${userId}, order ${orderId}`);
                return false;
            }
        }
        return true;
    }
    async reconcilePayments() {
        return {
            totalProcessed: 0,
            successful: 0,
            failed: 0,
            discrepancies: [],
        };
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.WalletEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_transaction_entity_1.WalletTransactionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        payments_service_1.PaymentService,
        notification_service_1.NotificationService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map