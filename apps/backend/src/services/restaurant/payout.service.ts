import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { PayoutReportEntity, PayoutStatus } from '../../db/entities/payout-report.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { CommissionRuleEntity } from '../../db/entities/commission-rule.entity';
import { GSTDetailEntity } from '../../db/entities/gst-detail.entity';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    @InjectRepository(PayoutReportEntity)
    private payoutRepo: Repository<PayoutReportEntity>,
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(RestaurantEntity)
    private restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(CommissionRuleEntity)
    private commissionRepo: Repository<CommissionRuleEntity>,
    @InjectRepository(GSTDetailEntity)
    private gstRepo: Repository<GSTDetailEntity>,
    private dataSource: DataSource,
  ) {}

  async generatePayoutReport(
    restaurantId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<PayoutReportEntity> {
    const orders = await this.orderRepo.find({
      where: {
        restaurantId: restaurantId as any,
        status: In([OrderStatus.DELIVERED]),
        createdAt: Between(periodStart, periodEnd),
      },
      relations: ['gstDetail'],
    });

    const grossSales = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

    const commissionRules = await this.commissionRepo.find({
      where: {
        restaurantId: restaurantId as any,
        status: 'active' as any,
      },
    });

    let platformCommission = grossSales * 0.15;
    if (commissionRules.length > 0) {
      const applicableRule = commissionRules[0];
      if (applicableRule.type === 'percentage') {
        platformCommission = grossSales * (Number(applicableRule.value) / 100);
      } else {
        platformCommission = Number(applicableRule.value) * orders.length;
      }
    }

    const gstAmount = orders.reduce((sum, o) => sum + Number(o.gst || 0), 0);

    const netPayout = grossSales - platformCommission - gstAmount;

    const payout = this.payoutRepo.create({
      restaurantId,
      periodStart,
      periodEnd,
      grossSales,
      platformCommission,
      gstAmount,
      cancellationFees: 0,
      incentives: 0,
      penalties: 0,
      netPayout,
      status: PayoutStatus.PENDING,
      orderBreakdown: {
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
        cancelledOrders: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
        refundedOrders: orders.filter(o => o.paymentStatus === PaymentStatus.REFUNDED).length,
      },
      paymentBreakdown: {
        onlinePayments: orders.filter(o => o.paymentStatus === PaymentStatus.COMPLETED).length,
        codPayments: 0,
        walletPayments: 0,
      },
    });

    return this.payoutRepo.save(payout);
  }

  async getPayoutHistory(restaurantId: string, limit: number = 10): Promise<PayoutReportEntity[]> {
    return this.payoutRepo.find({
      where: { restaurantId: restaurantId as any },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async processPayout(payoutId: string, reference: string): Promise<PayoutReportEntity> {
    const payout = await this.payoutRepo.findOne({ where: { id: payoutId } });
    if (!payout) {
      throw new Error('Payout not found');
    }

    await this.payoutRepo.update(payoutId, {
      status: PayoutStatus.PROCESSING,
      payoutReference: reference,
      payoutDate: new Date(),
    });

    return this.payoutRepo.findOne({ where: { id: payoutId } });
  }

  async getPendingPayouts(restaurantId?: string): Promise<PayoutReportEntity[]> {
    const where: any = { status: PayoutStatus.PENDING };
    if (restaurantId) {
      where.restaurantId = restaurantId as any;
    }

    return this.payoutRepo.find({
      where,
      relations: ['restaurant'],
      order: { createdAt: 'ASC' },
    });
  }

  async getPayoutSummary(restaurantId: string, month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const payouts = await this.payoutRepo.find({
      where: {
        restaurantId: restaurantId as any,
        periodStart: Between(startDate, endDate),
      },
    });

    return {
      totalGrossSales: payouts.reduce((sum, p) => sum + Number(p.grossSales), 0),
      totalCommission: payouts.reduce((sum, p) => sum + Number(p.platformCommission), 0),
      totalGST: payouts.reduce((sum, p) => sum + Number(p.gstAmount), 0),
      totalNetPayout: payouts.reduce((sum, p) => sum + Number(p.netPayout), 0),
      pendingPayouts: payouts.filter(p => p.status === PayoutStatus.PENDING).length,
      paidPayouts: payouts.filter(p => p.status === PayoutStatus.PAID).length,
    };
  }
}

function In(values: any[]): any {
  return values;
}