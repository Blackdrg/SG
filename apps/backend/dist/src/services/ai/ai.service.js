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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
let AiService = class AiService {
    constructor(orderRepo, menuRepo) {
        this.orderRepo = orderRepo;
        this.menuRepo = menuRepo;
    }
    async getRecommendations(userId) {
        const recentOrders = await this.orderRepo.find({
            where: { userId },
            relations: ['items', 'items.menuItem', 'items.menuItem.category'],
            take: 5,
            order: { createdAt: 'DESC' },
        });
        const preferredCategoryIds = new Set();
        recentOrders.forEach(order => {
            order.items?.forEach(item => {
                if (item.menuItem?.category?.id) {
                    preferredCategoryIds.add(item.menuItem.category.id);
                }
            });
        });
        if (preferredCategoryIds.size > 0) {
            return this.menuRepo.find({
                where: { category: { id: Array.from(preferredCategoryIds)[0] } },
                take: 5,
            });
        }
        return this.menuRepo.find({ take: 5, order: { createdAt: 'DESC' } });
    }
    async predictDemand(branchId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const historicalCount = await this.orderRepo.count({
            where: {
                restaurantId: branchId,
                createdAt: (0, typeorm_2.Between)(startOfDay, endOfDay)
            }
        });
        const growthFactor = 1.1;
        const predictedOrders = Math.max(20, Math.floor((historicalCount || 50) * growthFactor));
        return {
            predictedOrders,
            busyHours: ['12:00', '13:00', '19:00', '20:00'],
            confidence: 0.85
        };
    }
    async chatbotResponse(message) {
        const msg = message.toLowerCase();
        if (msg.includes('order status'))
            return 'You can track your order in the "Active Orders" section.';
        if (msg.includes('refund'))
            return 'Refunds typically take 5-7 business days to process.';
        if (msg.includes('contact'))
            return 'You can reach us at support@spicegarden.com or call 1800-SPICE.';
        return "I'm sorry, I didn't quite catch that. Would you like to speak to a human agent?";
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AiService);
//# sourceMappingURL=ai.service.js.map