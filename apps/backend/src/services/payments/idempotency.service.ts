import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { IdempotencyEntity } from './idempotency.entity';

export interface IdempotencyOptions {
  headerName?: string;
}

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(
    @InjectRepository(IdempotencyEntity)
    private readonly idempotencyRepo: Repository<IdempotencyEntity>,
  ) {}

  async validateOrCreate(
    key: string,
    operation: string,
    userId: string | null,
    requestPayload: any
  ): Promise<{ isDuplicate: boolean; response?: any }> {
    if (!key) {
      return { isDuplicate: false };
    }

    const existing = await this.idempotencyRepo.findOne({
      where: { key, operation }
    });

    if (existing?.isCompleted) {
      this.logger.warn(`Duplicate request detected for operation ${operation} with key ${key}`);
      return { isDuplicate: true, response: existing.responsePayload };
    }

    const newKey = this.idempotencyRepo.create({
      key,
      operation,
      userId: userId || 'anonymous',
      requestPayload,
      isCompleted: false,
    });
    await this.idempotencyRepo.save(newKey);

    return { isDuplicate: false };
  }

  async complete(
    key: string,
    operation: string,
    responsePayload: any,
    statusCode: number = 200
  ): Promise<void> {
    await this.idempotencyRepo.update(
      { key, operation },
      {
        responsePayload,
        statusCode,
        isCompleted: true,
        completedAt: new Date(),
      }
    );
  }

  async getRecentRequests(userId: string, operation: string, windowMs: number = 60000): Promise<number> {
    const since = new Date(Date.now() - windowMs);
    return this.idempotencyRepo.count({
      where: {
        userId,
        operation,
        createdAt: MoreThanOrEqual(since) as any
      }
    });
  }
}