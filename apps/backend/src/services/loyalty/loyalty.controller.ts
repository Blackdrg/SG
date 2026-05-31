import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';

@ApiTags('loyalty')
@ApiBearerAuth()
@Controller('loyalty')
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post('coupons')
  @ApiOperation({ summary: 'Create a new coupon' })
  createCoupon(@Body() data: any) {
    return this.loyaltyService.createCoupon(data);
  }

  @Post('coupons/apply')
  @ApiOperation({ summary: 'Apply coupon to order' })
  applyCoupon(@Body() body: { code: string; userId: string; orderAmount: number; orderId?: string }) {
    return this.loyaltyService.applyCoupon(body.code, body.userId, body.orderAmount, body.orderId);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'Get all coupons' })
  getCoupons(@Query() filters: any) {
    return this.loyaltyService.getAllCoupons(filters);
  }

  @Get('coupons/:id/analytics')
  @ApiOperation({ summary: 'Get coupon analytics' })
  getCouponAnalytics(@Param('id') id: string) {
    return this.loyaltyService.getCouponAnalytics(id);
  }

  @Put('coupons/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate coupon' })
  deactivateCoupon(@Param('id') id: string) {
    return this.loyaltyService.deactivateCoupon(id);
  }

  @Post('referrals/code')
  @ApiOperation({ summary: 'Generate referral code' })
  generateReferralCode(@Body() body: { userId: string }) {
    return this.loyaltyService.generateReferralCode(body.userId);
  }

  @Post('referrals/process')
  @ApiOperation({ summary: 'Process referral' })
  processReferral(@Body() body: { code: string; refereeId: string; firstOrderId: string }) {
    return this.loyaltyService.processReferral(body.code, body.refereeId, body.firstOrderId);
  }

  @Get('referrals/:userId')
  @ApiOperation({ summary: 'Get referral history' })
  getReferralHistory(@Param('userId') userId: string) {
    return this.loyaltyService.getReferralHistory(userId);
  }

  @Post('cashback/process')
  @ApiOperation({ summary: 'Process cashback for order' })
  processCashback(@Body() body: { userId: string; orderId: string; orderAmount: number }) {
    return this.loyaltyService.processCashback(body.userId, body.orderId, body.orderAmount);
  }

  @Get('cashback/:userId')
  @ApiOperation({ summary: 'Get user cashback summary' })
  getWalletCashback(@Param('userId') userId: string) {
    return this.loyaltyService.getWalletCashback(userId);
  }
}
