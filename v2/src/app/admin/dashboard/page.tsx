'use client';

import { useState } from 'react';
import StatCard from '@/app/components/StatCard';
import AreaChart from '@/app/components/charts/AreaChart';
import DonutChart from '@/app/components/charts/DonutChart';
import { mockDashboardStats, mockChartData } from '@/lib/mockData';
import Icon, { faTicketAlt, faCheckCircle, faClock, faExclamationCircle } from '@/app/components/Icon';

export default function AdminDashboard() {
  const [stats] = useState(mockDashboardStats);

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
            data={mockChartData.ticketsByDay}
            dataKey="date"
            series={[{ key: 'count', name: 'Tickets' }]}
            height={300}
          />
        </div>

        <div className="bg-white rounded-sm border border-gray-200 p-6 md:col-span-4">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
          <DonutChart
            data={mockChartData.ticketsByStatus}
            height={300}
          />
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
          <DonutChart
            data={mockChartData.ticketsByPriority}
            height={300}
          />
        </div>

        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Agent</h3>
          <DonutChart
            data={mockChartData.ticketsByAgent.map(agent => ({
              name: agent.name,
              value: agent.count,
            }))}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}

