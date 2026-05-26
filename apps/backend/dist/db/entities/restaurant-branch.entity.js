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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantBranchEntity = void 0;
const typeorm_1 = require("typeorm");
const restaurant_entity_1 = require("./restaurant.entity");
let RestaurantBranchEntity = class RestaurantBranchEntity {
};
exports.RestaurantBranchEntity = RestaurantBranchEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RestaurantBranchEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RestaurantBranchEntity.prototype, "branchName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RestaurantBranchEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Index)({ spatial: true }),
    (0, typeorm_1.Column)({
        type: 'point',
        transformer: {
            from: (v) => {
                if (typeof v === 'string') {
                    const match = v.match(/\((.*)\)/);
                    if (match) {
                        const [lng, lat] = match[1].split(' ').map(Number);
                        return { lat, lng };
                    }
                }
                return v;
            },
            to: (v) => {
                return `(${v.lng} ${v.lat})`;
            },
        },
    }),
    __metadata("design:type", Object)
], RestaurantBranchEntity.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], RestaurantBranchEntity.prototype, "openingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], RestaurantBranchEntity.prototype, "closingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RestaurantBranchEntity.prototype, "isOnline", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.RestaurantEntity, (restaurant) => restaurant.branches),
    __metadata("design:type", restaurant_entity_1.RestaurantEntity)
], RestaurantBranchEntity.prototype, "restaurant", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('MenuCategoryEntity', (category) => category.branch),
    __metadata("design:type", Array)
], RestaurantBranchEntity.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RestaurantBranchEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RestaurantBranchEntity.prototype, "updatedAt", void 0);
exports.RestaurantBranchEntity = RestaurantBranchEntity = __decorate([
    (0, typeorm_1.Entity)('restaurant_branches')
], RestaurantBranchEntity);
//# sourceMappingURL=restaurant-branch.entity.js.map