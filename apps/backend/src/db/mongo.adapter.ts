import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IDatabaseAdapter } from './interfaces/database-adapter.interface';

@Injectable()
export class MongoAdapter<T> implements IDatabaseAdapter<T> {
  constructor(@InjectConnection() private connection: Connection) {}

  async connect(): Promise<void> {
    // Mongoose handles connection automatically
  }
  async disconnect(): Promise<void> {
    await this.connection.close();
  }
  async query(query: string, params?: any[]): Promise<any> {
    // MongoDB doesn't use SQL queries, but we can execute commands
    return this.connection.db?.command({ ping: 1 });
  }
  async findOne(filter: any): Promise<T | null> { return null; }
  async findMany(filter: any): Promise<T[]> { return []; }
  async create(data: Partial<T>): Promise<T> { return data as T; }
  async update(id: string, data: Partial<T>): Promise<T> { return data as T; }
  async delete(id: string): Promise<boolean> { return true; }
}
