import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { TaxReportingService } from './tax-reporting.service';
import { ReconciliationService } from './reconciliation.service';

@Controller('finance')
export class FinanceController {
  constructor(
    private taxService: TaxReportingService,
    private reconciliationService: ReconciliationService,
  ) {}

  @Get('gst/report')
  async getGSTReport(
    @Query('restaurantId') restaurantId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.taxService.generateGSTReport(
      restaurantId,
      Number(month),
      Number(year),
    );
  }

  @Post('reconciliation/payments')
  async reconcilePayments(@Body() body: { startDate: string; endDate: string }) {
    return this.reconciliationService.reconcilePayments(
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Post('reconciliation/payouts')
  async reconcilePayouts(
    @Body() body: { restaurantId: string; startDate: string; endDate: string },
  ) {
    return this.reconciliationService.reconcilePayouts(
      body.restaurantId,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Post('reconciliation/driver')
  async reconcileDriverPayments(
    @Body() body: { driverId: string; startDate: string; endDate: string },
  ) {
    return this.reconciliationService.reconcileDriverPayments(
      body.driverId,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }

  @Post('reconciliation/full')
  async runFullReconciliation(@Body() body: { startDate: string; endDate: string }) {
    return this.reconciliationService.runFullReconciliation({
      start: new Date(body.startDate),
      end: new Date(body.endDate),
    });
  }
}