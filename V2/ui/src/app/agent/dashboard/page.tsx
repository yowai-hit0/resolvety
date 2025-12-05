'use client';

import { useState, useEffect } from 'react';
import { AgentAPI, TicketsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import StatCard from '@/app/components/StatCard';
import AreaChart from '@/app/components/charts/AreaChart';
import DonutChart from '@/app/components/charts/DonutChart';
import BarChart from '@/app/components/charts/BarChart';
import Icon, { faTicketAlt, faCheckCircle, faClock, faChartLine } from '@/app/components/Icon';
import { StatCardSkeleton, ChartSkeleton, Skeleton } from '@/app/components/Skeleton';

export default function AgentDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    currentlyOpen: 0,
    recentlyResolved: 0,
    completionRate: 0,
    inProgress: 0,
    onHold: 0,
  });
  const [chartData, setChartData] = useState({
    ticketsByDay: [] as any[],
    performanceData: [] as any[],
    ticketsByStatus: [] as any[],
    ticketsByPriority: [] as any[],
  });

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user || user.role !== 'agent') {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch dashboard data
        const dashboardData = await AgentAPI.dashboard();
        
        // Calculate stats
        const totalAssigned = dashboardData.stats?.assigned_tickets || 0;
        const currentlyOpen = dashboardData.stats?.open_tickets || 0;
        const resolvedToday = dashboardData.stats?.resolved_today || 0;
        
        // Fetch additional data for charts
        const [ticketStats, allTickets] = await Promise.all([
          TicketsAPI.stats().catch(() => null),
          TicketsAPI.list({ assignee: user.id, take: 1000 }).catch(() => ({ data: [], total: 0 })),
        ]);

        // Calculate completion rate
        const completionRate = totalAssigned > 0 
          ? parseFloat(((totalAssigned - currentlyOpen) / totalAssigned * 100).toFixed(1))
          : 0;

        // Calculate in progress and on hold
        const inProgress = allTickets.data?.filter((t: any) => t.status === 'In_Progress').length || 0;
        const onHold = allTickets.data?.filter((t: any) => t.status === 'On_Hold').length || 0;

        // Get resolved in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentlyResolved = allTickets.data?.filter((t: any) => 
          (t.status === 'Resolved' || t.status === 'Closed') &&
          t.resolved_at &&
          new Date(t.resolved_at) >= thirtyDaysAgo
        ).length || 0;

        setStats({
          totalAssigned,
          currentlyOpen,
          recentlyResolved,
          completionRate,
          inProgress,
          onHold,
        });

        // Tickets per day (last 30 days)
        const ticketsByDay: Record<string, number> = {};
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const key = date.toISOString().split('T')[0];
          ticketsByDay[key] = 0;
        }
        
        allTickets.data?.forEach((ticket: any) => {
          const date = new Date(ticket.created_at).toISOString().split('T')[0];
          if (ticketsByDay[date] !== undefined) {
            ticketsByDay[date]++;
          }
        });

        setChartData({
          ticketsByDay: Object.entries(ticketsByDay).map(([date, count]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count,
          })),
          performanceData: (() => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentTickets = allTickets.data?.filter((t: any) => 
              new Date(t.created_at) >= thirtyDaysAgo
            ) || [];
            const byStatus = recentTickets.reduce((acc: any, ticket: any) => {
              const status = ticket.status.replace('_', ' ');
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {});
            return Object.entries(byStatus).map(([name, value]) => ({ name, value }));
          })(),
          ticketsByStatus: (() => {
            const byStatus = (allTickets.data || []).reduce((acc: any, ticket: any) => {
              const status = ticket.status.replace('_', ' ');
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {});
            return Object.entries(byStatus).map(([name, value]) => ({ name, value }));
          })(),
          ticketsByPriority: (() => {
            const byPriority = (allTickets.data || []).reduce((acc: any, ticket: any) => {
              if (ticket.priority?.name) {
                acc[ticket.priority.name] = (acc[ticket.priority.name] || 0) + 1;
              }
              return acc;
            }, {});
            return Object.entries(byPriority).map(([name, value]) => ({ name, value }));
          })(),
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <ChartSkeleton key={i} height={300} />
          ))}
        </div>

        {/* Additional Charts Skeleton */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <ChartSkeleton key={i} height={300} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.first_name} {user?.last_name}</p>
        </div>
        <span className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Assigned Tickets"
          value={stats.totalAssigned}
          icon={faTicketAlt}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          href="/agent/tickets"
        />
        <StatCard
          label="Open Now"
          value={stats.currentlyOpen}
          icon={faClock}
          iconColor="#f59e0b"
          iconBgColor="#fef3c7"
          href="/agent/tickets?status=open"
        />
        <StatCard
          label="Resolved (30d)"
          value={stats.recentlyResolved}
          icon={faCheckCircle}
          iconColor="#10b981"
          iconBgColor="#d1fae5"
        />
        <StatCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={faChartLine}
          iconColor="#8b5cf6"
          iconBgColor="#ede9fe"
          subtitle={`${stats.totalAssigned - stats.currentlyOpen} of ${stats.totalAssigned} completed`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Tickets per Day */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets per Day (Last 30 Days)</h3>
          {chartData.ticketsByDay.length > 0 ? (
            <AreaChart
              data={chartData.ticketsByDay}
              dataKey="date"
              series={[{ key: 'count', name: 'Tickets', color: '#0f36a5' }]}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <p className="text-sm">No tickets in the last 30 days</p>
            </div>
          )}
        </div>

        {/* Performance by Status */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Performance (Last 30 Days)</h3>
          {chartData.performanceData.length > 0 ? (
            <DonutChart
              data={chartData.performanceData}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <p className="text-sm">No performance data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Tickets by Status */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
          {chartData.ticketsByStatus.length > 0 ? (
            <DonutChart
              data={chartData.ticketsByStatus}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <p className="text-sm">No tickets assigned</p>
            </div>
          )}
        </div>

        {/* Tickets by Priority */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
          {chartData.ticketsByPriority.length > 0 ? (
            <BarChart
              data={chartData.ticketsByPriority}
              dataKey="name"
              bars={[{ key: 'value', name: 'Tickets', color: '#0f36a5' }]}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <p className="text-sm">No tickets assigned</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
