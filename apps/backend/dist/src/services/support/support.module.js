"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_support_service_1 = require("./customer-support.service");
const ticket_routing_service_1 = require("./ticket-routing.service");
const support_controller_1 = require("./support.controller");
const dispute_entity_1 = require("../../db/entities/dispute.entity");
const refund_entity_1 = require("../../db/entities/refund.entity");
const support_ticket_entity_1 = require("../../db/entities/support-ticket.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const wallet_module_1 = require("../wallet/wallet.module");
const payments_module_1 = require("../payments/payments.module");
let SupportModule = class SupportModule {
};
exports.SupportModule = SupportModule;
exports.SupportModule = SupportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                dispute_entity_1.DisputeEntity,
                refund_entity_1.RefundEntity,
                support_ticket_entity_1.SupportTicketEntity,
                support_ticket_entity_1.TicketMessageEntity,
                order_entity_1.OrderEntity,
                user_entity_1.UserEntity,
            ]),
            wallet_module_1.WalletModule,
            payments_module_1.PaymentServiceModule,
        ],
        providers: [customer_support_service_1.CustomerSupportService, ticket_routing_service_1.TicketRoutingService],
        controllers: [support_controller_1.SupportController],
        exports: [customer_support_service_1.CustomerSupportService, ticket_routing_service_1.TicketRoutingService],
    })
], SupportModule);
//# sourceMappingURL=support.module.js.map