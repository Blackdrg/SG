import { ConfigService } from '@nestjs/config';
export declare class SentryService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    captureException(error: Error, context?: Record<string, unknown>): void;
    captureMessage(message: string, level?: 'info' | 'warning' | 'error', context?: Record<string, unknown>): void;
    startTransaction(name: string, op?: string): any;
}
