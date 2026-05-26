/** @jest-environment node */
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../payments/payments.service';
import { NotificationService } from '../notifications/notification.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepo: Repository<WalletEntity>;
  let walletTransactionRepo: Repository<WalletTransactionEntity>;
  let configService: ConfigService;
  let paymentService: PaymentService;
  let notificationService: NotificationService;

  const mockWalletRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockWalletTransactionRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const mockConfig: any = {
        'WALLET_DEFAULT_CURRENCY': 'INR',
        'WALLET_NOTIFICATION_THRESHOLD': 100,
        'WALLET_LOW_BALANCE_THRESHOLD': 50,
      };
      return mockConfig[key] ?? null;
    }),
  };

  const mockPaymentService = {};

  const mockNotificationService = {
    sendPush: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(WalletEntity),
          useValue: mockWalletRepo,
        },
        {
          provide: getRepositoryToken(WalletTransactionEntity),
          useValue: mockWalletTransactionRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepo = module.get<Repository<WalletEntity>>(getRepositoryToken(WalletEntity));
    walletTransactionRepo = module.get<Repository<WalletTransactionEntity>>(getRepositoryToken(WalletTransactionEntity));
    configService = module.get<ConfigService>(ConfigService);
    paymentService = module.get<PaymentService>(PaymentService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  describe('getWallet', () => {
    it('should return existing wallet if found', async () => {
      const existingWallet = {
        id: 'wallet123',
        userId: 'user123',
        balance: 100,
        currency: 'INR',
      };
      
      mockWalletRepo.findOne.mockResolvedValueOnce(existingWallet);
      
      const result = await service.getWallet('user123');
      expect(result).toEqual(existingWallet);
    });
  });

  describe('preventDoublePayment', () => {
    it('should return reconciliation report', async () => {
      const result = await service.reconcilePayments();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalProcessed');
    });
  });
});