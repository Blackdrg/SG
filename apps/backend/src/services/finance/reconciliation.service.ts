import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { PayoutReportEntity, PayoutStatus } from '../../db/entities/payout-report.entity';
import { DriverIncentiveEntity, IncentiveStatus } from '../../db/entities/driver-incentive.entity';
import { GSTDetailEntity } from '../../db/entities/gst-detail.entity';

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(WalletTransactionEntity)
    private transactionRepo: Repository<WalletTransactionEntity>,
    @InjectRepository(PayoutReportEntity)
    private payoutRepo: Repository<PayoutReportEntity>,
    @InjectRepository(DriverIncentiveEntity)
    private incentiveRepo: Repository<DriverIncentiveEntity>,
    @InjectRepository(GSTDetailEntity)
    private gstRepo: Repository<GSTDetailEntity>,
    private dataSource: DataSource,
  ) {}

  async reconcilePayments(startDate: Date, endDate: Date): Promise<any> {
    const orders = await this.orderRepo.find({
      where: { createdAt: Between(startDate, endDate) },
    });

    const transactions = await this.transactionRepo.find({
      where: { createdAt: Between(startDate, endDate) },
    });

    const ordersTotal = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
    const transactionsTotal = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const discrepancies: any[] = [];

    for (const order of orders) {
      const relatedTxns = transactions.filter(t => 
        t.referenceId === order.id || t.description.includes(order.id)
      );

      const orderTotal = Number(order.grandTotal);
      const txnTotal = relatedTxns.reduce((sum, t) => sum + Number(t.amount), 0);

      if (Math.abs(orderTotal - txnTotal) > 1) {
        discrepancies.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          expected: orderTotal,
          actual: txnTotal,
          difference: orderTotal - txnTotal,
        });
      }
    }

    return {
      period: { startDate, endDate },
      totalOrders: orders.length,
      totalTransactions: transactions.length,
      ordersTotal,
      transactionsTotal,
      discrepancies: discrepancies.length,
      discrepancyDetails: discrepancies.slice(0, 20),
      matchRate: discrepancies.length ? ((orders.length - discrepancies.length) / orders.length) * 100 : 100,
    };
  }

  async reconcilePayouts(restaurantId: string, startDate: Date, endDate: Date): Promise<any> {
    const payouts = await this.payoutRepo.find({
      where: {
        restaurantId: restaurantId as any,
        createdAt: Between(startDate, endDate),
      },
    });

    const orders = await this.orderRepo.find({
      where: {
        restaurantId: restaurantId as any,
        createdAt: Between(startDate, endDate),
      },
    });

    const orderTotal = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
    const payoutTotal = payouts.reduce((sum, p) => sum + Number(p.netPayout), 0);

    return {
      restaurantId,
      period: { startDate, endDate },
      orderTotal,
      payoutTotal,
      payoutsGenerated: payouts.length,
      paidPayouts: payouts.filter(p => p.status === PayoutStatus.PAID).length,
      pendingPayouts: payouts.filter(p => p.status === PayoutStatus.PENDING).length,
      variance: orderTotal - payoutTotal,
    };
  }

  async reconcileDriverPayments(driverId: string, startDate: Date, endDate: Date): Promise<any> {
    const incentives = await this.incentiveRepo.find({
      where: {
        driverId: driverId as any,
        createdAt: Between(startDate, endDate),
      },
    });

    const pendingIncentives = incentives.filter(i => i.status === IncentiveStatus.PENDING);
    const paidIncentives = incentives.filter(i => i.status === IncentiveStatus.PAID);

    const pendingTotal = pendingIncentives.reduce((sum, i) => sum + Number(i.amount), 0);
    const paidTotal = paidIncentives.reduce((sum, i) => sum + Number(i.amount), 0);

    return {
      driverId,
      period: { startDate, endDate },
      pendingIncentivesTotal: pendingTotal,
      paidIncentivesTotal: paidTotal,
      pendingCount: pendingIncentives.length,
      paidCount: paidIncentives.length,
    };
  }

  async getGSTReconciliation(restaurantId: string, month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const orders = await this.orderRepo.find({
      where: {
        restaurantId: restaurantId as any,
        createdAt: Between(startDate, endDate),
      },
      relations: ['gstDetail'],
    });

    const gstDetails = orders.filter(o => o.gstDetail).map(o => o.gstDetail);

    return {
      restaurantId,
      period: { month, year },
      totalTaxableValue: gstDetails.reduce((sum, g) => sum + Number(g.taxableValue), 0),
      totalCGST: gstDetails.reduce((sum, g) => sum + Number(g.cgstAmount), 0),
      totalSGST: gstDetails.reduce((sum, g) => sum + Number(g.sgstAmount), 0),
      totalIGST: gstDetails.reduce((sum, g) => sum + Number(g.igstAmount), 0),
      invoicesGenerated: orders.length,
    };
  }

  async runFullReconciliation(dateRange: { start: Date; end: Date }): Promise<any> {
    const [paymentRecon, payoutRecon] = await Promise.all([
      this.reconcilePayments(dateRange.start, dateRange.end),
      this.reconcileDriverPayments('', dateRange.start, dateRange.end),
    ]);

    return {
      paymentReconciliation: paymentRecon,
      payoutReconciliation: payoutRecon,
      overallStatus: this.calculateOverallStatus(paymentRecon, payoutRecon),
    };
  }

  private calculateOverallStatus(payment: any, payout: any): string {
    const paymentMatch = payment.matchRate >= 95;
    const payoutPending = payout.pendingCount === 0;

    if (paymentMatch && payoutPending) return 'healthy';
    if (paymentMatch) return 'warning';
    return 'critical';
  }
}