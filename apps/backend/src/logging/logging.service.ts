import { Injectable, LoggerService } from '@nestjs/common';

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
}