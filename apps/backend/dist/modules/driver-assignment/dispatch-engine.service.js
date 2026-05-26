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
exports.DispatchEngineService = void 0;
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
const order_interface_1 = require("../../shared/domain/order.interface");
let DispatchEngineService = class DispatchEngineService {
    constructor(driverRepo, orderRepo, assignmentRepo, branchRepo, scoreRepo, slaRepo, fraudRepo, dataSource) {
        this.driverRepo = driverRepo;
        this.orderRepo = orderRepo;
        this.assignmentRepo = assignmentRepo;
        this.branchRepo = branchRepo;
        this.scoreRepo = scoreRepo;
        this.slaRepo = slaRepo;
        this.fraudRepo = fraudRepo;
        this.dataSource = dataSource;
    }
    async dispatchOrder(orderId) {
        return this.dataSource.transaction(async (manager) => {
            const order = await manager.findOne(order_entity_1.OrderEntity, {
                where: { id: orderId },
                relations: ['restaurantId']
            });
            if (!order) {
                throw new Error('Order not found');
            }
            const branch = await manager.findOne(restaurant_branch_entity_1.RestaurantBranchEntity, {
                where: { restaurant: { id: order.restaurantId } }
            });
            if (!branch) {
                throw new Error('Restaurant branch not found');
            }
            const availableDrivers = await this.findOptimalDrivers(order, branch, manager);
            if (!availableDrivers || availableDrivers.length === 0) {
                throw new Error('No available drivers found');
            }
            const bestDriver = this.selectBestDriver(availableDrivers, order, branch);
            const assignment = await this.createAssignment(bestDriver, order, branch, 'single', manager);
            await manager.update(order_entity_1.OrderEntity, orderId, {
                driverId: bestDriver.id,
                status: order_interface_1.OrderStatus.DRIVER_ASSIGNED
            });
            return assignment;
        });
    }
    async findOptimalDrivers(order, branch, manager) {
        const drivers = await manager.find(driver_entity_1.DriverEntity, {
            where: {
                isOnline: true,
                kycStatus: 'approved',
                isFraudSuspicious: false
            }
        });
        return drivers;
    }
    selectBestDriver(drivers, order, branch) {
        return drivers.reduce((best, current) => {
            const bestScore = this.calculateDriverScore(best, order, branch);
            const currentScore = this.calculateDriverScore(current, order, branch);
            return currentScore > bestScore ? current : best;
        }, drivers[0]);
    }
    calculateDriverScore(driver, order, branch) {
        let score = 0;
        score += (driver.rating / 5) * 0.3;
        score += ((100 - driver.fraudScore) / 100) * 0.2;
        const experienceScore = Math.min(driver.totalDeliveries / 1000, 1);
        score += experienceScore * 0.2;
        const speedScore = 1 - Math.abs(driver.averageSpeed - 30) / 50;
        score += Math.max(0, speedScore) * 0.15;
        score += 0.15;
        return score;
    }
    async createAssignment(driver, order, branch, assignmentType, manager) {
        const assignment = manager.create(driver_assignment_entity_1.DriverAssignmentEntity, {
            driver,
            order,
            branch,
            assignmentType,
            status: 'assigned',
            distance: 5.0,
            estimatedTimeMinutes: 30,
            isPriority: false,
            retryCount: 0
        });
        return manager.save(driver_assignment_entity_1.DriverAssignmentEntity, assignment);
    }
    async assignBatchDelivery(orderIds, driverId) {
        return this.dataSource.transaction(async (manager) => {
            const driver = await manager.findOne(driver_entity_1.DriverEntity, { where: { id: driverId } });
            if (!driver) {
                throw new Error('Driver not found');
            }
            const orders = await manager.find(order_entity_1.OrderEntity, {
                where: { id: (0, typeorm_2.In)(orderIds) }
            });
            if (orders.length !== orderIds.length) {
                throw new Error('Some orders not found');
            }
            const branch = await manager.findOne(restaurant_branch_entity_1.RestaurantBranchEntity, {
                where: { restaurant: { id: orders[0].restaurantId } }
            });
            const assignments = [];
            for (const order of orders) {
                const assignment = manager.create(driver_assignment_entity_1.DriverAssignmentEntity, {
                    driver,
                    order,
                    branch,
                    assignmentType: 'batch',
                    batchId: `batch_${Date.now()}`,
                    status: 'assigned',
                    distance: 5.0,
                    estimatedTimeMinutes: 30,
                    isPriority: false,
                    retryCount: 0
                });
                assignments.push(await manager.save(driver_assignment_entity_1.DriverAssignmentEntity, assignment));
                await manager.update(order_entity_1.OrderEntity, order.id, {
                    driverId: driver.id,
                    status: order_interface_1.OrderStatus.DRIVER_ASSIGNED
                });
            }
            return assignments;
        });
    }
    async reassignOrder(assignmentId, newDriverId, reason) {
        return this.dataSource.transaction(async (manager) => {
            const currentAssignment = await manager.findOne(driver_assignment_entity_1.DriverAssignmentEntity, {
                where: { id: assignmentId },
                relations: ['driver', 'order', 'branch']
            });
            if (!currentAssignment) {
                throw new Error('Assignment not found');
            }
            const newDriver = await manager.findOne(driver_entity_1.DriverEntity, { where: { id: newDriverId } });
            if (!newDriver) {
                throw new Error('New driver not found');
            }
            currentAssignment.status = 'reassigned';
            currentAssignment.reassignedFrom = currentAssignment.driver.id;
            currentAssignment.retryCount += 1;
            await manager.save(driver_assignment_entity_1.DriverAssignmentEntity, currentAssignment);
            const newAssignment = manager.create(driver_assignment_entity_1.DriverAssignmentEntity, {
                driver: newDriver,
                order: currentAssignment.order,
                branch: currentAssignment.branch,
                assignmentType: currentAssignment.assignmentType,
                batchId: currentAssignment.batchId,
                status: 'assigned',
                distance: currentAssignment.distance,
                estimatedTimeMinutes: currentAssignment.estimatedTimeMinutes,
                isPriority: currentAssignment.isPriority,
                reassignedFrom: currentAssignment.driver.id,
                retryCount: 0
            });
            const savedAssignment = await manager.save(driver_assignment_entity_1.DriverAssignmentEntity, newAssignment);
            await manager.update(order_entity_1.OrderEntity, currentAssignment.order.id, {
                driverId: newDriver.id
            });
            return savedAssignment;
        });
    }
};
exports.DispatchEngineService = DispatchEngineService;
exports.DispatchEngineService = DispatchEngineService = __decorate([
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
        typeorm_2.DataSource])
], DispatchEngineService);
//# sourceMappingURL=dispatch-engine.service.js.map