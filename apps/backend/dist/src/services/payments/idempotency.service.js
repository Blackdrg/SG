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
var IdempotencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const idempotency_entity_1 = require("./idempotency.entity");
let IdempotencyService = IdempotencyService_1 = class IdempotencyService {
    constructor(idempotencyRepo) {
        this.idempotencyRepo = idempotencyRepo;
        this.logger = new common_1.Logger(IdempotencyService_1.name);
    }
    async validateOrCreate(key, operation, userId, requestPayload) {
        if (!key) {
            return { isDuplicate: false };
        }
        const existing = await this.idempotencyRepo.findOne({
            where: { key, operation }
        });
        if (existing?.isCompleted) {
            this.logger.warn(`Duplicate request detected for operation ${operation} with key ${key}`);
            return { isDuplicate: true, response: existing.responsePayload };
        }
        const newKey = this.idempotencyRepo.create({
            key,
            operation,
            userId: userId || 'anonymous',
            requestPayload,
            isCompleted: false,
        });
        await this.idempotencyRepo.save(newKey);
        return { isDuplicate: false };
    }
    async complete(key, operation, responsePayload, statusCode = 200) {
        await this.idempotencyRepo.update({ key, operation }, {
            responsePayload,
            statusCode,
            isCompleted: true,
            completedAt: new Date(),
        });
    }
    async getRecentRequests(userId, operation, windowMs = 60000) {
        const since = new Date(Date.now() - windowMs);
        return this.idempotencyRepo.count({
            where: {
                userId,
                operation,
                createdAt: (0, typeorm_2.MoreThanOrEqual)(since)
            }
        });
    }
};
exports.IdempotencyService = IdempotencyService;
exports.IdempotencyService = IdempotencyService = IdempotencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(idempotency_entity_1.IdempotencyEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IdempotencyService);
//# sourceMappingURL=idempotency.service.js.map