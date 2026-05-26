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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const driver_entity_1 = require("../../db/entities/driver.entity");
const audit_log_entity_1 = require("../../db/entities/audit-log.entity");
let AdminService = class AdminService {
    constructor(orderRepo, userRepo, driverRepo, auditRepo) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.driverRepo = driverRepo;
        this.auditRepo = auditRepo;
    }
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [ordersToday, totalRevenue] = await Promise.all([
            this.orderRepo.count({ where: { createdAt: (0, typeorm_2.Between)(today, new Date()) } }),
            this.orderRepo.createQueryBuilder('order')
                .select('SUM(order.grandTotal)', 'total')
                .where('order.createdAt >= :today', { today })
                .getRawOne(),
        ]);
        const activeDrivers = await this.driverRepo.count({ where: { isOnline: true } });
        return {
            ordersToday,
            revenueToday: totalRevenue.total || 0,
            activeDrivers,
        };
    }
    async logAction(action, userId, entityType, entityId, metadata) {
        const log = this.auditRepo.create({
            action,
            performedBy: userId,
            entityType,
            entityId,
            metadata,
        });
        return this.auditRepo.save(log);
    }
    async getAllOrders(page = 1, limit = 10) {
        return this.orderRepo.find({
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
    }
    async banUser(userId, adminId, reason) {
        await this.userRepo.update(userId, { status: 'suspended' });
        await this.logAction('BAN_USER', adminId, 'USER', userId, { reason });
        return { success: true };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map