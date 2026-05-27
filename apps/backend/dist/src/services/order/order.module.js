"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderServiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_service_1 = require("./order.service");
const order_controller_1 = require("./order.controller");
const order_entity_1 = require("../../db/entities/order.entity");
const order_item_entity_1 = require("../../db/entities/order-item.entity");
const audit_log_entity_1 = require("../../db/entities/audit-log.entity");
const payments_module_1 = require("../../services/payments/payments.module");
const notification_module_1 = require("../../services/notifications/notification.module");
let OrderServiceModule = class OrderServiceModule {
};
exports.OrderServiceModule = OrderServiceModule;
exports.OrderServiceModule = OrderServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([order_entity_1.OrderEntity, order_item_entity_1.OrderItemEntity, audit_log_entity_1.AuditLogEntity]), payments_module_1.PaymentServiceModule, notification_module_1.NotificationModule],
        providers: [order_service_1.OrderService],
        controllers: [order_controller_1.OrderController],
        exports: [order_service_1.OrderService],
    })
], OrderServiceModule);
//# sourceMappingURL=order.module.js.map