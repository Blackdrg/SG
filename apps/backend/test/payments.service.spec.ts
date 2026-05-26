import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../../audit/audit.service';
import { Logger } from '@nestjs/common';

describe('PaymentService', () => {
  let service: PaymentService;
  let configService: ConfigService;
  let auditService: AuditService;
  let logger: Logger;
  let stripeMock: any;

  beforeEach(async () => {
    // Mock Stripe
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const mockConfig: any = {
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
          provide: AuditService,
          useValue: {
            logPaymentEvent: jest.fn().mockResolvedValue(undefined)
          }
        },
        Logger
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    configService = module.get<ConfigService>(ConfigService);
    auditService = module.get<AuditService>(AuditService);
    logger = module.get<Logger>(Logger);
    
    // Inject the mocked stripe
    (service as any).stripe = stripeMock;
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
        amount: 1000, // 10 dollars in cents
        currency: 'usd',
        metadata: {
          userId: 'user123',
          timestamp: expect.any(String)
        }
      });
      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_intent_created',
        'user123',
        10,
        'usd',
        'stripe',
        'pi_123',
        true,
        undefined
      );
    });

    it('should throw error for amount exceeding maximum', async () => {
      await expect(service.createPaymentIntent(15000)) // $15,000 > $10,000 limit
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
      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_confirmed',
        'user123',
        10,
        'usd',
        'stripe',
        'pi_123',
        true,
        undefined
      );
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
      
      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_failed',
        'user123',
        10,
        'usd',
        'stripe',
        'pi_123',
        false,
        undefined,
        'Payment status: failed'
      );
    });
  });

  describe('refundPayment', () => {
    it('should refund a payment successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 1000, // $10 in cents
        currency: 'usd'
      };
      
      const mockRefund = {
        id: 're_123',
        amount: 500, // $5 in cents
        currency: 'usd'
      };
      
      stripeMock.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);
      stripeMock.refunds.create.mockResolvedValue(mockRefund);
      
      const result = await service.refundPayment('pi_123', 5, 'user123'); // $5 refund
      
      expect(result).toEqual(mockRefund);
      expect(stripeMock.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: 500, // $5 in cents
        reason: 'requested_by_customer'
      });
      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_refunded',
        'user123',
        5,
        'usd',
        'stripe',
        'pi_123',
        true,
        undefined,
        'Reason: requested_by_customer'
      );
    });

    it('should throw error for refund exceeding original amount', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 1000, // $10 in cents
        currency: 'usd'
      };
      
      stripeMock.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);
      
      await expect(service.refundPayment('pi_123', 15, 'user123')) // Trying to refund $15 from $10 payment
        .rejects
        .toThrowError(/Refund amount cannot exceed original payment/);
    });
  });
});