import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceService } from './compliance.service';
import { UserEntity } from '../db/entities/user.entity';
import { SessionEntity } from '../db/entities/session.entity';
import { AuditLogEntity } from '../db/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SessionEntity, AuditLogEntity])],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}