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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const argon2 = require("argon2");
const crypto = require("crypto");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../db/entities/user.entity");
const session_entity_1 = require("../../db/entities/session.entity");
let AuthService = class AuthService {
    constructor(jwtService, configService, userRepo, sessionRepo) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.userRepo = userRepo;
        this.sessionRepo = sessionRepo;
    }
    async hashPassword(password) {
        return argon2.hash(password);
    }
    async verifyPassword(password, hash) {
        return argon2.verify(hash, password);
    }
    async createSession(userId, deviceInfo) {
        const sessionDurationDays = this.configService.get('SESSION_DURATION_DAYS', 30);
        const session = this.sessionRepo.create({
            userId,
            deviceName: deviceInfo.name,
            deviceType: deviceInfo.type,
            ipAddress: deviceInfo.ip,
            expiresAt: new Date(Date.now() + sessionDurationDays * 24 * 60 * 60 * 1000),
        });
        return this.sessionRepo.save(session);
    }
    async validateUser(email, pass) {
        if (!email || !pass) {
            throw new common_1.UnauthorizedException('Credentials required');
        }
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (await this.verifyPassword(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        throw new common_1.UnauthorizedException('Invalid email or password');
    }
    async login(user, deviceInfo) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        await this.createSession(user.id, deviceInfo);
        return {
            access_token: accessToken,
            refresh_token: crypto.randomBytes(this.configService.get('REFRESH_TOKEN_LENGTH', 40)).toString('hex'),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(session_entity_1.SessionEntity)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map