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
exports.ChargebackController = void 0;
const common_1 = require("@nestjs/common");
const chargeback_service_1 = require("./chargeback.service");
const switch_1 = require("@nestjs/switch");
let ChargebackController = class ChargebackController {
    constructor(chargebackService) {
        this.chargebackService = chargebackService;
    }
    async getDisputeById(disputeId) {
        return await this.chargebackService.getDisputeById(disputeId);
    }
    async getDisputesForOrder(orderId) {
        return await this.chargebackService.getDisputesForOrder(orderId);
    }
    async getDisputesByStatus(status, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        if (status) {
            return await this.chargebackService.getDisputesByStatus(status);
        }
        if (startDate || endDate) {
            return await this.chargebackService.getDisputeStats(start, end);
        }
        return await this.chargebackService.getDisputesByStatus('under_review');
    }
    async initiateRefundForWonDispute(disputeId, body) {
        return await this.chargebackService.initiateRefundForWonDispute(disputeId, body.processedBy, body.gateway);
    }
    async getDisputeStatsOverview(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return await this.chargebackService.getDisputeStats(start, end);
    }
};
exports.ChargebackController = ChargebackController;
__decorate([
    (0, common_1.Get)(':disputeId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Get chargeback dispute by ID' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Chargeback dispute retrieved successfully' }),
    (0, switch_1.ApiResponse)({ status: 404, description: 'Chargeback dispute not found' }),
    (0, switch_1.ApiParam)({ name: 'disputeId', type: 'string' }),
    __param(0, (0, common_1.Param)('disputeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChargebackController.prototype, "getDisputeById", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Get chargeback disputes for an order' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Chargeback disputes retrieved successfully' }),
    (0, switch_1.ApiParam)({ name: 'orderId', type: 'string' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChargebackController.prototype, "getDisputesForOrder", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Get chargeback disputes by status' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Chargeback disputes retrieved successfully' }),
    (0, switch_1.ApiQuery)({ name: 'status', type: 'string', required: false }),
    (0, switch_1.ApiQuery)({ name: 'startDate', type: 'string', required: false }),
    (0, switch_1.ApiQuery)({ name: 'endDate', type: 'string', required: false }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ChargebackController.prototype, "getDisputesByStatus", null);
__decorate([
    (0, common_1.Post)(':disputeId/initiate-refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Initiate refund for a won chargeback dispute' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Refund initiated successfully' }),
    (0, switch_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, switch_1.ApiResponse)({ status: 404, description: 'Chargeback dispute not found' }),
    (0, switch_1.ApiParam)({ name: 'disputeId', type: 'string' }),
    (0, switch_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                processedBy: { type: 'string' },
                gateway: { type: 'string' }
            },
            required: ['processedBy']
        }
    }),
    __param(0, (0, common_1.Param)('disputeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChargebackController.prototype, "initiateRefundForWonDispute", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Get chargeback statistics overview' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Chargeback statistics retrieved successfully' }),
    (0, switch_1.ApiQuery)({ name: 'startDate', type: 'string', required: false }),
    (0, switch_1.ApiQuery)({ name: 'endDate', type: 'string', required: false }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChargebackController.prototype, "getDisputeStatsOverview", null);
exports.ChargebackController = ChargebackController = __decorate([
    (0, switch_1.ApiTags)('chargebacks'),
    (0, common_1.Controller)('chargebacks'),
    __metadata("design:paramtypes", [chargeback_service_1.ChargebackService])
], ChargebackController);
//# sourceMappingURL=chargeback.controller.js.map