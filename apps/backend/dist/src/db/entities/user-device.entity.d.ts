import { UserEntity } from './user.entity';
export declare class UserDeviceEntity {
    id: string;
    userId: string;
    user: UserEntity;
    fcmToken: string;
    apnsToken: string;
    deviceName: string;
    deviceType: string;
    userAgent: string;
    ipAddress: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
