import { NotificationService } from './notification.service';
export declare class DeviceController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    registerDevice(body: {
        userId: string;
        fcmToken?: string;
        apnsToken?: string;
        deviceInfo?: {
            name?: string;
            type?: string;
            userAgent?: string;
            ip?: string;
        };
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    unregisterDevice(body: {
        userId: string;
        fcmToken?: string;
        apnsToken?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
