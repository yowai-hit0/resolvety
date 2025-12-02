'use client';

import { useState } from 'react';
import StatCard from '@/app/components/StatCard';
import LineChart from '@/app/components/charts/LineChart';
import PieChart from '@/app/components/charts/PieChart';
import BarChart from '@/app/components/charts/BarChart';
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
          label="Total Tickets"
          value={stats.totalTickets}
          icon={faTicketAlt}
          iconColor="#181E29"
          iconBgColor="#f0f1f3"
          href="/admin/tickets"
        />
        <StatCard
          label="Active Tickets"
          value={stats.activeTickets}
          icon={faClock}
          iconColor="#f59e0b"
          iconBgColor="#fef3c7"
          href="/admin/tickets?status=active"
        />
        <StatCard
          label="Resolved"
          value={stats.resolvedTickets}
          icon={faCheckCircle}
          iconColor="#10b981"
          iconBgColor="#d1fae5"
          href="/admin/tickets?status=resolved"
        />
        <StatCard
          label="New Today"
          value={stats.newToday}
          icon={faExclamationCircle}
          iconColor="#ef4444"
          iconBgColor="#fee2e2"
          href="/admin/tickets?status=new"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets per Day (Last 30 Days)</h3>
          <LineChart
            data={mockChartData.ticketsByDay}
            dataKey="date"
            lines={[{ key: 'count', name: 'Tickets' }]}
            height={300}
          />
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
          <PieChart
            data={mockChartData.ticketsByStatus}
            height={300}
          />
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Agent</h3>
          <BarChart
            data={mockChartData.ticketsByAgent}
            dataKey="name"
            bars={[{ key: 'count', name: 'Tickets' }]}
            height={300}
          />
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
          <PieChart
            data={mockChartData.ticketsByPriority}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}

