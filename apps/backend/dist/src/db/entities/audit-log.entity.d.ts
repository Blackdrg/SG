export declare class AuditLogEntity {
    id: string;
    action: string;
    performedBy: string;
    entityType: string;
    entityId: string;
    metadata: any;
    ipAddress: string;
    timestamp: Date;
}
