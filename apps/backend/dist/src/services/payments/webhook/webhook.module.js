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
const payment_event_entity_1 = require("../payment-event.entity");
const payment_fraud_entity_1 = require("../payment-fraud.entity");
const payment_dispute_entity_1 = require("../../../db/entities/payment-dispute.entity");
const webhook_service_1 = require("./webhook.service");
const webhook_controller_1 = require("./webhook.controller");
const notification_module_1 = require("../../../services/notifications/notification.module");
const chargeback_module_1 = require("../chargeback/chargeback.module");
let WebhookModule = class WebhookModule {
};
exports.WebhookModule = WebhookModule;
exports.WebhookModule = WebhookModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payment_webhook_entity_1.PaymentWebhookEntity, payment_event_entity_1.PaymentEventEntity, payment_fraud_entity_1.PaymentFraudFlagEntity, payment_dispute_entity_1.PaymentDisputeEntity]),
            notification_module_1.NotificationModule,
            chargeback_module_1.ChargebackModule,
        ],
        providers: [webhook_service_1.WebhookService],
        controllers: [webhook_controller_1.PaymentWebhookController],
        exports: [webhook_service_1.WebhookService],
    })
], WebhookModule);
//# sourceMappingURL=webhook.module.js.map