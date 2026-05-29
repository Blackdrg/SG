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
var CommissionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const commission_rule_entity_1 = require("../../db/entities/commission-rule.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
let CommissionService = CommissionService_1 = class CommissionService {
    constructor(commissionRepo, restaurantRepo, dataSource) {
        this.commissionRepo = commissionRepo;
        this.restaurantRepo = restaurantRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(CommissionService_1.name);
    }
    async createCommissionRule(restaurantId, ruleData) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        if (ruleData.value <= 0) {
            throw new common_1.BadRequestException('Commission value must be greater than zero');
        }
        const rule = this.commissionRepo.create({
            restaurantId,
            ...ruleData,
        });
        return this.commissionRepo.save(rule);
    }
    async getCommissionRules(restaurantId, activeOnly = true) {
        const where = { restaurantId: restaurantId };
        if (activeOnly) {
            where.status = commission_rule_entity_1.CommissionStatus.ACTIVE;
        }
        return this.commissionRepo.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }
    async calculateCommission(restaurantId, orderAmount, categoryId) {
        const rules = await this.commissionRepo.find({
            where: {
                restaurantId: restaurantId,
                status: commission_rule_entity_1.CommissionStatus.ACTIVE,
            },
        });
        let applicableRule = null;
        for (const rule of rules) {
            if (rule.minOrderValue && orderAmount < rule.minOrderValue)
                continue;
            if (rule.maxOrderValue && orderAmount > rule.maxOrderValue)
                continue;
            if (categoryId && rule.applicableCategories?.length && !rule.applicableCategories.includes(categoryId))
                continue;
            applicableRule = rule;
            break;
        }
        if (!applicableRule) {
            return orderAmount * 0.15;
        }
        if (applicableRule.type === commission_rule_entity_1.CommissionType.PERCENTAGE) {
            return orderAmount * (Number(applicableRule.value) / 100);
        }
        return Number(applicableRule.value);
    }
    async updateCommissionRule(ruleId, updateData) {
        const rule = await this.commissionRepo.findOne({ where: { id: ruleId } });
        if (!rule) {
            throw new common_1.NotFoundException('Commission rule not found');
        }
        await this.commissionRepo.update(ruleId, updateData);
        return this.commissionRepo.findOne({ where: { id: ruleId } });
    }
    async deactivateRule(ruleId) {
        return this.updateCommissionRule(ruleId, { status: commission_rule_entity_1.CommissionStatus.CANCELLED });
    }
    async getCommissionHistory(restaurantId, limit = 20) {
        const rules = await this.commissionRepo.find({
            where: { restaurantId: restaurantId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return rules.map(rule => ({
            ruleId: rule.id,
            type: rule.type,
            value: rule.value,
            createdAt: rule.createdAt,
        }));
    }
};
exports.CommissionService = CommissionService;
exports.CommissionService = CommissionService = CommissionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(commission_rule_entity_1.CommissionRuleEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], CommissionService);
//# sourceMappingURL=commission.service.js.map