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
    async calculateTrafficAwareRoute(restaurantLocation, customerLocation, historicalSpeed) {
        const basePrediction = await this.geoService.calculateDeliveryRoute(restaurantLocation, customerLocation);
        const timeOfDayFactor = this.getTimeOfDayTrafficFactor();
        const historicalSpeedFactor = historicalSpeed ?
            (this.geoService['AVERAGE_SPEED_KMH'] / historicalSpeed) : 1;
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
    async correctETAWithRealTimeData(assignmentId) {
        const assignment = await this.driverAssignmentRepo.findOne({
            where: { id: assignmentId },
            relations: ['order']
        });
        if (!assignment) {
            throw new common_2.NotFoundException(`Assignment with ID ${assignmentId} not found`);
        }
        if (!assignment.actualTimeMinutes) {
            throw new Error(`Actual time not recorded for assignment ${assignmentId}`);
        }
        const originalETA = assignment.estimatedTimeMinutes;
        const actualTime = assignment.actualTimeMinutes;
        const correctionFactor = actualTime / originalETA;
        const correctedETA = Math.ceil(originalETA * correctionFactor);
        return {
            correctionFactor,
            originalETA,
            actualTime,
            correctedETA
        };
    }
    async updateActualDeliveryTime(assignmentId, actualTimeMinutes) {
        return this.driverAssignmentRepo.update(assignmentId, {
            actualTimeMinutes: actualTimeMinutes,
            updatedAt: new Date()
        });
    }
    async getAverageETACorrectionFactor(driverId, areaCenter, radiusInKm = 5) {
        const queryBuilder = this.driverAssignmentRepo
            .createQueryBuilder('assignment')
            .where('assignment.actualTimeMinutes IS NOT NULL')
            .andWhere('assignment.estimatedTimeMinutes IS NOT NULL')
            .andWhere('assignment.actualTimeMinutes > 0')
            .andWhere('assignment.estimatedTimeMinutes > 0');
        if (driverId) {
            queryBuilder.andWhere('assignment.driverId = :driverId', { driverId });
        }
        const assignments = await queryBuilder.getMany();
        if (assignments.length === 0) {
            return {
                averageCorrectionFactor: 1.0,
                sampleSize: 0,
                confidence: 'low'
            };
        }
        const correctionFactors = assignments.map(a => a.actualTimeMinutes / a.estimatedTimeMinutes);
        const averageFactor = correctionFactors.reduce((sum, factor) => sum + factor, 0) / correctionFactors.length;
        let confidence = 'low';
        if (assignments.length >= 20) {
            confidence = 'high';
        }
        else if (assignments.length >= 5) {
            confidence = 'medium';
        }
        return {
            averageCorrectionFactor: averageFactor,
            sampleSize: assignments.length,
            confidence
        };
    }
    async calculateAndUpdateDriverScore(driverId, restaurantId) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            throw new common_2.NotFoundException(`Driver with ID ${driverId} not found`);
        }
        let branch = null;
        if (restaurantId) {
            branch = await this.geoService.branchRepo.findOne({
                where: { restaurant: { id: restaurantId }, isOnline: true }
            });
        }
        const scoreComponents = await this.calculateScoreComponents(driverId, restaurantId);
        let existingScore = null;
        if (branch) {
            existingScore = await this.driverScoreRepo.findOne({
                where: { driver: { id: driverId }, branch: { id: branch.id } }
            });
        }
        else {
            existingScore = await this.driverScoreRepo.findOne({
                where: { driver: { id: driverId } }
            });
        }
        const scoreData = {
            driver: driver,
            branch: branch,
            overallScore: scoreComponents.overallScore,
            onTimeDeliveryRate: scoreComponents.onTimeDeliveryRate,
            acceptanceRate: scoreComponents.acceptanceRate,
            cancellationRate: scoreComponents.cancellationRate,
            customerRating: scoreComponents.customerRating,
            totalDeliveries: scoreComponents.totalDeliveries,
            totalDistance: scoreComponents.totalDistance,
            averageSpeed: scoreComponents.averageSpeed,
            lastCalculatedAt: new Date()
        };
        if (existingScore) {
            await this.driverScoreRepo.update(existingScore.id, scoreData);
            existingScore = { ...existingScore, ...scoreData };
            return existingScore;
        }
        else {
            const newScore = this.driverScoreRepo.create(scoreData);
            return this.driverScoreRepo.save(newScore);
        }
    }
    async calculateScoreComponents(driverId, restaurantId) {
        const assignmentQuery = this.driverAssignmentRepo
            .createQueryBuilder('assignment')
            .leftJoin('assignment.driver', 'driver')
            .leftJoin('assignment.order', 'order')
            .where('driver.id = :driverId', { driverId });
        if (restaurantId) {
            assignmentQuery.andWhere('order.restaurantId = :restaurantId', { restaurantId });
        }
        const completedAssignments = await assignmentQuery
            .andWhere('assignment.status = :status', { status: 'delivered' })
            .getMany();
        const allAssignments = await assignmentQuery.getMany();
        const onTimeDeliveries = completedAssignments.filter(a => a.actualTimeMinutes !== null &&
            a.estimatedTimeMinutes !== null &&
            a.actualTimeMinutes <= a.estimatedTimeMinutes * 1.2).length;
        const onTimeDeliveryRate = completedAssignments.length > 0
            ? (onTimeDeliveries / completedAssignments.length) * 100
            : 0;
        const acceptedAssignments = allAssignments.filter(a => a.status !== 'failed' && a.status !== 'cancelled').length;
        const acceptanceRate = allAssignments.length > 0
            ? (acceptedAssignments / allAssignments.length) * 100
            : 0;
        const cancelledAssignments = allAssignments.filter(a => a.status === 'cancelled' || a.status === 'failed').length;
        const cancellationRate = allAssignments.length > 0
            ? (cancelledAssignments / allAssignments.length) * 100
            : 0;
        const customerRating = Math.max(0, Math.min(5, driver.rating || 0));
        const totalDeliveries = completedAssignments.length;
        const totalDistance = completedAssignments.reduce((sum, a) => sum + (a.distance || 0), 0);
        const totalTimeInHours = completedAssignments.reduce((sum, a) => sum + (a.actualTimeMinutes || 0) / 60, 0);
        const averageSpeed = totalTimeInHours > 0
            ? totalDistance / totalTimeInHours
            : 0;
        const onTimeScore = (onTimeDeliveryRate / 100) * 5;
        const acceptanceScore = (acceptanceRate / 100) * 5;
        const cancellationScore = ((100 - cancellationRate) / 100) * 5;
        const customerScore = customerRating;
        const speedDistanceScore = Math.min(5, (totalDeliveries / 100) * 5);
        const overallScore = (onTimeScore * 0.3 +
            acceptanceScore * 0.2 +
            cancellationScore * 0.1 +
            customerScore * 0.3 +
            speedDistanceScore * 0.1);
        return {
            overallScore: parseFloat(overallScore.toFixed(2)),
            onTimeDeliveryRate: parseFloat(onTimeDeliveryRate.toFixed(2)),
            acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
            cancellationRate: parseFloat(cancellationRate.toFixed(2)),
            customerRating: parseFloat(customerRating.toFixed(2)),
            totalDeliveries,
            totalDistance: parseFloat(totalDistance.toFixed(2)),
            averageSpeed: parseFloat(averageSpeed.toFixed(2))
        };
    }
    async getDriverScore(scoreId) {
        const score = await this.driverScoreRepo.findOne(scoreId, {
            relations: ['driver', 'branch']
        });
        if (!score) {
            throw new common_2.NotFoundException(`Driver score with ID ${scoreId} not found`);
        }
        return score;
    }
    async getCurrentDriverScore(driverId, restaurantId) {
        const query = this.driverScoreRepo
            .createQueryBuilder('score')
            .leftJoin('score.driver', 'driver')
            .where('driver.id = :driverId', { driverId });
        if (restaurantId) {
            query.leftJoin('score.branch', 'branch')
                .andWhere('branch.restaurantId = :restaurantId', { restaurantId });
        }
        else {
            query.andWhere('score.branch IS NULL');
        }
        return query
            .orderBy('score.lastCalculatedAt', 'DESC')
            .getOne();
    }
    async detectFraudFromGPSData(assignmentId, gpsData) {
        const assignment = await this.driverAssignmentRepo.findOne({
            where: { id: assignmentId },
            relations: ['order', 'driver']
        });
        if (!assignment) {
            throw new common_2.NotFoundException(`Assignment with ID ${assignmentId} not found`);
        }
        let fraudDetected = false;
        let fraudType = null;
        let riskScore = 0;
        const evidence = {};
        const gpsSpoofingRisk = this.detectGPSSpoofing(gpsData);
        evidence.gpsSpoofingRisk = gpsSpoofingRisk;
        const routeDeviationRisk = await this.detectRouteDeviation(assignment, gpsData);
        evidence.routeDeviationRisk = routeDeviationRisk;
        const timingAbuseRisk = this.detectTimingAbuse(assignment, gpsData);
        evidence.timingAbuseRisk = timingAbuseRisk;
        const fakeDeliveryRisk = this.detectFakeDelivery(assignment, gpsData);
        evidence.fakeDeliveryRisk = fakeDeliveryRisk;
        riskScore = Math.min(100, (gpsSpoofingRisk * 0.3) +
            (routeDeviationRisk * 0.3) +
            (timingAbuseRisk * 0.2) +
            (fakeDeliveryRisk * 0.2));
        if (riskScore >= 70) {
            fraudDetected = true;
            const risks = {
                gps_spoofing: gpsSpoofingRisk,
                route_deviation: routeDeviationRisk,
                timing_abuse: timingAbuseRisk,
                fake_delivery: fakeDeliveryRisk
            };
            fraudType = Object.keys(risks).reduce((a, b) => risks[a] > risks[b] ? a : b);
        }
        else if (riskScore >= 40) {
            fraudDetected = false;
        }
        return {
            fraudDetected,
            fraudType,
            riskScore: parseFloat(riskScore.toFixed(2)),
            evidence
        };
    }
    detectGPSSpoofing(gpsData) {
        if (gpsData.length < 2)
            return 0;
        let maxSpeedKmh = 0;
        const EARTH_RADIUS_KM = 6371;
        for (let i = 1; i < gpsData.length; i++) {
            const prev = gpsData[i - 1];
            const curr = gpsData[i];
            const dLat = this.toRadians(curr.lat - prev.lat);
            const dLng = this.toRadians(curr.lng - prev.lng);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(prev.lat)) *
                    Math.cos(this.toRadians(curr.lat)) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceKm = EARTH_RADIUS_KM * c;
            const timeDiffMs = curr.timestamp.getTime() - prev.timestamp.getTime();
            const timeDiffHr = timeDiffMs / (1000 * 60 * 60);
            if (timeDiffHr > 0) {
                const speedKmh = distanceKm / timeDiffHr;
                maxSpeedKmh = Math.max(maxSpeedKmh, speedKmh);
            }
        }
        if (maxSpeedKmh > 200)
            return 100;
        if (maxSpeedKmh > 100)
            return 70 + ((maxSpeedKmh - 100) / 100 * 30);
        if (maxSpeedKmh > 50)
            return 30 + ((maxSpeedKmh - 50) / 50 * 40);
        return Math.max(0, (maxSpeedKmh - 25) / 25 * 30);
    }
    async detectRouteDeviation(assignment, gpsData) {
        if (!assignment.routeData || !gpsData.length)
            return 0;
        const expectedWaypoints = assignment.routeData.waypoints || [];
        if (!expectedWaypoints.length)
            return 0;
        let totalDeviation = 0;
        let validComparisons = 0;
        for (const gpsPoint of gpsData) {
            let minDistance = Infinity;
            for (const waypoint of expectedWaypoints) {
                const distance = this.calculateDistance({ lat: gpsPoint.lat, lng: gpsPoint.lng }, { lat: waypoint.lat, lng: waypoint.lng });
                if (distance < minDistance)
                    minDistance = distance;
            }
            if (minDistance !== Infinity) {
                totalDeviation += minDistance;
                validComparisons++;
            }
        }
        if (validComparisons === 0)
            return 0;
        const avgDeviationKm = totalDeviation / validComparisons;
        if (avgDeviationKm > 5)
            return 100;
        if (avgDeviationKm > 2)
            return 60 + ((avgDeviationKm - 2) / 3 * 40);
        if (avgDeviationKm > 1)
            return 30 + ((avgDeviationKm - 1) / 1 * 30);
        return Math.max(0, avgDeviationKm * 30);
    }
    detectTimingAbuse(assignment, gpsData) {
        if (!assignment.estimatedTimeMinutes || !gpsData.length)
            return 0;
        if (gpsData.length < 2)
            return 0;
        const firstTimestamp = gpsData[0].timestamp.getTime();
        const lastTimestamp = gpsData[gpsData.length - 1].timestamp.getTime();
        const actualTimeMinutes = (lastTimestamp - firstTimestamp) / (1000 * 60);
        if (actualTimeMinutes <= 0)
            return 0;
        const timeRatio = actualTimeMinutes / assignment.estimatedTimeMinutes;
        if (timeRatio < 0.3) {
            return 100;
        }
        else if (timeRatio < 0.5) {
            return 70 + ((0.5 - timeRatio) / 0.2 * 30);
        }
        else if (timeRatio > 2.5) {
            return 100;
        }
        else if (timeRatio > 2.0) {
            return 60 + ((timeRatio - 2.0) / 0.5 * 40);
        }
        else if (timeRatio > 1.5) {
            return 30 + ((timeRatio - 1.5) / 0.5 * 30);
        }
        else if (timeRatio < 0.8) {
            return 30 + ((0.8 - timeRatio) / 0.3 * 30);
        }
        return 0;
    }
    detectFakeDelivery(assignment, gpsData) {
        if (gpsData.length < 2)
            return 50;
        let totalDistanceKm = 0;
        const EARTH_RADIUS_KM = 6371;
        for (let i = 1; i < gpsData.length; i++) {
            const prev = gpsData[i - 1];
            const curr = gpsData[i];
            const dLat = this.toRadians(curr.lat - prev.lat);
            const dLng = this.toRadians(curr.lng - prev.lng);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(prev.lat)) *
                    Math.cos(this.toRadians(curr.lat)) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceKm = EARTH_RADIUS_KM * c;
            totalDistanceKm += distanceKm;
        }
        let expectedDistanceKm = assignment.distance || 0;
        if (expectedDistanceKm === 0 && assignment.order) {
        }
        if (expectedDistanceKm > 0) {
            const distanceRatio = totalDistanceKm / expectedDistanceKm;
            if (distanceRatio < 0.3) {
                return 80 + ((0.3 - distanceRatio) / 0.3 * 20);
            }
            else if (distanceRatio < 0.6) {
                return 40 + ((0.6 - distanceRatio) / 0.3 * 40);
            }
        }
        else {
            if (totalDistanceKm < 0.1) {
                return 90;
            }
            else if (totalDistanceKm < 0.5) {
                return 60;
            }
        }
        return 0;
    }
    async recordFraudIncident(assignmentId, fraudType, evidence, severity = 'medium') {
        const assignment = await this.driverAssignmentRepo.findOne({
            where: { id: assignmentId },
            relations: ['driver', 'order']
        });
        if (!assignment) {
            throw new common_2.NotFoundException(`Assignment with ID ${assignmentId} not found`);
        }
        const fraud = this.driverFraudRepo.create({
            driver: assignment.driver,
            order: assignment.order,
            fraudType,
            evidence,
            severity,
            isResolved: false
        });
        return this.driverFraudRepo.save(fraud);
    }
    async getDriverFraudScore(driverId) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            throw new common_2.NotFoundException(`Driver with ID ${driverId} not found`);
        }
        return {
            fraudScore: driver.fraudScore,
            isFraudSuspicious: driver.isFraudSuspicious,
            fraudFlags: driver.fraudFlags || {
                gpsSpoofingRisk: 0,
                routeDeviationRisk: 0,
                timingAbuseRisk: 0,
                fakeDeliveryRisk: 0
            },
            lastFraudCheck: driver.lastFraudCheck || null
        };
    }
    async updateDriverFraudScore(driverId) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            throw new common_2.NotFoundException(`Driver with ID ${driverId} not found`);
        }
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentFraud = await this.driverFraudRepo.find({
            where: {
                driver: { id: driverId },
                createdAt: moreThanOrEqual(thirtyDaysAgo)
            }
        });
        let newScore = 0;
        for (const incident of recentFraud) {
            let incidentScore = 0;
            switch (incident.severity) {
                case 'low':
                    incidentScore = 10;
                    break;
                case 'medium':
                    incidentScore = 25;
                    break;
                case 'high':
                    incidentScore = 50;
                    break;
            }
            newScore = Math.min(100, newScore + incidentScore);
        }
        const fraudFlags = {
            gpsSpoofingRisk: 0,
            routeDeviationRisk: 0,
            timingAbuseRisk: 0,
            fakeDeliveryRisk: 0
        };
        for (const incident of recentFraud) {
            switch (incident.fraudType) {
                case 'gps_spoofing':
                    fraudFlags.gpsSpoofingRisk = Math.min(1, fraudFlags.gpsSpoofingRisk + 0.2);
                    break;
                case 'route_deviation':
                    fraudFlags.routeDeviationRisk = Math.min(1, fraudFlags.routeDeviationRisk + 0.2);
                    break;
                case 'late_delivery_abuse':
                    fraudFlags.timingAbuseRisk = Math.min(1, fraudFlags.timingAbuseRisk + 0.2);
                    break;
                case 'fake_delivery':
                    fraudFlags.fakeDeliveryRisk = Math.min(1, fraudFlags.fakeDeliveryRisk + 0.2);
                    break;
                default:
                    fraudFlags.gpsSpoofingRisk = Math.min(1, fraudFlags.gpsSpoofingRisk + 0.05);
                    fraudFlags.routeDeviationRisk = Math.min(1, fraudFlags.routeDeviationRisk + 0.05);
                    fraudFlags.timingAbuseRisk = Math.min(1, fraudFlags.timingAbuseRisk + 0.05);
                    fraudFlags.fakeDeliveryRisk = Math.min(1, fraudFlags.fakeDeliveryRisk + 0.05);
                    break;
            }
        }
        driver.fraudScore = newScore;
        driver.isFraudSuspicious = newScore >= 50;
        driver.fraudFlags = fraudFlags;
        driver.lastFraudCheck = new Date();
        await this.driverRepo.save(driver);
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
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
        return 6371 * c;
    }
    async getAverageETACorrectionFactor(driverId, areaCenter, radiusInKm = 5) {
        const queryBuilder = this.driverAssignmentRepo
            .createQueryBuilder('assignment')
            .where('assignment.actualTimeMinutes IS NOT NULL')
            .andWhere('assignment.estimatedTimeMinutes IS NOT NULL')
            .andWhere('assignment.actualTimeMinutes > 0')
            .andWhere('assignment.estimatedTimeMinutes > 0');
        if (driverId) {
            queryBuilder.andWhere('assignment.driverId = :driverId', { driverId });
        }
        const assignments = await queryBuilder.getMany();
        if (assignments.length === 0) {
            return {
                averageCorrectionFactor: 1.0,
                sampleSize: 0,
                confidence: 'low'
            };
        }
        const correctionFactors = assignments.map(a => a.actualTimeMinutes / a.estimatedTimeMinutes);
        const averageFactor = correctionFactors.reduce((sum, factor) => sum + factor, 0) / correctionFactors.length;
        let confidence = 'low';
        if (assignments.length >= 20) {
            confidence = 'high';
        }
        else if (assignments.length >= 5) {
            confidence = 'medium';
        }
        return {
            averageCorrectionFactor: averageFactor,
            sampleSize: assignments.length,
            confidence
        };
    }
    async createBatch(name, description, restaurantId, recipeId, quantityPrepared, quantityUnit) {
        const batch = this.batchRepo.create({
            name,
            description,
            recipe: { id: recipeId },
            quantityPrepared,
            quantityUnit,
            status: 'preparing',
            branch: { id: restaurantId }
        });
        return this.batchRepo.save(batch);
    }
    async addOrdersToBatch(batchId, orderIds) {
        const batch = await this.batchRepo.findOne({ where: { id: batchId } });
        if (!batch) {
            throw new common_2.NotFoundException(`Batch with ID ${batchId} not found`);
        }
        const orders = await this.orderRepo.findByIds(orderIds);
        if (orders.length !== orderIds.length) {
            throw new Error('One or more orders not found');
        }
        const updatePromises = orderIds.map(orderId => this.orderRepo.update(orderId, {
            status: order_interface_1.OrderStatus.BATCHED
        }));
        await Promise.all(updatePromises);
        if (batch.status === 'preparing') {
            batch.status = 'ready';
            batch.completedAt = new Date();
            await this.batchRepo.save(batch);
        }
        return { success: true, batchId, orderCount: orderIds.length };
    }
    async assignBatchToDriver(batchId, driverId) {
        const batch = await this.batchRepo.findOne({ where: { id: batchId } });
        if (!batch) {
            throw new common_2.NotFoundException(`Batch with ID ${batchId} not found`);
        }
        if (batch.status !== 'ready') {
            throw new Error(`Batch ${batchId} is not ready for assignment. Current status: ${batch.status}`);
        }
        const batchedOrders = await this.orderRepo.find({
            where: {
                status: order_interface_1.OrderStatus.BATCHED,
                restaurantId: batch.branch.id
            }
        });
        if (batchedOrders.length === 0) {
            throw new Error(`No batched orders found for batch ${batchId}`);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.update(batch_entity_1.BatchEntity, batchId, {
                status: 'used',
                updatedAt: new Date()
            });
            const assignmentPromises = batchedOrders.map(async (order) => {
                const existingAssignment = await this.driverAssignmentRepo.findOne({
                    where: { orderId: order.id, status: 'assigned' }
                });
                if (!existingAssignment) {
                    const assignment = this.driverAssignmentRepo.create({
                        orderId: order.id,
                        driverId: driverId,
                        branchId: order.restaurantId,
                        batchId: batchId,
                        assignmentType: 'batch',
                        status: 'assigned',
                        retryCount: 0
                    });
                    return this.driverAssignmentRepo.save(assignment);
                }
                return null;
            });
            const results = await Promise.all(assignmentPromises);
            const successfulAssignments = results.filter(r => r !== null);
            await queryRunner.commitTransaction();
            return {
                success: true,
                batchId,
                driverId,
                orderCount: successfulAssignments.length,
                message: `Successfully assigned ${successfulAssignments.length} orders from batch ${batchId} to driver ${driverId}`
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async reassignOrderToDriver(orderId, newDriverId, reason) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_2.NotFoundException(`Order with ID ${orderId} not found`);
        }
        if (!order.driverId) {
            throw new Error(`Order ${orderId} is not currently assigned to any driver`);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.update(order_entity_1.OrderEntity, orderId, {
                driverId: newDriverId,
            });
            await queryRunner.manager.update(driver_assignment_entity_1.DriverAssignmentEntity, {
                orderId: orderId,
                status: 'assigned'
            }, {
                status: 'reassigned',
                reassignedFrom: order.driverId,
                updatedAt: new Date()
            });
            const newAssignment = this.driverAssignmentRepo.create({
                orderId: orderId,
                driverId: newDriverId,
                branchId: order.restaurantId,
                assignmentType: 'single',
                status: 'assigned',
                reassignedFrom: order.driverId,
                retryCount: 0
            });
            await queryRunner.manager.save(newAssignment);
            await queryRunner.commitTransaction();
            return { success: true, orderId, newDriverId, reason };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async completeDelivery(orderId, driverId, earning) {
        return this.dataSource.transaction(async (manager) => {
            await manager.update(order_entity_1.OrderEntity, orderId, { status: order_interface_1.OrderStatus.DELIVERED });
            const wallet = await manager.findOne(wallet_entity_1.WalletEntity, { where: { userId: driverId } });
            if (wallet) {
                wallet.balance = Number(wallet.balance) + earning;
                await manager.save(wallet);
                const transaction = this.transactionRepo.create({
                    walletId: wallet.id,
                    amount: earning,
                    type: 'credit',
                    description: `Earning for order #${orderId}`,
                    referenceId: orderId,
                });
                await manager.save(transaction);
            }
        });
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