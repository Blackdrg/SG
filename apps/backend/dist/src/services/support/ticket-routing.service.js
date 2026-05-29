"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TicketRoutingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRoutingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const support_ticket_entity_1 = require("../../db/entities/support-ticket.entity");
const user_entity_1 = require("../../db/entities/user.entity");
let TicketRoutingService = TicketRoutingService_1 = class TicketRoutingService {
    constructor(ticketRepo, userRepo, dataSource) {
        this.ticketRepo = ticketRepo;
        this.userRepo = userRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(TicketRoutingService_1.name);
        this.categoryRules = new Map([
            [support_ticket_entity_1.TicketCategory.ORDER, ['support_agent', 'admin']],
            [support_ticket_entity_1.TicketCategory.PAYMENT, ['finance_agent', 'admin']],
            [support_ticket_entity_1.TicketCategory.DELIVERY, ['delivery_coordinator', 'admin']],
            [support_ticket_entity_1.TicketCategory.QUALITY, ['quality_agent', 'admin']],
            [support_ticket_entity_1.TicketCategory.ACCOUNT, ['support_agent', 'admin']],
            [support_ticket_entity_1.TicketCategory.TECHNICAL, ['tech_support', 'admin']],
        ]);
        this.prioritySLA = new Map([
            [support_ticket_entity_1.TicketPriority.LOW, 48],
            [support_ticket_entity_1.TicketPriority.MEDIUM, 24],
            [support_ticket_entity_1.TicketPriority.HIGH, 4],
            [support_ticket_entity_1.TicketPriority.URGENT, 1],
        ]);
    }
    async routeTicket(ticketId) {
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
                status: support_ticket_entity_1.TicketStatus.IN_PROGRESS,
            });
        }
        else {
            await this.ticketRepo.update(ticketId, {
                status: support_ticket_entity_1.TicketStatus.OPEN,
            });
        }
        return this.ticketRepo.findOne({ where: { id: ticketId } });
    }
    async findAvailableAgent(roles, priority) {
        const agents = await this.userRepo.find({
            where: { role: 1 },
            order: { createdAt: 'ASC' },
        });
        return agents[0] || null;
    }
    async escalateTicket(ticketId, escalationLevel = 1) {
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
        });
        return this.ticketRepo.findOne({ where: { id: ticketId } });
    }
    getEscalationTarget(level) {
        const targets = ['senior_agent', 'team_lead', 'manager', 'admin'];
        return targets[Math.min(level, targets.length) - 1];
    }
    getEscalatedPriority(current, level) {
        const priorityOrder = [support_ticket_entity_1.TicketPriority.LOW, support_ticket_entity_1.TicketPriority.MEDIUM, support_ticket_entity_1.TicketPriority.HIGH, support_ticket_entity_1.TicketPriority.URGENT];
        const currentIndex = priorityOrder.indexOf(current);
        return priorityOrder[Math.min(currentIndex + level, priorityOrder.length - 1)];
    }
    async autoAssignBySLA() {
        const unassignedTickets = await this.ticketRepo.find({
            where: { status: support_ticket_entity_1.TicketStatus.OPEN },
        });
        for (const ticket of unassignedTickets) {
            await this.routeTicket(ticket.id);
        }
    }
    async getQueueStats() {
        const [openTickets, inProgress, awaitingCustomer, byPriority,] = await Promise.all([
            this.ticketRepo.count({ where: { status: support_ticket_entity_1.TicketStatus.OPEN } }),
            this.ticketRepo.count({ where: { status: support_ticket_entity_1.TicketStatus.IN_PROGRESS } }),
            this.ticketRepo.count({ where: { status: support_ticket_entity_1.TicketStatus.AWAITING_CUSTOMER } }),
            this.getTicketsByPriority(),
        ]);
        return {
            open: openTickets,
            inProgress,
            awaitingCustomer,
            byPriority,
        };
    }
    async getTicketsByPriority() {
        const counts = {};
        for (const priority of Object.values(support_ticket_entity_1.TicketPriority)) {
            counts[priority] = await this.ticketRepo.count({ where: { priority } });
        }
        return counts;
    }
    async getOverdueTickets() {
        return this.ticketRepo.find({
            where: { status: support_ticket_entity_1.TicketStatus.IN_PROGRESS },
        });
    }
};
exports.TicketRoutingService = TicketRoutingService;
exports.TicketRoutingService = TicketRoutingService = TicketRoutingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(support_ticket_entity_1.SupportTicketEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], TicketRoutingService);
//# sourceMappingURL=ticket-routing.service.js.map