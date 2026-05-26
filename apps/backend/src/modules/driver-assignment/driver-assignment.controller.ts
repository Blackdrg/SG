import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { DriverAssignmentService } from './driver-assignment.service';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DeliverySLAEntity } from '../../db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
import { OrderEntity } from '../../db/entities/order.entity';

@Controller('driver-assignment')
export class DriverAssignmentController {
  constructor(private readonly driverAssignmentService: DriverAssignmentService) {}

  // Driver Assignment Endpoints
  @Post('assign/:orderId')
  async assignDriverToOrder(@Param('orderId') orderId: string) {
    return this.driverAssignmentService.assignDriverToOrder(orderId);
  }

  @Post('batch-assign')
  async assignBatchDelivery(
    @Body('orderIds') orderIds: string[],
    @Body('driverId') driverId: string
  ) {
    return this.driverAssignmentService.assignBatchDelivery(orderIds, driverId);
  }

  @Put('reassign/:assignmentId')
  async reassignOrder(
    @Param('assignmentId') assignmentId: string,
    @Body('newDriverId') newDriverId: string,
    @Body('reason') reason: string = 'Driver unavailable'
  ) {
    return this.driverAssignmentService.reassignOrder(assignmentId, newDriverId, reason);
  }

  @Get('driver/:driverId/assignments')
  async getDriverAssignments(
    @Param('driverId') driverId: string,
    @Query('status') status?: string
  ) {
    return this.driverAssignmentService.getDriverAssignments(driverId, status);
  }

  @Get('order/:orderId/assignments')
  async getOrderAssignments(@Param('orderId') orderId: string) {
    return this.driverAssignmentService.getOrderAssignments(orderId);
  }

  @Put(':assignmentId/status')
  async updateAssignmentStatus(
    @Param('assignmentId') assignmentId: string,
    @Body('status') status: DriverAssignmentEntity['status'],
    @Body('actualTimeMinutes') actualTimeMinutes?: number
  ) {
    return this.driverAssignmentService.updateAssignmentStatus(
      assignmentId,
      status,
      actualTimeMinutes
    );
  }

  @Put(':assignmentId/route')
  async updateAssignmentRoute(
    @Param('assignmentId') assignmentId: string,
    @Body() routeData: {
      start: { lat: number; lng: number };
      end: { lat: number; lng: number };
      waypoints: Array<{ lat: number; lng: number; timestamp: Date }>;
    }
  ) {
    return this.driverAssignmentService.updateAssignmentRoute(assignmentId, routeData);
  }

  // Driver Management Endpoints
  @Get('drivers/available')
  async getAvailableDrivers(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 5
  ) {
    return this.driverAssignmentService.getAvailableDrivers(lat, lng, radius);
  }

  @Post('drivers/:driverId/score')
  async updateDriverScore(@Param('driverId') driverId: string) {
    return this.driverAssignmentService.updateDriverScore(driverId);
  }

  // ETA Intelligence Endpoints
  @Get('eta/:orderId/:driverId')
  async calculateETA(
    @Param('orderId') orderId: string,
    @Param('driverId') driverId: string
  ) {
    // This would call the ETA service - for now returning placeholder
    // In a full implementation, you'd inject ETAIntelligenceService
    return {
      etaMinutes: 25,
      confidence: 0.85,
      factors: {
        distance: 4.2,
        trafficConditions: { multiplier: 1.1, level: 'moderate' },
        kitchenDelay: { delayMinutes: 3, confidence: 0.8 },
        driverExperience: 150,
        timeOfDay: 14,
        weatherImpact: { multiplier: 1.0, condition: 'clear' }
      }
    };
  }

  // SLA Monitoring Endpoints
  @Post('sla')
  async recordDeliverySLA(
    @Body() data: {
      driverId: string;
      branchId: string;
      metricName: string;
      value: number;
      unit: string;
      targetValue?: number;
      targetUnit?: string;
      measurementPeriod?: string;
    }
  ) {
    return this.driverAssignmentService.recordDeliverySLA(
      data.driverId,
      data.branchId,
      data.metricName,
      data.value,
      data.unit,
      data.targetValue,
      data.targetUnit,
      data.measurementPeriod
    );
  }

  @Get('sla')
  async getDeliverySLAMetrics(
    @Query('driverId') driverId?: string,
    @Query('branchId') branchId?: string,
    @Query('metricName') metricName?: string,
    @Query('limit') limit: number = 100
  ) {
    return this.driverAssignmentService.getDeliverySLAMetrics(
      driverId,
      branchId,
      metricName,
      limit
    );
  }

  // Fraud Detection Endpoints
  @Post('fraud')
  async recordFraudIncident(
    @Body() data: {
      driverId: string;
      orderId: string;
      branchId: string;
      fraudType: 'gps_spoofing' | 'fake_delivery' | 'late_delivery_abuse' | 'route_deviation' | 'other';
      evidence: any;
      severity: 'low' | 'medium' | 'high';
    }
  ) {
    return this.driverAssignmentService.recordFraudIncident(
      data.driverId,
      data.orderId,
      data.branchId,
      data.fraudType,
      data.evidence,
      data.severity
    );
  }

  @Get('drivers/:driverId/fraud')
  async getDriverFraudHistory(@Param('driverId') driverId: string) {
    return this.driverAssignmentService.getDriverFraudHistory(driverId);
  }

  @Get('fraud')
  async getAllFraudIncidents(
    @Query('driverId') driverId?: string,
    @Query('limit') limit: number = 50
  ) {
    // This would need to be implemented in the service
    // For now returning placeholder
    return [];
  }
}