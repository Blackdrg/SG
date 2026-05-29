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
var BranchManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
let BranchManagementService = BranchManagementService_1 = class BranchManagementService {
    constructor(branchRepo, restaurantRepo, dataSource) {
        this.branchRepo = branchRepo;
        this.restaurantRepo = restaurantRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(BranchManagementService_1.name);
    }
    async createBranch(restaurantId, branchData) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        const branch = this.branchRepo.create({
            restaurant: { id: restaurantId },
            branchName: branchData.branchName,
            address: branchData.address,
            openingTime: branchData.openingTime || '09:00',
            closingTime: branchData.closingTime || '21:00',
            location: { lat: branchData.lat, lng: branchData.lng },
            isOnline: false,
        });
        const saved = await this.branchRepo.save(branch);
        return saved;
    }
    async updateBranch(branchId, updateData) {
        const branch = await this.branchRepo.findOne({ where: { id: branchId } });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        const { lat, lng, ...rest } = updateData;
        const updatePayload = { ...rest };
        if (lat !== undefined && lng !== undefined) {
            updatePayload.location = { lat, lng };
        }
        await this.branchRepo.update(branchId, updatePayload);
        const updated = await this.branchRepo.findOne({ where: { id: branchId } });
        return updated;
    }
    async toggleBranchStatus(branchId, isOnline) {
        const branch = await this.branchRepo.findOne({ where: { id: branchId } });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        await this.branchRepo.update(branchId, { isOnline });
        this.logger.log(`Branch ${branchId} status updated to ${isOnline ? 'online' : 'offline'}`);
        return this.branchRepo.findOne({ where: { id: branchId } });
    }
    async getBranchDetails(branchId) {
        return this.branchRepo.findOne({
            where: { id: branchId },
            relations: ['restaurant'],
        });
    }
    async getBranchesByRestaurant(restaurantId) {
        return this.branchRepo.find({
            where: { restaurant: { id: restaurantId } },
            relations: ['restaurant'],
            order: { branchName: 'ASC' },
        });
    }
    async getAllBranches(filter) {
        const where = {};
        if (filter?.isOnline !== undefined) {
            where.isOnline = filter.isOnline;
        }
        if (filter?.restaurantId) {
            where.restaurant = { id: filter.restaurantId };
        }
        return this.branchRepo.find({
            where,
            relations: ['restaurant'],
            order: { branchName: 'ASC' },
        });
    }
    async deleteBranch(branchId) {
        const branch = await this.branchRepo.findOne({ where: { id: branchId } });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        await this.branchRepo.softDelete(branchId);
    }
};
exports.BranchManagementService = BranchManagementService;
exports.BranchManagementService = BranchManagementService = BranchManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], BranchManagementService);
//# sourceMappingURL=branch-management.service.js.map