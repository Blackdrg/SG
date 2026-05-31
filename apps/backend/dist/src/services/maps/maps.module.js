"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const maps_service_1 = require("./maps.service");
const maps_controller_1 = require("./maps.controller");
const surge_zone_entity_1 = require("../../db/entities/surge-zone.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
let MapsModule = class MapsModule {
};
exports.MapsModule = MapsModule;
exports.MapsModule = MapsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([surge_zone_entity_1.SurgeZoneEntity, restaurant_branch_entity_1.RestaurantBranchEntity])],
        providers: [maps_service_1.MapsService],
        controllers: [maps_controller_1.MapsController],
        exports: [maps_service_1.MapsService],
    })
], MapsModule);
//# sourceMappingURL=maps.module.js.map