import { Module } from '@nestjs/common';
import { LedgerEntryEntity } from '../db/entities/ledger-entry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerService } from './ledger.service';

@Module({
  imports: [TypeOrmModule.forFeature([LedgerEntryEntity])],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}