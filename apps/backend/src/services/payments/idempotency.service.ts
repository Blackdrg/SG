import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { IdempotencyEntity } from './idempotency.entity';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface IdempotencyOptions {
  headerName?: string;
}

@Injectable()
export class IdempotencyService {
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
        createdAt: MoreThanOrEqual(since)
      }
    });
  }
}

import { Reflector } from '@nestjs/core';