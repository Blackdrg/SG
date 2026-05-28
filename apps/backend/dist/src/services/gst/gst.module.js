"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSTModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const gst_service_1 = require("./gst.service");
const gst_controller_1 = require("./gst.controller");
const order_entity_1 = require("../db/entities/order.entity");
const order_item_entity_1 = require("../db/entities/order-item.entity");
const gst_detail_entity_1 = require("../db/entities/gst-detail.entity");
const hsn_sac_entity_1 = require("../db/entities/hsn-sac.entity");
const restaurant_gst_entity_1 = require("../db/entities/restaurant-gst.entity");
const menu_item_entity_1 = require("../db/entities/menu-item.entity");
const restaurant_entity_1 = require("../db/entities/restaurant.entity");
let GSTModule = class GSTModule {
};
exports.GSTModule = GSTModule;
exports.GSTModule = GSTModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                order_entity_1.OrderEntity,
                order_item_entity_1.OrderItemEntity,
                gst_detail_entity_1.GSTDetailEntity,
                hsn_sac_entity_1.HSNSACEntity,
                restaurant_gst_entity_1.RestaurantGSTEntity,
                menu_item_entity_1.MenuItemEntity,
                restaurant_entity_1.RestaurantEntity,
            ]),
        ],
        providers: [gst_service_1.GSTService],
        controllers: [gst_controller_1.GSTController],
        exports: [gst_service_1.GSTService],
    })
], GSTModule);
//# sourceMappingURL=gst.module.js.map