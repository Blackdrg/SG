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
var MapsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const surge_zone_entity_1 = require("../../db/entities/surge-zone.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
let MapsService = MapsService_1 = class MapsService {
    constructor(configService, surgeZoneRepo, branchRepo) {
        this.configService = configService;
        this.surgeZoneRepo = surgeZoneRepo;
        this.branchRepo = branchRepo;
        this.logger = new common_1.Logger(MapsService_1.name);
        this.baseUrl = 'https://maps.googleapis.com/maps/api';
        this.googleMapsApiKey = this.configService.get('GOOGLE_MAPS_API_KEY') || '';
    }
    async calculateETA(origin, destination) {
        if (!this.googleMapsApiKey) {
            return this.calculateHaversineETA(origin, destination);
        }
        try {
            const response = await fetch(`${this.baseUrl}/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&departure_time=now&key=${this.googleMapsApiKey}`);
            const data = await response.json();
            const row = data.rows?.[0];
            const element = row?.elements?.[0];
            if (!element) {
                throw new Error('No route found');
            }
            const trafficLevel = this.determineTrafficLevel(element.duration.value, element.duration_in_traffic?.value || element.duration.value);
            return {
                distance: element.distance.value,
                duration: element.duration.value,
                durationInTraffic: element.duration_in_traffic?.value || element.duration.value,
                trafficLevel,
            };
        }
        catch (error) {
            this.logger.error('Google Maps ETA failed, using fallback:', error);
            return this.calculateHaversineETA(origin, destination);
        }
    }
    calculateHaversineETA(origin, destination) {
        const R = 6371e3;
        const dLat = (destination.lat - origin.lat) * Math.PI / 180;
        const dLng = (destination.lng - origin.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return {
            distance,
            duration: distance / 1000 * 60,
            durationInTraffic: distance / 1000 * 72,
            trafficLevel: 'normal',
        };
    }
    determineTrafficLevel(normalDuration, trafficDuration) {
        const ratio = trafficDuration / normalDuration;
        if (ratio < 1.1)
            return 'light';
        if (ratio < 1.3)
            return 'normal';
        if (ratio < 1.6)
            return 'heavy';
        return 'severe';
    }
    async calculateSurgeETA(origin, destination) {
        const baseETA = await this.calculateETA(origin, destination);
        const surgeMultiplier = await this.getSurgeMultiplier(origin.lat, origin.lng);
        return {
            ...baseETA,
            durationInTraffic: Math.round(baseETA.durationInTraffic * surgeMultiplier),
        };
    }
    async getSurgeMultiplier(lat, lng) {
        const surgeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });
        for (const zone of surgeZones) {
            if (this.isPointInPolygon({ lat, lng }, zone.polygon)) {
                const now = new Date();
                const currentHour = now.getHours();
                if (zone.startTime && zone.endTime) {
                    const startHour = parseInt(zone.startTime.split(':')[0]);
                    const endHour = parseInt(zone.endTime.split(':')[0]);
                    if (currentHour >= startHour && currentHour <= endHour) {
                        return Number(zone.multiplier);
                    }
                }
                return Number(zone.multiplier);
            }
        }
        return 1.0;
    }
    isPointInPolygon(point, polygon) {
        let x = point.lng, y = point.lat;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lng, yi = polygon[i].lat;
            const xj = polygon[j].lng, yj = polygon[j].lat;
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect)
                inside = !inside;
        }
        return inside;
    }
    async getReroutingOptions(origin, destination, waypoints) {
        if (!this.googleMapsApiKey) {
            return {
                alternativeRoutes: [],
                originalRoute: { distance: 0, duration: 0 },
            };
        }
        try {
            const waypointParam = waypoints && waypoints.length > 0
                ? `&waypoints=${waypoints.map(w => w.lat + ',' + w.lng).join('|')}`
                : '';
            const response = await fetch(`${this.baseUrl}/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&alternatives=true&key=${this.googleMapsApiKey}${waypointParam}`);
            const data = await response.json();
            const routes = data.routes || [];
            const originalRoute = routes[0];
            const alternativeRoutes = routes.slice(1).map((route) => ({
                distance: route.legs?.[0]?.distance?.value || 0,
                duration: route.legs?.[0]?.duration?.value || 0,
                summary: route.summary || '',
            }));
            return {
                alternativeRoutes,
                originalRoute: {
                    distance: originalRoute?.legs?.[0]?.distance?.value || 0,
                    duration: originalRoute?.legs?.[0]?.duration?.value || 0,
                },
            };
        }
        catch (error) {
            this.logger.error('Rerouting failed:', error);
            return {
                alternativeRoutes: [],
                originalRoute: { distance: 0, duration: 0 },
            };
        }
    }
    async getHeatmapData(bounds, zoom = 12) {
        const branches = await this.branchRepo
            .createQueryBuilder('branch')
            .where('ST_Y(branch.location) BETWEEN :south AND :north', { south: bounds.south, north: bounds.north })
            .andWhere('ST_X(branch.location) BETWEEN :west AND :east', { west: bounds.west, east: bounds.east })
            .getMany();
        return branches.map(branch => ({
            lat: branch.location.lat,
            lng: branch.location.lng,
            weight: Math.floor(Math.random() * 100) + 1,
        }));
    }
    async getSurgeZones() {
        return this.surgeZoneRepo.find({ where: { isActive: true } });
    }
    async isAddressInSurgeZone(lat, lng) {
        const surgeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });
        for (const zone of surgeZones) {
            if (this.isPointInPolygon({ lat, lng }, zone.polygon)) {
                return {
                    inSurgeZone: true,
                    multiplier: Number(zone.multiplier),
                    zoneName: zone.name,
                };
            }
        }
        return { inSurgeZone: false };
    }
};
exports.MapsService = MapsService;
exports.MapsService = MapsService = MapsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(surge_zone_entity_1.SurgeZoneEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MapsService);
//# sourceMappingURL=maps.service.js.map