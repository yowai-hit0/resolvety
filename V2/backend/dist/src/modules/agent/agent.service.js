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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AgentService = class AgentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(userId) {
        const [assignedTickets, openTickets, resolvedToday, recentTickets,] = await Promise.all([
            this.prisma.ticket.count({
                where: { assignee_id: userId },
            }),
            this.prisma.ticket.count({
                where: {
                    assignee_id: userId,
                    status: { in: ['New', 'Assigned', 'In_Progress'] },
                },
            }),
            this.prisma.ticket.count({
                where: {
                    assignee_id: userId,
                    status: 'Resolved',
                    resolved_at: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
            this.prisma.ticket.findMany({
                where: { assignee_id: userId },
                take: 10,
                orderBy: { created_at: 'desc' },
                include: {
                    priority: true,
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
            }),
        ]);
        return {
            stats: {
                assigned_tickets: assignedTickets,
                open_tickets: openTickets,
                resolved_today: resolvedToday,
            },
            recent_tickets: recentTickets,
        };
    }
    async getTickets(userId, skip = 0, take = 10, status, priorityId, search, sortBy, sortOrder = 'desc') {
        const where = { assignee_id: userId };
        if (status) {
            where.status = status;
        }
        if (priorityId) {
            where.priority_id = priorityId;
        }
        if (search) {
            where.OR = [
                { ticket_code: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { requester_email: { contains: search, mode: 'insensitive' } },
                { requester_name: { contains: search, mode: 'insensitive' } },
            ];
        }
        let orderBy = { created_at: 'desc' };
        if (sortBy) {
            switch (sortBy) {
                case 'ticket_code':
                    orderBy = { ticket_code: sortOrder };
                    break;
                case 'subject':
                    orderBy = { subject: sortOrder };
                    break;
                case 'status':
                    orderBy = { status: sortOrder };
                    break;
                case 'priority':
                    orderBy = { priority: { name: sortOrder } };
                    break;
                case 'created_at':
                    orderBy = { created_at: sortOrder };
                    break;
                case 'updated_at':
                    orderBy = { updated_at: sortOrder };
                    break;
                default:
                    orderBy = { created_at: sortOrder };
            }
        }
        const [tickets, total] = await Promise.all([
            this.prisma.ticket.findMany({
                where,
                skip,
                take,
                include: {
                    priority: true,
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            attachments: true,
                        },
                    },
                },
                orderBy,
            }),
            this.prisma.ticket.count({ where }),
        ]);
        return { data: tickets, total, skip, take };
    }
    async updateTicketStatus(ticketId, status, userId) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
        });
        if (!ticket || ticket.assignee_id !== userId) {
            throw new Error('Ticket not found or not assigned to you');
        }
        const updateData = {
            status,
            updated_by_id: userId,
        };
        if (status === 'Resolved' && !ticket.resolved_at) {
            updateData.resolved_at = new Date();
        }
        if (status === 'Closed' && !ticket.closed_at) {
            updateData.closed_at = new Date();
        }
        return this.prisma.ticket.update({
            where: { id: ticketId },
            data: updateData,
            include: {
                priority: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }
    async updateTicketPriority(ticketId, priorityId, userId) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
        });
        if (!ticket || ticket.assignee_id !== userId) {
            throw new Error('Ticket not found or not assigned to you');
        }
        return this.prisma.ticket.update({
            where: { id: ticketId },
            data: {
                priority_id: priorityId,
                updated_by_id: userId,
            },
            include: {
                priority: true,
            },
        });
    }
    async getPerformance(userId) {
        const [totalAssigned, resolved, avgResolutionTime, recentActivity,] = await Promise.all([
            this.prisma.ticket.count({
                where: { assignee_id: userId },
            }),
            this.prisma.ticket.count({
                where: {
                    assignee_id: userId,
                    status: 'Resolved',
                },
            }),
            this.prisma.$queryRaw `
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400) as avg_days
        FROM tickets
        WHERE assignee_id = ${userId}::uuid AND resolved_at IS NOT NULL
      `,
            this.prisma.ticket.findMany({
                where: {
                    assignee_id: userId,
                    status: 'Resolved',
                },
                take: 10,
                orderBy: { resolved_at: 'desc' },
                select: {
                    id: true,
                    ticket_code: true,
                    subject: true,
                    created_at: true,
                    resolved_at: true,
                },
            }),
        ]);
        return {
            total_assigned: totalAssigned,
            resolved,
            resolution_rate: totalAssigned > 0 ? (resolved / totalAssigned) * 100 : 0,
            avg_resolution_days: avgResolutionTime,
            recent_activity: recentActivity,
        };
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AgentService);
//# sourceMappingURL=agent.service.js.map