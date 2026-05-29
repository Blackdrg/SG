import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { GSTDetailEntity } from '../../db/entities/gst-detail.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantGSTEntity } from '../../db/entities/restaurant-gst.entity';
import { OrderItemEntity } from '../../db/entities/order-item.entity';

@Injectable()
export class TaxReportingService {
  private readonly logger = new Logger(TaxReportingService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(GSTDetailEntity)
    private gstDetailRepo: Repository<GSTDetailEntity>,
    @InjectRepository(RestaurantEntity)
    private restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(RestaurantGSTEntity)
    private restaurantGstRepo: Repository<RestaurantGSTEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepo: Repository<OrderItemEntity>,
    private dataSource: DataSource,
  ) {}

  async generateGSTReport(restaurantId: string, month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const orders = await this.orderRepo.find({
      where: {
        restaurantId: restaurantId as any,
        createdAt: Between(startDate, endDate),
      },
      relations: ['gstDetail', 'items', 'items.menuItem'],
    });

    const gstDetails = orders
      .filter(o => o.gstDetail)
      .map(o => o.gstDetail);

    const summary = {
      period: { month, year },
      totalTaxableValue: gstDetails.reduce((sum, g) => sum + Number(g.taxableValue), 0),
      totalCGST: gstDetails.reduce((sum, g) => sum + Number(g.cgstAmount), 0),
      totalSGST: gstDetails.reduce((sum, g) => sum + Number(g.sgstAmount), 0),
      totalIGST: gstDetails.reduce((sum, g) => sum + Number(g.igstAmount), 0),
      totalGST: gstDetails.reduce((sum, g) => sum + Number(g.totalGstAmount), 0),
      totalInvoices: orders.length,
      hsnWise: await this.getHSNBreakdown(orders),
    };

    return {
      summary,
      invoices: orders.map(o => ({
        invoiceNumber: `INV-${o.id}`,
        date: o.createdAt,
        orderNumber: o.orderNumber,
        taxableValue: o.gstDetail?.taxableValue || 0,
        cgstAmount: o.gstDetail?.cgstAmount || 0,
        sgstAmount: o.gstDetail?.sgstAmount || 0,
        igstAmount: o.gstDetail?.igstAmount || 0,
        totalGST: o.gstDetail?.totalGstAmount || 0,
      })),
    };
  }

  private async getHSNBreakdown(orders: any[]): Promise<any[]> {
    const hsnMap = new Map<string, {
      hsnCode: string;
      taxableValue: number;
      cgst: number;
      sgst: number;
      igst: number;
      total: number;
      quantity: number;
    }>();

    for (const order of orders) {
      if (!order.gstDetail) continue;

      for (const item of order.items) {
        const hsnCode = item.hsnSac?.hsnCode || 'NOT_SPECIFIED';
        const existing = hsnMap.get(hsnCode) || {
          hsnCode,
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: 0,
          quantity: 0,
        };

        existing.taxableValue += Number(item.totalPrice);
        existing.cgst += Number(item.cgstAmount || 0);
        existing.sgst += Number(item.sgstAmount || 0);
        existing.igst += Number(item.igstAmount || 0);
        existing.total += Number(item.totalTax || 0);
        existing.quantity += item.quantity;

        hsnMap.set(hsnCode, existing);
      }
    }

    return Array.from(hsnMap.values());
  }

  async exportGSTR1(restaurantId: string, month: number, year: number): Promise<any[]> {
    const report = await this.generateGSTReport(restaurantId, month, year);
    return report.invoices.map((inv: any) => ({
      'Invoice Number': inv.invoiceNumber,
      'Invoice Date': inv.date,
      'Customer Name': 'Customer',
      'Customer GSTIN': '',
      'Taxable Value': inv.taxableValue,
      'CGST Rate': inv.cgstAmount ? 9 : 0,
      'CGST Amount': inv.cgstAmount,
      'SGST Rate': inv.sgstAmount ? 9 : 0,
      'SGST Amount': inv.sgstAmount,
      'IGST Rate': inv.igstAmount ? 18 : 0,
      'IGST Amount': inv.igstAmount,
      'Total Tax': inv.totalGST,
    }));
  }

  async getTaxLiability(reportingMonth: Date): Promise<any> {
    const month = reportingMonth.getMonth() + 1;
    const year = reportingMonth.getFullYear();

    const orders = await this.orderRepo.find({
      where: { createdAt: Between(new Date(year, month - 1, 1), new Date(year, month, 0)) },
      relations: ['gstDetail'],
    });

    const totalGST = orders.reduce((sum, o) => sum + Number(o.tax || 0), 0);
    const taxReceivable = totalGST;
    const taxPayable = totalGST; // In real scenario, this would include input credits

    return {
      reportingPeriod: { month, year },
      taxReceivable,
      taxPayable,
      netLiability: taxPayable - taxReceivable,
      ordersCount: orders.length,
    };
  }

  async getMonthlyTaxSummary(restaurantId: string, months: number = 12): Promise<any[]> {
    const summaries = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      summaries.push(await this.generateGSTReport(restaurantId, date.getMonth() + 1, date.getFullYear()));
    }

    return summaries;
  }
}