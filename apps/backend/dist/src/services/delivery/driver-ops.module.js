"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverOpsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const driver_onboarding_service_1 = require("./driver-onboarding.service");
const driver_payout_service_1 = require("./driver-payout.service");
const driver_ops_controller_1 = require("./driver-ops.controller");
const driver_entity_1 = require("../../db/entities/driver.entity");
const driver_document_entity_1 = require("../../db/entities/driver-document.entity");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
const wallet_module_1 = require("../wallet/wallet.module");
const payments_module_1 = require("../payments/payments.module");
let DriverOpsModule = class DriverOpsModule {
};
exports.DriverOpsModule = DriverOpsModule;
exports.DriverOpsModule = DriverOpsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                driver_entity_1.DriverEntity,
                driver_document_entity_1.DriverDocumentEntity,
                driver_incentive_entity_1.DriverIncentiveEntity,
                order_entity_1.OrderEntity,
                user_entity_1.UserEntity,
                driver_assignment_entity_1.DriverAssignmentEntity,
            ]),
            wallet_module_1.WalletModule,
            payments_module_1.PaymentServiceModule,
        ],
        providers: [driver_onboarding_service_1.DriverOnboardingService, driver_payout_service_1.DriverPayoutService],
        controllers: [driver_ops_controller_1.DriverOpsController],
        exports: [driver_onboarding_service_1.DriverOnboardingService, driver_payout_service_1.DriverPayoutService],
    })
], DriverOpsModule);
//# sourceMappingURL=driver-ops.module.js.map