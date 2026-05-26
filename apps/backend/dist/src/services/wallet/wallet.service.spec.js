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
const common_1 = require("@nestjs/common");
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
        walletRepo = module.get < (0, typeorm_1.getRepositoryToken)(wallet_entity_1.WalletEntity) > ((0, typeorm_1.getRepositoryToken)(wallet_entity_1.WalletEntity));
        walletTransactionRepo = module.get < (0, typeorm_1.getRepositoryToken)(wallet_transaction_entity_1.WalletTransactionEntity) > ((0, typeorm_1.getRepositoryToken)(wallet_transaction_entity_1.WalletTransactionEntity));
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
            expect(mockWalletRepo.findOne).toHaveBeenCalledWith({ where: { userId: 'user123' } });
        });
        it('should create new wallet if not found', async () => {
            mockWalletRepo.findOne.mockResolvedValueOnce(null);
            mockWalletRepo.create.mockReturnValueOnce({
                userId: 'user123',
                balance: 0,
                currency: 'INR',
            });
            mockWalletRepo.save.mockResolvedValueOnce({
                id: 'wallet123',
                userId: 'user123',
                balance: 0,
                currency: 'INR',
            });
            const result = await service.getWallet('user123');
            expect(result).toBeDefined();
            expect(result.id).toBe('wallet123');
            expect(result.balance).toBe(0);
            expect(mockWalletRepo.create).toHaveBeenCalled();
            expect(mockWalletRepo.save).toHaveBeenCalled();
        });
    });
    describe('creditWallet', () => {
        it('should credit wallet successfully', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 50,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            mockWalletRepo.save.mockResolvedValueOnce({
                ...wallet,
                balance: 150,
                updatedAt: new Date(),
            });
            mockWalletTransactionRepo.create.mockReturnValueOnce({});
            mockWalletTransactionRepo.save.mockResolvedValueOnce({
                id: 'txn123',
                walletId: 'wallet123',
                amount: 100,
                type: 'credit',
                description: 'Test credit',
                referenceId: 'ref123',
                createdAt: new Date(),
            });
            const result = await service.creditWallet('user123', 100, 'Test credit', 'ref123');
            expect(result).toBeDefined();
            expect(result.amount).toBe(100);
            expect(result.type).toBe('credit');
            expect(mockWalletRepo.save).toHaveBeenCalledWith({
                ...wallet,
                balance: 150,
                updatedAt: expect.any(Date),
            });
            expect(mockNotificationService.sendPush).toHaveBeenCalled();
        });
        it('should reject negative or zero amount', async () => {
            await expect(service.creditWallet('user123', 0, 'Test', 'ref123'))
                .rejects.toThrow(common_1.BadRequestException);
            await expect(service.creditWallet('user123', -50, 'Test', 'ref123'))
                .rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('debitWallet', () => {
        it('should debit wallet successfully', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 150,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            mockWalletRepo.save.mockResolvedValueOnce({
                ...wallet,
                balance: 50,
                updatedAt: new Date(),
            });
            mockWalletTransactionRepo.create.mockReturnValueOnce({});
            mockWalletTransactionRepo.save.mockResolvedValueOnce({
                id: 'txn123',
                walletId: 'wallet123',
                amount: 100,
                type: 'debit',
                description: 'Test debit',
                referenceId: 'ref123',
                createdAt: new Date(),
            });
            const result = await service.debitWallet('user123', 100, 'Test debit', 'ref123');
            expect(result).toBeDefined();
            expect(result.amount).toBe(100);
            expect(result.type).toBe('debit');
            expect(mockWalletRepo.save).toHaveBeenCalledWith({
                ...wallet,
                balance: 50,
                updatedAt: expect.any(Date),
            });
            expect(mockNotificationService.sendPush).not.toHaveBeenCalledWith('user123', 'Low Wallet Balance', expect.any(String), expect.any(Object));
        });
        it('should notify for low balance after debit', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 75,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            mockWalletRepo.save.mockResolvedValueOnce({
                ...wallet,
                balance: 25,
                updatedAt: new Date(),
            });
            mockWalletTransactionRepo.create.mockReturnValueOnce({});
            mockWalletTransactionRepo.save.mockResolvedValueOnce({
                id: 'txn123',
                walletId: 'wallet123',
                amount: 50,
                type: 'debit',
                description: 'Test debit',
                referenceId: 'ref123',
                createdAt: new Date(),
            });
            await service.debitWallet('user123', 50, 'Test debit', 'ref123');
            expect(mockNotificationService.sendPush).toHaveBeenCalledWith('user123', 'Low Wallet Balance', expect.stringContaining('₹25'), expect.objectContaining({ walletId: 'wallet123' }));
        });
        it('should reject debit when insufficient balance', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 30,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            await expect(service.debitWallet('user123', 50, 'Test debit', 'ref123'))
                .rejects.toThrow(common_1.BadRequestException);
        });
        it('should reject negative or zero amount', async () => {
            await expect(service.debitWallet('user123', 0, 'Test', 'ref123'))
                .rejects.toThrow(common_1.BadRequestException);
            await expect(service.debitWallet('user123', -50, 'Test', 'ref123'))
                .rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('compensateUser', () => {
        it('should credit wallet as compensation', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 100,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            mockWalletRepo.save.mockResolvedValueOnce({
                ...wallet,
                balance: 150,
                updatedAt: new Date(),
            });
            mockWalletTransactionRepo.create.mockReturnValueOnce({});
            mockWalletTransactionRepo.save.mockResolvedValueOnce({
                id: 'txn123',
                walletId: 'wallet123',
                amount: 50,
                type: 'credit',
                description: 'Compensation: Test reason',
                referenceId: 'COMP-123456789-abc',
                createdAt: new Date(),
            });
            const result = await service.compensateUser('user123', 50, 'Test reason');
            expect(result).toBeDefined();
            expect(result.amount).toBe(50);
            expect(result.type).toBe('credit');
            expect(result.description).toBe('Compensation: Test reason');
        });
    });
    describe('processCODPayment', () => {
        it('should process COD payment successfully', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 100,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            mockWalletTransactionRepo.create.mockReturnValueOnce({});
            mockWalletTransactionRepo.save.mockResolvedValueOnce({
                id: 'txn123',
                walletId: 'wallet123',
                amount: 75,
                type: 'credit',
                description: 'COD Payment Pending for Order #order123',
                referenceId: 'order123',
                createdAt: new Date(),
            });
            const result = await service.processCODPayment('order123', 75, 'user123');
            expect(result).toBe(true);
            expect(mockWalletTransactionRepo.save).toHaveBeenCalled();
        });
        it('should reject invalid COD amount', async () => {
            await expect(service.processCODPayment('order123', 0, 'user123'))
                .rejects.toThrow(common_1.BadRequestException);
            await expect(service.processCODPayment('order123', -50, 'user123'))
                .rejects.toThrow(common_1.BadRequestException);
            await expect(service.processCODPayment('order123', 'invalid', 'user123'))
                .rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('confirmCODCollection', () => {
        it('should confirm COD collection successfully', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 100,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            mockWalletTransactionRepo.findOne.mockResolvedValueOnce({
                id: 'txn123',
                walletId: 'wallet123',
                amount: 50,
                type: 'credit',
                description: 'COD Payment Pending for Order #order123',
                referenceId: 'order123',
                createdAt: new Date(),
            });
            mockWalletRepo.save.mockResolvedValueOnce({
                ...wallet,
                balance: 150,
                updatedAt: new Date(),
            });
            mockWalletTransactionRepo.save.mockResolvedValueOnce({
                id: 'txn123',
                walletId: 'wallet123',
                amount: 75,
                type: 'credit',
                description: 'COD Payment Collected for Order #order123',
                referenceId: 'order123',
                createdAt: new Date(),
            });
            const result = await service.confirmCODCollection('order123', 75, 'user123');
            expect(result).toBeDefined();
            expect(result.amount).toBe(75);
            expect(result.description).toBe('COD Payment Collected for Order #order123');
            expect(mockWalletRepo.save).toHaveBeenCalledWith({
                ...wallet,
                balance: 150,
                updatedAt: expect.any(Date),
            });
        });
        it('should reject invalid COD amount', async () => {
            await expect(service.confirmCODCollection('order123', 0, 'user123'))
                .rejects.toThrow(common_1.BadRequestException);
            await expect(service.confirmCODCollection('order123', -50, 'user123'))
                .rejects.toThrow(common_1.BadRequestException);
            await expect(service.confirmCODCollection('order123', 'invalid', 'user123'))
                .rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw error when no pending COD transaction found', async () => {
            mockWalletRepo.findOne.mockResolvedValueOnce({
                id: 'wallet123',
                userId: 'user123',
                balance: 100,
                currency: 'INR',
            });
            mockWalletTransactionRepo.findOne.mockResolvedValueOnce(null);
            await expect(service.confirmCODCollection('order123', 50, 'user123'))
                .rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('refundCOD', () => {
        it('should refund COD payment successfully', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 150,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            mockWalletTransactionRepo.findOne.mockResolvedValueOnce({
                id: 'txn123',
                walletId: 'wallet123',
                amount: 75,
                type: 'credit',
                description: 'COD Payment Collected for Order #order123',
                referenceId: 'order123',
                createdAt: new Date(),
            });
            mockWalletTransactionRepo.create.mockReturnValueOnce({});
            mockWalletTransactionRepo.save.mockResolvedValueOnce({
                id: 'txn456',
                walletId: 'wallet123',
                amount: 75,
                type: 'debit',
                description: 'COD Refund: customer_request',
                referenceId: 'COD-REF-order123-1234567890',
                createdAt: new Date(),
            });
            const result = await service.refundCOD('order123', 75, 'user123', 'customer_request');
            expect(result).toBeDefined();
            expect(result.amount).toBe(75);
            expect(result.type).toBe('debit');
            expect(result.description).toBe('COD Refund: customer_request');
        });
    });
    describe('getWalletBalance', () => {
        it('should return wallet balance and currency', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 125.50,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            const result = await service.getWalletBalance('user123');
            expect(result).toEqual({
                balance: 125.50,
                currency: 'INR',
            });
        });
    });
    describe('preventDoublePayment', () => {
        it('should allow payment when no recent transactions', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 100,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            mockWalletTransactionRepo.find.mockResolvedValueOnce([]);
            const result = await service.preventDoublePayment('user123', 'order123', 50);
            expect(result).toBe(true);
        });
        it('should prevent payment when recent confirmed transaction exists', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 100,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            mockWalletTransactionRepo.find.mockResolvedValueOnce([
                {
                    id: 'txn123',
                    walletId: 'wallet123',
                    amount: 50,
                    type: 'credit',
                    description: 'Payment Confirmed for Order #order123',
                    referenceId: 'order123',
                    createdAt: new Date(Date.now() - 60000),
                },
            ]);
            const result = await service.preventDoublePayment('user123', 'order123', 50);
            expect(result).toBe(false);
        });
        it('should allow payment when only pending transactions exist', async () => {
            const wallet = {
                id: 'wallet123',
                userId: 'user123',
                balance: 100,
                currency: 'INR',
            };
            mockWalletRepo.findOne.mockResolvedValueOnce(wallet);
            mockWalletTransactionRepo.find.mockResolvedValueOnce([
                {
                    id: 'txn123',
                    walletId: 'wallet123',
                    amount: 50,
                    type: 'credit',
                    description: 'Payment Pending for Order #order123',
                    referenceId: 'order123',
                    createdAt: new Date(Date.now() - 60000),
                },
            ]);
            const result = await service.preventDoublePayment('user123', 'order123', 50);
            expect(result).toBe(true);
        });
    });
    describe('reconcilePayments', () => {
        it('should return reconciliation report', async () => {
            const result = await service.reconcilePayments();
            expect(result).toBeDefined();
            expect(result).toHaveProperty('totalProcessed');
            expect(result).toHaveProperty('successful');
            expect(result).toHaveProperty('failed');
            expect(result).toHaveProperty('discrepancies');
            expect(Array.isArray(result.discrepancies)).toBe(true);
        });
    });
});
//# sourceMappingURL=wallet.service.spec.js.map