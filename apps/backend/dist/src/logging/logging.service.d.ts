import { LoggerService } from '@nestjs/common';
export declare class LoggingService implements LoggerService {
    private readonly context;
    constructor(context?: string);
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
}
