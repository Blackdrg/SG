"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const payments_service_1 = require("./payments.service");
const config_1 = require("@nestjs/config");
const audit_service_1 = require("../../audit/audit.service");
const common_1 = require("@nestjs/common");
describe('PaymentService', () => {
    let service;
    let configService;
    let auditService;
    let logger;
    let stripeMock;
    beforeEach(async () => {
        stripeMock = {
            paymentIntents: {
                create: jest.fn(),
                retrieve: jest.fn()
            },
            refunds: {
                create: jest.fn()
            },
            webhooks: {
                constructEvent: jest.fn()
            }
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                payments_service_1.PaymentService,
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            const mockConfig = {
                                'STRIPE_SECRET_KEY': 'sk_test_mock',
                                'PAYMENT_MAX_SINGLE_AMOUNT': 10000,
                                'PAYMENT_DAILY_LIMIT_PER_USER': 50000,
                                'REFRESH_TOKEN_LENGTH': 40
                            };
                            return mockConfig[key];
                        })
                    }
                },
                {
                    provide: audit_service_1.AuditService,
                    useValue: {
                        logPaymentEvent: jest.fn().mockResolvedValue(undefined)
                    }
                },
                common_1.Logger
            ],
        }).compile();
        service = module.get(payments_service_1.PaymentService);
        configService = module.get(config_1.ConfigService);
        auditService = module.get(audit_service_1.AuditService);
        logger = module.get(common_1.Logger);
        service.stripe = stripeMock;
    });
    describe('createPaymentIntent', () => {
        it('should create a payment intent successfully', async () => {
            const mockPaymentIntent = {
                id: 'pi_123',
                amount: 1000,
                currency: 'usd',
                status: 'succeeded'
            };
            stripeMock.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
            const result = await service.createPaymentIntent(10, 'usd', 'user123', {});
            expect(result).toEqual(mockPaymentIntent);
            expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith({
                amount: 1000,
                currency: 'usd',
                metadata: {
                    userId: 'user123',
                    timestamp: expect.any(String)
                }
            });
            expect(auditService.logPaymentEvent).toHaveBeenCalledWith('payment_intent_created', 'user123', 10, 'usd', 'stripe', 'pi_123', true, undefined);
        });
        it('should throw error for amount exceeding maximum', async () => {
            await expect(service.createPaymentIntent(15000))
                .rejects
                .toThrowError(/Payment amount exceeds maximum allowed/);
        });
        it('should throw error for negative amount', async () => {
            await expect(service.createPaymentIntent(-5))
                .rejects
                .toThrowError(/Payment amount must be greater than zero/);
        });
    });
    describe('confirmPayment', () => {
        it('should confirm a successful payment', async () => {
            const mockPaymentIntent = {
                id: 'pi_123',
                amount: 1000,
                currency: 'usd',
                status: 'succeeded'
            };
            stripeMock.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);
            const result = await service.confirmPayment('pi_123', 'user123');
            expect(result).toEqual(mockPaymentIntent);
            expect(stripeMock.paymentIntents.retrieve).toHaveBeenCalledWith('pi_123');
            expect(auditService.logPaymentEvent).toHaveBeenCalledWith('payment_confirmed', 'user123', 10, 'usd', 'stripe', 'pi_123', true, undefined);
        });
        it('should throw error for failed payment', async () => {
            const mockPaymentIntent = {
                id: 'pi_123',
                amount: 1000,
                currency: 'usd',
                status: 'failed'
            };
            stripeMock.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);
            await expect(service.confirmPayment('pi_123', 'user123'))
                .rejects
                .toThrowError(/Payment not successful/);
            expect(auditService.logPaymentEvent).toHaveBeenCalledWith('payment_failed', 'user123', 10, 'usd', 'stripe', 'pi_123', false, undefined, 'Payment status: failed');
        });
    });
    describe('refundPayment', () => {
        it('should refund a payment successfully', async () => {
            const mockPaymentIntent = {
                id: 'pi_123',
                amount: 1000,
                currency: 'usd'
            };
            const mockRefund = {
                id: 're_123',
                amount: 500,
                currency: 'usd'
            };
            stripeMock.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);
            stripeMock.refunds.create.mockResolvedValue(mockRefund);
            const result = await service.refundPayment('pi_123', 5, 'user123');
            expect(result).toEqual(mockRefund);
            expect(stripeMock.refunds.create).toHaveBeenCalledWith({
                payment_intent: 'pi_123',
                amount: 500,
                reason: 'requested_by_customer'
            });
            expect(auditService.logPaymentEvent).toHaveBeenCalledWith('payment_refunded', 'user123', 5, 'usd', 'stripe', 'pi_123', true, undefined, 'Reason: requested_by_customer');
        });
        it('should throw error for refund exceeding original amount', async () => {
            const mockPaymentIntent = {
                id: 'pi_123',
                amount: 1000,
                currency: 'usd'
            };
            stripeMock.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);
            await expect(service.refundPayment('pi_123', 15, 'user123'))
                .rejects
                .toThrowError(/Refund amount cannot exceed original payment/);
        });
    });
});
//# sourceMappingURL=payments.service.spec.js.map