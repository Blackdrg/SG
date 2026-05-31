export declare enum PushTrackingEvent {
    SENT = "sent",
    DELIVERED = "delivered",
    OPENED = "opened",
    FAILED = "failed",
    REJECTED = "rejected"
}
export declare class NotificationAnalyticsEntity {
    id: string;
    notificationId: string;
    deviceToken: string;
    event: PushTrackingEvent;
    fcmMessageId: string;
    apnsMessageId: string;
    receivedAt: Date;
    openedAt: Date;
    metadata: {
        platform?: 'ios' | 'android' | 'web';
        appVersion?: string;
        deviceInfo?: string;
        error?: string;
    };
    createdAt: Date;
}
