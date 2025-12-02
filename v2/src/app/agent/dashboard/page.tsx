'use client';

import { useState, useEffect, useMemo } from 'react';
import { mockTickets, mockUsers } from '@/lib/mockData';
import StatCard from '@/app/components/StatCard';
import AreaChart from '@/app/components/charts/AreaChart';
import DonutChart from '@/app/components/charts/DonutChart';
import BarChart from '@/app/components/charts/BarChart';
import Icon, { faTicketAlt, faCheckCircle, faClock, faChartLine } from '@/app/components/Icon';
import { StatCardSkeleton, ChartSkeleton, Skeleton } from '@/app/components/Skeleton';

export default function AgentDashboard() {
  const [currentAgent, setCurrentAgent] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current agent from session storage (mock)
    try {
      const authRaw = sessionStorage.getItem('resolveitAuth');
      if (authRaw) {
        const auth = JSON.parse(authRaw) as { id?: number; name?: string; email?: string; role?: string } | null;
        if (auth?.role === 'agent' && auth?.id) {
          setCurrentAgent({ id: auth.id, name: auth.name || 'Agent' });
          setLoading(false);
          return;
        }
      }
      // Default to first agent for demo
      const firstAgent = mockUsers.find(u => u.role === 'agent');
      if (firstAgent) {
        setCurrentAgent({ id: firstAgent.id, name: `${firstAgent.first_name} ${firstAgent.last_name}`.trim() || firstAgent.email });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading agent info', error);
      const firstAgent = mockUsers.find(u => u.role === 'agent');
      if (firstAgent) {
        setCurrentAgent({ id: firstAgent.id, name: `${firstAgent.first_name} ${firstAgent.last_name}`.trim() || firstAgent.email });
      }
      setLoading(false);
    }
  }, []);

  // Calculate agent-specific statistics
  const stats = useMemo(() => {
    if (!currentAgent) {
      return {
        totalAssigned: 0,
        currentlyOpen: 0,
        recentlyResolved: 0,
        completionRate: 0,
        inProgress: 0,
        onHold: 0,
      };
    }

    const assignedTickets = mockTickets.filter(t => t.assignee_id === currentAgent.id);
    const openTickets = assignedTickets.filter(t => 
      ['New', 'Assigned', 'In_Progress', 'On_Hold', 'Reopened'].includes(t.status)
    );
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyResolved = assignedTickets.filter(t => 
      (t.status === 'Resolved' || t.status === 'Closed') &&
      t.resolved_at &&
      new Date(t.resolved_at) >= thirtyDaysAgo
    );

    const totalAssigned = assignedTickets.length;
    const currentlyOpen = openTickets.length;
    const resolvedCount = recentlyResolved.length;
    const completionRate = totalAssigned > 0 
      ? ((totalAssigned - currentlyOpen) / totalAssigned * 100).toFixed(1)
      : '0';

    const inProgress = assignedTickets.filter(t => t.status === 'In_Progress').length;
    const onHold = assignedTickets.filter(t => t.status === 'On_Hold').length;

    return {
      totalAssigned,
      currentlyOpen,
      recentlyResolved: resolvedCount,
      completionRate: parseFloat(completionRate),
      inProgress,
      onHold,
    };
  }, [currentAgent]);

  // Performance data (last 30 days)
  const performanceData = useMemo(() => {
    if (!currentAgent) return [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const assignedTickets = mockTickets.filter(t => 
      t.assignee_id === currentAgent.id &&
      new Date(t.created_at) >= thirtyDaysAgo
    );

    const byStatus = assignedTickets.reduce((acc, ticket) => {
      const status = ticket.status.replace('_', ' ');
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  }, [currentAgent]);

  // Tickets per day (last 30 days)
  const ticketsByDay = useMemo(() => {
    if (!currentAgent) return [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const assignedTickets = mockTickets.filter(t => 
      t.assignee_id === currentAgent.id &&
      new Date(t.created_at) >= thirtyDaysAgo
    );

    const days: Record<string, number> = {};
    const today = new Date();
    
    // Initialize all days with 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().split('T')[0];
      days[key] = 0;
    }
    
    // Count tickets per day
    assignedTickets.forEach(ticket => {
      const date = new Date(ticket.created_at).toISOString().split('T')[0];
      if (days[date] !== undefined) {
        days[date]++;
      }
    });
    
    return Object.entries(days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }));
  }, [currentAgent]);

  // Tickets by priority
  const ticketsByPriority = useMemo(() => {
    if (!currentAgent) return [];

    const assignedTickets = mockTickets.filter(t => t.assignee_id === currentAgent.id);
    
    const byPriority = assignedTickets.reduce((acc, ticket) => {
      if (ticket.priority) {
        acc[ticket.priority.name] = (acc[ticket.priority.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byPriority).map(([name, value]) => ({ name, value }));
  }, [currentAgent]);

  // Tickets by status
  const ticketsByStatus = useMemo(() => {
    if (!currentAgent) return [];

    const assignedTickets = mockTickets.filter(t => t.assignee_id === currentAgent.id);
    
    const byStatus = assignedTickets.reduce((acc, ticket) => {
      const status = ticket.status.replace('_', ' ');
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  }, [currentAgent]);

  if (loading || !currentAgent) {
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
          <p className="text-sm text-gray-600 mt-1">Welcome back, {currentAgent.name}</p>
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
          {ticketsByDay.length > 0 ? (
            <AreaChart
              data={ticketsByDay}
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
          {performanceData.length > 0 ? (
            <DonutChart
              data={performanceData}
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
          {ticketsByStatus.length > 0 ? (
            <DonutChart
              data={ticketsByStatus}
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
          {ticketsByPriority.length > 0 ? (
            <BarChart
              data={ticketsByPriority}
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
