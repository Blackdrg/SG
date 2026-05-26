import { DataSource } from 'typeorm';
import { IDatabaseAdapter } from './interfaces/database-adapter.interface';
export declare class PostgresAdapter<T> implements IDatabaseAdapter<T> {
    private dataSource;
    constructor(dataSource: DataSource);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(query: string, params?: any[]): Promise<any>;
    findOne(filter: any): Promise<T | null>;
    findMany(filter: any): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
}
