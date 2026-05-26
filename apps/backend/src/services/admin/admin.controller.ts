import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getStats(@Query() query: any) {
    return this.adminService.getDashboardStats(query.branchId);
  }

  @Get('stats')
  async getFullStats(@Query() query: any) {
    return this.adminService.getDashboardStats(query.branchId);
  }

  @Get('orders')
  async getOrders(@Query('page') page: string, @Query('limit') limit: string) {
    return this.adminService.getAllOrders(Number(page) || 1, Number(limit) || 10);
  }

  @Post('users/ban')
  async banUser(@Body() body: { userId: string; reason: string }, @Req() req: any) {
    return this.adminService.banUser(body.userId, body.reason);
  }
}
