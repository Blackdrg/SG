import { Repository, DataSource } from 'typeorm';
import { SupportTicketEntity } from '../../db/entities/support-ticket.entity';
import { UserEntity } from '../../db/entities/user.entity';
export declare class TicketRoutingService {
    private ticketRepo;
    private userRepo;
    private dataSource;
    private readonly logger;
    private categoryRules;
    private prioritySLA;
    constructor(ticketRepo: Repository<SupportTicketEntity>, userRepo: Repository<UserEntity>, dataSource: DataSource);
    routeTicket(ticketId: string): Promise<SupportTicketEntity>;
    private findAvailableAgent;
    escalateTicket(ticketId: string, escalationLevel?: number): Promise<SupportTicketEntity>;
    private getEscalationTarget;
    private getEscalatedPriority;
    autoAssignBySLA(): Promise<void>;
    getQueueStats(): Promise<any>;
    private getTicketsByPriority;
    getOverdueTickets(): Promise<SupportTicketEntity[]>;
}
