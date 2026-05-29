import { ConfigService } from '@nestjs/config';
import { StripeGateway } from './gateways/stripe-gateway.service';
import { RazorpayGateway } from './gateways/razorpay-gateway.service';
export declare class PaymentGatewayFactory {
    private configService;
    private stripeGatewayInstance;
    private razorpayGatewayInstance;
    private readonly logger;
    private stripeGateway;
    private razorpayGateway;
    private defaultGateway;
    constructor(configService: ConfigService, stripeGatewayInstance: StripeGateway, razorpayGatewayInstance: RazorpayGateway);
    default: any;
    gateway: ;
}
