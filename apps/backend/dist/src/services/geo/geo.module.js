"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoModule = void 0;
const module_1 = require();
const module_2 = require();
const module_3 = require();
const module_4 = require();
const module_5 = require();
const module_6 = require();
const module_7 = require();
let GeoModule = class GeoModule {
};
exports.GeoModule = GeoModule;
exports.GeoModule = GeoModule = __decorate([
    (0, module_1.Module)({
        imports: [module_2.TypeOrmModule.forFeature([module_3.RestaurantEntity, module_4.RestaurantBranchEntity, module_5.DriverEntity, module_6.OrderEntity])],
        providers: [module_7.EnhancedGeoService],
        exports: [module_7.EnhancedGeoService],
    })
], GeoModule);
//# sourceMappingURL=geo.module.js.map