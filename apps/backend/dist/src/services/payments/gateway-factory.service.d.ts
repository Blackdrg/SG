import { ConfigService } from '@nestjs/config';
import { StripeGateway } from './gateways/stripe-gateway.service';
import { RazorpayGateway } from './gateways/razorpay-gateway.service';
import { PaymentGateway } from './gateways/payment-gateway.interface';
export declare class PaymentGatewayFactory {
    private configService;
    private stripeGatewayInstance;
    private razorpayGatewayInstance;
    private readonly logger;
    private stripeGateway;
    private razorpayGateway;
    private defaultGateway;
    constructor(configService: ConfigService, stripeGatewayInstance: StripeGateway, razorpayGatewayInstance: RazorpayGateway);
    getGateway(gatewayName?: string): PaymentGateway;
    getAvailableGateways(): string[];
}
