"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentServiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payments_service_1 = require("./payments.service");
const payments_controller_1 = require("./payments.controller");
const order_entity_1 = require("../../db/entities/order.entity");
const wallet_entity_1 = require("../../db/entities/wallet.entity");
const module_1 = require();
const module_2 = require();
const module_3 = require();
let PaymentServiceModule = class PaymentServiceModule {
};
exports.PaymentServiceModule = PaymentServiceModule;
exports.PaymentServiceModule = PaymentServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([order_entity_1.OrderEntity, wallet_entity_1.WalletEntity, module_1.WalletTransactionEntity, module_2.AuditLogEntity]), module_3.WebhookModule],
        providers: [payments_service_1.PaymentService],
        controllers: [payments_controller_1.PaymentsController],
        exports: [payments_service_1.PaymentService],
    })
], PaymentServiceModule);
//# sourceMappingURL=payments.module.js.map