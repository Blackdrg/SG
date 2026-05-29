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
let RestaurantServiceModule = class RestaurantServiceModule {
};
exports.RestaurantServiceModule = RestaurantServiceModule;
exports.RestaurantServiceModule = RestaurantServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            module_1.TypeOrmModule.forFeature([
                module_12.RestaurantEntity,
                module_13.RestaurantBranchEntity,
                module_14.MenuCategoryEntity,
                module_15.MenuItemEntity,
                module_16.InventoryItemEntity,
                module_17.RestaurantOnboardingEntity,
                module_18.MenuModerationEntity,
                module_19.PayoutReportEntity,
                module_20.CommissionRuleEntity,
                module_21.OrderEntity,
                module_22.GSTDetailEntity,
                module_23.UserEntity,
            ]),
        ],
        providers: [
            module_2.RestaurantService,
            module_5.RestaurantOpsService,
            module_6.MenuModerationService,
            module_7.PayoutService,
            module_8.BranchManagementService,
            module_9.CommissionService,
            module_10.OnboardingService
        ],
        controllers: [
            module_3.RestaurantController,
            module_4.RestaurantOpsController,
            module_11.OnboardingController
        ],
        exports: [
            module_2.RestaurantService,
            module_5.RestaurantOpsService,
            module_6.MenuModerationService,
            module_7.PayoutService,
            module_8.BranchManagementService,
            module_9.CommissionService,
            module_10.OnboardingService
        ],
    })
], RestaurantServiceModule);
//# sourceMappingURL=restaurant.module.js.map