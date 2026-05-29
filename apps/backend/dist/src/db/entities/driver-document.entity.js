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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverDocumentEntity = exports.DocumentStatus = exports.DocumentType = void 0;
const typeorm_1 = require("typeorm");
const driver_entity_1 = require("./driver.entity");
var DocumentType;
(function (DocumentType) {
    DocumentType["DRIVING_LICENSE"] = "driving_license";
    DocumentType["VEHICLE_REGISTRATION"] = "vehicle_registration";
    DocumentType["INSURANCE"] = "insurance";
    DocumentType["ID_PROOF"] = "id_proof";
    DocumentType["ADDRESS_PROOF"] = "address_proof";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "pending";
    DocumentStatus["UPLOADED"] = "uploaded";
    DocumentStatus["VERIFIED"] = "verified";
    DocumentStatus["REJECTED"] = "rejected";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
let DriverDocumentEntity = class DriverDocumentEntity {
};
exports.DriverDocumentEntity = DriverDocumentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DriverDocumentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DriverDocumentEntity.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.DriverEntity),
    __metadata("design:type", driver_entity_1.DriverEntity)
], DriverDocumentEntity.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DocumentType }),
    __metadata("design:type", String)
], DriverDocumentEntity.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DriverDocumentEntity.prototype, "documentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING }),
    __metadata("design:type", String)
], DriverDocumentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverDocumentEntity.prototype, "verificationNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverDocumentEntity.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DriverDocumentEntity.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DriverDocumentEntity.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DriverDocumentEntity.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DriverDocumentEntity.prototype, "updatedAt", void 0);
exports.DriverDocumentEntity = DriverDocumentEntity = __decorate([
    (0, typeorm_1.Entity)('driver_documents')
], DriverDocumentEntity);
//# sourceMappingURL=driver-document.entity.js.map