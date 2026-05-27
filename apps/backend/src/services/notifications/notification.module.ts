import { Global } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { ProductionNotificationService } from './production-notification.service';
import { UserDeviceEntity } from '../../db/entities/user-device.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserDeviceEntity])],
  providers: [NotificationService, ProductionNotificationService],
  exports: [NotificationService, ProductionNotificationService],
})
export class NotificationModule {}
