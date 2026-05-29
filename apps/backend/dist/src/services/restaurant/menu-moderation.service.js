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
var MenuModerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuModerationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const menu_moderation_entity_1 = require("../../db/entities/menu-moderation.entity");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
let MenuModerationService = MenuModerationService_1 = class MenuModerationService {
    constructor(moderationRepo, itemRepo, restaurantRepo, dataSource) {
        this.moderationRepo = moderationRepo;
        this.itemRepo = itemRepo;
        this.restaurantRepo = restaurantRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(MenuModerationService_1.name);
    }
    async submitForModeration(menuItemId, restaurantId, action, data, originalData) {
        const menuItem = await this.itemRepo.findOne({ where: { id: menuItemId } });
        if (!menuItem) {
            throw new common_1.NotFoundException('Menu item not found');
        }
        const aiFlags = this.detectAIFlags(data);
        const moderation = this.moderationRepo.create({
            menuItemId,
            restaurantId,
            action,
            status: menu_moderation_entity_1.ModerationStatus.PENDING,
            updatedData: data,
            originalData: originalData || {},
            aiFlags,
            flaggedForReview: this.shouldFlagForReview(aiFlags),
        });
        const saved = await this.moderationRepo.save(moderation);
        await this.itemRepo.update(menuItemId, { status: 'pending_moderation' });
        return saved;
    }
    detectAIFlags(data) {
        const flags = {};
        if (data?.basePrice && (data.basePrice < 10 || data.basePrice > 5000)) {
            flags.priceAnomaly = true;
        }
        if (data?.description && data.description.length < 10) {
            flags.descriptionIssue = true;
        }
        if (!data?.imageUrl || data?.imageUrl?.includes('placeholder')) {
            flags.imageProblem = true;
        }
        return flags;
    }
    shouldFlagForReview(flags) {
        return Object.values(flags).some((v) => v === true);
    }
    async getPendingModerations(restaurantId, priorityOnly = false) {
        const where = { status: menu_moderation_entity_1.ModerationStatus.PENDING };
        if (restaurantId) {
            where.restaurantId = restaurantId;
        }
        return this.moderationRepo.find({
            where,
            relations: ['menuItem', 'restaurant'],
            order: { createdAt: 'DESC' },
        });
    }
    async reviewModeration(moderationId, moderatorId, status, notes) {
        const moderation = await this.moderationRepo.findOne({ where: { id: moderationId } });
        if (!moderation) {
            throw new common_1.NotFoundException('Moderation request not found');
        }
        await this.moderationRepo.update(moderationId, {
            status,
            moderatorId,
            moderatorNotes: notes,
            reviewedAt: new Date(),
        });
        if (status === menu_moderation_entity_1.ModerationStatus.APPROVED) {
            await this.itemRepo.update(moderation.menuItemId, { status: 'available' });
        }
        else if (status === menu_moderation_entity_1.ModerationStatus.REJECTED || status === menu_moderation_entity_1.ModerationStatus.CHANGES_REQUESTED) {
            await this.itemRepo.update(moderation.menuItemId, { status: 'rejected' });
        }
        return this.moderationRepo.findOne({ where: { id: moderationId } });
    }
    async bulkApprove(moderationIds, moderatorId) {
        await this.moderationRepo.update({ id: (0, typeorm_2.In)(moderationIds) }, { status: menu_moderation_entity_1.ModerationStatus.APPROVED, moderatorId, reviewedAt: new Date() });
        const moderations = await this.moderationRepo.findByIds(moderationIds);
        for (const m of moderations) {
            await this.itemRepo.update(m.menuItemId, { status: 'available' });
        }
    }
    async getModerationStats(restaurantId) {
        const where = {};
        if (restaurantId) {
            where.restaurantId = restaurantId;
        }
        const [totalPending, totalApproved, totalRejected, avgReviewTime,] = await Promise.all([
            this.moderationRepo.count({ where: { ...where, status: menu_moderation_entity_1.ModerationStatus.PENDING } }),
            this.moderationRepo.count({ where: { ...where, status: menu_moderation_entity_1.ModerationStatus.APPROVED } }),
            this.moderationRepo.count({ where: { ...where, status: menu_moderation_entity_1.ModerationStatus.REJECTED } }),
            this.getAverageReviewTime(where),
        ]);
        return {
            pending: totalPending,
            approved: totalApproved,
            rejected: totalRejected,
            avgReviewTimeHours: avgReviewTime,
        };
    }
    async getAverageReviewTime(where) {
        const result = await this.moderationRepo
            .createQueryBuilder('moderation')
            .select('AVG(TIMESTAMPDIFF(HOUR, moderation.createdAt, moderation.reviewedAt))', 'avgHours')
            .where('moderation.reviewedAt IS NOT NULL')
            .getRawOne();
        return result?.avgHours || 0;
    }
};
exports.MenuModerationService = MenuModerationService;
exports.MenuModerationService = MenuModerationService = MenuModerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(menu_moderation_entity_1.MenuModerationEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItemEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], MenuModerationService);
//# sourceMappingURL=menu-moderation.service.js.map