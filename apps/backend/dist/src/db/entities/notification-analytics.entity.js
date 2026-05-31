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
exports.NotificationAnalyticsEntity = exports.PushTrackingEvent = void 0;
const typeorm_1 = require("typeorm");
var PushTrackingEvent;
(function (PushTrackingEvent) {
    PushTrackingEvent["SENT"] = "sent";
    PushTrackingEvent["DELIVERED"] = "delivered";
    PushTrackingEvent["OPENED"] = "opened";
    PushTrackingEvent["FAILED"] = "failed";
    PushTrackingEvent["REJECTED"] = "rejected";
})(PushTrackingEvent || (exports.PushTrackingEvent = PushTrackingEvent = {}));
let NotificationAnalyticsEntity = class NotificationAnalyticsEntity {
};
exports.NotificationAnalyticsEntity = NotificationAnalyticsEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationAnalyticsEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationAnalyticsEntity.prototype, "notificationId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationAnalyticsEntity.prototype, "deviceToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PushTrackingEvent }),
    __metadata("design:type", String)
], NotificationAnalyticsEntity.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NotificationAnalyticsEntity.prototype, "fcmMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NotificationAnalyticsEntity.prototype, "apnsMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationAnalyticsEntity.prototype, "receivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationAnalyticsEntity.prototype, "openedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], NotificationAnalyticsEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationAnalyticsEntity.prototype, "createdAt", void 0);
exports.NotificationAnalyticsEntity = NotificationAnalyticsEntity = __decorate([
    (0, typeorm_1.Entity)('notification_analytics')
], NotificationAnalyticsEntity);
//# sourceMappingURL=notification-analytics.entity.js.map