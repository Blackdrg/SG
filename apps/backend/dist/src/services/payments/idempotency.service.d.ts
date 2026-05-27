import { Repository } from 'typeorm';
import { IdempotencyEntity } from './idempotency.entity';
export interface IdempotencyOptions {
    headerName?: string;
}
export declare class IdempotencyService {
    private readonly idempotencyRepo;
    private readonly logger;
    constructor(idempotencyRepo: Repository<IdempotencyEntity>);
    validateOrCreate(key: string, operation: string, userId: string | null, requestPayload: any): Promise<{
        isDuplicate: boolean;
        response?: any;
    }>;
    complete(key: string, operation: string, responsePayload: any, statusCode?: number): Promise<void>;
    getRecentRequests(userId: string, operation: string, windowMs?: number): Promise<number>;
}
