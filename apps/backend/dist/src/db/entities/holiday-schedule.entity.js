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
exports.HolidayScheduleEntity = void 0;
const typeorm_1 = require("typeorm");
const restaurant_branch_entity_1 = require("./restaurant-branch.entity");
let HolidayScheduleEntity = class HolidayScheduleEntity {
};
exports.HolidayScheduleEntity = HolidayScheduleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], HolidayScheduleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_branch_entity_1.RestaurantBranchEntity),
    __metadata("design:type", restaurant_branch_entity_1.RestaurantBranchEntity)
], HolidayScheduleEntity.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HolidayScheduleEntity.prototype, "holidayName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], HolidayScheduleEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], HolidayScheduleEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HolidayScheduleEntity.prototype, "scheduleType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HolidayScheduleEntity.prototype, "openingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HolidayScheduleEntity.prototype, "closingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], HolidayScheduleEntity.prototype, "isDeliveryAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], HolidayScheduleEntity.prototype, "isDineInAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], HolidayScheduleEntity.prototype, "isTakeawayAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HolidayScheduleEntity.prototype, "specialInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], HolidayScheduleEntity.prototype, "isRecurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HolidayScheduleEntity.prototype, "recurrenceRule", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], HolidayScheduleEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], HolidayScheduleEntity.prototype, "updatedAt", void 0);
exports.HolidayScheduleEntity = HolidayScheduleEntity = __decorate([
    (0, typeorm_1.Entity)('holiday_schedules')
], HolidayScheduleEntity);
//# sourceMappingURL=holiday-schedule.entity.js.map