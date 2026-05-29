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
exports.TicketMessageEntity = exports.SupportTicketEntity = exports.TicketStatus = exports.TicketCategory = exports.TicketPriority = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "low";
    TicketPriority["MEDIUM"] = "medium";
    TicketPriority["HIGH"] = "high";
    TicketPriority["URGENT"] = "urgent";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
var TicketCategory;
(function (TicketCategory) {
    TicketCategory["ORDER"] = "order";
    TicketCategory["PAYMENT"] = "payment";
    TicketCategory["DELIVERY"] = "delivery";
    TicketCategory["QUALITY"] = "quality";
    TicketCategory["ACCOUNT"] = "account";
    TicketCategory["TECHNICAL"] = "technical";
})(TicketCategory || (exports.TicketCategory = TicketCategory = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "open";
    TicketStatus["IN_PROGRESS"] = "in_progress";
    TicketStatus["AWAITING_CUSTOMER"] = "awaiting_customer";
    TicketStatus["RESOLVED"] = "resolved";
    TicketStatus["CLOSED"] = "closed";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
let SupportTicketEntity = class SupportTicketEntity {
};
exports.SupportTicketEntity = SupportTicketEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SupportTicketEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SupportTicketEntity.prototype, "ticketNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SupportTicketEntity.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TicketCategory }),
    __metadata("design:type", String)
], SupportTicketEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM }),
    __metadata("design:type", String)
], SupportTicketEntity.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN }),
    __metadata("design:type", String)
], SupportTicketEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SupportTicketEntity.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    __metadata("design:type", user_entity_1.UserEntity)
], SupportTicketEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SupportTicketEntity.prototype, "assignedToId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    __metadata("design:type", user_entity_1.UserEntity)
], SupportTicketEntity.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SupportTicketEntity.prototype, "escalatedToId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    __metadata("design:type", user_entity_1.UserEntity)
], SupportTicketEntity.prototype, "escalatedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SupportTicketEntity.prototype, "escalationLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], SupportTicketEntity.prototype, "slaBreachedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('TicketMessageEntity', (message) => message.ticket),
    __metadata("design:type", Array)
], SupportTicketEntity.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], SupportTicketEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SupportTicketEntity.prototype, "resolutionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], SupportTicketEntity.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SupportTicketEntity.prototype, "satisfactionSurveySent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SupportTicketEntity.prototype, "satisfactionRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SupportTicketEntity.prototype, "escalated", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SupportTicketEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SupportTicketEntity.prototype, "updatedAt", void 0);
exports.SupportTicketEntity = SupportTicketEntity = __decorate([
    (0, typeorm_1.Entity)('support_tickets')
], SupportTicketEntity);
let TicketMessageEntity = class TicketMessageEntity {
};
exports.TicketMessageEntity = TicketMessageEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TicketMessageEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TicketMessageEntity.prototype, "ticketId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SupportTicketEntity),
    __metadata("design:type", SupportTicketEntity)
], TicketMessageEntity.prototype, "ticket", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TicketMessageEntity.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    __metadata("design:type", user_entity_1.UserEntity)
], TicketMessageEntity.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TicketMessageEntity.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TicketMessageEntity.prototype, "isInternalNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TicketMessageEntity.prototype, "isSystemMessage", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Array)
], TicketMessageEntity.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TicketMessageEntity.prototype, "createdAt", void 0);
exports.TicketMessageEntity = TicketMessageEntity = __decorate([
    (0, typeorm_1.Entity)('ticket_messages')
], TicketMessageEntity);
//# sourceMappingURL=support-ticket.entity.js.map