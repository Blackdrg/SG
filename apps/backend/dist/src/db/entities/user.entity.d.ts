import { UserRole, UserStatus } from '../../shared/domain/user.interface';
export declare class UserEntity {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    passwordHash: string;
    profileImage: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
