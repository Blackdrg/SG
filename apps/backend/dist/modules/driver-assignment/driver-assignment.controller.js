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
exports.DriverAssignmentController = void 0;
const common_1 = require("@nestjs/common");
const driver_assignment_service_1 = require("./driver-assignment.service");
let DriverAssignmentController = class DriverAssignmentController {
    constructor(driverAssignmentService) {
        this.driverAssignmentService = driverAssignmentService;
    }
    async assignDriverToOrder(orderId) {
        return this.driverAssignmentService.assignDriverToOrder(orderId);
    }
    async assignBatchDelivery(orderIds, driverId) {
        return this.driverAssignmentService.assignBatchDelivery(orderIds, driverId);
    }
    async reassignOrder(assignmentId, newDriverId, reason = 'Driver unavailable') {
        return this.driverAssignmentService.reassignOrder(assignmentId, newDriverId, reason);
    }
    async getDriverAssignments(driverId, status) {
        return this.driverAssignmentService.getDriverAssignments(driverId, status);
    }
    async getOrderAssignments(orderId) {
        return this.driverAssignmentService.getOrderAssignments(orderId);
    }
    async updateAssignmentStatus(assignmentId, status, actualTimeMinutes) {
        return this.driverAssignmentService.updateAssignmentStatus(assignmentId, status, actualTimeMinutes);
    }
    async updateAssignmentRoute(assignmentId, routeData) {
        return this.driverAssignmentService.updateAssignmentRoute(assignmentId, routeData);
    }
    async getAvailableDrivers(lat, lng, radius = 5) {
        return this.driverAssignmentService.getAvailableDrivers(lat, lng, radius);
    }
    async updateDriverScore(driverId) {
        return this.driverAssignmentService.updateDriverScore(driverId);
    }
    async calculateETA(orderId, driverId) {
        return {
            etaMinutes: 25,
            confidence: 0.85,
            factors: {
                distance: 4.2,
                trafficConditions: { multiplier: 1.1, level: 'moderate' },
                kitchenDelay: { delayMinutes: 3, confidence: 0.8 },
                driverExperience: 150,
                timeOfDay: 14,
                weatherImpact: { multiplier: 1.0, condition: 'clear' }
            }
        };
    }
    async recordDeliverySLA(data) {
        return this.driverAssignmentService.recordDeliverySLA(data.driverId, data.branchId, data.metricName, data.value, data.unit, data.targetValue, data.targetUnit, data.measurementPeriod);
    }
    async getDeliverySLAMetrics(driverId, branchId, metricName, limit = 100) {
        return this.driverAssignmentService.getDeliverySLAMetrics(driverId, branchId, metricName, limit);
    }
    async recordFraudIncident(data) {
        return this.driverAssignmentService.recordFraudIncident(data.driverId, data.orderId, data.branchId, data.fraudType, data.evidence, data.severity);
    }
    async getDriverFraudHistory(driverId) {
        return this.driverAssignmentService.getDriverFraudHistory(driverId);
    }
    async getAllFraudIncidents(driverId, limit = 50) {
        return [];
    }
};
exports.DriverAssignmentController = DriverAssignmentController;
__decorate([
    (0, common_1.Post)('assign/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "assignDriverToOrder", null);
__decorate([
    (0, common_1.Post)('batch-assign'),
    __param(0, (0, common_1.Body)('orderIds')),
    __param(1, (0, common_1.Body)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "assignBatchDelivery", null);
__decorate([
    (0, common_1.Put)('reassign/:assignmentId'),
    __param(0, (0, common_1.Param)('assignmentId')),
    __param(1, (0, common_1.Body)('newDriverId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "reassignOrder", null);
__decorate([
    (0, common_1.Get)('driver/:driverId/assignments'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "getDriverAssignments", null);
__decorate([
    (0, common_1.Get)('order/:orderId/assignments'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "getOrderAssignments", null);
__decorate([
    (0, common_1.Put)(':assignmentId/status'),
    __param(0, (0, common_1.Param)('assignmentId')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('actualTimeMinutes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "updateAssignmentStatus", null);
__decorate([
    (0, common_1.Put)(':assignmentId/route'),
    __param(0, (0, common_1.Param)('assignmentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "updateAssignmentRoute", null);
__decorate([
    (0, common_1.Get)('drivers/available'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "getAvailableDrivers", null);
__decorate([
    (0, common_1.Post)('drivers/:driverId/score'),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "updateDriverScore", null);
__decorate([
    (0, common_1.Get)('eta/:orderId/:driverId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "calculateETA", null);
__decorate([
    (0, common_1.Post)('sla'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "recordDeliverySLA", null);
__decorate([
    (0, common_1.Get)('sla'),
    __param(0, (0, common_1.Query)('driverId')),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('metricName')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "getDeliverySLAMetrics", null);
__decorate([
    (0, common_1.Post)('fraud'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "recordFraudIncident", null);
__decorate([
    (0, common_1.Get)('drivers/:driverId/fraud'),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "getDriverFraudHistory", null);
__decorate([
    (0, common_1.Get)('fraud'),
    __param(0, (0, common_1.Query)('driverId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DriverAssignmentController.prototype, "getAllFraudIncidents", null);
exports.DriverAssignmentController = DriverAssignmentController = __decorate([
    (0, common_1.Controller)('driver-assignment'),
    __metadata("design:paramtypes", [driver_assignment_service_1.DriverAssignmentService])
], DriverAssignmentController);
//# sourceMappingURL=driver-assignment.controller.js.map