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
const swagger_1 = require("@nestjs/swagger");
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
    async getDisputes(status, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        if (status) {
            const validStatuses = ['warning', 'needs_response', 'under_review', 'won', 'lost'];
            if (!validStatuses.includes(status)) {
                throw new common_1.BadRequestException(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}`);
            }
            return await this.chargebackService.getDisputesByStatus(status);
        }
        if (startDate || endDate) {
            return await this.chargebackService.getDisputeStats(start, end);
        }
        return await this.chargebackService.getDisputesByStatus('under_review');
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
    (0, swagger_1.ApiOperation)({ summary: 'Get chargeback dispute by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chargeback dispute retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chargeback dispute not found' }),
    (0, swagger_1.ApiParam)({ name: 'disputeId', type: 'string' }),
    __param(0, (0, common_1.Param)('disputeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChargebackController.prototype, "getDisputeById", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get chargeback disputes for an order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chargeback disputes retrieved successfully' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', type: 'string' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChargebackController.prototype, "getDisputesForOrder", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ChargebackController.prototype, "getDisputes", null);
__decorate([
    (0, common_1.Post)(':disputeId/initiate-refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate refund for a won chargeback dispute' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund initiated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chargeback dispute not found' }),
    (0, swagger_1.ApiParam)({ name: 'disputeId', type: 'string' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                processedBy: { type: 'string' },
                gateway: { type: 'string' }
            },
            required: ['processedBy']
        }
    }),
    (0, common_1.Get)('stats/overview'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get chargeback statistics overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chargeback statistics retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: 'string', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: 'string', required: false }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChargebackController.prototype, "getDisputeStatsOverview", null);
exports.ChargebackController = ChargebackController = __decorate([
    (0, swagger_1.ApiTags)('chargebacks'),
    (0, common_1.Controller)('chargebacks'),
    __metadata("design:paramtypes", [chargeback_service_1.ChargebackService])
], ChargebackController);
//# sourceMappingURL=chargeback.controller.js.map