import { Module } from "@nestjs/common";
import { NotificationService } from '../services/notifications/notification.service';

@Module({
  controllers: [],
  providers: [NotificationService]
})
export class NotificationsModule {}

