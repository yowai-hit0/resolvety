'use client';

import { useState, useMemo, useEffect } from 'react';
import { mockTickets, mockUsers, mockTags, mockChartData } from '@/lib/mockData';
import AreaChart from '@/app/components/charts/AreaChart';
import BarChart from '@/app/components/charts/BarChart';
import DonutChart from '@/app/components/charts/DonutChart';
import StatCard from '@/app/components/StatCard';
import Icon, { faChartLine, faUsers, faTicketAlt, faClock, faCheckCircle, faTimesCircle } from '@/app/components/Icon';
import { StatCardSkeleton, ChartSkeleton, Skeleton } from '@/app/components/Skeleton';

type TimePeriod = '7d' | '30d' | '90d' | 'all';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate date range based on time period
  const dateRange = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timePeriod) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate.setFullYear(2024, 0, 1);
        break;
    }
    
    return { startDate, endDate: now };
  }, [timePeriod]);

  // Filter tickets by date range
  const filteredTickets = useMemo(() => {
    return mockTickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_at);
      return ticketDate >= dateRange.startDate && ticketDate <= dateRange.endDate;
    });
  }, [dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTickets = filteredTickets.length;
    const resolvedTickets = filteredTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    const activeTickets = filteredTickets.filter(t => 
      ['New', 'Assigned', 'In_Progress', 'On_Hold', 'Reopened'].includes(t.status)
    ).length;
    const avgResponseTime = Math.floor(Math.random() * 24) + 1; // Mock: 1-24 hours
    const avgResolutionTime = Math.floor(Math.random() * 72) + 12; // Mock: 12-84 hours
    
    // Calculate tickets by status
    const byStatus = filteredTickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate tickets by agent
    const byAgent = filteredTickets.reduce((acc, ticket) => {
      if (ticket.assignee) {
        const agentName = `${ticket.assignee.first_name} ${ticket.assignee.last_name}`.trim() || ticket.assignee.email.split('@')[0];
        acc[agentName] = (acc[agentName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate tickets by category
    const byCategory = filteredTickets.reduce((acc, ticket) => {
      if (ticket.categories && Array.isArray(ticket.categories) && ticket.categories.length > 0) {
        ticket.categories.forEach(category => {
          acc[category.name] = (acc[category.name] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate tickets by priority
    const byPriority = filteredTickets.reduce((acc, ticket) => {
      if (ticket.priority) {
        acc[ticket.priority.name] = (acc[ticket.priority.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // User statistics
    const activeUsers = mockUsers.filter(u => u.is_active).length;
    const usersByRole = mockUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTickets,
      resolvedTickets,
      activeTickets,
      avgResponseTime,
      avgResolutionTime,
      byStatus,
      byAgent,
      byCategory,
      byPriority,
      activeUsers,
      totalUsers: mockUsers.length,
      usersByRole,
    };
  }, [filteredTickets]);

  // Prepare chart data
  const ticketsByDay = useMemo(() => {
    const days: Record<string, number> = {};
    const today = new Date();
    const daysToShow = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : timePeriod === '90d' ? 90 : 365;
    
    // Initialize all days with 0
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().split('T')[0];
      days[key] = 0;
    }
    
    // Count tickets per day
    filteredTickets.forEach(ticket => {
      const date = new Date(ticket.created_at).toISOString().split('T')[0];
      if (days[date] !== undefined) {
        days[date]++;
      }
    });
    
    return Object.entries(days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }));
  }, [filteredTickets, timePeriod]);

  const ticketsByAgentChart = useMemo(() => {
    return Object.entries(stats.byAgent)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, value: count }));
  }, [stats.byAgent]);

  const ticketsByCategoryChart = useMemo(() => {
    return Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [stats.byCategory]);

  const ticketsByStatusChart = useMemo(() => {
    return Object.entries(stats.byStatus).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));
  }, [stats.byStatus]);

  const ticketsByPriorityChart = useMemo(() => {
    return Object.entries(stats.byPriority).map(([name, value]) => ({
      name,
      value,
    }));
  }, [stats.byPriority]);

  const usersByRoleChart = useMemo(() => {
    return Object.entries(stats.usersByRole).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
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
                    <span className="font-medium text-gray-900">{count}</span>
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

