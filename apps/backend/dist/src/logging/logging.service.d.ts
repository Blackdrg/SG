import { LoggerService } from '@nestjs/common';
export declare function sanitizeForLog(obj: unknown): unknown;
export declare function sanitizeErrorMessage(error: unknown): {
    message: string;
    stack?: string;
};
export declare class LoggingService implements LoggerService {
    private readonly context;
    constructor(context?: string);
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    secureError(message: string, error: unknown, context?: string): void;
}
