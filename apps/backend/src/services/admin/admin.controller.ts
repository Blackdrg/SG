import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('stats')
  async getFullStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('orders')
  async getOrders(@Query('page') page: string, @Query('limit') limit: string) {
    return this.adminService.getAllOrders(Number(page) || 1, Number(limit) || 10);
  }

  @Post('users/ban')
  async banUser(@Body() body: { userId: string; reason: string }, @Req() req: any) {
    return this.adminService.banUser(body.userId, req.user.userId, body.reason);
  }
}
