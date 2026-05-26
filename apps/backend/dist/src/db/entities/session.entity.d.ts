import { UserEntity } from './user.entity';
export declare class SessionEntity {
    id: string;
    userId: string;
    user: UserEntity;
    deviceName: string;
    deviceType: string;
    ipAddress: string;
    refreshToken: string;
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    lastActiveAt: Date;
}
