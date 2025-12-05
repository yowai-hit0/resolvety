'use client';

import { useState, useMemo, useEffect } from 'react';
import AreaChart from '@/app/components/charts/AreaChart';
import BarChart from '@/app/components/charts/BarChart';
import DonutChart from '@/app/components/charts/DonutChart';
import StatCard from '@/app/components/StatCard';
import Icon, { faChartLine, faUsers, faTicketAlt, faClock, faCheckCircle, faTimesCircle } from '@/app/components/Icon';
import { StatCardSkeleton, ChartSkeleton, Skeleton } from '@/app/components/Skeleton';
import { AdminAPI, TicketsAPI } from '@/lib/api';

type TimePeriod = '7d' | '30d' | '90d' | 'all';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [ticketStats, setTicketStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analytics, stats] = await Promise.all([
          AdminAPI.analytics(),
          TicketsAPI.stats(),
        ]);
        setAnalyticsData(analytics);
        setTicketStats(stats);
      } catch (error: any) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics from API data
  const stats = useMemo(() => {
    if (!analyticsData || !ticketStats) {
      return {
        totalTickets: 0,
        resolvedTickets: 0,
        activeTickets: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
        byStatus: {} as Record<string, number>,
        byAgent: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        activeUsers: 0,
        totalUsers: 0,
        usersByRole: {} as Record<string, number>,
      };
    }

    const byStatus = analyticsData.tickets_by_status?.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count || 0;
      return acc;
    }, {} as Record<string, number>) || {};

    const byPriority = analyticsData.tickets_by_priority?.reduce((acc: Record<string, number>, item: any) => {
      acc[item.priority_name] = item._count || 0;
      return acc;
    }, {} as Record<string, number>) || {};

    const byCategory = analyticsData.tickets_by_category?.reduce((acc: Record<string, number>, item: any) => {
      acc[item.category_name] = item.count || 0;
      return acc;
    }, {} as Record<string, number>) || {};

    const usersByRole = analyticsData.users_by_role?.reduce((acc: Record<string, number>, item: any) => {
      acc[item.role] = item._count || 0;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalTickets = ticketStats.total || 0;
    const resolvedTickets = (byStatus['Resolved'] || 0) + (byStatus['Closed'] || 0);
    const activeTickets = (byStatus['New'] || 0) + (byStatus['Assigned'] || 0) + 
                         (byStatus['In_Progress'] || 0) + (byStatus['On_Hold'] || 0) + 
                         (byStatus['Reopened'] || 0);
    
    const totalUsers = Object.values(usersByRole).reduce((sum: number, count: any) => sum + count, 0);
    const activeUsers = ticketStats.active_users || 0;

    // Calculate avg resolution time from ticket stats if available
    const avgResolutionTime = ticketStats.avg_resolution_time || 0;

    return {
      totalTickets,
      resolvedTickets,
      activeTickets,
      avgResponseTime: 0, // Not available from backend yet
      avgResolutionTime,
      byStatus,
      byAgent: {}, // Will be populated from dashboard data if needed
      byCategory,
      byPriority,
      activeUsers,
      totalUsers,
      usersByRole,
    };
  }, [analyticsData, ticketStats]);

  // Prepare chart data
  const ticketsByDay = useMemo(() => {
    if (!analyticsData?.tickets_by_day) {
      return [];
    }

    // Backend returns tickets_by_day as array of { date, count }
    return analyticsData.tickets_by_day.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: item.count || 0,
    }));
  }, [analyticsData]);

  const ticketsByAgentChart = useMemo(() => {
    // Get from dashboard data if available, otherwise empty
    // This would need to be fetched separately or from dashboard endpoint
    return [];
  }, []);

  const ticketsByCategoryChart = useMemo(() => {
    return Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 8)
      .map(([name, value]) => ({ name, value: value as number }));
  }, [stats.byCategory]);

  const ticketsByStatusChart = useMemo(() => {
    return Object.entries(stats.byStatus).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value: value as number,
    }));
  }, [stats.byStatus]);

  const ticketsByPriorityChart = useMemo(() => {
    return Object.entries(stats.byPriority).map(([name, value]) => ({
      name,
      value: value as number,
    }));
  }, [stats.byPriority]);

  const usersByRoleChart = useMemo(() => {
    return Object.entries(stats.usersByRole).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value: value as number,
    }));
  }, [stats.usersByRole]);

  const resolutionRate = stats.totalTickets > 0 
    ? ((stats.resolvedTickets / stats.totalTickets) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartSkeleton key={i} height={300} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Detailed insights and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Tickets"
          value={stats.totalTickets}
          icon={faTicketAlt}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
        />
        <StatCard
          label="Resolved Tickets"
          value={stats.resolvedTickets}
          icon={faCheckCircle}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          subtitle={`${resolutionRate}% resolution rate`}
        />
        <StatCard
          label="Active Tickets"
          value={stats.activeTickets}
          icon={faChartLine}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
        />
        <StatCard
          label="Avg Resolution Time"
          value={`${stats.avgResolutionTime}h`}
          icon={faClock}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Tickets per Day */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets per Day</h3>
          <AreaChart
            data={ticketsByDay}
            dataKey="date"
            series={[{ key: 'count', name: 'Tickets', color: '#0f36a5' }]}
            height={300}
          />
        </div>

        {/* Tickets by Status */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
          <DonutChart
            data={ticketsByStatusChart}
            height={300}
          />
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Tickets by Agent */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Agents</h3>
          <BarChart
            data={ticketsByAgentChart}
            dataKey="name"
            bars={[{ key: 'value', name: 'Tickets', color: '#0f36a5' }]}
            height={250}
          />
        </div>

        {/* Tickets by Priority */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
          <DonutChart
            data={ticketsByPriorityChart}
            height={250}
          />
        </div>

        {/* Common Tags */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Common Categories</h3>
          <DonutChart
            data={ticketsByCategoryChart}
            height={250}
          />
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Users by Role */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Users by Role</h3>
          <DonutChart
            data={usersByRoleChart}
            height={300}
          />
        </div>

        {/* User Stats */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">User Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
              <div className="flex items-center gap-2">
                <Icon icon={faUsers} className="text-primary-500" size="sm" />
                <span className="text-sm font-medium text-gray-700">Total Users</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
              <div className="flex items-center gap-2">
                <Icon icon={faCheckCircle} className="text-green-500" size="sm" />
                <span className="text-sm font-medium text-gray-700">Active Users</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
              <div className="flex items-center gap-2">
                <Icon icon={faTimesCircle} className="text-red-500" size="sm" />
                <span className="text-sm font-medium text-gray-700">Inactive Users</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.totalUsers - stats.activeUsers}</span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-2">
                {Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{role.replace('_', ' ')}</span>
                    <span className="font-medium text-gray-900">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

