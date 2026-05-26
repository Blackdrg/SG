import { Injectable, LoggerService, Scope } from '@nestjs/common';

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
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    }));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
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
