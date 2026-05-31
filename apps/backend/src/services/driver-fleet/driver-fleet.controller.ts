import { Controller, Post, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DriverFleetService } from './driver-fleet.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';

@ApiTags('driver-fleet')
@ApiBearerAuth()
@Controller('fleet')
@UseGuards(JwtAuthGuard)
export class DriverFleetController {
  constructor(private readonly fleetService: DriverFleetService) {}

  @Post('shifts/start')
  @ApiOperation({ summary: 'Start a driver shift' })
  startShift(@Body('driverId') driverId: string) {
    return this.fleetService.startShift(driverId);
  }

  @Post('shifts/end')
  @ApiOperation({ summary: 'End a driver shift' })
  endShift(@Body('driverId') driverId: string, @Body('shiftId') shiftId: string) {
    return this.fleetService.endShift(driverId, shiftId);
  }

  @Get('shifts/:driverId')
  @ApiOperation({ summary: 'Get driver shift history' })
  getShifts(@Param('driverId') driverId: string) {
    return this.fleetService.getShifts(driverId);
  }

  @Post('earnings')
  @ApiOperation({ summary: 'Get driver earnings for a period' })
  getEarnings(@Body() body: { driverId: string; start: string; end: string }) {
    return this.fleetService.getEarnings(body.driverId, { start: new Date(body.start), end: new Date(body.end) });
  }

  @Post('incentives/calculate')
  @ApiOperation({ summary: 'Calculate driver incentives' })
  calculateIncentives(@Body('driverId') driverId: string) {
    return this.fleetService.calculateIncentives(driverId);
  }

  @Post('penalties')
  @ApiOperation({ summary: 'Issue a penalty to driver' })
  issuePenalty(@Body() body: any) {
    return this.fleetService.issuePenalty(body.driverId, body);
  }

  @Get('performance/:driverId?')
  @ApiOperation({ summary: 'Get performance ranking' })
  getPerformance(@Param('driverId') driverId?: string) {
    return this.fleetService.getPerformanceRanking(driverId);
  }

  @Get('schedule/:driverId')
  @ApiOperation({ summary: 'Get driver schedule' })
  getSchedule(@Param('driverId') driverId: string) {
    return this.fleetService.getDriverSchedule(driverId);
  }

  @Put('penalties/:id/approve')
  @ApiOperation({ summary: 'Approve penalty' })
  approvePenalty(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.fleetService.approvePenalty(id, approvedBy);
  }

  @Put('penalties/:id/waive')
  @ApiOperation({ summary: 'Waive penalty' })
  waivePenalty(@Param('id') id: string, @Body() body: { waivedBy: string; reason: string }) {
    return this.fleetService.waivePenalty(id, body.waivedBy, body.reason);
  }
}
