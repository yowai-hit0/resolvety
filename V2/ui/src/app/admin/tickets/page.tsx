'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TicketsAPI, UsersAPI, PrioritiesAPI, CategoriesAPI } from '@/lib/api';
import { Ticket, TicketStatus, TicketPriority, User, Category } from '@/types';
import Icon, { faSearch, faArrowsUpDown, faArrowUp, faArrowDown, faFilter, faPlus, faTable, faTh, faTimes, faDownload, faSave, faBookmark, faCheck, faX } from '@/app/components/Icon';
import { TableSkeleton, TicketCardSkeleton, Skeleton } from '@/app/components/Skeleton';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const RW_DISTRICTS = [
  'Nyarugenge', 'Gasabo', 'Kicukiro', 'Musanze', 'Burera', 'Gakenke', 'Rubavu', 'Nyabihu', 
  'Rutsiro', 'Ngororero', 'Muhanga', 'Kamonyi', 'Ruhango', 'Nyanza', 'Huye', 'Gisagara', 
  'Nyaruguru', 'Nyamagabe', 'Karongi', 'Rusizi', 'Nyamasheke', 'Gicumbi', 'Rulindo', 
  'Bugesera', 'Ngoma', 'Kirehe', 'Kayonza', 'Rwamagana', 'Gatsibo', 'Nyagatare'
];

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
function MobileTicketCard({ ticket, isSelected, onSelect }: { ticket: Ticket; isSelected: boolean; onSelect: (id: string, checked: boolean) => void }) {
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
  priorityFilter: string | '';
  assigneeFilter: string | '';
  pageSize: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TicketStatus | '') => void;
  onPriorityChange: (value: string | '') => void;
  onAssigneeChange: (value: string | '') => void;
  onPageSizeChange: (value: number) => void;
  priorities: TicketPriority[];
  agents: User[];
  categories: Category[];
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
              onChange={(e) => onPriorityChange(e.target.value || '')}
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
              onChange={(e) => onAssigneeChange(e.target.value || '')}
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
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [search, setSearch] = useState('');
  
  // Helper function to normalize status from URL (e.g., "resolved" -> "Resolved")
  const normalizeStatus = (status: string | null): TicketStatus | '' => {
    if (!status) return '';
    // Handle special cases first
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'in_progress' || lowerStatus === 'in progress') return 'In_Progress';
    if (lowerStatus === 'on_hold' || lowerStatus === 'on hold') return 'On_Hold';
    
    // Normalize: capitalize first letter, lowercase rest
    const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    // Check if it's a valid status
    const validStatuses: TicketStatus[] = ['New', 'Assigned', 'In_Progress', 'On_Hold', 'Resolved', 'Closed', 'Reopened'];
    return validStatuses.includes(normalized as TicketStatus) ? (normalized as TicketStatus) : '';
  };
  
  // Initialize status filter from URL query parameter
  const getInitialStatus = (): TicketStatus | '' => {
    const statusParam = searchParams.get('status');
    return normalizeStatus(statusParam);
  };
  
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>(() => getInitialStatus());
  const [priorityFilter, setPriorityFilter] = useState<string | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [savedViewsOpen, setSavedViewsOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('');
  const [savedViews, setSavedViews] = useState<Array<{ name: string; params: any }>>([]);
  const [newViewName, setNewViewName] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    requester_email: '',
    requester_name: '',
    requester_phone: '',
    location: '',
    priority_id: '',
    assignee_id: '',
    category_ids: [] as string[],
  });
  const [phoneLocal, setPhoneLocal] = useState('');
  const [showLocationList, setShowLocationList] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; type: 'image' | 'audio' | 'video'; file: File }>>([]);
  const [fileUploading, setFileUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load initial data (priorities, categories, agents)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [prioritiesData, categoriesData, usersData] = await Promise.all([
          PrioritiesAPI.list().catch(() => []),
          CategoriesAPI.list().catch(() => []),
          UsersAPI.list({ take: 1000 }).catch(() => ({ data: [] })),
        ]);
        
        setPriorities(prioritiesData || []);
        setAvailableCategories(categoriesData || []);
        setAgents((usersData?.data || []).filter((u: User) => u.is_active));
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  // Update status filter when URL parameter changes
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const normalizedStatus = normalizeStatus(statusParam);
    if (normalizedStatus !== statusFilter) {
      setStatusFilter(normalizedStatus);
      // Reset to page 1 when filter changes
      setPage(1);
    }
  }, [searchParams]);

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

  // Load tickets based on filters
  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      try {
        const params: any = {
          skip: (page - 1) * pageSize,
          take: pageSize,
        };

        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;
        if (assigneeFilter) params.assignee = assigneeFilter;

        const response = await TicketsAPI.list(params);
        console.log('Tickets API Response:', response);
        console.log('Response data:', response.data);
        console.log('Response total:', response.total);
        
        // Handle different response structures
        const ticketsData = response.data || response || [];
        const totalData = response.total || response.totalCount || (Array.isArray(ticketsData) ? ticketsData.length : 0);
        
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
        setTotalTickets(totalData);
      } catch (error) {
        console.error('Failed to load tickets:', error);
        setTickets([]);
        setTotalTickets(0);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [page, pageSize, search, statusFilter, priorityFilter, assigneeFilter]);

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
    setPriorityFilter(view.params.priorityFilter?.toString() || '');
    setAssigneeFilter(view.params.assigneeFilter?.toString() || '');
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

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.priority_id) {
      errors.priority_id = 'Priority is required';
    }
    
    if (formData.requester_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requester_email)) {
      errors.requester_email = 'Invalid email format';
    }
    
    if (phoneLocal && !/^7\d{8}$/.test(phoneLocal)) {
      errors.requester_phone = 'Phone must be 9 digits starting with 7';
    }
    
    if (formData.location && !RW_DISTRICTS.includes(formData.location)) {
      errors.location = 'Invalid district';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setFileUploading(true);
    
    // Simulate file upload (mock)
    setTimeout(() => {
      const newFiles: Array<{ url: string; type: 'image' | 'audio' | 'video'; file: File }> = files.map(file => {
        const type: 'image' | 'audio' | 'video' = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('audio/') ? 'audio' : 
                     file.type.startsWith('video/') ? 'video' : 'image';
        const url = URL.createObjectURL(file);
        return { url, type, file };
      });
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setFileUploading(false);
    }, 500);
  };

  // Remove uploaded file
  const removeFile = (url: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.url === url);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter(f => f.url !== url);
    });
  };

  // Handle form submit
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update phone number
    const fullPhone = phoneLocal ? `+250${phoneLocal}` : '';
    const finalFormData = { ...formData, requester_phone: fullPhone };
    
    if (!validateForm()) {
      return;
    }
    
    setCreating(true);
    setFormErrors({});
    
    try {
      const ticketData: any = {
        subject: formData.subject,
        description: formData.description,
        requester_phone: fullPhone,
        priority_id: formData.priority_id,
      };
      
      if (formData.requester_email) ticketData.requester_email = formData.requester_email;
      if (formData.requester_name) ticketData.requester_name = formData.requester_name;
      if (formData.location) ticketData.location = formData.location;
      if (formData.assignee_id) ticketData.assignee_id = formData.assignee_id;
      if (formData.category_ids.length > 0) ticketData.category_ids = formData.category_ids;
      
      await TicketsAPI.create(ticketData);
      
      // Reset form
      setFormData({
        subject: '',
        description: '',
        requester_email: '',
        requester_name: '',
        requester_phone: '',
        location: '',
        priority_id: '',
        assignee_id: '',
        category_ids: [],
      });
      setPhoneLocal('');
      setUploadedFiles([]);
      setFormErrors({});
      setShowLocationList(false);
      setShowNewCategory(false);
      setNewCategoryName('');
      setCreateModalOpen(false);
      
      // Reload tickets
      const params: any = {
        skip: (page - 1) * pageSize,
        take: pageSize,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assigneeFilter) params.assignee = assigneeFilter;
      const response = await TicketsAPI.list(params);
      setTickets(response.data || []);
      setTotalTickets(response.total || 0);
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      setFormErrors({ 
        submit: error?.response?.data?.message || 'Failed to create ticket' 
      });
    } finally {
      setCreating(false);
    }
  };

  // Reset form when modal closes
  const handleCloseModal = () => {
    setFormData({
      subject: '',
      description: '',
      requester_email: '',
      requester_name: '',
      requester_phone: '',
      location: '',
      priority_id: '',
      assignee_id: '',
      category_ids: [],
    });
    setPhoneLocal('');
    setUploadedFiles([]);
    setFormErrors({});
    setShowLocationList(false);
    setShowNewCategory(false);
    setNewCategoryName('');
    setCreateModalOpen(false);
  };

  // Add new category
  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    
    try {
      const newCategory = await CategoriesAPI.create({ name });
      setAvailableCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({
        ...prev,
        category_ids: [...prev.category_ids, newCategory.id],
      }));
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (error) {
      console.error('Failed to create category:', error);
      setFormErrors({ category: 'Failed to create category' });
    }
  };

  // CSV Export
  const exportCsv = () => {
    const selectedTickets = tickets.filter(t => selectedIds.size === 0 || selectedIds.has(t.id));
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
  const handleBulkAssign = async () => {
    if (selectedIds.size === 0 || !selectedAssignee) return;
    try {
      await TicketsAPI.bulkAssign({
        ticket_ids: Array.from(selectedIds),
        assignee_id: selectedAssignee.toString(),
      });
      setSelectedIds(new Set());
      setAssignModalOpen(false);
      setSelectedAssignee('');
      // Reload tickets
      const params: any = {
        skip: (page - 1) * pageSize,
        take: pageSize,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assigneeFilter) params.assignee = assigneeFilter;
      const response = await TicketsAPI.list(params);
      setTickets(response.data || []);
    } catch (error) {
      console.error('Failed to bulk assign:', error);
    }
  };

  // Bulk Status Update
  const handleBulkStatus = async () => {
    if (selectedIds.size === 0 || !selectedStatus) return;
    try {
      await TicketsAPI.bulkStatus({
        ticket_ids: Array.from(selectedIds),
        status: selectedStatus,
      });
      setSelectedIds(new Set());
      setStatusModalOpen(false);
      setSelectedStatus('');
      // Reload tickets
      const params: any = {
        skip: (page - 1) * pageSize,
        take: pageSize,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assigneeFilter) params.assignee = assigneeFilter;
      const response = await TicketsAPI.list(params);
      setTickets(response.data || []);
    } catch (error) {
      console.error('Failed to bulk update status:', error);
    }
  };

  // Filter and sort tickets (client-side sorting for now, can be moved to backend)
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = [...tickets];

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

    // Priority filter (already filtered by API, but keep for client-side if needed)
    if (priorityFilter) {
      filtered = filtered.filter(ticket => ticket.priority_id === priorityFilter.toString());
    }

    // Assignee filter (already filtered by API, but keep for client-side if needed)
    if (assigneeFilter) {
      filtered = filtered.filter(ticket => ticket.assignee_id === assigneeFilter.toString());
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
  }, [tickets, search, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection]);

  // Pagination
  // Pagination is handled by the API, so we use the tickets directly
  const totalPages = Math.ceil(totalTickets / pageSize);
  const paginatedTickets = filteredAndSortedTickets; // Already paginated by API

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
  const handleSelectOne = (id: string, checked: boolean) => {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-4">
          <div className="flex gap-3 flex-wrap">
            <Skeleton className="h-10 flex-1 min-w-[200px]" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        {viewMode === 'table' ? (
          <TableSkeleton rows={10} cols={8} />
        ) : (
          <TicketCardSkeleton count={10} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-600 mt-1">
            {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'} found
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
            onClick={() => setCreateModalOpen(true)}
            className="btn btn-primary flex items-center gap-2 text-sm font-medium"
          >
            <Icon icon={faPlus} size="sm" />
            <span className="hidden sm:inline">Create Ticket</span>
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
              setPriorityFilter(e.target.value || '');
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
          >
            <option value="">All Priorities</option>
            {priorities.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => {
              setAssigneeFilter(e.target.value || '');
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

          {/* Saved Views */}
          <button
            onClick={() => setSavedViewsOpen(true)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Icon icon={faBookmark} size="sm" />
            Saved Views
          </button>
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
                  onChange={(e) => setSelectedAssignee(e.target.value || '')}
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
                  className="btn btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAssign}
                  disabled={!selectedAssignee}
                  className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="btn btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkStatus}
                  disabled={!selectedStatus}
                  className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        priorities={priorities}
        agents={agents}
        categories={availableCategories}
      />

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-white border border-gray-200 rounded-sm p-4 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-gray-700">
            {selectedIds.size} {selectedIds.size === 1 ? 'ticket' : 'tickets'} selected
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAssignModalOpen(true)}
              disabled={selectedIds.size === 0}
              className="px-3 py-2 text-sm border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
            >
              Assign
            </button>
            <button
              onClick={() => setStatusModalOpen(true)}
              disabled={selectedIds.size === 0}
              className="px-3 py-2 text-sm border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
            >
              Update Status
            </button>
            <button
              onClick={exportCsv}
              className="px-3 py-2 text-sm border border-gray-200 rounded-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
            >
              <Icon icon={faDownload} size="xs" />
              Export CSV
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
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
        <div className="bg-white border border-gray-200 rounded-sm p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalTickets)} of {totalTickets} tickets
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        : 'bg-white border-gray-300 hover:bg-gray-50'
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
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Create Ticket Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateTicket} className="bg-white rounded-sm border border-gray-200 w-full max-w-2xl max-h-[95vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Create New Ticket</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
              >
                <Icon icon={faTimes} className="text-gray-500" size="sm" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm ${
                      formErrors.subject ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter ticket subject"
                  />
                  {formErrors.subject && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requester Email
                  </label>
                  <input
                    type="email"
                    value={formData.requester_email}
                    onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm ${
                      formErrors.requester_email ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="requester@example.com"
                  />
                  {formErrors.requester_email && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.requester_email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requester Name
                  </label>
                  <input
                    type="text"
                    value={formData.requester_name}
                    onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requester Phone (+250) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-200 rounded-l-sm text-sm text-gray-700">
                      +250
                    </span>
                    <input
                      type="text"
                      value={phoneLocal}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setPhoneLocal(digits);
                      }}
                      onKeyDown={(e) => {
                        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
                        if (allowed.includes(e.key)) return;
                        if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                      }}
                      className={`flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-r-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm ${
                        formErrors.requester_phone ? 'border-red-500' : ''
                      }`}
                      placeholder="7XXXXXXXX"
                      maxLength={9}
                    />
                  </div>
                  {formErrors.requester_phone && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.requester_phone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Enter 9 digits after +250</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (District)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        setShowLocationList(true);
                      }}
                      onFocus={() => setShowLocationList(true)}
                      onBlur={() => setTimeout(() => setShowLocationList(false), 200)}
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm ${
                        formErrors.location ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Select location"
                    />
                    {showLocationList && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-sm max-h-40 overflow-y-auto">
                        {RW_DISTRICTS.filter(d => 
                          d.toLowerCase().includes((formData.location || '').toLowerCase())
                        ).map((district) => (
                          <div
                            key={district}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                            onMouseDown={() => {
                              setFormData({ ...formData, location: district });
                              setShowLocationList(false);
                            }}
                          >
                            {district}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {formErrors.location && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority_id}
                    onChange={(e) => setFormData({ ...formData, priority_id: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm ${
                      formErrors.priority_id ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select priority</option>
                    {priorities.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.priority_id && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.priority_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignee
                  </label>
                  <select
                    value={formData.assignee_id}
                    onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.first_name} {a.last_name} ({a.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categories Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Categories
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    className="p-1.5 hover:bg-gray-100 rounded-sm transition-colors text-gray-600"
                    title={showNewCategory ? 'Close' : 'Add category'}
                  >
                    <Icon icon={showNewCategory ? faTimes : faPlus} size="sm" />
                  </button>
                </div>
                {showNewCategory && (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                      placeholder="New category name"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-sm hover:bg-gray-200 text-sm text-gray-700"
                    >
                      Add
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-sm">
                  {availableCategories.map((category) => {
                    const checked = formData.category_ids.includes(category.id);
                    return (
                      <label
                        key={category.id}
                        className={`px-3 py-1.5 rounded-sm text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                          checked
                            ? 'text-white border border-primary-500'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                        style={checked ? { backgroundColor: '#0f36a5', borderColor: '#0f36a5' } : undefined}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const current = new Set(formData.category_ids);
                            if (current.has(category.id)) {
                              current.delete(category.id);
                            } else {
                              current.add(category.id);
                            }
                            setFormData({ ...formData, category_ids: Array.from(current) });
                          }}
                          className="sr-only"
                        />
                        <span>{category.name}</span>
                        {checked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const current = new Set(formData.category_ids);
                              current.delete(category.id);
                              setFormData({ ...formData, category_ids: Array.from(current) });
                            }}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                          >
                            <Icon icon={faTimes} size="xs" />
                          </button>
                        )}
                      </label>
                    );
                  })}
                  {availableCategories.length === 0 && (
                    <span className="text-sm text-gray-500 p-2">No categories available</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm min-h-[120px] resize-y"
                  placeholder="Describe the issue in detail..."
                />
              </div>

              {/* File Uploads */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                {uploadedFiles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">
                      {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-sm">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          {file.type === 'image' ? (
                            <img
                              src={file.url}
                              alt={`Preview ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-sm border border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-sm border border-gray-200 flex items-center justify-center">
                              <Icon 
                                icon={file.type === 'audio' ? faCheck : faCheck} 
                                className="text-gray-600" 
                                size="lg" 
                              />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(file.url)}
                            className="absolute -top-1 -right-1 bg-black/80 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon icon={faTimes} size="xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,audio/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={fileUploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`px-4 py-2 bg-gray-100 border border-gray-200 rounded-sm hover:bg-gray-200 cursor-pointer text-sm text-gray-700 transition-colors ${
                      fileUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {fileUploading ? 'Uploading...' : 'Choose Files'}
                  </label>
                  <span className="text-xs text-gray-500">
                    Images (5MB), Audio/Video (50MB)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || fileUploading}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Ticket'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
