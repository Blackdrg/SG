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
exports.RefundController = void 0;
const common_1 = require("@nestjs/common");
const refund_service_1 = require("./refund.service");
const refund_service_2 = require("./refund.service");
const swagger_1 = require("@nestjs/swagger");
let RefundController = class RefundController {
    constructor(refundService) {
        this.refundService = refundService;
    }
    async createRefundRequest(body) {
        return await this.refundService.createRefundRequest(body.orderId, body.requestedBy, body.amount, body.reason, body.requestType || refund_service_2.RefundRequestType.CUSTOMER_REQUEST);
    }
    async approveRefundRequest(approvalId, body) {
        return await this.refundService.approveRefundRequest(approvalId, body.approverId, body.notes);
    }
    async rejectRefundRequest(approvalId, body) {
        return await this.refundService.rejectRefundRequest(approvalId, body.approverId, body.reason);
    }
    async processRefund(approvalId, body) {
        return await this.refundService.processRefund(approvalId, body.processedBy, body.gateway);
    }
    async getRefundRequest(approvalId) {
        return await this.refundService.getRefundRequest(approvalId);
    }
    async getRefundRequestsForOrder(orderId) {
        return await this.refundService.getRefundRequestsForOrder(orderId);
    }
    async getRefundRequestsByStatus(status) {
        if (status) {
            const validStatuses = ['pending', 'approved', 'rejected', 'processed', 'failed'];
            if (!validStatuses.includes(status)) {
                throw new common_1.BadRequestException(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}`);
            }
            return await this.refundService.getRefundRequestsByStatus(status);
        }
        return await this.refundService.getRefundRequestsByStatus('pending');
    }
};
exports.RefundController = RefundController;
__decorate([
    (0, common_1.Post)('request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create a refund request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund request created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order or user not found' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                orderId: { type: 'string' },
                requestedBy: { type: 'string' },
                amount: { type: 'number' },
                reason: { type: 'string' },
                requestType: { type: 'string', enum: ['customer_request', 'agent_initiated', 'policy_exception', 'dispute_resolution'] }
            },
            required: ['orderId', 'requestedBy', 'amount', 'reason']
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RefundController.prototype, "createRefundRequest", null);
__decorate([
    (0, common_1.Patch)(':approvalId/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a refund request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund request approved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Refund request not found' }),
    (0, swagger_1.ApiParam)({ name: 'approvalId', type: 'string' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                approverId: { type: 'string' },
                notes: { type: 'string' }
            },
            required: ['approverId']
        }
    }),
    __param(0, (0, common_1.Param)('approvalId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RefundController.prototype, "approveRefundRequest", null);
__decorate([
    (0, common_1.Patch)(':approvalId/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a refund request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund request rejected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Refund request not found' }),
    (0, swagger_1.ApiParam)({ name: 'approvalId', type: 'string' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                approverId: { type: 'string' },
                reason: { type: 'string' }
            },
            required: ['approverId', 'reason']
        }
    }),
    __param(0, (0, common_1.Param)('approvalId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RefundController.prototype, "rejectRefundRequest", null);
__decorate([
    (0, common_1.Post)(':approvalId/process'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process an approved refund' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Refund request not found' }),
    (0, swagger_1.ApiParam)({ name: 'approvalId', type: 'string' }),
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
    __param(0, (0, common_1.Param)('approvalId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RefundController.prototype, "processRefund", null);
__decorate([
    (0, common_1.Get)(':approvalId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get refund request by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund request retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Refund request not found' }),
    (0, swagger_1.ApiParam)({ name: 'approvalId', type: 'string' }),
    __param(0, (0, common_1.Param)('approvalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RefundController.prototype, "getRefundRequest", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get refund requests for an order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund requests retrieved successfully' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', type: 'string' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RefundController.prototype, "getRefundRequestsForOrder", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get refund requests by status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund requests retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'status', type: 'string', required: false }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RefundController.prototype, "getRefundRequestsByStatus", null);
exports.RefundController = RefundController = __decorate([
    (0, swagger_1.ApiTags)('refunds'),
    (0, common_1.Controller)('refunds'),
    __metadata("design:paramtypes", [refund_service_1.RefundService])
], RefundController);
//# sourceMappingURL=refund.controller.js.map