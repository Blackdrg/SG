import { UserEntity } from './user.entity';
export declare class DeviceFingerprintEntity {
    id: string;
    userId: string;
    user: UserEntity;
    fingerprint: string;
    deviceName: string;
    deviceType: string;
    userAgent: string;
    ipAddress: string;
    isTrusted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
