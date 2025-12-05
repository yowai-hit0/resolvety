'use client';

import { useState, useMemo, useEffect } from 'react';
import AreaChart from '@/app/components/charts/AreaChart';
import BarChart from '@/app/components/charts/BarChart';
import DonutChart from '@/app/components/charts/DonutChart';
import LineChart from '@/app/components/charts/LineChart';
import StatCard from '@/app/components/StatCard';
import Icon, { 
  faChartLine, 
  faTicketAlt, 
  faClock, 
  faCheckCircle, 
  faExclamationCircle,
  faUsers,
  faTag,
  faArrowUp,
  faArrowDown,
} from '@/app/components/Icon';
import { StatCardSkeleton, ChartSkeleton, Skeleton } from '@/app/components/Skeleton';
import { AdminAPI, TicketsAPI } from '@/lib/api';

type TimePeriod = '7d' | '30d' | '90d' | 'all';

export default function TicketAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [ticketAnalytics, setTicketAnalytics] = useState<any>(null);
  const [ticketStats, setTicketStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analytics, stats] = await Promise.all([
          AdminAPI.ticketAnalytics(),
          TicketsAPI.stats(),
        ]);
        setTicketAnalytics(analytics);
        setTicketStats(stats);
      } catch (error: any) {
        console.error('Failed to fetch ticket analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics from API data
  const stats = useMemo(() => {
    if (!ticketAnalytics || !ticketStats) {
      return {
        totalTickets: 0,
        resolvedTickets: 0,
        activeTickets: 0,
        newTickets: 0,
        inProgressTickets: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
        resolutionRate: 0,
        ticketsPerDay: 0,
        growth: 0,
      };
    }

    const byStatus = ticketAnalytics.by_status?.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count || 0;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalTickets = ticketStats.total || 0;
    const resolvedTickets = (byStatus['Resolved'] || 0) + (byStatus['Closed'] || 0);
    const activeTickets = (byStatus['New'] || 0) + (byStatus['Assigned'] || 0) + 
                         (byStatus['In_Progress'] || 0) + (byStatus['On_Hold'] || 0) + 
                         (byStatus['Reopened'] || 0);
    const newTickets = byStatus['New'] || 0;
    const inProgressTickets = byStatus['In_Progress'] || 0;
    
    const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
    const avgResolutionDays = ticketAnalytics.avg_resolution_days?.[0]?.avg_days || 0;
    const avgResolutionTime = Math.round(avgResolutionDays * 24); // Convert days to hours

    return {
      totalTickets,
      resolvedTickets,
      activeTickets,
      newTickets,
      inProgressTickets,
      avgResponseTime: 0, // Not available from backend yet
      avgResolutionTime,
      resolutionRate,
      ticketsPerDay: 0, // Can be calculated if needed
      growth: 0, // Can be calculated if needed
    };
  }, [ticketAnalytics, ticketStats]);

  // Tickets by Day (for area chart) - Use from general analytics if available
  const ticketsByDay = useMemo(() => {
    // This would need to be fetched from AdminAPI.analytics() or calculated from ticket list
    return [];
  }, []);

  // Tickets by Status
  const ticketsByStatus = useMemo(() => {
    if (!ticketAnalytics?.by_status) return [];
    
    return ticketAnalytics.by_status.map((item: any) => ({
      name: item.status.replace('_', ' '),
      value: item._count || 0,
    }));
  }, [ticketAnalytics]);

  // Tickets by Agent - Would need to fetch from dashboard or separate endpoint
  const ticketsByAgent = useMemo(() => {
    return [];
  }, []);

  // Tickets by Priority
  const ticketsByPriority = useMemo(() => {
    if (!ticketAnalytics?.by_priority) return [];
    
    // Backend returns by_priority with priority_id, need to get names from stats
    const priorityMap = ticketStats?.by_priority?.reduce((acc: Record<string, string>, item: any) => {
      acc[item.priority_id] = item.priority_name || 'Unknown';
      return acc;
    }, {} as Record<string, string>) || {};
    
    return ticketAnalytics.by_priority.map((item: any) => ({
      name: priorityMap[item.priority_id] || 'Unknown',
      value: item._count || 0,
    }));
  }, [ticketAnalytics, ticketStats]);

  // Tickets by Category - Would need to fetch from general analytics
  const ticketsByCategory = useMemo(() => {
    return [];
  }, []);

  // Status Trend - Would need to calculate from ticket list or separate endpoint
  const statusTrend = useMemo(() => {
    return [];
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">Ticket Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Detailed insights and metrics for ticket management
          </p>
        </div>
        
        {/* Time Period Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Time Period:</label>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Tickets"
          value={stats.totalTickets}
          icon={faTicketAlt}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          subtitle={`${stats.ticketsPerDay} per day avg`}
        />
        <StatCard
          label="Resolved Tickets"
          value={stats.resolvedTickets}
          icon={faCheckCircle}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          subtitle={`${stats.resolutionRate}% resolution rate`}
        />
        <StatCard
          label="Active Tickets"
          value={stats.activeTickets}
          icon={faExclamationCircle}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          subtitle={`${stats.newTickets} new, ${stats.inProgressTickets} in progress`}
        />
        <StatCard
          label="Avg Resolution Time"
          value={`${stats.avgResolutionTime}h`}
          icon={faClock}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          subtitle={`${stats.avgResponseTime}h avg response`}
        />
      </div>

      {/* Growth Indicator */}
      {stats.growth !== 0 && (
        <div className="bg-white border border-gray-200 rounded-sm p-4">
          <div className="flex items-center gap-2">
            <Icon 
              icon={stats.growth > 0 ? faArrowUp : faArrowDown} 
              className={stats.growth > 0 ? 'text-green-600' : 'text-red-600'} 
              size="sm" 
            />
            <span className="text-sm text-gray-600">
              Ticket volume is <strong className={stats.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(stats.growth)}% {stats.growth > 0 ? 'higher' : 'lower'}
              </strong> compared to the previous period
            </span>
          </div>
        </div>
      )}

      {/* Main Charts - Row 1 */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-12">
        {/* Tickets per Day - Area Chart */}
        <div className="bg-white rounded-sm border border-gray-200 p-6 md:col-span-8">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets per Day</h3>
          {ticketsByDay.length > 0 ? (
            <AreaChart
              data={ticketsByDay}
              dataKey="date"
              series={[{ key: 'count', name: 'Tickets', color: '#0f36a5' }]}
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
              No data available for selected period
            </div>
          )}
        </div>

        {/* Tickets by Status - Donut Chart */}
        <div className="bg-white rounded-sm border border-gray-200 p-6 md:col-span-4">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
          {ticketsByStatus.length > 0 ? (
            <DonutChart
              data={ticketsByStatus}
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Secondary Charts - Row 2 */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Tickets by Priority */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
          {ticketsByPriority.length > 0 ? (
            <DonutChart
              data={ticketsByPriority}
              height={250}
            />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>

        {/* Tickets by Agent */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Agent</h3>
          {ticketsByAgent.length > 0 ? (
            <DonutChart
              data={ticketsByAgent}
              height={250}
            />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>

        {/* Tickets by Category */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Category</h3>
          {ticketsByCategory.length > 0 ? (
            <DonutChart
              data={ticketsByCategory}
              height={250}
            />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Status Trend - Line Chart */}
      <div className="bg-white rounded-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Status Trend Over Time</h3>
        {statusTrend.length > 0 ? (
          <LineChart
            data={statusTrend}
            dataKey="date"
            lines={[
              { key: 'New', name: 'New', color: '#3b82f6' },
              { key: 'Assigned', name: 'Assigned', color: '#f59e0b' },
              { key: 'In_Progress', name: 'In Progress', color: '#8b5cf6' },
              { key: 'Resolved', name: 'Resolved', color: '#10b981' },
              { key: 'Closed', name: 'Closed', color: '#6b7280' },
            ]}
            height={350}
          />
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-500 text-sm">
            No data available for selected period
          </div>
        )}
      </div>

      {/* Top Agents Bar Chart */}
      <div className="bg-white rounded-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Top Agents by Ticket Count</h3>
        {ticketsByAgent.length > 0 ? (
          <BarChart
            data={ticketsByAgent}
            dataKey="name"
            bars={[{ key: 'value', name: 'Tickets', color: '#0f36a5' }]}
            height={300}
          />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}

