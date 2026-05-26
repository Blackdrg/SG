import { PaymentService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../../infra/queue/queue.service';
export declare class PaymentsController {
    private paymentService;
    private configService;
    private queueService;
    constructor(paymentService: PaymentService, configService: ConfigService, queueService: QueueService);
    createPaymentIntent(body: any): Promise<{
        clientSecret: any;
    }>;
    refund(body: any): Promise<any>;
}
