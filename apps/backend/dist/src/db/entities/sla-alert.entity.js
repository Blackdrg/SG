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
exports.SLAAlertEntity = void 0;
const typeorm_1 = require("typeorm");
const restaurant_branch_entity_1 = require("./restaurant-branch.entity");
const order_entity_1 = require("./order/order.entity");
let SLAAlertEntity = class SLAAlertEntity {
};
exports.SLAAlertEntity = SLAAlertEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SLAAlertEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_branch_entity_1.RestaurantBranchEntity),
    __metadata("design:type", restaurant_branch_entity_1.RestaurantBranchEntity)
], SLAAlertEntity.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SLAAlertEntity.prototype, "slaType", void 0);
exports.SLAAlertEntity = SLAAlertEntity = __decorate([
    (0, typeorm_1.Entity)('sla_alerts')
], SLAAlertEntity);
/ Type of SLA;
targetValue;
number;
/ Target SLA value (e.g., 15 minutes for prep);
actualValue;
number;
/ Actual measured value;
isBreached;
boolean;
/ Whether SLA is breached;
breachSeverity ?  : 'low' | 'medium' | 'high';
/ Severity of breach;
relatedOrderId ?  : string;
/ If related to a specific order;
relatedOrder ?  : order_entity_1.OrderEntity;
isNotified;
boolean;
/ Whether alert has been sent;
notifiedAt ?  : Date;
/ When notification was sent;
createdAt;
Date;
updatedAt;
Date;
//# sourceMappingURL=sla-alert.entity.js.map