import { Module, Global } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { EncryptionService } from './encryption.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from '../db/entities/audit-log.entity';
import { SessionEntity } from '../db/entities/session.entity';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TypeOrmModule.forFeature([AuditLogEntity, SessionEntity]),
  ],
  providers: [EncryptionService],
  exports: [EncryptionService, ThrottlerModule],
})
export class SecurityModule {}
