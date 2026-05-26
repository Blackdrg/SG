import { UserEntity } from './user.entity';
export declare enum OtpType {
    EMAIL_VERIFICATION = "email_verification",
    PHONE_VERIFICATION = "phone_verification",
    LOGIN_2FA = "login_2fa",
    PASSWORD_RESET = "password_reset"
}
export declare enum OtpStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    EXPIRED = "expired"
}
export declare class OtpEntity {
    id: string;
    userId: string;
    user: UserEntity;
    type: OtpType;
    code: string;
    status: OtpStatus;
    expiresAt: Date;
    verifiedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
