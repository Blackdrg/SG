import { RestaurantEntity } from './restaurant.entity';
export declare enum OnboardingStep {
    BUSINESS_REGISTRATION = "business_registration",
    DOCUMENT_UPLOAD = "document_upload",
    BANK_VERIFICATION = "bank_verification",
    MENU_SETUP = "menu_setup",
    STAFF_INVITE = "staff_invite",
    GST_CONFIG = "gst_config",
    PRICING_SETUP = "pricing_setup",
    PAYOUT_SETUP = "payout_setup",
    COMPLETION = "completion"
}
export declare enum OnboardingStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    REJECTED = "rejected",
    AWAITING_REVIEW = "awaiting_review"
}
export declare class RestaurantOnboardingEntity {
    id: string;
    restaurantId: string;
    restaurant: RestaurantEntity;
    currentStep: OnboardingStep;
    status: OnboardingStatus;
    businessDetails: {
        legalName?: string;
        tradeName?: string;
        gstin?: string;
        businessType?: string;
        registrationDate?: string;
    };
    documentStatus: {
        fssai?: boolean;
        gstCertificate?: boolean;
        businessLicense?: boolean;
        bankStatement?: boolean;
        cancelledCheque?: boolean;
    };
    bankDetails: {
        accountHolderName?: string;
        accountNumber?: string;
        ifscCode?: string;
        bankName?: string;
        branchName?: string;
        verified?: boolean;
    };
    menuSetup: {
        categoriesCreated?: number;
        itemsAdded?: number;
        readyForReview?: boolean;
    };
    rejectionReason: string;
    reviewedBy: string;
    reviewedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
