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
const module_1 = require();
const module_2 = require();
const module_3 = require();
const module_4 = require();
const module_5 = require();
const module_6 = require();
const module_7 = require();
const module_8 = require();
const module_9 = require();
const module_10 = require();
const module_11 = require();
const module_12 = require();
const module_13 = require();
const module_14 = require();
const module_15 = require();
const module_16 = require();
const module_17 = require();
const module_18 = require();
const module_19 = require();
const module_20 = require();
const module_21 = require();
const module_22 = require();
const module_23 = require();
const module_24 = require();
const module_25 = require();
let PaymentServiceModule = class PaymentServiceModule {
};
exports.PaymentServiceModule = PaymentServiceModule;
exports.PaymentServiceModule = PaymentServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            module_1.TypeOrmModule.forFeature([
                module_11.OrderEntity,
                module_12.WalletEntity,
                module_13.WalletTransactionEntity,
                module_14.AuditLogEntity,
                module_15.IdempotencyEntity,
                module_16.PaymentValidationEventEntity,
                module_17.PaymentFraudFlagEntity,
                module_18.PaymentEventEntity,
                module_19.LedgerEntryEntity,
                module_25.PaymentDisputeEntity,
            ]),
            module_20.WebhookModule,
            module_21.AuditModule,
            module_22.LedgerModule,
            module_23.GSTModule,
            module_24.ChargebackModule
        ],
        providers: [
            module_2.PaymentService,
            module_4.PaymentHardeningService,
            module_5.RetryService,
            module_6.FraudHardeningService,
            module_7.IdempotencyService,
            module_8.PaymentGatewayFactory,
            module_9.StripeGateway,
            module_10.RazorpayGateway,
            ChargebackService
        ],
        controllers: [module_3.PaymentsController],
        exports: [
            module_2.PaymentService,
            module_4.PaymentHardeningService,
            module_5.RetryService,
            module_6.FraudHardeningService,
            module_7.IdempotencyService,
            module_8.PaymentGatewayFactory,
            ChargebackService
        ],
    })
], PaymentServiceModule);
//# sourceMappingURL=payments.module.js.map