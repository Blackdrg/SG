import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { SupportTicketEntity, TicketCategory, TicketStatus, TicketPriority } from '../../db/entities/support-ticket.entity';
import { UserEntity } from '../../db/entities/user.entity';

@Injectable()
export class TicketRoutingService {
  private readonly logger = new Logger(TicketRoutingService.name);

  private categoryRules: Map<TicketCategory, string[]> = new Map([
    [TicketCategory.ORDER, ['support_agent', 'admin']],
    [TicketCategory.PAYMENT, ['finance_agent', 'admin']],
    [TicketCategory.DELIVERY, ['delivery_coordinator', 'admin']],
    [TicketCategory.QUALITY, ['quality_agent', 'admin']],
    [TicketCategory.ACCOUNT, ['support_agent', 'admin']],
    [TicketCategory.TECHNICAL, ['tech_support', 'admin']],
  ]);

  private prioritySLA: Map<TicketPriority, number> = new Map([
    [TicketPriority.LOW, 48],
    [TicketPriority.MEDIUM, 24],
    [TicketPriority.HIGH, 4],
    [TicketPriority.URGENT, 1],
  ]);

  constructor(
    @InjectRepository(SupportTicketEntity)
    private ticketRepo: Repository<SupportTicketEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private dataSource: DataSource,
  ) {}

  async routeTicket(ticketId: string): Promise<SupportTicketEntity> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['assignedTo'],
    });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.assignedToId) {
      return ticket;
    }

    const eligibleRoles = this.categoryRules.get(ticket.category) || ['support_agent'];
    const availableAgent = await this.findAvailableAgent(eligibleRoles, ticket.priority);

    if (availableAgent) {
      await this.ticketRepo.update(ticketId, {
        assignedToId: availableAgent.id,
        status: TicketStatus.IN_PROGRESS,
      });
    } else {
      await this.ticketRepo.update(ticketId, {
        status: TicketStatus.OPEN,
      });
    }

    return this.ticketRepo.findOne({ where: { id: ticketId } });
  }

  private async findAvailableAgent(roles: string[], priority: TicketPriority): Promise<UserEntity | null> {
    const agents = await this.userRepo.find({
      where: { role: 1 } as any,
      order: { createdAt: 'ASC' } as any,
    });

    return agents[0] || null;
  }

  async escalateTicket(ticketId: string, escalationLevel: number = 1): Promise<SupportTicketEntity> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const newLevel = (ticket.escalationLevel || 0) + 1;
    const escalatedTo = this.getEscalationTarget(newLevel);

    await this.ticketRepo.update(ticketId, {
      escalated: true,
      escalationLevel: newLevel,
      escalatedToId: escalatedTo,
      escalatedAt: new Date(),
      priority: this.getEscalatedPriority(ticket.priority, newLevel),
    } as any);

    return this.ticketRepo.findOne({ where: { id: ticketId } });
  }

  private getEscalationTarget(level: number): string {
    const targets = ['senior_agent', 'team_lead', 'manager', 'admin'];
    return targets[Math.min(level, targets.length) - 1];
  }

  private getEscalatedPriority(current: TicketPriority, level: number): TicketPriority {
    const priorityOrder = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.URGENT];
    const currentIndex = priorityOrder.indexOf(current);
    return priorityOrder[Math.min(currentIndex + level, priorityOrder.length - 1)];
  }

  async autoAssignBySLA(): Promise<void> {
    const unassignedTickets = await this.ticketRepo.find({
      where: { status: TicketStatus.OPEN } as any,
    });

    for (const ticket of unassignedTickets) {
      await this.routeTicket(ticket.id);
    }
  }

  async getQueueStats(): Promise<any> {
    const [
      openTickets,
      inProgress,
      awaitingCustomer,
      byPriority,
    ] = await Promise.all([
      this.ticketRepo.count({ where: { status: TicketStatus.OPEN } }),
      this.ticketRepo.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      this.ticketRepo.count({ where: { status: TicketStatus.AWAITING_CUSTOMER } }),
      this.getTicketsByPriority(),
    ]);

    return {
      open: openTickets,
      inProgress,
      awaitingCustomer,
      byPriority,
    };
  }

  private async getTicketsByPriority(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const priority of Object.values(TicketPriority)) {
      counts[priority] = await this.ticketRepo.count({ where: { priority } } as any);
    }
    return counts;
  }

  async getOverdueTickets(): Promise<SupportTicketEntity[]> {
    return this.ticketRepo.find({
      where: { status: TicketStatus.IN_PROGRESS } as any,
    });
  }
}