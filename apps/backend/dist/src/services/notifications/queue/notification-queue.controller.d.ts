import { NotificationQueueService } from './notification-queue.service';
export declare class NotificationQueueController {
    private readonly notificationQueueService;
    constructor(notificationQueueService: NotificationQueueService);
    queueNotification(body: any): Promise<NotificationEntity>;
    getNotificationById(id: string): Promise<NotificationEntity>;
    getNotificationsByStatus(status?: string): Promise<NotificationEntity[]>;
    getNotificationsForRecipient(recipientId: string, recipientType: string): Promise<NotificationEntity[]>;
    cancelNotification(id: string): Promise<{
        success: boolean;
    }>;
    getNotificationStats(): Promise<any>;
    processNotificationQueue(): Promise<{
        success: boolean;
    }>;
}
