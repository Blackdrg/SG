export declare class BranchControlEntity {
    id: string;
    branchId: string;
    controlType: 'pause_orders' | 'restrict_payment_methods' | 'limit_order_value' | 'restrict_delivery_radius';
    controlValue?: any;
    isActive: boolean;
    activatedAt?: Date;
    activatedBy?: string;
    expiresAt?: Date;
    deactivatedAt?: Date;
    deactivatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
