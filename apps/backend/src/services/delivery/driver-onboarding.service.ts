import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { DriverDocumentEntity, DocumentType, DocumentStatus } from '../../db/entities/driver-document.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';

@Injectable()
export class DriverOnboardingService {
  private readonly logger = new Logger(DriverOnboardingService.name);

  constructor(
    @InjectRepository(DriverEntity)
    private driverRepo: Repository<DriverEntity>,
    @InjectRepository(DriverDocumentEntity)
    private documentRepo: Repository<DriverDocumentEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(DriverAssignmentEntity)
    private driverAssignmentRepo: Repository<DriverAssignmentEntity>,
    private dataSource: DataSource,
  ) {}

  async startOnboarding(userId: string, data: {
    licenseNumber?: string;
    vehicleNumber?: string;
    vehicleType?: string;
  }): Promise<DriverEntity> {
    let driver = await this.driverRepo.findOne({ where: { userId } });

    if (!driver) {
      driver = this.driverRepo.create({
        userId,
        ...data,
        kycStatus: 'pending',
      });
    } else {
      await this.driverRepo.update(driver.id, {
        ...data,
        kycStatus: 'pending',
      });
      driver = await this.driverRepo.findOne({ where: { userId } });
    }

    const savedDriver = await this.driverRepo.save(driver);

    await this.createInitialDocuments(savedDriver.id, data);

    return savedDriver;
  }

  private async createInitialDocuments(driverId: string, data: any): Promise<void> {
    if (data.licenseNumber) {
      await this.documentRepo.save({
        driverId,
        documentType: DocumentType.DRIVING_LICENSE,
        documentUrl: '',
        status: DocumentStatus.PENDING,
      });
    }

    if (data.vehicleNumber) {
      await this.documentRepo.save({
        driverId,
        documentType: DocumentType.VEHICLE_REGISTRATION,
        documentUrl: '',
        status: DocumentStatus.PENDING,
      });
    }
  }

  async uploadDocument(
    driverId: string,
    documentType: DocumentType,
    documentUrl: string,
    expiryDate?: Date,
  ): Promise<DriverDocumentEntity> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const document = this.documentRepo.create({
      driverId,
      documentType,
      documentUrl,
      status: DocumentStatus.UPLOADED,
      expiryDate,
    });

    return this.documentRepo.save(document);
  }

  async getDocuments(driverId: string): Promise<DriverDocumentEntity[]> {
    return this.documentRepo.find({
      where: { driver: { id: driverId } } as any,
      order: { createdAt: 'DESC' } as any,
    });
  }

  async verifyDocument(
    documentId: string,
    status: DocumentStatus,
    notes?: string,
    verifierId?: string,
  ): Promise<DriverDocumentEntity> {
    const document = await this.documentRepo.findOne({ where: { id: documentId } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.documentRepo.update(documentId, {
      status,
      verificationNotes: notes,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
    });

    const driver = await this.driverRepo.findOne({ where: { id: document.driverId } });
    if (driver && status === DocumentStatus.VERIFIED) {
      const allDocs = await this.documentRepo.find({
        where: { driverId: document.driverId as any },
      });

      const requiredDocs = [
        DocumentType.DRIVING_LICENSE,
        DocumentType.VEHICLE_REGISTRATION,
      ];

      const allRequiredVerified = requiredDocs.every(docType =>
        allDocs.some(d => d.documentType === docType && d.status === DocumentStatus.VERIFIED)
      );

      if (allRequiredVerified) {
        await this.driverRepo.update(document.driverId, { kycStatus: 'approved' });
      }
    }

    return this.documentRepo.findOne({ where: { id: documentId } });
  }

  async getOnboardingStatus(driverId: string): Promise<any> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const documents = await this.documentRepo.find({
      where: { driverId: driverId as any },
    });

    const requiredDocs = [
      DocumentType.DRIVING_LICENSE,
      DocumentType.VEHICLE_REGISTRATION,
      DocumentType.INSURANCE,
      DocumentType.ID_PROOF,
    ];

    const documentStatus = requiredDocs.map(docType => ({
      type: docType,
      status: documents.find(d => d.documentType === docType)?.status || DocumentStatus.PENDING,
    }));

    return {
      kycStatus: driver.kycStatus,
      documents: documentStatus,
      isApproved: driver.kycStatus === 'approved',
    };
  }

  async updateDriverStatus(driverId: string, isOnline: boolean): Promise<void> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (driver.kycStatus !== 'approved') {
      throw new BadRequestException('Driver must have approved KYC to go online');
    }

    await this.driverRepo.update(driverId, { isOnline });
  }
}