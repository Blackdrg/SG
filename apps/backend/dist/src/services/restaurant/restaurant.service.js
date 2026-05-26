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
exports.RestaurantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
let RestaurantService = class RestaurantService {
    constructor(restaurantRepo, branchRepo, dataSource) {
        this.restaurantRepo = restaurantRepo;
        this.branchRepo = branchRepo;
        this.dataSource = dataSource;
    }
    async getAllRestaurants() {
        return this.restaurantRepo.find({
            relations: ['branches'],
            where: { status: 'active' },
        });
    }
    async findNearby(lat, lng, radiusInKm = 5) {
        const radius = radiusInKm * 1000;
        return this.branchRepo
            .createQueryBuilder('branch')
            .leftJoinAndSelect('branch.restaurant', 'restaurant')
            .select([
            'branch',
            'restaurant',
            `ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) AS distance`
        ])
            .where(`ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng, lat, radius })
            .andWhere('branch.isOnline = :isOnline', { isOnline: true })
            .orderBy('distance', 'ASC')
            .getMany();
    }
    async getRestaurantDetails(slug) {
        return this.restaurantRepo.findOne({
            where: { slug },
            relations: ['branches', 'branches.categories', 'branches.categories.items'],
        });
    }
    async searchRestaurants(query) {
        return this.restaurantRepo.find({
            where: [
                { name: (0, typeorm_2.Like)(`%${query}%`) },
                { description: (0, typeorm_2.Like)(`%${query}%`) },
            ],
            relations: ['branches'],
        });
    }
    async updateBranchStatus(branchId, isOnline) {
        return this.branchRepo.update(branchId, { isOnline });
    }
};
exports.RestaurantService = RestaurantService;
exports.RestaurantService = RestaurantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], RestaurantService);
//# sourceMappingURL=restaurant.service.js.map