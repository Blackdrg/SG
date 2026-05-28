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
var EnhancedDeliveryService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedDeliveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_entity_1 = require("../../db/entities/driver.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const batch_entity_1 = require("../../db/entities/batch.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
const geo_service_1 = require("../../services/geo/geo.service");
const events_gateway_1 = require("../../events.gateway");
const order_interface_1 = require("../../shared/domain/order.interface");
let EnhancedDeliveryService = exports.EnhancedDeliveryService = EnhancedDeliveryService_1 = class EnhancedDeliveryService {
    constructor(driverRepo, orderRepo, batchRepo, driverAssignmentRepo, geoService, eventsGateway, dataSource) {
        this.driverRepo = driverRepo;
        this.orderRepo = orderRepo;
        this.batchRepo = batchRepo;
        this.driverAssignmentRepo = driverAssignmentRepo;
        this.geoService = geoService;
        this.eventsGateway = eventsGateway;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(EnhancedDeliveryService_1.name);
        this.surgeZones = new Map();
        this.incentiveRules = new Map();
        this.initializeSurgeZones();
        this.initializeIncentiveRules();
    }
    initializeSurgeZones() {
        this.surgeZones.set('central', {
            id: 'central',
            center: { lat: 30.7333, lng: 76.7794 },
            radiusKm: 5,
            surgeMultiplier: 1.0,
            active: false,
        });
    }
    initializeIncentiveRules() {
        this.incentiveRules.set('default', [
            {
                id: 'on_time bonus',
                type: 'bonus_per_order',
                value: 15,
                conditions: { minDeliveries: 0 },
                active: true,
            },
            {
                id: 'peak_hour_rate',
                type: 'peak_hour_rate',
                value: 1.2,
                conditions: {
                    timeWindow: { start: '12:00', end: '14:00' },
                },
                active: true,
            },
        ]);
    }
    async registerDriver(userId, data) {
        const driver = this.driverRepo.create({
            userId,
            ...data,
            kycStatus: 'pending',
        });
        const savedDriver = await this.driverRepo.save(driver);
        return savedDriver;
    }
    async updateLocation(driverId, lat, lng) {
        const result = await this.driverRepo.update(driverId, {
            currentLocation: { lat, lng },
        });
        this.eventsGateway.updateDriverLocation(driverId, { lat, lng });
        return result;
    }
    async findAvailableDrivers(lat, lng, radiusInKm = 5) {
        const radius = radiusInKm * 1000;
        return this.driverRepo
            .createQueryBuilder('driver')
            .where('driver.isOnline = :online', { online: true })
            .andWhere('driver.kycStatus = :status', { status: 'approved' })
            .andWhere('driver.isFraudSuspicious = :suspicious', { suspicious: false })
            .andWhere(`ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng, lat, radius })
            .orderBy('driver.rating', 'DESC')
            .addOrderBy('driver.totalDeliveries', 'ASC')
            .getMany();
    }
    async assignOrderToDriver(orderId, driverId) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new Error('Order not found');
        }
        await this.dataSource.manager.transaction(async (manager) => {
            await manager.update(order_entity_1.OrderEntity, orderId, {
                driverId,
                status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
                assignedAt: new Date(),
            });
            await manager.increment(driver_entity_1.DriverEntity, driverId, 'totalDeliveries', 0);
            const assignment = manager.create(driver_assignment_entity_1.DriverAssignmentEntity, {
                driverId,
                orderId,
                status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
                etaMinutes: order.eta || 30,
            });
            await manager.save(driver_assignment_entity_1.DriverAssignmentEntity, assignment);
        });
        await this.eventsGateway.assignOrderToDriver(driverId, orderId);
    }
    calculateTrafficAwareRoute(restaurantLocation, customerLocation, historicalSpeed) {
        const distance = this.geoService.calculateDistance(restaurantLocation, customerLocation);
        const basePrediction = this.geoService.predictETA(distance, historicalSpeed || 30);
        const timeOfDayFactor = this.getTimeOfDayTrafficFactor();
        const historicalSpeedFactor = historicalSpeed ? (30 / historicalSpeed) : 1;
        const trafficFactor = Math.max(0.5, Math.min(3.0, (timeOfDayFactor * historicalSpeedFactor)));
        const adjustedDuration = basePrediction.duration * trafficFactor;
        const adjustedETA = Math.ceil(adjustedDuration + (adjustedDuration * 0.2));
        return {
            eta: adjustedETA,
            distance: basePrediction.distance,
            duration: Math.ceil(adjustedDuration),
            trafficFactor
        };
    }
    getTimeOfDayTrafficFactor() {
        const hour = new Date().getHours();
        if (hour >= 7 && hour <= 9)
            return 1.5;
        if (hour >= 12 && hour <= 14)
            return 1.3;
        if (hour >= 17 && hour <= 20)
            return 1.7;
        return 1.0;
    }
    getSurgeMultiplier(location) {
        for (const zone of this.surgeZones.values()) {
            if (zone.active && this.geoService.calculateDistance(location, zone.center) <= zone.radiusKm) {
                return zone.surgeMultiplier;
            }
        }
        return 1.0;
    }
    async calculateSurgeForOrder(orderId) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: ['restaurant', 'customer'],
        });
        if (!order)
            return 1.0;
        const surge = this.getSurgeMultiplier(order.restaurant.location);
        const timeSurge = this.getTimeOfDayTrafficFactor();
        return Math.max(surge, timeSurge);
    }
    async handleFailedDelivery(orderId, driverId, failureReason, reasonDetails) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new Error('Order not found');
        }
        await this.dataSource.manager.transaction(async (manager) => {
            await manager.update(order_entity_1.OrderEntity, orderId, {
                status: order_interface_1.OrderStatus.DELIVERY_FAILED,
                failedAt: new Date(),
                failureReason,
                failureDetails: reasonDetails,
            });
            const driver = await manager.findOne(driver_entity_1.DriverEntity, { where: { id: driverId } });
            if (driver && reasonDetails !== 'customer_unavailable') {
                await manager.update(driver_entity_1.DriverEntity, driverId, {
                    failureCount: (driver.failureCount || 0) + 1,
                    isFraudSuspicious: (driver.failureCount || 0) >= 3,
                });
            }
        });
        await this.eventsGateway.notifyDeliveryFailed(orderId, driverId, failureReason);
        this.handleDriverNoShow(driverId, orderId);
    }
    async handleDriverNoShow(driverId, orderId) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver)
            return;
        const assignments = await this.driverAssignmentRepo.find({
            where: { driverId },
            order: { createdAt: 'DESC' },
            take: 5,
        });
        const recentNoShows = assignments.filter(a => a.status === order_interface_1.OrderStatus.DELIVERY_FAILED &&
            a.failureReason === 'no_show').length;
        if (recentNoShows >= 2) {
            await this.driverRepo.update(driverId, {
                isFraudSuspicious: true,
                fraudFlags: {
                    ...driver.fraudFlags,
                    noShowRisk: 0.8,
                },
            });
            this.logger.warn(`Driver ${driverId} flagged for no-shows`);
        }
    }
    async batchOrdersForDriver(orders) {
        const batches = [];
        const sortedOrders = [...orders].sort((a, b) => (a.eta || 0) - (b.eta || 0));
        let currentBatch = [];
        let currentBatchRouteDistance = 0;
        for (const order of sortedOrders) {
            const estimatedAddition = order.restaurant?.location
                ? this.geoService.calculateDistance(order.restaurant.location, order.customer.location)
                : 5;
            if (currentBatch.length >= 3 || currentBatchRouteDistance + estimatedAddition > 15) {
                if (currentBatch.length > 0) {
                    const batch = await this.createBatch(currentBatch);
                    batches.push(batch);
                }
                currentBatch = [order];
                currentBatchRouteDistance = estimatedAddition;
            }
            else {
                currentBatch.push(order);
                currentBatchRouteDistance += estimatedAddition;
            }
        }
        if (currentBatch.length > 0) {
            const batch = await this.createBatch(currentBatch);
            batches.push(batch);
        }
        return batches;
    }
    async createBatch(orders) {
        const totalDistance = orders.reduce((sum, order, i) => {
            if (i === 0)
                return 0;
            return sum + (this.geoService.calculateDistance(orders[i - 1].customer.location, order.restaurant?.location || { lat: 0, lng: 0 }));
        }, 0);
        const batch = this.batchRepo.create({
            orders: orders.map(o => o.id),
            totalDistance,
            status: 'pending',
            estimatedCompletionTime: new Date(Date.now() + totalDistance * 300000),
        });
        return await this.batchRepo.save(batch);
    }
    async calculateDeliveryIncentives(driverId, date = new Date()) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver)
            return { totalIncentive: 0, breakdown: {} };
        const rules = this.incentiveRules.get('default') || [];
        const breakdown = {};
        let totalIncentive = 0;
        for (const rule of rules) {
            if (!rule.active)
                continue;
            switch (rule.type) {
                case 'bonus_per_order':
                    const completedToday = await this.driverAssignmentRepo.count({
                        where: {
                            driverId,
                            status: order_interface_1.OrderStatus.DELIVERED,
                            createdAt: date,
                        },
                    });
                    if ((!rule.conditions.minDeliveries || completedToday >= rule.conditions.minDeliveries)) {
                        breakdown[rule.id] = rule.value * completedToday;
                        totalIncentive += breakdown[rule.id];
                    }
                    break;
                case 'peak_hour_rate':
                    const hour = date.getHours();
                    if (rule.conditions.timeWindow) {
                        const startHour = parseInt(rule.conditions.timeWindow.start.split(':')[0]);
                        const endHour = parseInt(rule.conditions.timeWindow.end.split(':')[0]);
                        if (hour >= startHour && hour <= endHour) {
                            const peakDeliveries = await this.driverAssignmentRepo.count({
                                where: { driverId, status: order_interface_1.OrderStatus.DRIVER_ASSIGNED }
                            });
                            breakdown[rule.id] = peakDeliveries * 10;
                            totalIncentive += breakdown[rule.id];
                        }
                    }
                    break;
                case 'completion_bonus':
                    if (driver.rating >= (rule.conditions.minRating || 4.5)) {
                        breakdown[rule.id] = rule.value;
                        totalIncentive += rule.value;
                    }
                    break;
            }
        }
        return { totalIncentive, breakdown };
    }
    async validateGeoFence(driverId, centerLat, centerLng, radiusKm = 1) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver?.currentLocation)
            return false;
        const distance = this.geoService.calculateDistance(driver.currentLocation, { lat: centerLat, lng: centerLng });
        return distance <= radiusKm;
    }
    async rerouteDriver(driverId, orderId, newDestination, reason) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver || driver.isAvailable)
            return;
        const assignment = await this.driverAssignmentRepo.findOne({
            where: { driverId, orderId },
        });
        if (!assignment)
            return;
        const newRoute = this.geoService.calculateDistance(driver.currentLocation, newDestination);
        await this.driverAssignmentRepo.update(assignment.id, {
            rerouted: true,
            rerouteReason: reason,
            reroutedTo: newDestination,
            updatedETA: Math.ceil(newRoute / 30 * 60),
        });
        await this.eventsGateway.notifyDriverReroute(driverId, orderId, newDestination, reason);
    }
    async reassignOrder(orderId, excludeDriverId) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: ['restaurant'],
        });
        if (!order)
            return false;
        const availableDrivers = await this.findAvailableDrivers(order.restaurant.location.lat, order.restaurant.location.lng, 5);
        const driversToConsider = availableDrivers.filter(d => d.id !== excludeDriverId && !d.isFraudSuspicious);
        if (driversToConsider.length === 0)
            return false;
        const bestDriver = driversToConsider.reduce((best, current) => (current.rating || 0) > (best.rating || 0) ? current : best);
        await this.assignOrderToDriver(orderId, bestDriver.id);
        return true;
    }
    async getDriverEarnings(driverId, period = 'today') {
        const assignments = await this.driverAssignmentRepo
            .createQueryBuilder('assignment')
            .where('assignment.driverId = :driverId', { driverId })
            .andWhere('assignment.status = :status', { status: order_interface_1.OrderStatus.DELIVERED })
            .getMany();
        const orderIds = assignments.map(a => a.orderId);
        const orders = await this.orderRepo.findByIds(orderIds);
        let totalEarnings = 0;
        for (const order of orders) {
            const surge = order.surgeMultiplier || 1;
            const incentive = await this.calculateDeliveryIncentives(driverId);
            totalEarnings += (order.total || 0) * surge + (incentive.totalIncentive / assignments.length);
        }
        return {
            totalEarnings,
            pendingPayout: totalEarnings * 0.9,
            incentives: totalEarnings * 0.1,
            ordersCompleted: assignments.length,
        };
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
};
exports.EnhancedDeliveryService = EnhancedDeliveryService = EnhancedDeliveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(batch_entity_1.BatchEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(driver_assignment_entity_1.DriverAssignmentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        geo_service_1.GeoService, typeof (_a = typeof events_gateway_1.EventsGateway !== "undefined" && events_gateway_1.EventsGateway) === "function" ? _a : Object, typeorm_2.DataSource])
], EnhancedDeliveryService);
//# sourceMappingURL=enhanced-delivery.service.js.map