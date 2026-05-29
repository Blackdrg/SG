import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { DisputeEntity, DisputeType, DisputeStatus } from '../../db/entities/dispute.entity';
import { RefundEntity, RefundStatus, RefundType } from '../../db/entities/refund.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { WalletService } from '../wallet/wallet.service';
import { PaymentService } from '../payments/payments.service';

@Injectable()
export class CustomerSupportService {
  private readonly logger = new Logger(CustomerSupportService.name);

  constructor(
    @InjectRepository(DisputeEntity)
    private disputeRepo: Repository<DisputeEntity>,
    @InjectRepository(RefundEntity)
    private refundRepo: Repository<RefundEntity>,
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    private walletService: WalletService,
    private paymentService: PaymentService,
    private dataSource: DataSource,
  ) {}

  async raiseDispute(
    orderId: string,
    customerId: string,
    type: DisputeType,
    description: string,
    evidence?: any,
  ): Promise<DisputeEntity> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const existingDispute = await this.disputeRepo.findOne({
      where: { orderId: orderId as any, status: DisputeStatus.RAISED } as any,
    });
    if (existingDispute) {
      throw new BadRequestException('Dispute already exists for this order');
    }

    const dispute = this.disputeRepo.create({
      orderId,
      customerId,
      restaurantId: order.restaurantId,
      driverId: order.driverId,
      type,
      description,
      evidence: evidence || {},
    });

    return this.disputeRepo.save(dispute);
  }

  async getDisputes(filter?: {
    status?: DisputeStatus;
    customerId?: string;
    restaurantId?: string;
    driverId?: string;
  }): Promise<DisputeEntity[]> {
    const where: any = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.customerId) where.customerId = filter.customerId as any;
    if (filter?.restaurantId) where.restaurantId = filter.restaurantId as any;
    if (filter?.driverId) where.driverId = filter.driverId as any;

    return this.disputeRepo.find({
      where,
      order: { createdAt: 'DESC' } as any,
    });
  }

  async reviewDispute(
    disputeId: string,
    reviewerId: string,
    status: DisputeStatus,
    notes?: string,
    creditAmount?: number,
  ): Promise<DisputeEntity> {
    const dispute = await this.disputeRepo.findOne({ where: { id: disputeId } });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    await this.disputeRepo.update(disputeId, {
      status,
      resolutionNotes: notes,
      resolvedBy: reviewerId,
      resolvedAt: new Date(),
      creditAmount: creditAmount || dispute.creditAmount,
    });

    if (status === DisputeStatus.RESOLVED_CREDIT || status === DisputeStatus.RESOLVED_REFUND) {
      await this.initiateRefund(disputeId, reviewerId, creditAmount || 0, status);
    }

    return this.disputeRepo.findOne({ where: { id: disputeId } });
  }

  private async initiateRefund(
    disputeId: string,
    initiatedBy: string,
    amount: number,
    disputeStatus: DisputeStatus,
  ): Promise<void> {
    const dispute = await this.disputeRepo.findOne({ where: { id: disputeId } });

    const refund = this.refundRepo.create({
      orderId: dispute.orderId,
      requestedBy: initiatedBy,
      type: disputeStatus === DisputeStatus.RESOLVED_CREDIT
        ? RefundType.CUSTOMER_REFUND
        : RefundType.RESTAURANT_PENALTY,
      amount,
      status: RefundStatus.PROCESSED,
      approvalNotes: `Auto-approved via dispute resolution`,
      approvedBy: initiatedBy,
      approvedAt: new Date(),
    });

    await this.refundRepo.save(refund);
  }

  async requestRefund(
    orderId: string,
    requestedBy: string,
    type: RefundType,
    amount: number,
    reason: string,
    evidence?: any,
  ): Promise<RefundEntity> {
    const refund = this.refundRepo.create({
      orderId,
      requestedBy,
      type,
      amount,
      reason,
      evidence: evidence || {},
    });

    return this.refundRepo.save(refund);
  }

  async processRefund(
    refundId: string,
    processedBy: string,
    paymentReference?: string,
  ): Promise<RefundEntity> {
    const refund = await this.refundRepo.findOne({ where: { id: refundId } });
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    const order = await this.orderRepo.findOne({ where: { id: refund.orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.refundRepo.update(refundId, {
      status: RefundStatus.PROCESSED,
      processedBy,
      processedAt: new Date(),
      paymentReference,
    });

    await this.walletService.creditWallet(
      order.userId,
      refund.amount,
      `Refund for order #${order.orderNumber}: ${refund.reason}`,
    );

    return this.refundRepo.findOne({ where: { id: refundId } });
  }

  async getRefunds(filter?: {
    status?: RefundStatus;
    orderId?: string;
  }): Promise<RefundEntity[]> {
    const where: any = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.orderId) where.orderId = filter.orderId as any;

    return this.refundRepo.find({
      where,
      order: { createdAt: 'DESC' } as any,
    });
  }

  async getDisputeStats(startDate?: Date, endDate?: Date): Promise<any> {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const [
      totalDisputes,
      resolvedCredit,
      resolvedRefund,
      avgResolutionTime,
    ] = await Promise.all([
      this.disputeRepo.count({ where }),
      this.disputeRepo.count({ where: { ...where, status: DisputeStatus.RESOLVED_CREDIT } as any }),
      this.disputeRepo.count({ where: { ...where, status: DisputeStatus.RESOLVED_REFUND } as any }),
      this.getAverageResolutionTime(where),
    ]);

    return {
      totalDisputes,
      creditDisputes: resolvedCredit,
      refundDisputes: resolvedRefund,
      avgResolutionHours: avgResolutionTime,
    };
  }

  private async getAverageResolutionTime(where: any): Promise<number> {
    const result = await this.disputeRepo
      .createQueryBuilder('dispute')
      .select('AVG(TIMESTAMPDIFF(HOUR, dispute.createdAt, dispute.resolvedAt))', 'avgHours')
      .where('dispute.resolvedAt IS NOT NULL')
      .getRawOne();

    return result?.avgHours || 0;
  }
}