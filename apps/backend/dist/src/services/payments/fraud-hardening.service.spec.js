"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const fraud_hardening_service_1 = require("./fraud-hardening.service");
const payment_fraud_entity_1 = require("./payment-fraud.entity");
const audit_service_1 = require("../../audit/audit.service");
describe('FraudHardeningService', () => {
    let service;
    let fraudFlagRepo;
    const mockFraudFlagRepo = {
        count: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getRawOne: jest.fn(),
        })),
    };
    const mockAuditService = {
        log: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                fraud_hardening_service_1.FraudHardeningService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(payment_fraud_entity_1.PaymentFraudFlagEntity),
                    useValue: mockFraudFlagRepo,
                },
                {
                    provide: audit_service_1.AuditService,
                    useValue: mockAuditService,
                },
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(70),
                    },
                },
            ],
        }).compile();
        service = module.get(fraud_hardening_service_1.FraudHardeningService);
        fraudFlagRepo = module.get((0, typeorm_1.getRepositoryToken)(payment_fraud_entity_1.PaymentFraudFlagEntity));
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('checkPaymentFraud', () => {
        it('should allow low-risk payments', async () => {
            mockFraudFlagRepo.count.mockResolvedValue(1);
            mockFraudFlagRepo.createQueryBuilder().getRawOne.mockResolvedValue({ total: '100' });
            const result = await service.checkPaymentFraud({
                userId: 'user-1',
                amount: 100,
            });
            expect(result.allowed).toBe(true);
            expect(result.riskScore).toBeLessThan(70);
        });
        it('should block high-risk payments', async () => {
            mockFraudFlagRepo.count.mockResolvedValue(20);
            const result = await service.checkPaymentFraud({
                userId: 'user-1',
                amount: 10000,
            });
            expect(result.allowed).toBe(false);
            expect(result.riskScore).toBeGreaterThanOrEqual(70);
        });
    });
    describe('getFraudStats', () => {
        it('should return fraud statistics', async () => {
            mockFraudFlagRepo.count.mockResolvedValue(5);
            mockFraudFlagRepo.createQueryBuilder().getRawOne.mockResolvedValue({ count: '2' });
            const result = await service.getFraudStats();
            expect(result).toHaveProperty('totalFraudFlags');
            expect(result).toHaveProperty('fraudFlagsLast24h');
        });
    });
});
//# sourceMappingURL=fraud-hardening.service.spec.js.map