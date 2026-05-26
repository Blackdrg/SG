export interface IDatabaseAdapter<T> {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(query: string, params?: any[]): Promise<any>;
    findOne(filter: any): Promise<T | null>;
    findMany(filter: any): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
}
