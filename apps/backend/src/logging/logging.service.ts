import { Injectable, LoggerService } from '@nestjs/common';

const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'token',
  'secret',
  'apiKey',
  'accessToken',
  'refreshToken',
  'creditCard',
  'cvv',
  'cvc',
];

export function sanitizeForLog(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => sanitizeForLog(item));
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLog(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function sanitizeErrorMessage(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    message: String(error),
  };
}

@Injectable()
export class LoggingService implements LoggerService {
  private readonly context: string;

  constructor(context: string = 'Application') {
    this.context = context;
  }

  log(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logContext = context || this.context;
    console.log(`[${timestamp}] [LOG] [${logContext}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logContext = context || this.context;
    console.error(`[${timestamp}] [ERROR] [${logContext}] ${message}`, trace || '');
  }

  warn(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logContext = context || this.context;
    console.warn(`[${timestamp}] [WARN] [${logContext}] ${message}`);
  }

  debug(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logContext = context || this.context;
    console.debug(`[${timestamp}] [DEBUG] [${logContext}] ${message}`);
  }

  verbose(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logContext = context || this.context;
    console.log(`[${timestamp}] [VERBOSE] [${logContext}] ${message}`);
  }

  secureError(message: string, error: unknown, context?: string): void {
    const timestamp = new Date().toISOString();
    const logContext = context || this.context;
    const sanitizedError = sanitizeErrorMessage(error);
    const safeContext = sanitizeForLog(logContext);
    console.error(
      `[${timestamp}] [SECURE-ERROR] [${safeContext}] ${message}`,
      sanitizedError.message
    );
  }
}
