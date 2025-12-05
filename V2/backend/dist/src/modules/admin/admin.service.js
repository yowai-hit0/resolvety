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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard() {
        const [totalTickets, openTickets, resolvedTickets, totalUsers, activeAgents, recentTickets, ticketTrends, busiestAgents, ticketsByPriority, ticketsByCategory,] = await Promise.all([
            this.prisma.ticket.count(),
            this.prisma.ticket.count({ where: { status: { in: ['New', 'Assigned', 'In_Progress'] } } }),
            this.prisma.ticket.count({ where: { status: 'Resolved' } }),
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'agent', is_active: true } }),
            this.prisma.ticket.findMany({
                take: 10,
                orderBy: { created_at: 'desc' },
                include: {
                    created_by: {
                        select: {
                            id: true,
                            email: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                    priority: true,
                },
            }),
            this.prisma.$queryRaw `
        SELECT 
          DATE(created_at) as date,
          COUNT(*)::int as count
        FROM tickets
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
            this.prisma.$queryRaw `
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.role,
          COUNT(t.id)::int as ticket_count
        FROM users u
        INNER JOIN tickets t ON t.assignee_id = u.id
        WHERE u.is_active = true
        GROUP BY u.id, u.email, u.first_name, u.last_name, u.role
        ORDER BY ticket_count DESC
        LIMIT 10
      `,
            this.prisma.ticket.groupBy({
                by: ['priority_id'],
                _count: true,
            }),
            this.prisma.ticketCategory.groupBy({
                by: ['category_id'],
                _count: true,
            }),
        ]);
        const priorityIds = ticketsByPriority.map((p) => p.priority_id);
        const priorities = await this.prisma.ticketPriority.findMany({
            where: { id: { in: priorityIds } },
            select: { id: true, name: true },
        });
        const priorityMap = new Map(priorities.map((p) => [p.id, p.name]));
        const categoryIds = ticketsByCategory.map((tc) => tc.category_id);
        const categories = await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
        });
        const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newToday = await this.prisma.ticket.count({
            where: {
                created_at: { gte: today },
            },
        });
        const sortedAgents = busiestAgents.map((assignee) => ({
            agent: {
                id: assignee.id,
                email: assignee.email,
                first_name: assignee.first_name,
                last_name: assignee.last_name,
            },
            ticket_count: assignee.ticket_count,
        }));
        return {
            stats: {
                total_tickets: totalTickets,
                open_tickets: openTickets,
                resolved_tickets: resolvedTickets,
                total_users: totalUsers,
                active_agents: activeAgents,
            },
            recent_tickets: recentTickets,
            new_tickets_today: newToday,
            ticket_trends: ticketTrends,
            busiest_agents: sortedAgents,
            tickets_by_priority: ticketsByPriority.map((p) => ({
                priority_id: p.priority_id,
                priority_name: priorityMap.get(p.priority_id) || 'Unknown',
                _count: p._count,
            })),
            tickets_by_category: ticketsByCategory.map((tc) => ({
                category_id: tc.category_id,
                category_name: categoryMap.get(tc.category_id) || 'Unknown',
                count: tc._count,
            })),
        };
    }
    async getAnalytics() {
        const [ticketsByStatus, ticketsByPriority, ticketsByMonth, ticketsByDay, usersByRole, ticketsByCategory,] = await Promise.all([
            this.prisma.ticket.groupBy({
                by: ['status'],
                _count: true,
            }),
            this.prisma.ticket.groupBy({
                by: ['priority_id'],
                _count: true,
            }),
            this.prisma.$queryRaw `
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*)::int as count
        FROM tickets
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month
      `,
            this.prisma.$queryRaw `
        SELECT 
          DATE(created_at) as date,
          COUNT(*)::int as count
        FROM tickets
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
            this.prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            this.prisma.ticketCategory.groupBy({
                by: ['category_id'],
                _count: true,
            }),
        ]);
        const categoryIds = ticketsByCategory.map((tc) => tc.category_id);
        const categories = await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
        });
        const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
        const priorityIds = ticketsByPriority.map((p) => p.priority_id);
        const priorities = await this.prisma.ticketPriority.findMany({
            where: { id: { in: priorityIds } },
            select: { id: true, name: true },
        });
        const priorityMap = new Map(priorities.map((p) => [p.id, p.name]));
        return {
            tickets_by_status: ticketsByStatus,
            tickets_by_priority: ticketsByPriority.map((p) => ({
                priority_id: p.priority_id,
                priority_name: priorityMap.get(p.priority_id) || 'Unknown',
                _count: p._count,
            })),
            tickets_by_month: ticketsByMonth,
            tickets_by_day: ticketsByDay,
            users_by_role: usersByRole,
            tickets_by_category: ticketsByCategory.map((tc) => ({
                category_id: tc.category_id,
                category_name: categoryMap.get(tc.category_id) || 'Unknown',
                count: tc._count,
            })),
        };
    }
    async getTicketAnalytics() {
        const [byStatus, byPriority, resolutionTime, avgResolutionDays,] = await Promise.all([
            this.prisma.ticket.groupBy({
                by: ['status'],
                _count: true,
            }),
            this.prisma.ticket.groupBy({
                by: ['priority_id'],
                _count: true,
            }),
            this.prisma.ticket.findMany({
                where: {
                    resolved_at: { not: null },
                },
                select: {
                    created_at: true,
                    resolved_at: true,
                },
            }),
            this.prisma.$queryRaw `
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400) as avg_days
        FROM tickets
        WHERE resolved_at IS NOT NULL
      `,
        ]);
        return {
            by_status: byStatus,
            by_priority: byPriority,
            resolution_time: resolutionTime,
            avg_resolution_days: avgResolutionDays,
        };
    }
    async getUserAnalytics() {
        const [byRole, activeUsers, recentUsers, userActivity,] = await Promise.all([
            this.prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            this.prisma.user.count({ where: { is_active: true } }),
            this.prisma.user.findMany({
                take: 10,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    role: true,
                    created_at: true,
                },
            }),
            this.prisma.user.findMany({
                where: {
                    last_login_at: { not: null },
                },
                orderBy: { last_login_at: 'desc' },
                take: 10,
                select: {
                    id: true,
                    email: true,
                    last_login_at: true,
                },
            }),
        ]);
        return {
            by_role: byRole,
            active_users: activeUsers,
            recent_users: recentUsers,
            user_activity: userActivity,
        };
    }
    async getAgentPerformance() {
        const agents = await this.prisma.user.findMany({
            where: { role: 'agent', is_active: true },
            include: {
                _count: {
                    select: {
                        tickets_assigned: true,
                        comments: true,
                    },
                },
                tickets_assigned: {
                    where: {
                        status: 'Resolved',
                    },
                    select: {
                        created_at: true,
                        resolved_at: true,
                    },
                },
            },
        });
        return agents.map(agent => ({
            id: agent.id,
            email: agent.email,
            first_name: agent.first_name,
            last_name: agent.last_name,
            tickets_assigned: agent._count.tickets_assigned,
            tickets_resolved: agent.tickets_assigned.length,
            comments_count: agent._count.comments,
        }));
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map