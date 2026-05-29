import { DriverEntity } from './driver.entity';
export declare enum DocumentType {
    DRIVING_LICENSE = "driving_license",
    VEHICLE_REGISTRATION = "vehicle_registration",
    INSURANCE = "insurance",
    ID_PROOF = "id_proof",
    ADDRESS_PROOF = "address_proof"
}
export declare enum DocumentStatus {
    PENDING = "pending",
    UPLOADED = "uploaded",
    VERIFIED = "verified",
    REJECTED = "rejected"
}
export declare class DriverDocumentEntity {
    id: string;
    driverId: string;
    driver: DriverEntity;
    documentType: DocumentType;
    documentUrl: string;
    status: DocumentStatus;
    verificationNotes: string;
    verifiedBy: string;
    verifiedAt: Date;
    expiryDate: Date;
    uploadedAt: Date;
    updatedAt: Date;
}
