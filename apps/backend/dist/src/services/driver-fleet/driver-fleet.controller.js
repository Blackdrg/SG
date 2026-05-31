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
exports.DriverFleetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const driver_fleet_service_1 = require("./driver-fleet.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
let DriverFleetController = class DriverFleetController {
    constructor(fleetService) {
        this.fleetService = fleetService;
    }
    startShift(driverId) {
        return this.fleetService.startShift(driverId);
    }
    endShift(driverId, shiftId) {
        return this.fleetService.endShift(driverId, shiftId);
    }
    getShifts(driverId) {
        return this.fleetService.getShifts(driverId);
    }
    getEarnings(body) {
        return this.fleetService.getEarnings(body.driverId, { start: new Date(body.start), end: new Date(body.end) });
    }
    calculateIncentives(driverId) {
        return this.fleetService.calculateIncentives(driverId);
    }
    issuePenalty(body) {
        return this.fleetService.issuePenalty(body.driverId, body);
    }
    getPerformance(driverId) {
        return this.fleetService.getPerformanceRanking(driverId);
    }
    getSchedule(driverId) {
        return this.fleetService.getDriverSchedule(driverId);
    }
    approvePenalty(id, approvedBy) {
        return this.fleetService.approvePenalty(id, approvedBy);
    }
    waivePenalty(id, body) {
        return this.fleetService.waivePenalty(id, body.waivedBy, body.reason);
    }
};
exports.DriverFleetController = DriverFleetController;
__decorate([
    (0, common_1.Post)('shifts/start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a driver shift' }),
    __param(0, (0, common_1.Body)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriverFleetController.prototype, "startShift", null);
__decorate([
    (0, common_1.Post)('shifts/end'),
    (0, swagger_1.ApiOperation)({ summary: 'End a driver shift' }),
    __param(0, (0, common_1.Body)('driverId')),
    __param(1, (0, common_1.Body)('shiftId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DriverFleetController.prototype, "endShift", null);
__decorate([
    (0, common_1.Get)('shifts/:driverId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get driver shift history' }),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriverFleetController.prototype, "getShifts", null);
__decorate([
    (0, common_1.Post)('earnings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get driver earnings for a period' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DriverFleetController.prototype, "getEarnings", null);
__decorate([
    (0, common_1.Post)('incentives/calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate driver incentives' }),
    __param(0, (0, common_1.Body)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriverFleetController.prototype, "calculateIncentives", null);
__decorate([
    (0, common_1.Post)('penalties'),
    (0, swagger_1.ApiOperation)({ summary: 'Issue a penalty to driver' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DriverFleetController.prototype, "issuePenalty", null);
__decorate([
    (0, common_1.Get)('performance/:driverId?'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance ranking' }),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriverFleetController.prototype, "getPerformance", null);
__decorate([
    (0, common_1.Get)('schedule/:driverId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get driver schedule' }),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriverFleetController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Put)('penalties/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve penalty' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('approvedBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DriverFleetController.prototype, "approvePenalty", null);
__decorate([
    (0, common_1.Put)('penalties/:id/waive'),
    (0, swagger_1.ApiOperation)({ summary: 'Waive penalty' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DriverFleetController.prototype, "waivePenalty", null);
exports.DriverFleetController = DriverFleetController = __decorate([
    (0, swagger_1.ApiTags)('driver-fleet'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('fleet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [driver_fleet_service_1.DriverFleetService])
], DriverFleetController);
//# sourceMappingURL=driver-fleet.controller.js.map