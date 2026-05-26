"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./auth.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../db/entities/user.entity");
const session_entity_1 = require("../../db/entities/session.entity");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const argon2 = require("argon2");
const crypto = require("crypto");
describe('AuthService', () => {
    let authService;
    let userRepo;
    let sessionRepo;
    let jwtService;
    let configService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.UserEntity),
                    useClass: Repository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(session_entity_1.SessionEntity),
                    useClass: Repository,
                },
                jwt_1.JwtService,
                config_1.ConfigService,
            ],
        }).compile();
        authService = module.get(auth_service_1.AuthService);
        userRepo = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.UserEntity));
        sessionRepo = module.get((0, typeorm_1.getRepositoryToken)(session_entity_1.SessionEntity));
        jwtService = module.get(jwt_1.JwtService);
        configService = module.get(config_1.ConfigService);
    });
    describe('hashPassword', () => {
        it('should hash a password correctly', async () => {
            const password = 'testPassword123';
            const hashedPassword = await authService.hashPassword(password);
            expect(hashedPassword).not.toBe(password);
            expect(await argon2.verify(hashedPassword, password)).toBe(true);
        });
    });
    describe('verifyPassword', () => {
        it('should verify a correct password', async () => {
            const password = 'testPassword123';
            const hashedPassword = await argon2.hash(password);
            const result = await authService.verifyPassword(password, hashedPassword);
            expect(result).toBe(true);
        });
        it('should reject an incorrect password', async () => {
            const password = 'testPassword123';
            const wrongPassword = 'wrongPassword';
            const hashedPassword = await argon2.hash(password);
            const result = await authService.verifyPassword(wrongPassword, hashedPassword);
            expect(result).toBe(false);
        });
    });
    describe('validateUser', () => {
        it('should validate a user with correct credentials', async () => {
            const userData = {
                id: '1',
                email: 'test@example.com',
                passwordHash: await argon2.hash('password123'),
                fullName: 'Test User',
                role: 'CUSTOMER',
                status: 'ACTIVE'
            };
            jest.spyOn(userRepo, 'findOne').mockResolvedValue(userData);
            const result = await authService.validateUser('test@example.com', 'password123');
            expect(result).toMatchObject({
                id: '1',
                email: 'test@example.com',
                fullName: 'Test User'
            });
        });
        it('should throw UnauthorizedException for invalid credentials', async () => {
            jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
            await expect(authService.validateUser('nonexistent@example.com', 'password'))
                .rejects
                .toThrowError(/Invalid email or password/);
        });
    });
    describe('login', () => {
        it('should create a session and return tokens', async () => {
            const user = {
                id: '1',
                email: 'test@example.com',
                role: 'CUSTOMER'
            };
            const deviceInfo = {
                name: 'Test Device',
                type: 'mobile',
                ip: '127.0.0.1'
            };
            jest.spyOn(sessionRepo, 'create').mockReturnValue({});
            jest.spyOn(sessionRepo, 'save').mockResolvedValue({});
            jest.spyOn(jwtService, 'sign').mockReturnValue('fake-jwt-token');
            jest.spyOn(configService, 'get').mockImplementation((key) => {
                if (key === 'REFRESH_TOKEN_LENGTH')
                    return 40;
                return null;
            });
            jest.spyOn(crypto, 'randomBytes').mockReturnValue({ toString: () => 'fake-refresh-token' });
            const result = await authService.login(user, deviceInfo);
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
            expect(sessionRepo.save).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map