import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../security/jwt-auth.guard';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('top-dishes')
  @ApiOperation({ summary: 'Get top selling dishes' })
  getTopDishes(@Query('restaurantId') restaurantId?: string, @Query('period') period = '30') {
    return this.analyticsService.getTopDishes(restaurantId, parseInt(period));
  }

  @Get('churn')
  @ApiOperation({ summary: 'Get churn analysis' })
  getChurnAnalysis(@Query('restaurantId') restaurantId?: string, @Query('period') period = '90') {
    return this.analyticsService.getChurnAnalysis(restaurantId, parseInt(period));
  }

  @Get('repeat-users')
  @ApiOperation({ summary: 'Get repeat user analytics' })
  getRepeatUsers(@Query('restaurantId') restaurantId?: string, @Query('period') period = '90') {
    return this.analyticsService.getRepeatUsers(restaurantId, parseInt(period));
  }

  @Get('conversion')
  @ApiOperation({ summary: 'Get conversion funnel' })
  getConversion(@Query('restaurantId') restaurantId?: string, @Query('period') period = '30') {
    return this.analyticsService.getConversionRate(restaurantId, parseInt(period));
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Get delivery heatmap' })
  getHeatmap(@Query('restaurantId') restaurantId?: string, @Query('period') period = '30') {
    return this.analyticsService.getDeliveryHeatmap(restaurantId, parseInt(period));
  }

  @Get('peak-hours')
  @ApiOperation({ summary: 'Get peak hours analysis' })
  getPeakHours(@Query('restaurantId') restaurantId?: string, @Query('period') period = '30') {
    return this.analyticsService.getPeakHours(restaurantId, parseInt(period));
  }

  @Get('restaurant/:id')
  @ApiOperation({ summary: 'Get full restaurant analytics' })
  getRestaurantAnalytics(@Param('id') id: string) {
    return this.analyticsService.getRestaurantAnalytics(id);
  }

  @Get('platform')
  @ApiOperation({ summary: 'Get platform-wide analytics' })
  getPlatformAnalytics() {
    return this.analyticsService.getPlatformAnalytics();
  }
}
