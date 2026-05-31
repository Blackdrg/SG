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
var HeatmapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatmapService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const driver_entity_1 = require("../../db/entities/driver.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const surge_zone_entity_1 = require("../../db/entities/surge-zone.entity");
let HeatmapService = HeatmapService_1 = class HeatmapService {
    constructor(branchRepo, driverRepo, orderRepo, surgeZoneRepo, dataSource) {
        this.branchRepo = branchRepo;
        this.driverRepo = driverRepo;
        this.orderRepo = orderRepo;
        this.surgeZoneRepo = surgeZoneRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(HeatmapService_1.name);
    }
    async generateDeliveryHeatmap(centralPoint, radiusKm = 10) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentOrders = await this.orderRepo
            .createQueryBuilder('order')
            .where('order.createdAt >= :since', { since: twentyFourHoursAgo })
            .andWhere('order.status IN (:...statuses)', { statuses: ['delivered', 'completed'] })
            .getMany();
        const grid = {};
        for (const order of recentOrders) {
            const key = this.hashToGrid(order.deliveryAddressId || '', 0.001);
            grid[key] = (grid[key] || 0) + 1;
        }
        const points = Object.entries(grid).map(([key, weight]) => {
            const [lat, lng] = this.gridToCoords(key);
            return { lat, lng, weight };
        });
        const onlineDrivers = await this.driverRepo.find({
            where: { isOnline: true, isAvailable: false },
        });
        onlineDrivers.forEach(driver => {
            if (driver.currentLocation) {
                points.push({
                    lat: Number(driver.currentLocation.lat),
                    lng: Number(driver.currentLocation.lng),
                    weight: 2,
                });
            }
        });
        return {
            points,
            maxWeight: Math.max(...points.map(p => p.weight), 1),
            totalDeliveries: recentOrders.length,
        };
    }
    async getSurgeZoneStatus(point) {
        const activeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });
        for (const zone of activeZones) {
            if (zone.polygon && this.isPointInPolygon(point, zone.polygon)) {
                return {
                    inSurgeZone: true,
                    multiplier: Number(zone.multiplier),
                    zoneName: zone.name,
                };
            }
        }
        return { inSurgeZone: false, multiplier: 1.0 };
    }
    async calculateSurgeAdjustedETA(origin, destination) {
        const surgeCheck = await this.getSurgeZoneStatus(origin);
        const distanceKm = this.calculateDistance(origin, destination);
        const avgSpeedKmh = 30;
        const durationMinutes = Math.ceil((distanceKm / avgSpeedKmh) * 60);
        const buffer = durationMinutes * 0.2;
        const etaMinutes = Math.ceil(durationMinutes + buffer);
        return {
            etaMinutes,
            surgeMultiplier: surgeCheck.multiplier,
            surgeZone: surgeCheck.zoneName,
        };
    }
    async createSurgeZone(name, polygon, multiplier, startTime, endTime) {
        const zone = this.surgeZoneRepo.create({
            name,
            polygon,
            multiplier,
            startTime,
            endTime,
        });
        return await this.surgeZoneRepo.save(zone);
    }
    async updateSurgeZone(zoneId, updates) {
        await this.surgeZoneRepo.update(zoneId, updates);
        return this.surgeZoneRepo.findOne({ where: { id: zoneId } });
    }
    async getAllSurgeZones() {
        return await this.surgeZoneRepo.find({ order: { isActive: 'DESC' } });
    }
    isPointInPolygon(point, polygon) {
        let x = point.lng, y = point.lat;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lng, yi = polygon[i].lat;
            const xj = polygon[j].lng, yj = polygon[j].lat;
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect)
                inside = !inside;
        }
        return inside;
    }
    hashToGrid(hash, gridSize) {
        return `${Math.floor(Math.random() / gridSize) * gridSize},${Math.floor(Math.random() / gridSize) * gridSize}`;
    }
    gridToCoords(hash) {
        const [lat, lng] = hash.split(',').map(Number);
        return [lat, lng];
    }
    calculateDistance(loc1, loc2) {
        const R = 6371;
        const φ1 = loc1.lat * Math.PI / 180;
        const φ2 = loc2.lat * Math.PI / 180;
        const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
        const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};
exports.HeatmapService = HeatmapService;
exports.HeatmapService = HeatmapService = HeatmapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(surge_zone_entity_1.SurgeZoneEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], HeatmapService);
//# sourceMappingURL=heatmap.service.js.map