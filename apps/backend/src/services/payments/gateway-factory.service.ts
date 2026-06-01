
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeGateway } from './gateways/stripe-gateway.service';
import { RazorpayGateway } from './gateways/razorpay-gateway.service';
import { PaymentGateway } from './gateways/payment-gateway.interface';

@Injectable()
export class PaymentGatewayFactory {
  private readonly logger = new Logger(PaymentGatewayFactory.name);
  
  private stripeGateway: StripeGateway;
  private razorpayGateway: RazorpayGateway;
  
  private defaultGateway: PaymentGateway;

constructor(
    private configService: ConfigService,
    private stripeGatewayInstance: StripeGateway,
    private razorpayGatewayInstance: RazorpayGateway
  ) {
    this.stripeGateway = this.stripeGatewayInstance;
    this.razorpayGateway = this.razorpayGatewayInstance;
    
    // Determine default gateway based on configuration
    const primaryGateway = this.configService.get<string>('PAYMENT_PRIMARY_GATEWAY', 'stripe');
    this.defaultGateway = primaryGateway === 'razorpay' ? this.razorpayGateway : this.stripeGateway;

    this.logger.log(`Payment gateway factory initialized with default gateway: ${this.defaultGateway.getGatewayName()}`);
  }

  getGateway(gatewayName?: string): PaymentGateway {
    if (!gatewayName) {
      return this.defaultGateway;
    }
    
    switch (gatewayName.toLowerCase()) {
      case 'stripe':
        return this.stripeGateway;
      case 'razorpay':
        return this.razorpayGateway;
       default:
         this.logger.warn(`Unknown payment gateway: ${gatewayName}, falling back to default`);
         return this.defaultGateway;
    }
  }

  getAvailableGateways(): string[] {
    return ['stripe', 'razorpay'];
  }
}
