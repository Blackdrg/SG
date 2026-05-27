export declare class IdempotencyEntity {
    id: string;
    key: string;
    operation: string;
    userId: string;
    requestPayload: any;
    responsePayload: any;
    statusCode: number;
    isCompleted: boolean;
    createdAt: Date;
    completedAt: Date;
}
