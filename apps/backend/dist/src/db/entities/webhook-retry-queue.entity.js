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
exports.WebhookRetryQueueEntity = void 0;
const typeorm_1 = require("typeorm");
let WebhookRetryQueueEntity = class WebhookRetryQueueEntity {
};
exports.WebhookRetryQueueEntity = WebhookRetryQueueEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WebhookRetryQueueEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WebhookRetryQueueEntity.prototype, "webhookId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], WebhookRetryQueueEntity.prototype, "gateway", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], WebhookRetryQueueEntity.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], WebhookRetryQueueEntity.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WebhookRetryQueueEntity.prototype, "attempt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WebhookRetryQueueEntity.prototype, "maxAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    __metadata("design:type", String)
], WebhookRetryQueueEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WebhookRetryQueueEntity.prototype, "lastError", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], WebhookRetryQueueEntity.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], WebhookRetryQueueEntity.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WebhookRetryQueueEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WebhookRetryQueueEntity.prototype, "updatedAt", void 0);
exports.WebhookRetryQueueEntity = WebhookRetryQueueEntity = __decorate([
    (0, typeorm_1.Entity)('webhook_retry_queue')
], WebhookRetryQueueEntity);
//# sourceMappingURL=webhook-retry-queue.entity.js.map