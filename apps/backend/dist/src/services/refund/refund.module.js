"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const refund_service_1 = require("./refund.service");
const refund_controller_1 = require("./refund.controller");
const refund_entity_1 = require("../../db/entities/refund.entity");
const refund_approval_entity_1 = require("../../db/entities/refund-approval.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const payments_module_1 = require("../../../services/payments/payments.module");
const notification_module_1 = require("../../services/notifications/notification.module");
const ledger_module_1 = require("../../../modules/ledger/ledger.module");
let RefundModule = class RefundModule {
};
exports.RefundModule = RefundModule;
exports.RefundModule = RefundModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([refund_entity_1.RefundEntity, refund_approval_entity_1.RefundApprovalEntity, order_entity_1.OrderEntity, user_entity_1.UserEntity]),
            payments_module_1.PaymentServiceModule,
            notification_module_1.NotificationModule,
            ledger_module_1.LedgerModule
        ],
        providers: [refund_service_1.RefundService],
        controllers: [refund_controller_1.RefundController],
        exports: [refund_service_1.RefundService]
    })
], RefundModule);
let RefundModule = class RefundModule {
};
exports.RefundModule = RefundModule;
exports.RefundModule = RefundModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([refund_entity_1.RefundEntity, refund_approval_entity_1.RefundApprovalEntity, order_entity_1.OrderEntity, user_entity_1.UserEntity]),
            payments_module_1.PaymentServiceModule,
            notification_module_1.NotificationModule
        ],
        providers: [refund_service_1.RefundService],
        controllers: [refund_controller_1.RefundController],
        exports: [refund_service_1.RefundService]
    })
], RefundModule);
//# sourceMappingURL=refund.module.js.map