"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tax_reporting_service_1 = require("./tax-reporting.service");
const reconciliation_service_1 = require("./reconciliation.service");
const finance_controller_1 = require("./finance.controller");
const order_entity_1 = require("../../db/entities/order.entity");
const gst_detail_entity_1 = require("../../db/entities/gst-detail.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const restaurant_gst_entity_1 = require("../../db/entities/restaurant-gst.entity");
const order_item_entity_1 = require("../../db/entities/order-item.entity");
const wallet_transaction_entity_1 = require("../../db/entities/wallet-transaction.entity");
const payout_report_entity_1 = require("../../db/entities/payout-report.entity");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
let FinanceModule = class FinanceModule {
};
exports.FinanceModule = FinanceModule;
exports.FinanceModule = FinanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                order_entity_1.OrderEntity,
                gst_detail_entity_1.GSTDetailEntity,
                restaurant_entity_1.RestaurantEntity,
                restaurant_gst_entity_1.RestaurantGSTEntity,
                order_item_entity_1.OrderItemEntity,
                wallet_transaction_entity_1.WalletTransactionEntity,
                payout_report_entity_1.PayoutReportEntity,
                driver_incentive_entity_1.DriverIncentiveEntity,
            ]),
        ],
        providers: [tax_reporting_service_1.TaxReportingService, reconciliation_service_1.ReconciliationService],
        controllers: [finance_controller_1.FinanceController],
        exports: [tax_reporting_service_1.TaxReportingService, reconciliation_service_1.ReconciliationService],
    })
], FinanceModule);
//# sourceMappingURL=finance.module.js.map