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
exports.GeoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const driver_entity_1 = require("../../db/entities/driver.entity");
const order_entity_1 = require("../../db/entities/order.entity");
let GeoService = class GeoService {
    constructor(restaurantRepo, branchRepo, driverRepo, orderRepo, dataSource) {
        this.restaurantRepo = restaurantRepo;
        this.branchRepo = branchRepo;
        this.driverRepo = driverRepo;
        this.orderRepo = orderRepo;
        this.dataSource = dataSource;
        this.EARTH_RADIUS_KM = 6371;
        this.AVERAGE_SPEED_KMH = 30;
    }
    calculateDistance(point1, point2) {
        const dLat = this.toRadians(point2.lat - point1.lat);
        const dLng = this.toRadians(point2.lng - point1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(point1.lat)) *
                Math.cos(this.toRadians(point2.lat)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return this.EARTH_RADIUS_KM * c;
    }
    predictETA(distance, speedKmh = this.AVERAGE_SPEED_KMH) {
        const duration = (distance / speedKmh) * 60;
        const buffer = duration * 0.2;
        const eta = Math.ceil(duration + buffer);
        return {
            eta,
            distance,
            duration: Math.ceil(duration),
        };
    }
    async findNearbyBranches(customerLocation, radiusInKm = 5, limit = 20) {
        const radius = radiusInKm * 1000;
        return this.branchRepo
            .createQueryBuilder('branch')
            .leftJoinAndSelect('branch.restaurant', 'restaurant')
            .select([
            'branch',
            'restaurant',
            `ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) AS distance`,
        ])
            .where(`ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng: customerLocation.lng, lat: customerLocation.lat, radius })
            .andWhere('branch.isOnline = :isOnline', { isOnline: true })
            .andWhere('restaurant.isActive = :isActive', { isActive: true })
            .orderBy('distance', 'ASC')
            .limit(limit)
            .getRawMany()
            .then((results) => results.map((r) => ({
            ...r.branch,
            distance: r.distance / 1000,
            restaurant: r.restaurant,
        })));
    }
    async findNearestBranchForOrder(restaurantId, customerLocation) {
        const branches = await this.branchRepo.find({
            where: { isOnline: true },
        });
        if (!branches.length)
            return null;
        let nearest = branches[0];
        let minDistance = Infinity;
        for (const branch of branches) {
            if (branch.location) {
                const branchPoint = {
                    lat: Number(branch.location.lat),
                    lng: Number(branch.location.lng),
                };
                const distance = this.calculateDistance(customerLocation, branchPoint);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = branch;
                }
            }
        }
        return nearest;
    }
    async findAvailableDrivers(restaurantLocation, radiusInKm = 5, limit = 10) {
        const radius = radiusInKm * 1000;
        return this.driverRepo
            .createQueryBuilder('driver')
            .select([
            'driver',
            `ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) AS distance`,
        ])
            .where('driver.isOnline = :isOnline', { isOnline: true })
            .andWhere('driver.isAvailable = :isAvailable', { isAvailable: true })
            .andWhere(`ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng: restaurantLocation.lng, lat: restaurantLocation.lat, radius })
            .orderBy('distance', 'ASC')
            .limit(limit)
            .getRawMany()
            .then((results) => results.map((r) => r.driver));
    }
    async calculateDeliveryRoute(restaurantLocation, customerLocation) {
        const distance = this.calculateDistance(restaurantLocation, customerLocation);
        return this.predictETA(distance);
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
};
exports.GeoService = GeoService;
exports.GeoService = GeoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], GeoService);
//# sourceMappingURL=geo.service.js.map