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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
const order_item_entity_1 = require("../../db/entities/order-item.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const address_entity_1 = require("../../db/entities/address.entity");
let AnalyticsService = class AnalyticsService {
    constructor(orderRepo, orderItemRepo, menuItemRepo, userRepo, branchRepo, addressRepo, dataSource) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.menuItemRepo = menuItemRepo;
        this.userRepo = userRepo;
        this.branchRepo = branchRepo;
        this.addressRepo = addressRepo;
        this.dataSource = dataSource;
    }
    async getTopDishes(restaurantId, period = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        const query = this.orderItemRepo
            .createQueryBuilder('item')
            .innerJoin(order_entity_1.OrderEntity, 'order', 'order.id = item.orderId')
            .select('item.menuItemId as dishId')
            .addSelect('SUM(item.quantity) as totalQuantity')
            .addSelect('SUM(item.quantity * item.unitPrice) as totalRevenue')
            .addSelect('COUNT(DISTINCT order.userId) as uniqueCustomers')
            .where('order.createdAt >= :startDate', { startDate })
            .andWhere('order.status != :status', { status: 'cancelled' })
            .groupBy('item.menuItemId')
            .orderBy('totalRevenue', 'DESC')
            .limit(20);
        if (restaurantId) {
            query.andWhere('order.restaurantId = :restaurantId', { restaurantId });
        }
        const results = await query.getRawMany();
        const dishes = await Promise.all(results.map(async (r) => {
            const menuItem = await this.menuItemRepo.findOne({ where: { id: r.dishId } });
            return {
                dishId: r.dishId,
                name: menuItem?.name || 'Unknown',
                totalQuantity: parseInt(r.totalQuantity),
                totalRevenue: parseFloat(r.totalRevenue),
                uniqueCustomers: parseInt(r.uniqueCustomers),
                avgOrderValue: parseFloat(r.totalRevenue) / parseInt(r.totalQuantity),
            };
        }));
        return { period: `Last ${period} days`, dishes };
    }
    async getChurnAnalysis(restaurantId, period = 90) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        const allCustomers = await this.orderRepo
            .createQueryBuilder('order')
            .select('order.userId as userId')
            .addSelect('MAX(order.createdAt) as lastOrderDate')
            .addSelect('COUNT(order.id) as totalOrders')
            .addSelect('SUM(order.total) as totalSpent')
            .where('order.createdAt >= :startDate', { startDate })
            .andWhere('order.status != :status', { status: 'cancelled' });
        if (restaurantId) {
            allCustomers.andWhere('order.restaurantId = :restaurantId', { restaurantId });
        }
        allCustomers.groupBy('order.userId');
        const customers = await allCustomers.getRawMany();
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeCustomers = customers.filter((c) => new Date(c.lastOrderDate) >= thirtyDaysAgo);
        const churnedCustomers = customers.filter((c) => new Date(c.lastOrderDate) < thirtyDaysAgo);
        const totalCustomers = customers.length;
        const churnRate = totalCustomers > 0 ? (churnedCustomers.length / totalCustomers) * 100 : 0;
        return {
            totalCustomers,
            activeCustomers: activeCustomers.length,
            churnedCustomers: churnedCustomers.length,
            churnRate: Math.round(churnRate * 100) / 100,
            avgOrdersPerCustomer: totalCustomers > 0 ? Math.round((customers.reduce((s, c) => s + parseInt(c.totalOrders), 0) / totalCustomers) * 100) / 100 : 0,
            avgCustomerValue: totalCustomers > 0 ? Math.round((customers.reduce((s, c) => s + parseFloat(c.totalSpent), 0) / totalCustomers) * 100) / 100 : 0,
            period: `Last ${period} days`,
        };
    }
    async getRepeatUsers(restaurantId, period = 90) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        const query = this.orderRepo
            .createQueryBuilder('order')
            .select('order.userId as userId')
            .addSelect('COUNT(order.id) as orderCount')
            .addSelect('SUM(order.total) as totalSpent')
            .addSelect('MIN(order.createdAt) as firstOrder')
            .addSelect('MAX(order.createdAt) as lastOrder')
            .where('order.createdAt >= :startDate', { startDate })
            .andWhere('order.status != :status', { status: 'cancelled' })
            .groupBy('order.userId')
            .having('COUNT(order.id) > :minOrders', { minOrders: 2 });
        if (restaurantId) {
            query.andWhere('order.restaurantId = :restaurantId', { restaurantId });
        }
        const repeatCustomers = await query.getRawMany();
        const frequencyDistribution = {};
        repeatCustomers.forEach((c) => {
            const count = parseInt(c.orderCount);
            const bucket = count <= 5 ? 5 : count <= 10 ? 10 : count <= 20 ? 20 : 50;
            frequencyDistribution[bucket] = (frequencyDistribution[bucket] || 0) + 1;
        });
        const avgFrequency = repeatCustomers.length > 0
            ? repeatCustomers.reduce((s, c) => s + parseInt(c.orderCount), 0) / repeatCustomers.length
            : 0;
        return {
            repeatCustomers: repeatCustomers.length,
            repeatRate: 0,
            avgFrequency: Math.round(avgFrequency * 100) / 100,
            frequencyDistribution,
            topRepeatCustomers: repeatCustomers
                .sort((a, b) => parseFloat(b.totalSpent) - parseFloat(a.totalSpent))
                .slice(0, 20)
                .map((c) => ({
                userId: c.userId,
                orderCount: parseInt(c.orderCount),
                totalSpent: parseFloat(c.totalSpent),
                avgOrderValue: Math.round((parseFloat(c.totalSpent) / parseInt(c.orderCount)) * 100) / 100,
                firstOrder: c.firstOrder,
                lastOrder: c.lastOrder,
            })),
            period: `Last ${period} days`,
        };
    }
    async getConversionRate(restaurantId, period = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        const queryBuilder = this.orderRepo.createQueryBuilder('order');
        if (restaurantId) {
            queryBuilder.where('order.restaurantId = :restaurantId', { restaurantId });
        }
        const [totalOrders, avgOrderValue] = await Promise.all([
            queryBuilder
                .andWhere('order.createdAt >= :startDate', { startDate })
                .andWhere('order.status != :status', { status: 'cancelled' })
                .getCount(),
            queryBuilder
                .andWhere('order.createdAt >= :startDate', { startDate })
                .andWhere('order.status != :status', { status: 'cancelled' })
                .select('AVG(order.total)', 'avgValue')
                .getRawOne(),
        ]);
        const estimatedViews = totalOrders * 15;
        const estimatedCartAdds = totalOrders * 3;
        const viewToCart = estimatedViews > 0 ? (estimatedCartAdds / estimatedViews) * 100 : 0;
        const cartToOrder = estimatedCartAdds > 0 ? (totalOrders / estimatedCartAdds) * 100 : 0;
        const overallConversion = estimatedViews > 0 ? (totalOrders / estimatedViews) * 100 : 0;
        return {
            period: `Last ${period} days`,
            funnel: {
                restaurantViews: estimatedViews,
                cartAdditions: estimatedCartAdds,
                ordersPlaced: totalOrders,
                deliveriesCompleted: totalOrders,
            },
            conversionRates: {
                viewToCart: Math.round(viewToCart * 100) / 100,
                cartToOrder: Math.round(cartToOrder * 100) / 100,
                overallConversion: Math.round(overallConversion * 100) / 100,
            },
            avgOrderValue: avgOrderValue?.avgValue ? parseFloat(avgOrderValue.avgValue) : 0,
        };
    }
    async getDeliveryHeatmap(restaurantId, period = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        const queryBuilder = this.orderRepo.createQueryBuilder('order');
        if (restaurantId) {
            queryBuilder.where('order.restaurantId = :restaurantId', { restaurantId });
        }
        const deliveries = await queryBuilder
            .innerJoin(address_entity_1.AddressEntity, 'address', 'address.userId = order.userId')
            .andWhere('order.createdAt >= :startDate', { startDate })
            .andWhere('order.status IN (:...statuses)', { statuses: ['delivered', 'pickedup'] })
            .select('address.location', 'location')
            .addSelect('COUNT(order.id)', 'deliveryCount')
            .addSelect('AVG(order.total)', 'avgOrderValue')
            .groupBy('address.location')
            .orderBy('deliveryCount', 'DESC')
            .limit(100)
            .getRawMany();
        const gridData = deliveries.map((d, idx) => {
            const loc = d.location;
            let lat = 0, lng = 0;
            if (typeof loc === 'string') {
                const coords = loc.replace(/[()]/g, '').split(' ');
                lng = parseFloat(coords[0]) * 100;
                lat = parseFloat(coords[1]) * 100;
            }
            else if (loc && typeof loc === 'object') {
                lat = (loc.lat || 0) * 100;
                lng = (loc.lng || 0) * 100;
            }
            const gridX = Math.max(0, Math.min(95, Math.floor(lat / 5) * 5));
            const gridY = Math.max(0, Math.min(95, Math.floor(lng / 5) * 5));
            return {
                x: gridX, y: gridY,
                intensity: Math.min(1, parseInt(d.deliveryCount) / 50),
                deliveries: parseInt(d.deliveryCount),
                avgOrderValue: d.avgOrderValue,
            };
        });
        const maxIntensity = Math.max(...gridData.map(d => d.intensity), 1);
        return {
            period: `Last ${period} days`,
            totalDeliveryZones: gridData.length,
            gridData: gridData.map(d => ({
                x: d.x, y: d.y,
                intensity: d.intensity / maxIntensity,
                deliveries: d.deliveries,
                avgOrderValue: d.avgOrderValue,
                label: `Zone ${d.x}-${d.y}`,
            })),
        };
    }
    async getPeakHours(restaurantId, period = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        const queryBuilder = this.orderRepo.createQueryBuilder('order');
        if (restaurantId) {
            queryBuilder.where('order.restaurantId = :restaurantId', { restaurantId });
        }
        const hourlyData = await queryBuilder
            .andWhere('order.createdAt >= :startDate', { startDate })
            .andWhere('order.status != :status', { status: 'cancelled' })
            .select("EXTRACT(HOUR FROM order.createdAt)", 'hour')
            .addSelect('COUNT(order.id)', 'orderCount')
            .addSelect('AVG(order.total)', 'avgOrderValue')
            .addSelect('SUM(order.total)', 'totalRevenue')
            .groupBy("EXTRACT(HOUR FROM order.createdAt)")
            .orderBy("EXTRACT(HOUR FROM order.createdAt)", 'ASC')
            .getRawMany();
        const peakHours = hourlyData
            .sort((a, b) => parseInt(b.orderCount) - parseInt(a.orderCount))
            .slice(0, 5)
            .map(h => parseInt(h.hour));
        const formattedData = hourlyData.map((h) => ({
            hour: `${String(h.hour).padStart(2, '0')}:00`,
            orderCount: parseInt(h.orderCount),
            avgOrderValue: parseFloat(h.avgOrderValue) || 0,
            totalRevenue: parseFloat(h.totalRevenue) || 0,
        }));
        return {
            period: `Last ${period} days`,
            hourlyPattern: formattedData,
            peakHours: peakHours.map(h => `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00`),
            totalDailyOrders: hourlyData.reduce((s, h) => s + parseInt(h.orderCount), 0),
            avgDailyOrders: Math.round(hourlyData.reduce((s, h) => s + parseInt(h.orderCount), 0) / period),
        };
    }
    async getRestaurantAnalytics(restaurantId) {
        const [topDishes, churn, repeat, conversion, heatmap, peakHours] = await Promise.all([
            this.getTopDishes(restaurantId),
            this.getChurnAnalysis(restaurantId),
            this.getRepeatUsers(restaurantId),
            this.getConversionRate(restaurantId),
            this.getDeliveryHeatmap(restaurantId),
            this.getPeakHours(restaurantId),
        ]);
        return {
            restaurantId,
            generatedAt: new Date(),
            topDishes,
            churnAnalysis: churn,
            repeatUsers: repeat,
            conversionFunnel: conversion,
            deliveryHeatmap: heatmap,
            peakHours,
        };
    }
    async getPlatformAnalytics() {
        const topDishes = await this.getTopDishes(undefined);
        const churn = await this.getChurnAnalysis(undefined);
        const repeat = await this.getRepeatUsers(undefined);
        const conversion = await this.getConversionRate(undefined);
        const heatmap = await this.getDeliveryHeatmap(undefined);
        const peakHours = await this.getPeakHours(undefined);
        const activeBranches = await this.branchRepo.count({ where: { isActive: true } });
        return {
            platform: true,
            generatedAt: new Date(),
            activeBranches,
            topDishes,
            churnAnalysis: churn,
            repeatUsers: repeat,
            conversionFunnel: conversion,
            deliveryHeatmap: heatmap,
            peakHours,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItemEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItemEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(address_entity_1.AddressEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map