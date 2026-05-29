import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserDeviceEntity } from '../../db/entities/user-device.entity';
export declare class NotificationService {
    private configService;
    private readonly userDeviceRepo;
    private readonly logger;
    constructor(configService: ConfigService, userDeviceRepo: Repository<UserDeviceEntity>);
    registerDevice(userId: string, fcmToken: string, deviceInfo: {
        name?: string;
        type?: string;
        userAgent?: string;
        ip?: string;
    }): Promise<UserDeviceEntity>;
    unregisterDevice(userId: string, fcmToken: string): Promise<void>;
    sendPush(userId: string, title: string, body: string, data?: any): Promise<{
        success: boolean;
        reason: string;
        result?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        result: any;
        reason?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        reason?: undefined;
        result?: undefined;
    }>;
    sendSMS(phone: string, message: string): Promise<{
        success: boolean;
        reason: string;
        sid?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        sid: any;
        reason?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        reason?: undefined;
        sid?: undefined;
    }>;
    sendEmail(email: string, subject: string, template: string, context: any): Promise<{
        success: boolean;
        reason: string;
        error?: undefined;
    } | {
        success: boolean;
        reason?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        reason?: undefined;
    }>;
    notifyOrderUpdate(userId: string, orderId: string, status: string, phone?: string): Promise<void>;
    sendOTP(phone: string, otp: string): Promise<{
        success: boolean;
        reason: string;
        sid?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        sid: any;
        reason?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        reason?: undefined;
        sid?: undefined;
    }>;
    sendAPNs(userId: string, title: string, body: string, data?: any): Promise<{
        success: boolean;
        reason: string;
        sent?: undefined;
        results?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        sent: number;
        results: any[];
        reason?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        reason?: undefined;
        sent?: undefined;
        results?: undefined;
    }>;
    private generateJWT;
    notifyDeliveryLifecycle(orderId: string, event: 'driver_assigned' | 'picked_up' | 'nearby' | 'delivered', userId: string, driverInfo?: any): Promise<void>;
    notifyRestaurant(orderId: string, alertType: 'new_order' | 'order_cancelled' | 'order_delayed', restaurantId: string): Promise<{
        success: boolean;
        alertType: "new_order" | "order_cancelled" | "order_delayed";
    }>;
    notifyDriver(driverId: string, orderId: string, event: 'assigned' | 'reassigned'): Promise<{
        success: boolean;
        event: "assigned" | "reassigned";
    }>;
}
