import { NotificationService } from '../../services/notifications/notification.service';
export declare class OrderProcessor {
    private notificationService;
    constructor(notificationService: NotificationService);
    processOrderLifecycle(job: any): Promise<void>;
}
