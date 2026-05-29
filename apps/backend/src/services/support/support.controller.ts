import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CustomerSupportService } from './customer-support.service';
import { TicketRoutingService } from './ticket-routing.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPPORT_STAFF)
export class SupportController {
  constructor(
    private supportService: CustomerSupportService,
    private routingService: TicketRoutingService,
  ) {}

  @Post('disputes')
  async raiseDispute(@Body() body: { orderId: string; customerId: string; type: string; description: string }) {
    return this.supportService.raiseDispute(body.orderId, body.customerId, body.type as any, body.description);
  }

  @Get('disputes')
  async getDisputes(@Query() query: any) {
    return this.supportService.getDisputes(query);
  }

  @Put('disputes/:id/review')
  async reviewDispute(@Param('id') id: string, @Body() body: any) {
    return this.supportService.reviewDispute(id, body.reviewerId, body.status, body.notes);
  }

  @Post('refunds')
  async requestRefund(@Body() body: { orderId: string; requestedBy: string; type: string; amount: number; reason: string }) {
    return this.supportService.requestRefund(body.orderId, body.requestedBy, body.type as any, body.amount, body.reason);
  }

  @Put('refunds/:id/process')
  async processRefund(@Param('id') id: string, @Body() body: { processedBy: string; paymentReference?: string }) {
    return this.supportService.processRefund(id, body.processedBy, body.paymentReference);
  }

  @Get('tickets/stats')
  async getQueueStats() {
    return this.routingService.getQueueStats();
  }

  @Post('tickets/:id/route')
  async routeTicket(@Param('id') id: string) {
    return this.routingService.routeTicket(id);
  }

  @Post('tickets/:id/escalate')
  async escalateTicket(@Param('id') id: string, @Body() body: { level?: number }) {
    return this.routingService.escalateTicket(id, body.level || 1);
  }
}