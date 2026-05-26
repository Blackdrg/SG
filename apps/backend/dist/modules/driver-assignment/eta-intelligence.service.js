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
exports.ETAIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_entity_1 = require("../../db/entities/driver.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
const delivery_sla_entity_1 = require("../../db/entities/delivery-sla.entity");
const driver_fraud_entity_1 = require("../../db/entities/driver-fraud.entity");
let ETAIntelligenceService = class ETAIntelligenceService {
    constructor(driverRepo, orderRepo, branchRepo, assignmentRepo, slaRepo, fraudRepo) {
        this.driverRepo = driverRepo;
        this.orderRepo = orderRepo;
        this.branchRepo = branchRepo;
        this.assignmentRepo = assignmentRepo;
        this.slaRepo = slaRepo;
        this.fraudRepo = fraudRepo;
    }
    async calculateETA(orderId, driverId) {
        const [order, driver, branch, recentAssignments] = await Promise.all([
            this.orderRepo.findOne({ where: { id: orderId } }),
            this.driverRepo.findOne({ where: { id: driverId } }),
            this.branchRepo.findOne({
                where: { restaurant: { id: orderId } }
            }),
            this.assignmentRepo.find({
                where: { driver: { id: driverId } },
                order: { createdAt: 'DESC' },
                take: 10
            })
        ]);
        if (!order || !driver || !branch) {
            throw new Error('Required data not found for ETA calculation');
        }
        const factors = {
            distance: await this.calculateDistance(order, driver, branch),
            trafficConditions: await this.getTrafficConditions(),
            kitchenDelay: await this.getKitchenDelay(branch.id),
            driverExperience: driver.totalDeliveries,
            timeOfDay: new Date().getHours(),
            weatherImpact: await this.getWeatherImpact()
        };
        const baseTimeMinutes = (factors.distance / Math.max(driver.averageSpeed, 10)) * 60;
        let totalMultiplier = 1.0;
        totalMultiplier *= factors.trafficConditions.multiplier || 1.0;
        totalMultiplier *= (1 + (factors.kitchenDelay.delayMinutes / 60));
        const hour = factors.timeOfDay;
        if ((hour >= 7 && hour <= 9) || (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 20)) {
            totalMultiplier *= 1.3;
        }
        totalMultiplier *= factors.weatherImpact.multiplier || 1.0;
        const experienceFactor = Math.max(0.8, 1 - (driver.totalDeliveries / 2000));
        totalMultiplier *= experienceFactor;
        const etaMinutes = baseTimeMinutes * totalMultiplier;
        const confidence = this.calculateConfidence(factors, recentAssignments);
        return {
            etaMinutes: Math.round(etaMinutes),
            confidence,
            factors
        };
    }
    async calculateDistance(order, driver, branch) {
        return 5.0;
    }
    async getTrafficConditions() {
        return {
            multiplier: 1.0,
            level: 'normal'
        };
    }
    async getKitchenDelay(branchId) {
        return {
            delayMinutes: 5,
            confidence: 0.7
        };
    }
    async getWeatherImpact() {
        return {
            multiplier: 1.0,
            condition: 'clear'
        };
    }
    calculateConfidence(factors, recentAssignments) {
        let confidence = 0.8;
        if (recentAssignments.length < 3) {
            confidence *= 0.8;
        }
        if (factors.kitchenDelay && factors.kitchenDelay.confidence < 0.8) {
            confidence *= factors.kitchenDelay.confidence;
        }
        return Math.min(0.95, Math.max(0.3, confidence));
    }
    async updateETARegionalTime(assignmentId, currentLocation) {
        return {
            etaMinutes: 15,
            timestamp: new Date()
        };
    }
    async getHistoricalETAAccuracy(driverId, branchId, days = 7) {
        return {
            averageErrorMinutes: 3,
            accuracyPercentage: 85
        };
    }
};
exports.ETAIntelligenceService = ETAIntelligenceService;
exports.ETAIntelligenceService = ETAIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(driver_assignment_entity_1.DriverAssignmentEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(delivery_sla_entity_1.DeliverySLAEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(driver_fraud_entity_1.DriverFraudEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ETAIntelligenceService);
//# sourceMappingURL=eta-intelligence.service.js.map