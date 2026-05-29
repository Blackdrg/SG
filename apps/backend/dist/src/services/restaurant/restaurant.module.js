"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantServiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const restaurant_service_1 = require("./restaurant.service");
const restaurant_controller_1 = require("./restaurant.controller");
const restaurant_ops_controller_1 = require("./restaurant-ops.controller");
const restaurant_ops_service_1 = require("./restaurant-ops.service");
const menu_moderation_service_1 = require("./menu-moderation.service");
const payout_service_1 = require("./payout.service");
const branch_management_service_1 = require("./branch-management.service");
const commission_service_1 = require("./commission.service");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const menu_category_entity_1 = require("../../db/entities/menu-category.entity");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
const inventory_item_entity_1 = require("../../db/entities/inventory-item.entity");
const restaurant_onboarding_entity_1 = require("../../db/entities/restaurant-onboarding.entity");
const menu_moderation_entity_1 = require("../../db/entities/menu-moderation.entity");
const payout_report_entity_1 = require("../../db/entities/payout-report.entity");
const commission_rule_entity_1 = require("../../db/entities/commission-rule.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const gst_detail_entity_1 = require("../../db/entities/gst-detail.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const kds_gateway_1 = require("./kds.gateway");
let RestaurantServiceModule = class RestaurantServiceModule {
};
exports.RestaurantServiceModule = RestaurantServiceModule;
exports.RestaurantServiceModule = RestaurantServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                restaurant_entity_1.RestaurantEntity,
                restaurant_branch_entity_1.RestaurantBranchEntity,
                menu_category_entity_1.MenuCategoryEntity,
                menu_item_entity_1.MenuItemEntity,
                inventory_item_entity_1.InventoryItemEntity,
                restaurant_onboarding_entity_1.RestaurantOnboardingEntity,
                menu_moderation_entity_1.MenuModerationEntity,
                payout_report_entity_1.PayoutReportEntity,
                commission_rule_entity_1.CommissionRuleEntity,
                order_entity_1.OrderEntity,
                gst_detail_entity_1.GSTDetailEntity,
                user_entity_1.UserEntity,
            ]),
        ],
        providers: [restaurant_service_1.RestaurantService, restaurant_ops_service_1.RestaurantOpsService, menu_moderation_service_1.MenuModerationService, payout_service_1.PayoutService, branch_management_service_1.BranchManagementService, commission_service_1.CommissionService, kds_gateway_1.KdsGateway],
        controllers: [restaurant_controller_1.RestaurantController, restaurant_ops_controller_1.RestaurantOpsController],
        exports: [restaurant_service_1.RestaurantService, restaurant_ops_service_1.RestaurantOpsService, menu_moderation_service_1.MenuModerationService, payout_service_1.PayoutService, branch_management_service_1.BranchManagementService, commission_service_1.CommissionService],
    })
], RestaurantServiceModule);
//# sourceMappingURL=restaurant.module.js.map