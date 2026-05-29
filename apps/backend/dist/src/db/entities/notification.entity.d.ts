import { NotificationStatus } from './notification-status.enum';
export declare class NotificationEntity {
    id: string;
    recipientId: string;
    recipientType: 'user' | 'device' | 'email' | 'phone';
    notificationType: 'push' | 'sms' | 'email' | 'apns';
    payload: any;
    provider: 'fcm' | 'twilio' | 'sendgrid' | 'apns';
    status: NotificationStatus;
    attemptCount: number;
    maxAttempts: number;
    lastAttemptAt: Date;
    nextAttemptAt: Date;
    completedAt: Date;
    errorInfo: {
        message?: string;
        code?: string;
        providerResponse?: any;
    };
    callbackUrl: string;
    metadata: {};
    createdAt: Date;
    updatedAt: Date;
}
