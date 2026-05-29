import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from '../../services/notifications/notification.service';
import { UserDeviceEntity } from '../../db/entities/user-device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserDeviceEntity])],
  controllers: [],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}

