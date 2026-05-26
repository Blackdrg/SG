export declare class NotificationService {
    constructor();
    sendPush(userId: string, title: string, body: string, data?: any): Promise<{
        success: boolean;
    }>;
    sendSMS(phone: string, message: string): Promise<{
        success: boolean;
    }>;
    sendEmail(email: string, subject: string, template: string, context: any): Promise<{
        success: boolean;
    }>;
    notifyOrderUpdate(userId: string, orderId: string, status: string): Promise<void>;
}
