import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { sanitizeForLog } from '../../logging/logging.service';

@Injectable({ scope: Scope.TRANSIENT })
export class StructuredLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    }));
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(JSON.stringify({
      level: 'error',
      message: sanitizeForLog(message),
      error: sanitizeForLog(optionalParams[0]),
      context: this.context,
      timestamp: new Date().toISOString(),
    }));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(JSON.stringify({
      level: 'warn',
      message: sanitizeForLog(message),
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    }));
  }

  debug?(message: any, ...optionalParams: any[]) {
    console.debug(JSON.stringify({
      level: 'debug',
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    }));
  }

  verbose?(message: any, ...optionalParams: any[]) {
    console.log(JSON.stringify({
      level: 'verbose',
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    }));
  }
}
