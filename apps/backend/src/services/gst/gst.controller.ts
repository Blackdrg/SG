import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { GSTService } from './gst.service';
import { OrderEntity } from '../../db/entities/order.entity';

@Controller('gst')
export class GSTController {
  constructor(private readonly gstService: GSTService) {}

  @Post('calculate/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT)
  async calculateGST(@Param('orderId') orderId: string) {
    return this.gstService.calculateGSTForOrder(orderId);
  }

  @Get('invoice/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.ADMIN, UserRole.RESTAURANT, UserRole.CUSTOMER)
  async generateGSTInvoice(@Param('orderId') orderId: string) {
    return this.gstService.generateGSTInvoice(orderId);
  }

  @Get('rate-summary/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT)
  async getGSTRateSummary(@Param('orderId') orderId: string) {
    return this.gstService.getGSTRateSummary(orderId);
  }

  @Post('validate-gstin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RESTAURANT)
  validateGSTIN(@Body('gstin') gstin: string) {
    return { valid: this.gstService.validateGSTIN(gstin) };
  }
}