export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  profileImage?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export enum UserRole {
  CUSTOMER = 'customer',
  RESTAURANT = 'restaurant',
  KITCHEN_STAFF = 'kitchen_staff',
  DELIVERY_PARTNER = 'delivery_partner',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  SUPPORT_STAFF = 'support_staff',
  FINANCE_STAFF = 'finance_staff',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
