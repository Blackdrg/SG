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
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const customer_support_service_1 = require("./customer-support.service");
const ticket_routing_service_1 = require("./ticket-routing.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let SupportController = class SupportController {
    constructor(supportService, routingService) {
        this.supportService = supportService;
        this.routingService = routingService;
    }
    async raiseDispute(body) {
        return this.supportService.raiseDispute(body.orderId, body.customerId, body.type, body.description);
    }
    async getDisputes(query) {
        return this.supportService.getDisputes(query);
    }
    async reviewDispute(id, body) {
        return this.supportService.reviewDispute(id, body.reviewerId, body.status, body.notes);
    }
    async requestRefund(body) {
        return this.supportService.requestRefund(body.orderId, body.requestedBy, body.type, body.amount, body.reason);
    }
    async processRefund(id, body) {
        return this.supportService.processRefund(id, body.processedBy, body.paymentReference);
    }
    async getQueueStats() {
        return this.routingService.getQueueStats();
    }
    async routeTicket(id) {
        return this.routingService.routeTicket(id);
    }
    async escalateTicket(id, body) {
        return this.routingService.escalateTicket(id, body.level || 1);
    }
};
exports.SupportController = SupportController;
__decorate([
    (0, common_1.Post)('disputes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "raiseDispute", null);
__decorate([
    (0, common_1.Get)('disputes'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getDisputes", null);
__decorate([
    (0, common_1.Put)('disputes/:id/review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "reviewDispute", null);
__decorate([
    (0, common_1.Post)('refunds'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "requestRefund", null);
__decorate([
    (0, common_1.Put)('refunds/:id/process'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "processRefund", null);
__decorate([
    (0, common_1.Get)('tickets/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getQueueStats", null);
__decorate([
    (0, common_1.Post)('tickets/:id/route'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "routeTicket", null);
__decorate([
    (0, common_1.Post)('tickets/:id/escalate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "escalateTicket", null);
exports.SupportController = SupportController = __decorate([
    (0, common_1.Controller)('support'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPPORT_STAFF),
    __metadata("design:paramtypes", [customer_support_service_1.CustomerSupportService,
        ticket_routing_service_1.TicketRoutingService])
], SupportController);
//# sourceMappingURL=support.controller.js.map