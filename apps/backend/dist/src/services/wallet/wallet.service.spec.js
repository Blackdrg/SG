"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const wallet_service_1 = require("./wallet.service");
const typeorm_1 = require("@nestjs/typeorm");
const wallet_entity_1 = require("../../db/entities/wallet.entity");
const wallet_transaction_entity_1 = require("../../db/entities/wallet-transaction.entity");
const config_1 = require("@nestjs/config");
const payments_service_1 = require("../payments/payments.service");
const notification_service_1 = require("../notifications/notification.service");
describe('WalletService', () => {
    let service;
    let walletRepo;
    let walletTransactionRepo;
    let configService;
    let paymentService;
    let notificationService;
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
        get: jest.fn((key) => {
            const mockConfig = {
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                wallet_service_1.WalletService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(wallet_entity_1.WalletEntity),
                    useValue: mockWalletRepo,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(wallet_transaction_entity_1.WalletTransactionEntity),
                    useValue: mockWalletTransactionRepo,
                },
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: payments_service_1.PaymentService,
                    useValue: mockPaymentService,
                },
                {
                    provide: notification_service_1.NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        }).compile();
        service = module.get(wallet_service_1.WalletService);
        walletRepo = module.get((0, typeorm_1.getRepositoryToken)(wallet_entity_1.WalletEntity));
        walletTransactionRepo = module.get((0, typeorm_1.getRepositoryToken)(wallet_transaction_entity_1.WalletTransactionEntity));
        configService = module.get(config_1.ConfigService);
        paymentService = module.get(payments_service_1.PaymentService);
        notificationService = module.get(notification_service_1.NotificationService);
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
//# sourceMappingURL=wallet.service.spec.js.map