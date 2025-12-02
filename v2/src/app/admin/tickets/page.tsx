'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { mockTickets, mockUsers, mockPriorities } from '@/lib/mockData';
import { Ticket, TicketStatus, TicketPriority, User } from '@/types';
import Icon, { faSearch, faArrowsUpDown, faArrowUp, faArrowDown, faFilter, faPlus, faTable, faTh, faTimes, faDownload, faSave, faBookmark, faCheck, faX } from '@/app/components/Icon';

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
type ViewMode = 'table' | 'cards';

// Mobile Ticket Card Component
function MobileTicketCard({ ticket, isSelected, onSelect }: { ticket: Ticket; isSelected: boolean; onSelect: (id: number, checked: boolean) => void }) {
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
    <Link href={`/admin/tickets/${ticket.id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-sm p-4 hover:border-gray-300 transition-all">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(ticket.id, e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <div className="font-mono text-sm text-primary-500 font-medium">
                  {ticket.ticket_code}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
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
              <div>
                <div className="text-xs text-gray-500">Assignee</div>
                <div className="text-gray-700 max-w-[100px] truncate">
                  {ticket.assignee ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}` : 'Unassigned'}
                </div>
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
  assigneeFilter,
  pageSize,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onPageSizeChange,
  priorities,
  agents,
}: {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  statusFilter: TicketStatus | '';
  priorityFilter: number | '';
  assigneeFilter: number | '';
  pageSize: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TicketStatus | '') => void;
  onPriorityChange: (value: number | '') => void;
  onAssigneeChange: (value: number | '') => void;
  onPageSizeChange: (value: number) => void;
  priorities: TicketPriority[];
  agents: User[];
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
            <select
              value={assigneeFilter}
              onChange={(e) => onAssigneeChange(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            >
              <option value="">Any Assignee</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.first_name} {a.last_name} ({a.email})
                </option>
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
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [savedViewsOpen, setSavedViewsOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('');
  const [savedViews, setSavedViews] = useState<Array<{ name: string; params: any }>>([]);
  const [newViewName, setNewViewName] = useState('');

  // Get agents for assignee filter
  const agents = useMemo(() => mockUsers.filter(u => u.role === 'agent' || u.role === 'admin'), []);

  // Load saved views from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('resolveit_saved_views');
      if (saved) {
        try {
          setSavedViews(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load saved views', e);
        }
      }
    }
  }, []);

  // Save current view
  const saveCurrentView = () => {
    if (!newViewName.trim()) return;
    
    const view = {
      name: newViewName.trim(),
      params: {
        search,
        statusFilter,
        priorityFilter,
        assigneeFilter,
        pageSize,
        sortField,
        sortDirection,
      }
    };
    
    const updated = [...savedViews, view];
    setSavedViews(updated);
    localStorage.setItem('resolveit_saved_views', JSON.stringify(updated));
    setNewViewName('');
    setSavedViewsOpen(false);
  };

  // Apply saved view
  const applyView = (view: { name: string; params: any }) => {
    setSearch(view.params.search || '');
    setStatusFilter(view.params.statusFilter || '');
    setPriorityFilter(view.params.priorityFilter || '');
    setAssigneeFilter(view.params.assigneeFilter || '');
    setPageSize(view.params.pageSize || 10);
    setSortField(view.params.sortField || 'updated_at');
    setSortDirection(view.params.sortDirection || 'desc');
    setPage(1);
    setSavedViewsOpen(false);
  };

  // Delete saved view
  const deleteView = (name: string) => {
    const updated = savedViews.filter(v => v.name !== name);
    setSavedViews(updated);
    localStorage.setItem('resolveit_saved_views', JSON.stringify(updated));
  };

  // CSV Export
  const exportCsv = () => {
    const selectedTickets = filteredAndSortedTickets.filter(t => selectedIds.size === 0 || selectedIds.has(t.id));
    const headers = ['ID', 'Ticket Code', 'Subject', 'Requester Email', 'Requester Name', 'Assignee', 'Priority', 'Status', 'Created At', 'Updated At'];
    const rows = selectedTickets.map((t) => [
      t.id,
      t.ticket_code,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.requester_email || '',
      t.requester_name || '',
      t.assignee ? `${t.assignee.first_name} ${t.assignee.last_name}` : 'Unassigned',
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
    a.download = `tickets_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bulk Assign
  const handleBulkAssign = () => {
    if (selectedIds.size === 0 || !selectedAssignee) return;
    // Mock implementation - in real app, this would call an API
    console.log('Bulk assign:', Array.from(selectedIds), 'to', selectedAssignee);
    setSelectedIds(new Set());
    setAssignModalOpen(false);
    setSelectedAssignee('');
  };

  // Bulk Status Update
  const handleBulkStatus = () => {
    if (selectedIds.size === 0 || !selectedStatus) return;
    // Mock implementation - in real app, this would call an API
    console.log('Bulk status update:', Array.from(selectedIds), 'to', selectedStatus);
    setSelectedIds(new Set());
    setStatusModalOpen(false);
    setSelectedStatus('');
  };

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
      <Icon icon={faArrowUp} className="text-primary-500" size="xs" />
    ) : (
      <Icon icon={faArrowDown} className="text-primary-500" size="xs" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAndSortedTickets.length} {filteredAndSortedTickets.length === 1 ? 'ticket' : 'tickets'} found
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle - Desktop */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-sm p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-primary-500 shadow-sm'
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
                  ? 'bg-white text-primary-500 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Card view"
            >
              <Icon icon={faTh} size="sm" />
            </button>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors text-sm font-medium"
            style={{ backgroundColor: '#0f36a5' }}
          >
            <Icon icon={faPlus} size="sm" />
            <span className="hidden sm:inline">Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Filters Bar - Desktop */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-sm p-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1">
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

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => {
              setAssigneeFilter(e.target.value ? Number(e.target.value) : '');
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
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
                ? 'bg-white text-primary-500 shadow-sm'
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
                ? 'bg-white text-primary-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Card view"
          >
            <Icon icon={faTh} size="sm" />
          </button>
        </div>
      </div>

      {/* Bulk Assign Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-sm p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bulk Assign Tickets</h3>
              <button
                onClick={() => {
                  setAssignModalOpen(false);
                  setSelectedAssignee('');
                }}
                className="p-1 hover:bg-gray-100 rounded-sm"
              >
                <Icon icon={faTimes} className="text-gray-500" size="sm" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                >
                  <option value="">Select assignee...</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.first_name} {a.last_name} ({a.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    setAssignModalOpen(false);
                    setSelectedAssignee('');
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAssign}
                  disabled={!selectedAssignee}
                  className="px-4 py-2 text-sm bg-primary-500 text-white rounded-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0f36a5' }}
                >
                  Assign {selectedIds.size} {selectedIds.size === 1 ? 'ticket' : 'tickets'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-sm p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
              <button
                onClick={() => {
                  setStatusModalOpen(false);
                  setSelectedStatus('');
                }}
                className="p-1 hover:bg-gray-100 rounded-sm"
              >
                <Icon icon={faTimes} className="text-gray-500" size="sm" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as TicketStatus | '')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                >
                  <option value="">Select status...</option>
                  {STATUSES.filter(s => s.value).map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    setStatusModalOpen(false);
                    setSelectedStatus('');
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkStatus}
                  disabled={!selectedStatus}
                  className="px-4 py-2 text-sm bg-primary-500 text-white rounded-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0f36a5' }}
                >
                  Update {selectedIds.size} {selectedIds.size === 1 ? 'ticket' : 'tickets'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Views Modal */}
      {savedViewsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-sm p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Saved Views</h3>
              <button
                onClick={() => {
                  setSavedViewsOpen(false);
                  setNewViewName('');
                }}
                className="p-1 hover:bg-gray-100 rounded-sm"
              >
                <Icon icon={faTimes} className="text-gray-500" size="sm" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Save Current View */}
              <div className="border-b border-gray-200 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Save Current View
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    placeholder="View name..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                  <button
                    onClick={saveCurrentView}
                    disabled={!newViewName.trim()}
                    className="px-4 py-2 text-sm bg-primary-500 text-white rounded-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: '#0f36a5' }}
                  >
                    <Icon icon={faSave} size="sm" />
                    Save
                  </button>
                </div>
              </div>

              {/* Saved Views List */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Saved Views</h4>
                {savedViews.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No saved views</p>
                ) : (
                  <div className="space-y-2">
                    {savedViews.map((view, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-sm hover:bg-gray-100"
                      >
                        <button
                          onClick={() => applyView(view)}
                          className="flex-1 text-left text-sm text-gray-900 hover:text-primary-500"
                        >
                          <Icon icon={faBookmark} className="inline mr-2 text-primary-500" size="xs" />
                          {view.name}
                        </button>
                        <button
                          onClick={() => deleteView(view.name)}
                          className="p-1 hover:bg-gray-200 rounded-sm text-gray-500 hover:text-red-600"
                        >
                          <Icon icon={faX} size="sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        search={search}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        assigneeFilter={assigneeFilter}
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
        onAssigneeChange={(value) => {
          setAssigneeFilter(value);
          setPage(1);
        }}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        priorities={mockPriorities}
        agents={agents}
      />

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-sm p-3 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-gray-700">
            {selectedIds.size} {selectedIds.size === 1 ? 'ticket' : 'tickets'} selected
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAssignModalOpen(true)}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign
            </button>
            <button
              onClick={() => setStatusModalOpen(true)}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Status
            </button>
            <button
              onClick={exportCsv}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 flex items-center gap-1"
            >
              <Icon icon={faDownload} size="xs" />
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
                isSelected={selectedIds.has(ticket.id)}
                onSelect={handleSelectOne}
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
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginatedTickets.length && paginatedTickets.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
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
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
                          className="font-mono text-sm text-primary-500 hover:text-primary-600 font-medium"
                        >
                          {ticket.ticket_code}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
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
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {ticket.assignee ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}` : 'Unassigned'}
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
    </div>
  );
}
