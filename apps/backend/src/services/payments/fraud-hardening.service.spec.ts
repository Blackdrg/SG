import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudHardeningService } from './fraud-hardening.service';
import { PaymentFraudFlagEntity } from './payment-fraud.entity';
import { AuditService } from '../../audit/audit.service';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';

describe('FraudHardeningService', () => {
  let service: FraudHardeningService;
  let fraudFlagRepo: Repository<PaymentFraudFlagEntity>;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FraudHardeningService,
        {
          provide: getRepositoryToken(PaymentFraudFlagEntity),
          useValue: mockFraudFlagRepo,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(70),
          },
        },
      ],
    }).compile();

    service = module.get<FraudHardeningService>(FraudHardeningService);
    fraudFlagRepo = module.get<Repository<PaymentFraudFlagEntity>>(getRepositoryToken(PaymentFraudFlagEntity));
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