import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  async placeOrder(@Body() body: any) {
    return this.orderService.placeOrder(body);
  }

  @Get('health')
  async healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
