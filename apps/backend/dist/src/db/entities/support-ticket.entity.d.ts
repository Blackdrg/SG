import { UserEntity } from './user.entity';
export declare enum TicketPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum TicketCategory {
    ORDER = "order",
    PAYMENT = "payment",
    DELIVERY = "delivery",
    QUALITY = "quality",
    ACCOUNT = "account",
    TECHNICAL = "technical"
}
export declare enum TicketStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    AWAITING_CUSTOMER = "awaiting_customer",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare class SupportTicketEntity {
    id: string;
    ticketNumber: string;
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    createdById: string;
    createdBy: UserEntity;
    assignedToId: string;
    assignedTo: UserEntity;
    escalatedToId: string;
    escalatedTo: UserEntity;
    escalationLevel: number;
    slaBreachedAt: Date;
    messages: any[];
    metadata: {
        orderId?: string;
        restaurantId?: string;
        driverId?: string;
        disputeId?: string;
    };
    resolutionNotes: string;
    resolvedAt: Date;
    satisfactionSurveySent: boolean;
    satisfactionRating: number;
    escalated: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TicketMessageEntity {
    id: string;
    ticketId: string;
    ticket: SupportTicketEntity;
    senderId: string;
    sender: UserEntity;
    message: string;
    isInternalNote: boolean;
    isSystemMessage: boolean;
    attachments: string[];
    createdAt: Date;
}
