"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsController = void 0;
const common_1 = require("@nestjs/common");
const maps_service_1 = require("./maps.service");
let MapsController = class MapsController {
    constructor(mapsService) {
        this.mapsService = mapsService;
    }
    async getETA(originLat, originLng, destLat, destLng) {
        const origin = { lat: Number(originLat), lng: Number(originLng) };
        const destination = { lat: Number(destLat), lng: Number(destLng) };
        return this.mapsService.calculateETA(origin, destination);
    }
    async getSurgeETA(originLat, originLng, destLat, destLng) {
        const origin = { lat: Number(originLat), lng: Number(originLng) };
        const destination = { lat: Number(destLat), lng: Number(destLng) };
        return this.mapsService.calculateSurgeETA(origin, destination);
    }
    async getRerouting(body) {
        return this.mapsService.getReroutingOptions(body.origin, body.destination, body.waypoints);
    }
    async getHeatmap(north, south, east, west, zoom) {
        return this.mapsService.getHeatmapData({
            north: Number(north),
            south: Number(south),
            east: Number(east),
            west: Number(west),
        }, zoom ? Number(zoom) : 12);
    }
    async getSurgeZones() {
        return this.mapsService.getSurgeZones();
    }
    async checkSurgeZone(lat, lng) {
        return this.mapsService.isAddressInSurgeZone(Number(lat), Number(lng));
    }
};
exports.MapsController = MapsController;
__decorate([
    (0, common_1.Get)('eta'),
    __param(0, (0, common_1.Query)('originLat')),
    __param(1, (0, common_1.Query)('originLng')),
    __param(2, (0, common_1.Query)('destLat')),
    __param(3, (0, common_1.Query)('destLng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MapsController.prototype, "getETA", null);
__decorate([
    (0, common_1.Get)('surge-eta'),
    __param(0, (0, common_1.Query)('originLat')),
    __param(1, (0, common_1.Query)('originLng')),
    __param(2, (0, common_1.Query)('destLat')),
    __param(3, (0, common_1.Query)('destLng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MapsController.prototype, "getSurgeETA", null);
__decorate([
    (0, common_1.Post)('reroute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MapsController.prototype, "getRerouting", null);
__decorate([
    (0, common_1.Get)('heatmap'),
    __param(0, (0, common_1.Query)('north')),
    __param(1, (0, common_1.Query)('south')),
    __param(2, (0, common_1.Query)('east')),
    __param(3, (0, common_1.Query)('west')),
    __param(4, (0, common_1.Query)('zoom')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MapsController.prototype, "getHeatmap", null);
__decorate([
    (0, common_1.Get)('surge-zones'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MapsController.prototype, "getSurgeZones", null);
__decorate([
    (0, common_1.Get)('check-surge-zone'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MapsController.prototype, "checkSurgeZone", null);
exports.MapsController = MapsController = __decorate([
    (0, common_1.Controller)('maps'),
    __metadata("design:paramtypes", [maps_service_1.MapsService])
], MapsController);
//# sourceMappingURL=maps.controller.js.map