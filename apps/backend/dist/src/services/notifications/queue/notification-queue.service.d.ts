import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotificationEntity } from '../../../db/entities/notification.entity';
import { NotificationStatus } from '../../../db/entities/notification-status.enum';
import { NotificationService } from '../notification.service';
import { QueueService } from '../../../infra/queue/queue.service';
export declare class NotificationQueueService {
    private readonly notificationRepo;
    private readonly configService;
    private readonly notificationService;
    private readonly queueService;
    private readonly logger;
    constructor(notificationRepo: Repository<NotificationEntity>, configService: ConfigService, notificationService: NotificationService, queueService: QueueService);
    queueNotification(recipientId: string, recipientType: 'user' | 'device' | 'email' | 'phone', notificationType: 'push' | 'sms' | 'email' | 'apns', payload: any, provider: 'fcm' | 'twilio' | 'sendgrid' | 'apns', options?: {
        maxAttempts?: number;
        callbackUrl?: string;
        metadata?: Record<string, any>;
    }): Promise<NotificationEntity>;
    processNotificationQueue(): Promise<void>;
    processNotification(notification: NotificationEntity): Promise<void>;
    getNotificationById(id: string): Promise<NotificationEntity>;
    getNotificationsByStatus(status: NotificationStatus): Promise<NotificationEntity[]>;
    getNotificationsForRecipient(recipientId: string, recipientType: 'user' | 'device' | 'email' | 'phone'): Promise<NotificationEntity[]>;
    cancelNotification(id: string): Promise<void>;
    getNotificationStats(): Promise<any>;
}
