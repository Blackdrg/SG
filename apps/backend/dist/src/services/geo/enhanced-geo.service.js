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
var EnhancedGeoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedGeoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const module_1 = require();
const module_2 = require();
let EnhancedGeoService = EnhancedGeoService_1 = class EnhancedGeoService {
    constructor(restaurantRepo, branchRepo, driverRepo, orderRepo, dataSource) {
        this.restaurantRepo = restaurantRepo;
        this.branchRepo = branchRepo;
        this.driverRepo = driverRepo;
        this.orderRepo = orderRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(EnhancedGeoService_1.name);
        this.EARTH_RADIUS_KM = 6371;
        this.AVERAGE_SPEED_KMH = 30;
        this.GEOFENCE_RADIUS_M = 100;
        this.TRAFFIC_UPDATE_INTERVAL_MS = 30000;
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
    predictETA(distance, speedKmh = this.AVERAGE_SPEED_KMH, trafficConditions = []) {
        let adjustedSpeed = speedKmh;
        let totalDelay = 0;
        for (const condition of trafficConditions) {
            totalDelay += condition.delayMinutes;
        }
        if (totalDelay > 0) {
            const baseTimeHours = distance / speedKmh;
            const delayedTimeHours = baseTimeHours + (totalDelay / 60);
            adjustedSpeed = distance / delayedTimeHours;
        }
        const duration = (distance / adjustedSpeed) * 60;
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
            ST_DistanceSphere(branch.location, geometry, ST_MakePoint(lng, lat), geometry), AS, distance,
        ])
            .where(ST_DistanceSphere(branch.location, geometry, ST_MakePoint(lng, lat), geometry) <= , radius, { lng: customerLocation.lng, lat: customerLocation.lat, radius })
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
            where: { restaurant: { id: restaurantId }, isOnline: true },
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
            ST_DistanceSphere(driver.currentLocation, geometry, ST_MakePoint(lng, lat), geometry), AS, distance,
        ])
            .where('driver.isOnline = :isOnline', { isOnline: true })
            .andWhere('driver.isAvailable = :isAvailable', { isAvailable: true })
            .andWhere(ST_DistanceSphere(driver.currentLocation, geometry, ST_MakePoint(lng, lat), geometry) <= , radius, { lng: restaurantLocation.lng, lat: restaurantLocation.lat, radius })
            .orderBy('distance', 'ASC')
            .limit(limit)
            .getRawMany()
            .then((results) => results.map((r) => r.driver));
    }
    async calculateDeliveryRoute(restaurantLocation, customerLocation, avoidCongestion = false) {
        const trafficConditions = avoidCongestion ? [] : [
            {
                segment: {
                    start: { lat: restaurantLocation.lat, lng: restaurantLocation.lng },
                    end: customerLocation
                },
                congestionLevel: 'medium',
                speedKmh: 20,
                delayMinutes: 5
            }
        ];
        const distance = this.calculateDistance(restaurantLocation, customerLocation);
        return this.predictETA(distance, this.AVERAGE_SPEED_KMH, trafficConditions);
    }
    async updateDriverLocation(driverId, locationUpdate) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            throw new Error(Driver, not, found);
        }
        driver.currentLocation = {
            lat: locationUpdate.latitude,
            lng: locationUpdate.longitude,
        };
        driver.lastLocationUpdate = locationUpdate.timestamp;
        if (locationUpdate.speed !== undefined) {
            const alpha = 0.3;
            driver.averageSpeed =
                (alpha * locationUpdate.speed) +
                    ((1 - alpha) * (driver.averageSpeed || 0));
        }
        if (driver.currentLocation && locationUpdate.timestamp) {
            if (locationUpdate.speed && locationUpdate.timestamp) {
                const timeDeltaHours = 1 / 60;
                const distanceDelta = locationUpdate.speed * timeDeltaHours;
                driver.totalDistance += distanceDelta;
            }
        }
        const updatedDriver = await this.driverRepo.save(driver);
        this.logger.log(Updated, location);
        for (driver; ; )
            : , ;
        ;
        return updatedDriver;
    }
    async checkGeofence(driverId, branchId) {
        const [driver, branch] = await Promise.all([
            this.driverRepo.findOne({ where: { id: driverId } }),
            this.branchRepo.findOne({ where: { id: branchId } })
        ]);
        if (!driver || !branch) {
            return null;
        }
        if (!driver.currentLocation || !branch.location) {
            return null;
        }
        const distance = this.calculateDistance({ lat: driver.currentLocation.lat, lng: driver.currentLocation.lng }, { lat: branch.location.lat, lng: branch.location.lng });
        const isWithinGeofence = distance <= (this.GEOFENCE_RADIUS_M / 1000);
        if (isWithinGeofence) {
            return {
                driverId,
                branchId,
                event: 'entered',
                timestamp: new Date(),
                location: {
                    lat: driver.currentLocation.lat,
                    lng: driver.currentLocation.lng
                }
            };
        }
        else {
            return {
                driverId,
                branchId,
                event: 'exited',
                timestamp: new Date(),
                location: {
                    lat: driver.currentLocation.lat,
                    lng: driver.currentLocation.lng
                }
            };
        }
    }
    async optimizeRoute(waypoints) {
        if (waypoints.length < 2) {
            throw new Error('At least 2 waypoints required for route optimization');
        }
        const unvisited = [...waypoints];
        const orderedWaypoints = [];
        let currentPoint = unvisited.shift();
        orderedWaypoints.push(currentPoint);
        while (unvisited.length > 0) {
            let nearestIndex = 0;
            let minDistance = Infinity;
            for (let i = 0; i < unvisited.length; i++) {
                const distance = this.calculateDistance(currentPoint, unvisited[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestIndex = i;
                }
            }
            currentPoint = unvisited.splice(nearestIndex, 1)[0];
            orderedWaypoints.push(currentPoint);
        }
        let totalDistance = 0;
        const instructions = [];
        for (let i = 0; i < orderedWaypoints.length - 1; i++) {
            const distance = this.calculateDistance(orderedWaypoints[i], orderedWaypoints[i + 1]);
            totalDistance += distance;
            const trafficConditions = [{
                    segment: {
                        start: orderedWaypoints[i],
                        end: orderedWaypoints[i + 1]
                    },
                    congestionLevel: 'low',
                    speedKmh: 35,
                    delayMinutes: 2
                }];
            const etaLeg = this.predictETA(distance, 30, trafficConditions);
            instructions.push({
                step: i + 1,
                instruction: Proceed, to, waypoint,
                distance,
                duration: etaLeg.duration
            });
        }
        const totalETA = this.predictETA(totalDistance).eta;
        return {
            orderedWaypoints,
            totalDistance,
            totalETA,
            instructions
        };
    }
    calculateRouteDistance(points) {
        let totalDistance = 0;
        for (let i = 0; i < points.length - 1; i++) {
            totalDistance += this.calculateDistance(points[i], points[i + 1]);
        }
        return totalDistance;
    }
    async getTrafficConditions(start, end) {
        const distance = this.calculateDistance(start, end);
        if (distance > 10) {
            return [{
                    segment: { start, end },
                    congestionLevel: 'medium',
                    speedKmh: 25,
                    delayMinutes: Math.ceil(distance / 5)
                }];
        }
        else if (distance > 5) {
            return [{
                    segment: { start, end },
                    congestionLevel: 'low',
                    speedKmh: 30,
                    delayMinutes: Math.ceil(distance / 10)
                }];
        }
        return [];
    }
    async calculateETAWithLiveTraffic(start, end, vehicleSpeedKmh = this.AVERAGE_SPEED_KMH) {
        const trafficConditions = await this.getTrafficConditions(start, end);
        const distance = this.calculateDistance(start, end);
        const etaPrediction = this.predictETA(distance, vehicleSpeedKmh, trafficConditions);
        return {
            ...etaPrediction,
            trafficConditions
        };
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
};
exports.EnhancedGeoService = EnhancedGeoService;
exports.EnhancedGeoService = EnhancedGeoService = EnhancedGeoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(module_1.DriverEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(module_2.OrderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], EnhancedGeoService);
//# sourceMappingURL=enhanced-geo.service.js.map