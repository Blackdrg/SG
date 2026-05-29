import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from './payment-gateway.interface';
export declare class RazorpayGateway implements PaymentGateway {
    private configService;
    private readonly logger;
    private keyId;
    private keySecret;
    constructor(configService: ConfigService);
    private razorpayRequest;
    createPaymentIntent(amount: number, currency?: string, userId?: string, metadata?: any): Promise<any>;
    confirmPayment(paymentId: string, userId: string): Promise<any>;
    refundPayment(paymentId: string, amount: number | null, userId: string, reason?: string): Promise<any>;
    constructEvent(payload: Buffer, signature: string, secret: string): Promise<any>;
    getGatewayName(): string;
}
