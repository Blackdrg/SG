"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DriverOnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverOnboardingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_entity_1 = require("../../db/entities/driver.entity");
const driver_document_entity_1 = require("../../db/entities/driver-document.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
let DriverOnboardingService = DriverOnboardingService_1 = class DriverOnboardingService {
    constructor(driverRepo, documentRepo, userRepo, driverAssignmentRepo, dataSource) {
        this.driverRepo = driverRepo;
        this.documentRepo = documentRepo;
        this.userRepo = userRepo;
        this.driverAssignmentRepo = driverAssignmentRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DriverOnboardingService_1.name);
    }
    async startOnboarding(userId, data) {
        let driver = await this.driverRepo.findOne({ where: { userId } });
        if (!driver) {
            driver = this.driverRepo.create({
                userId,
                ...data,
                kycStatus: 'pending',
            });
        }
        else {
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
    async createInitialDocuments(driverId, data) {
        if (data.licenseNumber) {
            await this.documentRepo.save({
                driverId,
                documentType: driver_document_entity_1.DocumentType.DRIVING_LICENSE,
                documentUrl: '',
                status: driver_document_entity_1.DocumentStatus.PENDING,
            });
        }
        if (data.vehicleNumber) {
            await this.documentRepo.save({
                driverId,
                documentType: driver_document_entity_1.DocumentType.VEHICLE_REGISTRATION,
                documentUrl: '',
                status: driver_document_entity_1.DocumentStatus.PENDING,
            });
        }
    }
    async uploadDocument(driverId, documentType, documentUrl, expiryDate) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            throw new common_1.NotFoundException('Driver not found');
        }
        const document = this.documentRepo.create({
            driverId,
            documentType,
            documentUrl,
            status: driver_document_entity_1.DocumentStatus.UPLOADED,
            expiryDate,
        });
        return this.documentRepo.save(document);
    }
    async getDocuments(driverId) {
        return this.documentRepo.find({
            where: { driver: { id: driverId } },
            order: { createdAt: 'DESC' },
        });
    }
    async verifyDocument(documentId, status, notes, verifierId) {
        const document = await this.documentRepo.findOne({ where: { id: documentId } });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        await this.documentRepo.update(documentId, {
            status,
            verificationNotes: notes,
            verifiedBy: verifierId,
            verifiedAt: new Date(),
        });
        const driver = await this.driverRepo.findOne({ where: { id: document.driverId } });
        if (driver && status === driver_document_entity_1.DocumentStatus.VERIFIED) {
            const allDocs = await this.documentRepo.find({
                where: { driverId: document.driverId },
            });
            const requiredDocs = [
                driver_document_entity_1.DocumentType.DRIVING_LICENSE,
                driver_document_entity_1.DocumentType.VEHICLE_REGISTRATION,
            ];
            const allRequiredVerified = requiredDocs.every(docType => allDocs.some(d => d.documentType === docType && d.status === driver_document_entity_1.DocumentStatus.VERIFIED));
            if (allRequiredVerified) {
                await this.driverRepo.update(document.driverId, { kycStatus: 'approved' });
            }
        }
        return this.documentRepo.findOne({ where: { id: documentId } });
    }
    async getOnboardingStatus(driverId) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            throw new common_1.NotFoundException('Driver not found');
        }
        const documents = await this.documentRepo.find({
            where: { driverId: driverId },
        });
        const requiredDocs = [
            driver_document_entity_1.DocumentType.DRIVING_LICENSE,
            driver_document_entity_1.DocumentType.VEHICLE_REGISTRATION,
            driver_document_entity_1.DocumentType.INSURANCE,
            driver_document_entity_1.DocumentType.ID_PROOF,
        ];
        const documentStatus = requiredDocs.map(docType => ({
            type: docType,
            status: documents.find(d => d.documentType === docType)?.status || driver_document_entity_1.DocumentStatus.PENDING,
        }));
        return {
            kycStatus: driver.kycStatus,
            documents: documentStatus,
            isApproved: driver.kycStatus === 'approved',
        };
    }
    async updateDriverStatus(driverId, isOnline) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            throw new common_1.NotFoundException('Driver not found');
        }
        if (driver.kycStatus !== 'approved') {
            throw new common_1.BadRequestException('Driver must have approved KYC to go online');
        }
        await this.driverRepo.update(driverId, { isOnline });
    }
};
exports.DriverOnboardingService = DriverOnboardingService;
exports.DriverOnboardingService = DriverOnboardingService = DriverOnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(driver_document_entity_1.DriverDocumentEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(driver_assignment_entity_1.DriverAssignmentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], DriverOnboardingService);
//# sourceMappingURL=driver-onboarding.service.js.map