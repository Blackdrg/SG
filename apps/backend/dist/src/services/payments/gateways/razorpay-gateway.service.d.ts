import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from './payment-gateway.interface';
export declare class RazorpayGateway implements PaymentGateway {
    private configService;
    private readonly logger;
    private keyId;
    private keySecret;
    constructor(configService: ConfigService);
    private razorpayRequest;
    catch(error: any): void;
}
