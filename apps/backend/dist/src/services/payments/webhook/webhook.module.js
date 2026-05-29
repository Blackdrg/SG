"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_webhook_entity_1 = require("../../../db/entities/payment-webhook.entity");
const module_1 = require();
const module_2 = require();
const module_3 = require();
const module_4 = require();
const module_5 = require();
const module_6 = require();
const module_7 = require();
let WebhookModule = class WebhookModule {
};
exports.WebhookModule = WebhookModule;
exports.WebhookModule = WebhookModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payment_webhook_entity_1.PaymentWebhookEntity, module_1.PaymentEventEntity, module_2.PaymentFraudFlagEntity, module_3.PaymentDisputeEntity]),
            module_6.NotificationModule,
            module_7.ChargebackModule,
        ],
        providers: [module_4.WebhookService],
        controllers: [module_5.PaymentWebhookController],
        exports: [module_4.WebhookService],
    })
], WebhookModule);
//# sourceMappingURL=webhook.module.js.map