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
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_entity_1 = require("../../db/entities/driver.entity");
const wallet_entity_1 = require("../../db/entities/wallet.entity");
const wallet_transaction_entity_1 = require("../../db/entities/wallet-transaction.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const batch_entity_1 = require("../../db/entities/batch.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
const driver_score_entity_1 = require("../../db/entities/driver-score.entity");
const driver_fraud_entity_1 = require("../../db/entities/driver-fraud.entity");
const geo_service_1 = require("../../services/geo/geo.service");
const common_2 = require("@nestjs/common");
let DeliveryService = class DeliveryService {
    constructor(driverRepo, walletRepo, transactionRepo, orderRepo, batchRepo, driverAssignmentRepo, driverScoreRepo, driverFraudRepo, geoService, dataSource) {
        this.driverRepo = driverRepo;
        this.walletRepo = walletRepo;
        this.transactionRepo = transactionRepo;
        this.orderRepo = orderRepo;
        this.batchRepo = batchRepo;
        this.driverAssignmentRepo = driverAssignmentRepo;
        this.driverScoreRepo = driverScoreRepo;
        this.driverFraudRepo = driverFraudRepo;
        this.geoService = geoService;
        this.dataSource = dataSource;
    }
    async registerDriver(userId, data) {
        const driver = this.driverRepo.create({
            userId,
            ...data,
            kycStatus: 'pending',
        });
        const savedDriver = await this.driverRepo.save(driver);
        const wallet = this.walletRepo.create({ userId, balance: 0 });
        await this.walletRepo.save(wallet);
        return savedDriver;
    }
    async updateLocation(driverId, lat, lng) {
        return this.driverRepo.update(driverId, {
            currentLocation: { lat, lng },
        });
    }
    async findAvailableDrivers(lat, lng, radiusInKm = 5) {
        const radius = radiusInKm * 1000;
        return this.driverRepo
            .createQueryBuilder('driver')
            .where('driver.isOnline = :online', { online: true })
            .andWhere('driver.kycStatus = :status', { status: 'approved' })
            .andWhere(`ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng, lat, radius })
            .getMany();
    }
    async assignOrderToDriver(orderId, driverId) {
        return this.orderRepo.update(orderId, {
            driverId,
            status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
        });
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
    async updateActualDeliveryTime(assignmentId, actualTimeMinutes) {
        return this.driverAssignmentRepo.update(assignmentId, {
            actualTimeMinutes: actualTimeMinutes,
            updatedAt: new Date()
        });
    }
    async calculateScoreComponents(driverId, restaurantId) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            throw new common_2.NotFoundException('Driver not found');
        }
        const totalDeliveries = driver.totalDeliveries || 0;
        const onTimeRate = totalDeliveries > 0 ? 0.95 : 0;
        const acceptanceRate = totalDeliveries > 0 ? 0.90 : 0;
        const cancellationRate = totalDeliveries > 0 ? 0.05 : 0;
        return {
            overallScore: driver.rating || 4.5,
            onTimeRate,
            acceptanceRate,
            cancellationRate,
        };
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.WalletEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(wallet_transaction_entity_1.WalletTransactionEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(batch_entity_1.BatchEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(driver_assignment_entity_1.DriverAssignmentEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(driver_score_entity_1.DriverScoreEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(driver_fraud_entity_1.DriverFraudEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        geo_service_1.GeoService,
        typeorm_2.DataSource])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map