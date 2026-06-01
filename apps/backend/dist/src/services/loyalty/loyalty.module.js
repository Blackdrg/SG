"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const loyalty_service_1 = require("./loyalty.service");
const loyalty_controller_1 = require("./loyalty.controller");
const coupon_entity_1 = require("../../db/entities/coupon.entity");
const coupon_usage_entity_1 = require("../../db/entities/coupon-usage.entity");
const referral_entity_1 = require("../../db/entities/referral.entity");
const subscription_entity_1 = require("../../db/entities/subscription.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const order_entity_1 = require("../../db/entities/order.entity");
let LoyaltyModule = class LoyaltyModule {
};
exports.LoyaltyModule = LoyaltyModule;
exports.LoyaltyModule = LoyaltyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                coupon_entity_1.CouponEntity,
                coupon_usage_entity_1.CouponUsageEntity,
                referral_entity_1.ReferralEntity,
                subscription_entity_1.SubscriptionEntity,
                user_entity_1.UserEntity,
                order_entity_1.OrderEntity,
            ]),
        ],
        providers: [loyalty_service_1.LoyaltyService],
        controllers: [loyalty_controller_1.LoyaltyController],
        exports: [loyalty_service_1.LoyaltyService],
    })
], LoyaltyModule);
//# sourceMappingURL=loyalty.module.js.map