import { Controller, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationService } from '../notification.service';

@Controller('devices')
export class DeviceController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async registerDevice(
    @Body() body: { userId: string; fcmToken?: string; apnsToken?: string; deviceInfo?: { name?: string; type?: string; userAgent?: string; ip?: string } }
  ) {
    const { userId, fcmToken, apnsToken, deviceInfo } = body;
    
    if (fcmToken) {
      await this.notificationService.registerDevice(userId, fcmToken, deviceInfo);
    }
    
    if (apnsToken) {
      await this.notificationService.registerDevice(userId, apnsToken, { ...deviceInfo, type: 'ios' });
    }
    
    return { success: true, message: 'Device registered successfully' };
  }

  @Delete('unregister')
  @HttpCode(HttpStatus.OK)
  async unregisterDevice(
    @Body() body: { userId: string; fcmToken?: string; apnsToken?: string }
  ) {
    const { userId, fcmToken, apnsToken } = body;
    
    if (fcmToken) {
      await this.notificationService.unregisterDevice(userId, fcmToken);
    }
    
    if (apnsToken) {
      await this.notificationService.unregisterDevice(userId, apnsToken);
    }
    
    return { success: true, message: 'Device unregistered successfully' };
  }
}