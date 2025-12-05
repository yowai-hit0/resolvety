'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/app/components/StatCard';
import AreaChart from '@/app/components/charts/AreaChart';
import DonutChart from '@/app/components/charts/DonutChart';
import { AdminAPI, TicketsAPI } from '@/lib/api';
import Icon, { faTicketAlt, faCheckCircle, faClock, faExclamationCircle } from '@/app/components/Icon';
import { StatCardSkeleton, ChartSkeleton, Skeleton } from '@/app/components/Skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    totalTickets: 0,
    newToday: 0,
  });
  const [chartData, setChartData] = useState({
    ticketsByDay: [] as any[],
    ticketsByStatus: [] as any[],
    ticketsByPriority: [] as any[],
    ticketsByAgent: [] as any[],
    ticketsByCategory: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardData, ticketStats, analyticsData] = await Promise.all([
          AdminAPI.dashboard().catch(() => null),
          TicketsAPI.stats().catch(() => null),
          AdminAPI.analytics().catch(() => null),
        ]);

        if (ticketStats) {
          const byStatus = ticketStats.by_status || [];
          const total = ticketStats.total || 0;
          const activeTickets = byStatus
            .filter((s: any) => ['New', 'Assigned', 'In_Progress', 'On_Hold', 'Reopened'].includes(s.status))
            .reduce((sum: number, s: any) => sum + (s._count || 0), 0);
          const resolvedTickets = byStatus
            .filter((s: any) => s.status === 'Resolved')
            .reduce((sum: number, s: any) => sum + (s._count || 0), 0);
          const closedTickets = byStatus
            .filter((s: any) => s.status === 'Closed')
            .reduce((sum: number, s: any) => sum + (s._count || 0), 0);

          // Use newToday from dashboard data if available, otherwise calculate
          const newToday = dashboardData?.new_tickets_today || (() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return dashboardData?.recent_tickets?.filter((t: any) => {
              const created = new Date(t.created_at);
              return created >= today;
            }).length || 0;
          })();

          setStats({
            activeTickets,
            resolvedTickets,
            closedTickets,
            totalTickets: total,
            newToday,
          });

          // Transform chart data
          setChartData({
            ticketsByDay: (dashboardData?.ticket_trends || analyticsData?.tickets_by_day || []).map((d: any) => ({
              date: d.date ? new Date(d.date).toISOString().split('T')[0] : d.date,
              count: d.count || 0,
            })),
            ticketsByStatus: byStatus.map((s: any) => ({
              name: s.status.replace('_', ' '),
              value: s._count || 0,
            })),
            ticketsByPriority: (dashboardData?.tickets_by_priority || ticketStats.by_priority || []).map((p: any) => ({
              name: p.priority_name || p.priority_id || 'Unknown',
              value: p._count || p.count || 0,
            })),
            ticketsByAgent: (dashboardData?.busiest_agents || []).map((a: any) => ({
              name: a.agent?.email?.split('@')[0] || `${a.agent?.first_name || ''} ${a.agent?.last_name || ''}`.trim() || 'Unknown',
              value: a.ticket_count || 0,
            })),
            ticketsByCategory: (dashboardData?.tickets_by_category || analyticsData?.tickets_by_category || []).map((c: any) => ({
              name: c.category_name || 'Unknown',
              value: c.count || 0,
            })),
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-8">
            <ChartSkeleton height={300} />
          </div>
          <div className="md:col-span-4">
            <ChartSkeleton height={300} />
          </div>
        </div>

        {/* Additional Charts Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ChartSkeleton key={i} height={300} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <span className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Tickets"
          value={stats.activeTickets}
          icon={faClock}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          href="/admin/tickets?status=active"
        />
        <StatCard
          label="Completed Tickets"
          value={stats.resolvedTickets + stats.closedTickets}
          icon={faCheckCircle}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          href="/admin/tickets?status=resolved"
        />
        <StatCard
          label="Total Tickets"
          value={stats.totalTickets}
          icon={faTicketAlt}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          href="/admin/tickets"
        />
        <StatCard
          label="New Today"
          value={stats.newToday}
          icon={faExclamationCircle}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          href="/admin/tickets?status=new"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-12">
        <div className="bg-white rounded-sm border border-gray-200 p-6 md:col-span-8">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets per Day (Last 30 Days)</h3>
          <AreaChart
            data={chartData.ticketsByDay}
            dataKey="date"
            series={[{ key: 'count', name: 'Tickets' }]}
            height={300}
          />
        </div>

        <div className="bg-white rounded-sm border border-gray-200 p-6 md:col-span-4">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
          <DonutChart
            data={chartData.ticketsByStatus}
            height={300}
          />
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
          <DonutChart
            data={chartData.ticketsByPriority}
            height={300}
            colors={chartData.ticketsByPriority.map((p: any) => {
              const name = p.name?.toLowerCase() || '';
              if (name.includes('critical')) return '#ef4444'; // Red
              if (name.includes('high')) return '#f59e0b'; // Orange/Amber
              if (name.includes('medium')) return '#3b82f6'; // Blue
              if (name.includes('low')) return '#10b981'; // Green
              return '#6b7280'; // Gray default
            })}
          />
        </div>

        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Agent</h3>
          <DonutChart
            data={chartData.ticketsByAgent}
            height={300}
          />
        </div>

        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Category</h3>
          <DonutChart
            data={chartData.ticketsByCategory}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}

