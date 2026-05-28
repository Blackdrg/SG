import { Repository } from 'typeorm';
import { LedgerEntryEntity } from '../db/entities/ledger-entry.entity';
export declare class LedgerService {
    private readonly ledgerRepo;
    private readonly logger;
    constructor(ledgerRepo: Repository<LedgerEntryEntity>);
    createEntry(transactionId: string, account: string, amount: number, currency: string, type: string, referenceId?: string, description?: string): Promise<LedgerEntryEntity>;
    createTransaction(transactionId: string, debitAccount: string, creditAccount: string, amount: number, currency: string, type: string, referenceId?: string, description?: string): Promise<void>;
    getEntriesByTransactionId(transactionId: string): Promise<LedgerEntryEntity[]>;
    getEntriesByAccount(account: string, startDate: Date, endDate: Date): Promise<LedgerEntryEntity[]>;
}
