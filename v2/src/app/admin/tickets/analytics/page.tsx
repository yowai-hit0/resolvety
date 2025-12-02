'use client';

import { useState, useMemo } from 'react';
import { mockTickets, mockUsers, mockTags, mockPriorities, mockChartData } from '@/lib/mockData';
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

type TimePeriod = '7d' | '30d' | '90d' | 'all';

export default function TicketAnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');

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
    const newTickets = filteredTickets.filter(t => t.status === 'New').length;
    const inProgressTickets = filteredTickets.filter(t => t.status === 'In_Progress').length;
    
    // Calculate average response time (mock: hours)
    const avgResponseTime = Math.floor(Math.random() * 24) + 1;
    
    // Calculate average resolution time (mock: hours)
    const avgResolutionTime = Math.floor(Math.random() * 72) + 12;
    
    // Calculate resolution rate
    const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
    
    // Calculate tickets per day average
    const daysDiff = Math.max(1, Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const ticketsPerDay = Math.round((totalTickets / daysDiff) * 10) / 10;

    // Calculate growth (mock: compare with previous period)
    const previousPeriodTickets = Math.floor(totalTickets * 0.85);
    const growth = totalTickets > 0 ? Math.round(((totalTickets - previousPeriodTickets) / previousPeriodTickets) * 100) : 0;

    return {
      totalTickets,
      resolvedTickets,
      activeTickets,
      newTickets,
      inProgressTickets,
      avgResponseTime,
      avgResolutionTime,
      resolutionRate,
      ticketsPerDay,
      growth,
    };
  }, [filteredTickets, dateRange]);

  // Tickets by Day (for area chart)
  const ticketsByDay = useMemo(() => {
    const days: Record<string, number> = {};
    filteredTickets.forEach(ticket => {
      const date = new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[date] = (days[date] || 0) + 1;
    });
    
    // Sort by date and fill missing days
    const sortedDates = Object.keys(days).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    
    return sortedDates.map(date => ({
      date,
      count: days[date],
    }));
  }, [filteredTickets]);

  // Tickets by Status
  const ticketsByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    filteredTickets.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));
  }, [filteredTickets]);

  // Tickets by Agent
  const ticketsByAgent = useMemo(() => {
    const agentCounts: Record<string, number> = {};
    filteredTickets.forEach(ticket => {
      if (ticket.assignee) {
        const agentName = `${ticket.assignee.first_name} ${ticket.assignee.last_name}`.trim() || ticket.assignee.email.split('@')[0];
        agentCounts[agentName] = (agentCounts[agentName] || 0) + 1;
      } else {
        agentCounts['Unassigned'] = (agentCounts['Unassigned'] || 0) + 1;
      }
    });
    
    return Object.entries(agentCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 agents
  }, [filteredTickets]);

  // Tickets by Priority
  const ticketsByPriority = useMemo(() => {
    const priorityCounts: Record<string, number> = {};
    filteredTickets.forEach(ticket => {
      if (ticket.priority) {
        priorityCounts[ticket.priority.name] = (priorityCounts[ticket.priority.name] || 0) + 1;
      }
    });
    
    return Object.entries(priorityCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredTickets]);

  // Tickets by Category/Tag
  const ticketsByCategory = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    filteredTickets.forEach(ticket => {
      if (ticket.tags && Array.isArray(ticket.tags) && ticket.tags.length > 0) {
        ticket.tags.forEach(tag => {
          tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
        });
      } else {
        tagCounts['Uncategorized'] = (tagCounts['Uncategorized'] || 0) + 1;
      }
    });
    
    return Object.entries(tagCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [filteredTickets]);

  // Status Trend (line chart showing status changes over time)
  const statusTrend = useMemo(() => {
    const statusByDay: Record<string, Record<string, number>> = {};
    
    filteredTickets.forEach(ticket => {
      const date = new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!statusByDay[date]) {
        statusByDay[date] = {};
      }
      statusByDay[date][ticket.status] = (statusByDay[date][ticket.status] || 0) + 1;
    });
    
    const dates = Object.keys(statusByDay).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    const statuses = ['New', 'Assigned', 'In_Progress', 'Resolved', 'Closed'];
    
    return dates.map(date => {
      const data: Record<string, any> = { date };
      statuses.forEach(status => {
        data[status] = statusByDay[date][status] || 0;
      });
      return data;
    });
  }, [filteredTickets]);

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

