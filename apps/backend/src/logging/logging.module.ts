import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';

@Module({
  providers: [
    {
      provide: LoggingService,
      useFactory: () => new LoggingService('Application'),
    },
  ],
  exports: [LoggingService],
})
export class LoggingModule {}
