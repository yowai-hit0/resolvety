'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { mockTickets, mockUsers, mockPriorities } from '@/lib/mockData';
import { Ticket, TicketStatus } from '@/types';
import Icon, { faSearch, faArrowsUpDown, faArrowUp, faArrowDown, faFilter, faTable, faTh, faTimes, faDownload } from '@/app/components/Icon';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const STATUSES: { value: TicketStatus | ''; label: string; class: string }[] = [
  { value: '', label: 'All Status', class: '' },
  { value: 'New', label: 'New', class: 'status-new' },
  { value: 'Assigned', label: 'Assigned', class: 'status-open' },
  { value: 'In_Progress', label: 'In Progress', class: 'status-open' },
  { value: 'On_Hold', label: 'On Hold', class: 'status-open' },
  { value: 'Resolved', label: 'Resolved', class: 'status-resolved' },
  { value: 'Closed', label: 'Closed', class: 'status-closed' },
  { value: 'Reopened', label: 'Reopened', class: 'status-open' },
];

type SortField = 'ticket_code' | 'subject' | 'status' | 'priority' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'cards';

// Mobile Ticket Card Component
function MobileTicketCard({ ticket }: { ticket: Ticket }) {
  const statusClass = STATUSES.find(s => s.value === ticket.status)?.class || 'status-new';
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Link href={`/agent/tickets/${ticket.id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-sm p-4 hover:border-gray-300 transition-all">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-sm text-primary-500 font-medium">
                {ticket.ticket_code}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <span className={`status-badge ${statusClass}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          
          <div className="font-medium text-gray-900 line-clamp-2">{ticket.subject}</div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-gray-500">Priority</div>
                <div className="text-gray-700">{ticket.priority?.name || 'N/A'}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500">Updated</div>
              <div className="text-gray-700">{formatTimeAgo(ticket.updated_at)}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Mobile Filter Sheet Component
function MobileFilterSheet({
  isOpen,
  onClose,
  search,
  statusFilter,
  priorityFilter,
  pageSize,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onPageSizeChange,
  priorities,
}: {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  statusFilter: TicketStatus | '';
  priorityFilter: number | '';
  pageSize: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TicketStatus | '') => void;
  onPriorityChange: (value: number | '') => void;
  onPageSizeChange: (value: number) => void;
  priorities: typeof mockPriorities;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
            aria-label="Close filters"
          >
            <Icon icon={faTimes} className="text-gray-500" size="sm" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Icon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="sm" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as TicketStatus | '')}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            >
              <option value="">All Priorities</option>
              {priorities.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentTicketsPage() {
  const [currentAgent, setCurrentAgent] = useState<{ id: number } | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Get current agent
  useEffect(() => {
    try {
      const authRaw = sessionStorage.getItem('resolveitAuth');
      if (authRaw) {
        const auth = JSON.parse(authRaw) as { id?: number; role?: string } | null;
        if (auth?.role === 'agent' && auth?.id) {
          setCurrentAgent({ id: auth.id });
          return;
        }
      }
      // Default to first agent for demo
      const firstAgent = mockUsers.find(u => u.role === 'agent');
      if (firstAgent) {
        setCurrentAgent({ id: firstAgent.id });
      }
    } catch (error) {
      console.error('Error loading agent info', error);
      const firstAgent = mockUsers.find(u => u.role === 'agent');
      if (firstAgent) {
        setCurrentAgent({ id: firstAgent.id });
      }
    }
  }, []);

  // Filter and sort tickets - only show assigned to current agent
  const filteredAndSortedTickets = useMemo(() => {
    if (!currentAgent) return [];

    let filtered = mockTickets.filter(ticket => ticket.assignee_id === currentAgent.id);

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.ticket_code.toLowerCase().includes(searchLower) ||
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.requester_name?.toLowerCase().includes(searchLower) ||
        ticket.requester_email?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter(ticket => ticket.priority_id === priorityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'ticket_code':
          aValue = a.ticket_code;
          bValue = b.ticket_code;
          break;
        case 'subject':
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          aValue = a.priority?.name || '';
          bValue = b.priority?.name || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [currentAgent, search, statusFilter, priorityFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTickets.length / pageSize);
  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedTickets.slice(start, start + pageSize);
  }, [filteredAndSortedTickets, page, pageSize]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // CSV Export
  const exportCsv = () => {
    const headers = ['ID', 'Ticket Code', 'Subject', 'Requester Email', 'Requester Name', 'Priority', 'Status', 'Created At', 'Updated At'];
    const rows = filteredAndSortedTickets.map((t) => [
      t.id,
      t.ticket_code,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.requester_email || '',
      t.requester_name || '',
      t.priority?.name || 'N/A',
      t.status,
      new Date(t.created_at).toISOString(),
      new Date(t.updated_at).toISOString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_tickets_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const getStatusClass = (status: TicketStatus) => {
    const statusObj = STATUSES.find(s => s.value === status);
    return statusObj?.class || 'status-new';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <Icon icon={faArrowsUpDown} className="text-gray-400" size="xs" />;
    }
    return sortDirection === 'asc' ? (
      <Icon icon={faArrowUp} className="text-primary-500" size="xs" />
    ) : (
      <Icon icon={faArrowDown} className="text-primary-500" size="xs" />
    );
  };

  if (!currentAgent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAndSortedTickets.length} {filteredAndSortedTickets.length === 1 ? 'ticket' : 'tickets'} assigned to you
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle - Desktop */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-sm p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-primary-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Table view"
            >
              <Icon icon={faTable} size="sm" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-primary-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Card view"
            >
              <Icon icon={faTh} size="sm" />
            </button>
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Icon icon={faDownload} size="sm" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar - Desktop */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Icon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="sm" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as TicketStatus | '');
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value ? Number(e.target.value) : '');
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
          >
            <option value="">All Priorities</option>
            {mockPriorities.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Icon icon={faFilter} size="sm" />
          Filters
        </button>
        <div className="flex items-center gap-1 bg-gray-100 rounded-sm p-1 flex-1 justify-end">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-primary-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Table view"
          >
            <Icon icon={faTable} size="sm" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
              viewMode === 'cards'
                ? 'bg-white text-primary-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Card view"
          >
            <Icon icon={faTh} size="sm" />
          </button>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        search={search}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        pageSize={pageSize}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        onPriorityChange={(value) => {
          setPriorityFilter(value);
          setPage(1);
        }}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        priorities={mockPriorities}
      />

      {/* Card View */}
      {viewMode === 'cards' && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {paginatedTickets.length === 0 ? (
            <div className="col-span-full bg-white border border-gray-200 rounded-sm p-12 text-center">
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            paginatedTickets.map((ticket) => (
              <MobileTicketCard
                key={ticket.id}
                ticket={ticket}
              />
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ticket_code')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Ticket</span>
                      <SortIcon field="ticket_code" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('subject')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Subject</span>
                      <SortIcon field="subject" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Status</span>
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Priority</span>
                      <SortIcon field="priority" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden lg:table-cell"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Created</span>
                      <SortIcon field="created_at" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('updated_at')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Updated</span>
                      <SortIcon field="updated_at" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/agent/tickets/${ticket.id}`}
                          className="font-mono text-sm text-primary-500 hover:text-primary-600 font-medium"
                        >
                          {ticket.ticket_code}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/agent/tickets/${ticket.id}`}
                          className="text-sm text-gray-900 hover:text-primary-500 line-clamp-1"
                        >
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {ticket.priority?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="text-sm text-gray-600">
                          {formatDate(ticket.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {formatTimeAgo(ticket.updated_at)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredAndSortedTickets.length)} of {filteredAndSortedTickets.length} tickets
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm border rounded-sm ${
                      page === pageNum
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    style={page === pageNum ? { backgroundColor: '#0f36a5', borderColor: '#0f36a5' } : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

