import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { DriverDocumentEntity, DocumentType, DocumentStatus } from '../../db/entities/driver-document.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
export declare class DriverOnboardingService {
    private driverRepo;
    private documentRepo;
    private userRepo;
    private driverAssignmentRepo;
    private dataSource;
    private readonly logger;
    constructor(driverRepo: Repository<DriverEntity>, documentRepo: Repository<DriverDocumentEntity>, userRepo: Repository<UserEntity>, driverAssignmentRepo: Repository<DriverAssignmentEntity>, dataSource: DataSource);
    startOnboarding(userId: string, data: {
        licenseNumber?: string;
        vehicleNumber?: string;
        vehicleType?: string;
    }): Promise<DriverEntity>;
    private createInitialDocuments;
    uploadDocument(driverId: string, documentType: DocumentType, documentUrl: string, expiryDate?: Date): Promise<DriverDocumentEntity>;
    getDocuments(driverId: string): Promise<DriverDocumentEntity[]>;
    verifyDocument(documentId: string, status: DocumentStatus, notes?: string, verifierId?: string): Promise<DriverDocumentEntity>;
    getOnboardingStatus(driverId: string): Promise<any>;
    updateDriverStatus(driverId: string, isOnline: boolean): Promise<void>;
}
