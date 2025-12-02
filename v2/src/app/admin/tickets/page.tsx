'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockTickets, mockUsers, mockPriorities } from '@/lib/mockData';
import { Ticket, TicketStatus, TicketPriority, User } from '@/types';
import Icon, { faSearch, faArrowsUpDown, faArrowUp, faArrowDown, faFilter, faPlus } from '@/app/components/Icon';

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

type SortField = 'ticket_code' | 'subject' | 'status' | 'priority' | 'assignee' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

export default function AdminTicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<number | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Get agents for assignee filter
  const agents = useMemo(() => mockUsers.filter(u => u.role === 'agent' || u.role === 'admin'), []);

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = [...mockTickets];

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

    // Assignee filter
    if (assigneeFilter) {
      filtered = filtered.filter(ticket => ticket.assignee_id === assigneeFilter);
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
        case 'assignee':
          aValue = a.assignee?.email || '';
          bValue = b.assignee?.email || '';
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
  }, [search, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection]);

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

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedTickets.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Handle select one
  const handleSelectOne = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
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
      <Icon icon={faArrowUp} className="text-accent" size="xs" />
    ) : (
      <Icon icon={faArrowDown} className="text-accent" size="xs" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAndSortedTickets.length} {filteredAndSortedTickets.length === 1 ? 'ticket' : 'tickets'} found
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors text-sm font-medium">
          <Icon icon={faPlus} size="sm" />
          Create Ticket
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-sm p-4">
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
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent text-sm"
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
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent text-sm"
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
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent text-sm"
          >
            <option value="">All Priorities</option>
            {mockPriorities.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => {
              setAssigneeFilter(e.target.value ? Number(e.target.value) : '');
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent text-sm"
          >
            <option value="">Any Assignee</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>
                {a.first_name} {a.last_name} ({a.email})
              </option>
            ))}
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent text-sm"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-accent/10 border border-accent/20 rounded-sm p-3 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            {selectedIds.size} {selectedIds.size === 1 ? 'ticket' : 'tickets'} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm hover:bg-gray-50">
              Assign
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm hover:bg-gray-50">
              Update Status
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm hover:bg-gray-50">
              Export CSV
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginatedTickets.length && paginatedTickets.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-accent focus:ring-accent"
                  />
                </th>
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
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('assignee')}
                >
                  <div className="flex items-center gap-2">
                    <span>Assignee</span>
                    <SortIcon field="assignee" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
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
                      <input
                        type="checkbox"
                        checked={selectedIds.has(ticket.id)}
                        onChange={(e) => handleSelectOne(ticket.id, e.target.checked)}
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="font-mono text-sm text-accent hover:text-accent-600 font-medium"
                      >
                        {ticket.ticket_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="text-sm text-gray-900 hover:text-accent line-clamp-1"
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
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {ticket.assignee ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}` : 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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

