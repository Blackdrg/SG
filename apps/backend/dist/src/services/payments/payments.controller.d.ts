import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../../infra/queue/queue.service';
export declare class PaymentsController {
    private paymentService;
    private configService;
    private queueService;
    constructor(paymentService: PaymentService, configService: ConfigService, queueService: QueueService);
    handleWebhook(sig: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
    private processSuccessfulPayment;
}
