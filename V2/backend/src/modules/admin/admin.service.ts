import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      totalUsers,
      activeAgents,
      recentTickets,
      ticketTrends,
      busiestAgents,
      ticketsByPriority,
      ticketsByCategory,
    ] = await Promise.all([
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
      // Tickets per day (last 30 days)
      this.prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*)::int as count
        FROM tickets
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      // Busiest assignees (all users with assigned tickets - agents and admins)
      // Use raw query to get users who actually have tickets assigned
      this.prisma.$queryRaw`
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
      ` as Promise<Array<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        ticket_count: number;
      }>>,
      // Tickets by priority
      this.prisma.ticket.groupBy({
        by: ['priority_id'],
        _count: true,
      }),
      // Tickets by category
      this.prisma.ticketCategory.groupBy({
        by: ['category_id'],
        _count: true,
      }),
    ]);

    // Get priority names for tickets by priority
    const priorityIds = ticketsByPriority.map((p: any) => p.priority_id);
    const priorities = await this.prisma.ticketPriority.findMany({
      where: { id: { in: priorityIds } },
      select: { id: true, name: true },
    });
    const priorityMap = new Map(priorities.map((p: any) => [p.id, p.name]));

    // Get category names for tickets by category
    const categoryIds = ticketsByCategory.map((tc: any) => tc.category_id);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

    // Calculate new tickets today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await this.prisma.ticket.count({
      where: {
        created_at: { gte: today },
      },
    });

    // Map the raw query results to the expected format
    const sortedAgents = (busiestAgents as any[]).map((assignee: any) => ({
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
      tickets_by_priority: ticketsByPriority.map((p: any) => ({
        priority_id: p.priority_id,
        priority_name: priorityMap.get(p.priority_id) || 'Unknown',
        _count: p._count,
      })),
      tickets_by_category: ticketsByCategory.map((tc: any) => ({
        category_id: tc.category_id,
        category_name: categoryMap.get(tc.category_id) || 'Unknown',
        count: tc._count,
      })),
    };
  }

  async getAnalytics() {
    const [
      ticketsByStatus,
      ticketsByPriority,
      ticketsByMonth,
      ticketsByDay,
      usersByRole,
      ticketsByCategory,
    ] = await Promise.all([
      this.prisma.ticket.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.ticket.groupBy({
        by: ['priority_id'],
        _count: true,
      }),
      this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*)::int as count
        FROM tickets
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month
      `,
      // Tickets per day (last 30 days) for dashboard
      this.prisma.$queryRaw`
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
      // Tickets by category
      this.prisma.ticketCategory.groupBy({
        by: ['category_id'],
        _count: true,
      }),
    ]);

    // Get category names
    const categoryIds = ticketsByCategory.map((tc: any) => tc.category_id);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

    // Get priority names
    const priorityIds = ticketsByPriority.map((p: any) => p.priority_id);
    const priorities = await this.prisma.ticketPriority.findMany({
      where: { id: { in: priorityIds } },
      select: { id: true, name: true },
    });
    const priorityMap = new Map(priorities.map((p: any) => [p.id, p.name]));

    return {
      tickets_by_status: ticketsByStatus,
      tickets_by_priority: ticketsByPriority.map((p: any) => ({
        priority_id: p.priority_id,
        priority_name: priorityMap.get(p.priority_id) || 'Unknown',
        _count: p._count,
      })),
      tickets_by_month: ticketsByMonth,
      tickets_by_day: ticketsByDay,
      users_by_role: usersByRole,
      tickets_by_category: ticketsByCategory.map((tc: any) => ({
        category_id: tc.category_id,
        category_name: categoryMap.get(tc.category_id) || 'Unknown',
        count: tc._count,
      })),
    };
  }

  async getTicketAnalytics() {
    const [
      byStatus,
      byPriority,
      resolutionTime,
      avgResolutionDays,
    ] = await Promise.all([
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
      this.prisma.$queryRaw`
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

  async getStatusTrend(days: number = 30) {
    // Get status changes from ticket_events
    // Use template literal with direct interpolation (days is a controlled number)
    const statusEvents = await this.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        new_value as status,
        COUNT(*)::int as count
      FROM ticket_events
      WHERE change_type = 'status'
        AND created_at >= NOW() - INTERVAL '${days} days'
        AND new_value IS NOT NULL
      GROUP BY DATE(created_at), new_value
      ORDER BY date ASC, status ASC
    ` as Array<{ date: Date; status: string; count: number }>;

    // Also get initial ticket creation (New status)
    const newTickets = await this.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as count
      FROM tickets
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    ` as Array<{ date: Date; count: number }>;

    // Combine and format the data
    const dateMap = new Map<string, Record<string, number>>();

    // Add status changes from events
    statusEvents.forEach((event) => {
      // DATE() returns a string in format 'YYYY-MM-DD', handle both Date and string
      const dateKey = typeof event.date === 'string' 
        ? event.date 
        : new Date(event.date).toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {});
      }
      const status = event.status || 'Unknown';
      dateMap.get(dateKey)![status] = (dateMap.get(dateKey)![status] || 0) + event.count;
    });

    // Add new tickets (initial New status)
    newTickets.forEach((ticket) => {
      // DATE() returns a string in format 'YYYY-MM-DD', handle both Date and string
      const dateKey = typeof ticket.date === 'string' 
        ? ticket.date 
        : new Date(ticket.date).toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {});
      }
      dateMap.get(dateKey)!['New'] = (dateMap.get(dateKey)!['New'] || 0) + ticket.count;
    });

    // Convert to array format
    const result = Array.from(dateMap.entries())
      .map(([date, statuses]) => ({
        date,
        ...statuses,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  async getUserAnalytics() {
    const [
      byRole,
      activeUsers,
      recentUsers,
      userActivity,
    ] = await Promise.all([
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
}

