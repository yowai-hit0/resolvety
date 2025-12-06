'use client';

import { useState, useMemo, useEffect } from 'react';
import { UsersAPI, TicketsAPI, OrganizationsAPI } from '@/lib/api';
import { User, Ticket, Organization } from '@/types';
import AreaChart from '@/app/components/charts/AreaChart';
import BarChart from '@/app/components/charts/BarChart';
import DonutChart from '@/app/components/charts/DonutChart';
import LineChart from '@/app/components/charts/LineChart';
import StatCard from '@/app/components/StatCard';
import Icon, { 
  faUsers, 
  faUserShield, 
  faUserCheck, 
  faUserTimes,
  faChartLine,
  faBuilding,
  faTicketAlt,
} from '@/app/components/Icon';
import { StatCardSkeleton, ChartSkeleton, Skeleton } from '@/app/components/Skeleton';

type TimePeriod = '7d' | '30d' | '90d' | 'all';

export default function UserAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all users, tickets, and organizations
        const [usersResponse, ticketsResponse, orgsResponse] = await Promise.all([
          UsersAPI.list({ take: 10000 }).catch(() => ({ data: [] })),
          TicketsAPI.list({ take: 10000 }).catch(() => ({ data: [] })),
          OrganizationsAPI.list({ take: 1000 }).catch(() => ({ data: [] })),
        ]);
        
        setUsers(usersResponse.data || usersResponse || []);
        setTickets(ticketsResponse.data || ticketsResponse || []);
        setOrganizations(orgsResponse.data || orgsResponse || []);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Filter users by date range (users created in this period)
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const userDate = new Date(user.created_at);
      return userDate >= dateRange.startDate && userDate <= dateRange.endDate;
    });
  }, [users, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const inactiveUsers = totalUsers - activeUsers;
    
    // Users by role
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // New users in period
    const newUsers = filteredUsers.length;
    
    // Users by organization
    const usersByOrg = users.reduce((acc, user) => {
      if (user.organization_id) {
        const org = organizations.find(o => o.id === user.organization_id);
        if (org) {
          acc[org.name] = (acc[org.name] || 0) + 1;
        }
      } else {
        acc['No Organization'] = (acc['No Organization'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Users with tickets
    const usersWithTickets = new Set(tickets.map(t => t.created_by_id));
    const usersWithoutTickets = totalUsers - usersWithTickets.size;

    // Average tickets per user
    const ticketsPerUser = totalUsers > 0 ? Math.round((tickets.length / totalUsers) * 10) / 10 : 0;

    // Users by activity (based on ticket creation)
    const userActivity = users.map(user => {
      const userTickets = tickets.filter(t => t.created_by_id === user.id);
      return {
        user,
        ticketCount: userTickets.length,
      };
    }).sort((a, b) => b.ticketCount - a.ticketCount);

    // Top active users
    const topActiveUsers = userActivity.slice(0, 10);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers,
      usersByRole,
      usersByOrg,
      usersWithTickets: usersWithTickets.size,
      usersWithoutTickets,
      ticketsPerUser,
      topActiveUsers,
    };
  }, [users, tickets, organizations, filteredUsers]);

  // Users by Role Chart
  const usersByRoleChart = useMemo(() => {
    return Object.entries(stats.usersByRole).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));
  }, [stats.usersByRole]);

  // Users by Organization Chart
  const usersByOrgChart = useMemo(() => {
    return Object.entries(stats.usersByOrg)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  }, [stats.usersByOrg]);

  // Top Active Users Chart
  const topActiveUsersChart = useMemo(() => {
    return stats.topActiveUsers.map(({ user, ticketCount }) => ({
      name: `${user.first_name} ${user.last_name}`.trim() || user.email.split('@')[0],
      value: ticketCount,
    }));
  }, [stats.topActiveUsers]);

  // User Registration Trend (users created per day)
  const usersByDay = useMemo(() => {
    const days: Record<string, number> = {};
    filteredUsers.forEach(user => {
      const date = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[date] = (days[date] || 0) + 1;
    });
    
    const sortedDates = Object.keys(days).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    
    return sortedDates.map(date => ({
      date,
      count: days[date],
    }));
  }, [filteredUsers]);

  // Role Distribution Over Time
  const roleTrend = useMemo(() => {
    const roleByDay: Record<string, Record<string, number>> = {};
    
    filteredUsers.forEach(user => {
      const date = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!roleByDay[date]) {
        roleByDay[date] = {};
      }
      roleByDay[date][user.role] = (roleByDay[date][user.role] || 0) + 1;
    });
    
    const dates = Object.keys(roleByDay).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    const roles = ['super_admin', 'admin', 'agent', 'customer'];
    
    return dates.map(date => {
      const data: Record<string, any> = { date };
      roles.forEach(role => {
        data[role] = roleByDay[date][role] || 0;
      });
      return data;
    });
  }, [filteredUsers]);

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
          <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Detailed insights and metrics for user management
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
          label="Total Users"
          value={stats.totalUsers}
          icon={faUsers}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          subtitle={`${stats.newUsers} new in period`}
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
          icon={faUserCheck}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          subtitle={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% active rate`}
        />
        <StatCard
          label="Users with Tickets"
          value={stats.usersWithTickets}
          icon={faTicketAlt}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          subtitle={`${stats.ticketsPerUser} tickets/user avg`}
        />
        <StatCard
          label="Inactive Users"
          value={stats.inactiveUsers}
          icon={faUserTimes}
          iconColor="#0f36a5"
          iconBgColor="#eef2ff"
          subtitle={`${Math.round((stats.inactiveUsers / stats.totalUsers) * 100)}% inactive`}
        />
      </div>

      {/* Main Charts - Row 1 */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-12">
        {/* User Registration Trend - Area Chart */}
        <div className="bg-white rounded-sm border border-gray-200 p-6 md:col-span-8">
          <h3 className="font-semibold text-gray-900 mb-4">User Registration Trend</h3>
          {usersByDay.length > 0 ? (
            <AreaChart
              data={usersByDay}
              dataKey="date"
              series={[{ key: 'count', name: 'New Users', color: '#0f36a5' }]}
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
              No new users in selected period
            </div>
          )}
        </div>

        {/* Users by Role - Donut Chart */}
        <div className="bg-white rounded-sm border border-gray-200 p-6 md:col-span-4">
          <h3 className="font-semibold text-gray-900 mb-4">Users by Role</h3>
          {usersByRoleChart.length > 0 ? (
            <DonutChart
              data={usersByRoleChart}
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
        {/* Users by Organization */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Users by Organization</h3>
          {usersByOrgChart.length > 0 ? (
            <DonutChart
              data={usersByOrgChart}
              height={250}
            />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>

        {/* Top Active Users */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Active Users</h3>
          {topActiveUsersChart.length > 0 ? (
            <DonutChart
              data={topActiveUsersChart}
              height={250}
            />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>

        {/* User Activity Stats */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
              <div className="flex items-center gap-2">
                <Icon icon={faTicketAlt} className="text-primary-500" size="sm" />
                <span className="text-sm font-medium text-gray-700">Users with Tickets</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.usersWithTickets}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
              <div className="flex items-center gap-2">
                <Icon icon={faUsers} className="text-gray-500" size="sm" />
                <span className="text-sm font-medium text-gray-700">Users without Tickets</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.usersWithoutTickets}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
              <div className="flex items-center gap-2">
                <Icon icon={faChartLine} className="text-primary-500" size="sm" />
                <span className="text-sm font-medium text-gray-700">Avg Tickets/User</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.ticketsPerUser}</span>
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

      {/* Role Trend - Line Chart */}
      <div className="bg-white rounded-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Role Distribution Over Time</h3>
        {roleTrend.length > 0 ? (
          <LineChart
            data={roleTrend}
            dataKey="date"
            lines={[
              { key: 'super_admin', name: 'Super Admin', color: '#8b5cf6' },
              { key: 'admin', name: 'Admin', color: '#0f36a5' },
              { key: 'agent', name: 'Agent', color: '#f59e0b' },
              { key: 'customer', name: 'Customer', color: '#10b981' },
            ]}
            height={350}
          />
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-500 text-sm">
            No data available for selected period
          </div>
        )}
      </div>

      {/* Top Active Users Bar Chart */}
      <div className="bg-white rounded-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Top Active Users by Ticket Count</h3>
        {topActiveUsersChart.length > 0 ? (
          <BarChart
            data={topActiveUsersChart}
            dataKey="name"
            bars={[{ key: 'value', name: 'Tickets Created', color: '#0f36a5' }]}
            height={300}
          />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
            No data available
          </div>
        )}
      </div>

      {/* Organization Distribution Bar Chart */}
      <div className="bg-white rounded-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Users by Organization</h3>
        {usersByOrgChart.length > 0 ? (
          <BarChart
            data={usersByOrgChart}
            dataKey="name"
            bars={[{ key: 'value', name: 'Users', color: '#0f36a5' }]}
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

