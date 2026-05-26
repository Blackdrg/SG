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
exports.DriverAssignmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_entity_1 = require("../../db/entities/driver.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const driver_score_entity_1 = require("../../db/entities/driver-score.entity");
const delivery_sla_entity_1 = require("../../db/entities/delivery-sla.entity");
const driver_fraud_entity_1 = require("../../db/entities/driver-fraud.entity");
const dispatch_engine_service_1 = require("./dispatch-engine.service");
const eta_intelligence_service_1 = require("./eta-intelligence.service");
let DriverAssignmentService = class DriverAssignmentService {
    constructor(driverRepo, orderRepo, assignmentRepo, branchRepo, scoreRepo, slaRepo, fraudRepo, dataSource, dispatchEngine, etaIntelligence) {
        this.driverRepo = driverRepo;
        this.orderRepo = orderRepo;
        this.assignmentRepo = assignmentRepo;
        this.branchRepo = branchRepo;
        this.scoreRepo = scoreRepo;
        this.slaRepo = slaRepo;
        this.fraudRepo = fraudRepo;
        this.dataSource = dataSource;
        this.dispatchEngine = dispatchEngine;
        this.etaIntelligence = etaIntelligence;
    }
    async assignDriverToOrder(orderId) {
        return this.dispatchEngine.dispatchOrder(orderId);
    }
    async assignBatchDelivery(orderIds, driverId) {
        return this.dispatchEngine.assignBatchDelivery(orderIds, driverId);
    }
    async reassignOrder(assignmentId, newDriverId, reason = 'Driver unavailable') {
        return this.dispatchEngine.reassignOrder(assignmentId, newDriverId, reason);
    }
    async getDriverAssignments(driverId, status) {
        const where = { driver: { id: driverId } };
        if (status) {
            where.status = status;
        }
        return this.assignmentRepo.find({
            where,
            relations: ['order', 'driver', 'branch'],
            order: { createdAt: 'DESC' }
        });
    }
    async getOrderAssignments(orderId) {
        return this.assignmentRepo.find({
            where: { order: { id: orderId } },
            relations: ['driver', 'branch'],
            order: { createdAt: 'DESC' }
        });
    }
    async updateAssignmentStatus(assignmentId, status, actualTimeMinutes) {
        const assignment = await this.assignmentRepo.findOne({
            where: { id: assignmentId }
        });
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        assignment.status = status;
        if (actualTimeMinutes !== undefined) {
            assignment.actualTimeMinutes = actualTimeMinutes;
        }
        if (status === 'delivered') {
            assignment.actualTimeMinutes = actualTimeMinutes || 0;
        }
        return this.assignmentRepo.save(assignment);
    }
    async updateAssignmentRoute(assignmentId, routeData) {
        const assignment = await this.assignmentRepo.findOne({
            where: { id: assignmentId }
        });
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        assignment.routeData = routeData;
        return this.assignmentRepo.save(assignment);
    }
    async getAvailableDrivers(lat, lng, radiusInKm = 5) {
        const radius = radiusInKm * 1000;
        return this.driverRepo
            .createQueryBuilder('driver')
            .where('driver.isOnline = :online', { online: true })
            .andWhere('driver.kycStatus = :status', { status: 'approved' })
            .andWhere('driver.isFraudSuspicious = :fraud', { fraud: false })
            .andWhere(`ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng, lat, radius })
            .getMany();
    }
    async updateDriverScore(driverId) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            throw new Error('Driver not found');
        }
        const recentAssignments = await this.assignmentRepo.find({
            where: { driver: { id: driverId }, status: 'delivered' },
            relations: ['order'],
            order: { createdAt: 'DESC' },
            take: 50
        });
        if (recentAssignments.length === 0) {
            const score = this.scoreRepo.create({
                driver,
                overallScore: 0,
                onTimeDeliveryRate: 0,
                acceptanceRate: 0,
                cancellationRate: 0,
                customerRating: driver.rating || 0,
                totalDeliveries: driver.totalDeliveries,
                totalDistance: driver.totalDistance,
                averageSpeed: driver.averageSpeed,
                lastCalculatedAt: new Date()
            });
            return this.scoreRepo.save(score);
        }
        const totalDeliveries = recentAssignments.length;
        const onTimeDeliveries = recentAssignments.filter(a => a.actualTimeMinutes !== null &&
            a.estimatedTimeMinutes !== null &&
            a.actualTimeMinutes <= a.estimatedTimeMinutes * 1.2).length;
        const onTimeDeliveryRate = (onTimeDeliveries / totalDeliveries) * 100;
        const acceptanceRate = 95;
        const cancelledAssignments = await this.assignmentRepo.count({
            where: {
                driver: { id: driverId },
                status: 'failed'
            }
        });
        const totalAssignments = await this.assignmentRepo.count({
            where: { driver: { id: driverId } }
        });
        const cancellationRate = totalAssignments > 0
            ? (cancelledAssignments / totalAssignments) * 100
            : 0;
        const customerRating = driver.rating || 0;
        const overallScore = (onTimeDeliveryRate / 100) * 0.3 +
            (acceptanceRate / 100) * 0.2 +
            (1 - cancellationRate / 100) * 0.2 +
            (customerRating / 5) * 0.3;
        let score = await this.scoreRepo.findOne({ where: { driver: { id: driverId } } });
        if (!score) {
            score = this.scoreRepo.create({ driver });
        }
        score.overallScore = overallScore * 5;
        score.onTimeDeliveryRate = onTimeDeliveryRate;
        score.acceptanceRate = acceptanceRate;
        score.cancellationRate = cancellationRate;
        score.customerRating = customerRating;
        score.totalDeliveries = driver.totalDeliveries;
        score.totalDistance = driver.totalDistance;
        score.averageSpeed = driver.averageSpeed;
        score.lastCalculatedAt = new Date();
        return this.scoreRepo.save(score);
    }
    async recordDeliverySLA(driverId, branchId, metricName, value, unit, targetValue, targetUnit, measurementPeriod = 'per_delivery') {
        const [driver, branch] = await Promise.all([
            this.driverRepo.findOne({ where: { id: driverId } }),
            this.branchRepo.findOne({ where: { id: branchId } })
        ]);
        if (!driver || !branch) {
            throw new Error('Driver or branch not found');
        }
        const sla = this.slaRepo.create({
            driver,
            branch,
            metricName,
            value,
            unit,
            targetValue,
            targetUnit,
            measurementPeriod,
            measuredAt: new Date()
        });
        return this.slaRepo.save(sla);
    }
    async recordFraudIncident(driverId, orderId, branchId, fraudType, evidence, severity) {
        const [driver, order, branch] = await Promise.all([
            this.driverRepo.findOne({ where: { id: driverId } }),
            this.orderRepo.findOne({ where: { id: orderId } }),
            this.branchRepo.findOne({ where: { id: branchId } })
        ]);
        if (!driver || !order || !branch) {
            throw new Error('Driver, order, or branch not found');
        }
        const fraud = this.fraudRepo.create({
            driver,
            order,
            branch,
            fraudType,
            evidence,
            severity,
            isResolved: false
        });
        await this.updateDriverFraudScore(driverId, fraudType, severity);
        return this.fraudRepo.save(fraud);
    }
    async updateDriverFraudScore(driverId, fraudType, severity) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            return;
        }
        let scoreIncrease = 0;
        switch (severity) {
            case 'low':
                scoreIncrease = 5;
                break;
            case 'medium':
                scoreIncrease = 15;
                break;
            case 'high':
                scoreIncrease = 30;
                break;
        }
        let typeMultiplier = 1;
        switch (fraudType) {
            case 'fake_delivery':
            case 'gps_spoofing':
                typeMultiplier = 1.5;
                break;
            case 'route_deviation':
                typeMultiplier = 1.2;
                break;
            case 'late_delivery_abuse':
                typeMultiplier = 1.0;
                break;
            default:
                typeMultiplier = 1.0;
        }
        const newFraudScore = Math.min(100, driver.fraudScore + (scoreIncrease * typeMultiplier));
        const isFraudSuspicious = newFraudScore >= 70;
        await this.driverRepo.update(driverId, {
            fraudScore: newFraudScore,
            isFraudSuspicious,
            lastFraudCheck: new Date()
        });
    }
    async getDriverFraudHistory(driverId) {
        return this.fraudRepo.find({
            where: { driver: { id: driverId } },
            order: { createdAt: 'DESC' }
        });
    }
    async getDeliverySLAMetrics(driverId, branchId, metricName, limit = 100) {
        const where = {};
        if (driverId) {
            where.driver = { id: driverId };
        }
        if (branchId) {
            where.branch = { id: branchId };
        }
        if (metricName) {
            where.metricName = metricName;
        }
        return this.slaRepo.find({
            where,
            order: { measuredAt: 'DESC' },
            take: limit
        });
    }
};
exports.DriverAssignmentService = DriverAssignmentService;
exports.DriverAssignmentService = DriverAssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(driver_assignment_entity_1.DriverAssignmentEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(driver_score_entity_1.DriverScoreEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(delivery_sla_entity_1.DeliverySLAEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(driver_fraud_entity_1.DriverFraudEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        dispatch_engine_service_1.DispatchEngineService,
        eta_intelligence_service_1.ETAIntelligenceService])
], DriverAssignmentService);
//# sourceMappingURL=driver-assignment.service.js.map