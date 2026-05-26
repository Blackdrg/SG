import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IDatabaseAdapter } from './interfaces/database-adapter.interface';

@Injectable()
export class PostgresAdapter<T> implements IDatabaseAdapter<T> {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async connect(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
  }
  async disconnect(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
  async query(query: string, params?: any[]): Promise<any> {
    return this.dataSource.query(query, params);
  }
  async findOne(filter: any): Promise<T | null> {
    // This is a generic adapter, actual implementation would need entity type
    return null; 
  }
  async findMany(filter: any): Promise<T[]> { return []; }
  async create(data: Partial<T>): Promise<T> { return data as T; }
  async update(id: string, data: Partial<T>): Promise<T> { return data as T; }
  async delete(id: string): Promise<boolean> { return true; }
}
