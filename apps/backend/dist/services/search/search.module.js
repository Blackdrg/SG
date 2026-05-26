"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchServiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const search_service_1 = require("./search.service");
const search_controller_1 = require("./search.controller");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
let SearchServiceModule = class SearchServiceModule {
};
exports.SearchServiceModule = SearchServiceModule;
exports.SearchServiceModule = SearchServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([menu_item_entity_1.MenuItemEntity, restaurant_entity_1.RestaurantEntity])],
        providers: [search_service_1.SearchService],
        controllers: [search_controller_1.SearchController],
        exports: [search_service_1.SearchService],
    })
], SearchServiceModule);
//# sourceMappingURL=search.module.js.map