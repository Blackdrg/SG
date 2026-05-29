"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargebackModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chargeback_service_1 = require("./chargeback.service");
const chargeback_controller_1 = require("./chargeback.controller");
const payment_dispute_entity_1 = require("../../db/entities/payment-dispute.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const payment_service_module_1 = require("../payments/payment-service.module");
const notification_module_1 = require("../../notifications/notification.module");
const ledger_module_1 = require("../../modules/ledger/ledger.module");
const audit_module_1 = require("../../audit/audit.module");
const production_notification_module_1 = require("../../notifications/production-notification.module");
let ChargebackModule = class ChargebackModule {
};
exports.ChargebackModule = ChargebackModule;
exports.ChargebackModule = ChargebackModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payment_dispute_entity_1.PaymentDisputeEntity, order_entity_1.OrderEntity, user_entity_1.UserEntity]),
            payment_service_module_1.PaymentServiceModule,
            notification_module_1.NotificationModule,
            ledger_module_1.LedgerModule,
            audit_module_1.AuditModule,
            production_notification_module_1.ProductionNotificationModule
        ],
        providers: [chargeback_service_1.ChargebackService],
        controllers: [chargeback_controller_1.ChargebackController],
        exports: [chargeback_service_1.ChargebackService]
    })
], ChargebackModule);
//# sourceMappingURL=chargeback.module.js.map