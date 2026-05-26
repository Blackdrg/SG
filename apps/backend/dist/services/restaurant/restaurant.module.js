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
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const menu_category_entity_1 = require("../../db/entities/menu-category.entity");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
const inventory_item_entity_1 = require("../../db/entities/inventory-item.entity");
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
            ]),
        ],
        providers: [restaurant_service_1.RestaurantService, kds_gateway_1.KdsGateway],
        controllers: [restaurant_controller_1.RestaurantController],
        exports: [restaurant_service_1.RestaurantService],
    })
], RestaurantServiceModule);
//# sourceMappingURL=restaurant.module.js.map