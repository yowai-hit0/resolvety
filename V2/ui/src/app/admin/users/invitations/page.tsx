'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { mockInvitations, mockOrganizations } from '@/lib/mockData';
import { Invitation, InviteStatus, UserRole } from '@/types';
import Icon, { faPlus, faRefresh, faPaperPlane, faTimes, faCheckCircle, faSearch, faFilter } from '@/app/components/Icon';
import Pagination from '@/app/components/Pagination';
import { useToast } from '@/app/components/Toaster';
import { TableSkeleton, Skeleton } from '@/app/components/Skeleton';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const ROLE_OPTIONS: { value: UserRole | ''; label: string }[] = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'agent', label: 'Agent' },
];

const STATUS_OPTIONS: { value: InviteStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REVOKED', label: 'Revoked' },
  { value: 'EXPIRED', label: 'Expired' },
];

export default function AdminInvitationsPage() {
  const { show } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<InviteStatus | ''>('');
  
  // Form state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [organizationId, setOrganizationId] = useState<number | ''>('');

  const load = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setInvitations([...mockInvitations]);
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => load(), 10000); // every 10s
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  // Refresh when tab gains focus
  useEffect(() => {
    const onFocus = () => load();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  // Filter invitations
  const filteredInvitations = useMemo(() => {
    let filtered = [...invitations];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.email.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(inv => inv.role === roleFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(inv => {
        const expired = isExpired(inv.expires_at);
        const statusDisplay = expired && inv.status === 'PENDING' ? 'EXPIRED' : inv.status;
        return statusDisplay === statusFilter;
      });
    }

    return filtered;
  }, [invitations, search, roleFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredInvitations.length / pageSize);
  const paginatedInvitations = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredInvitations.slice(start, end);
  }, [filteredInvitations, page, pageSize]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      show('Email is required', 'error');
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newInvite: Invitation = {
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        email: email.trim().toLowerCase(),
        role: role,
        token: `token-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'PENDING',
        created_at: new Date().toISOString(),
      };
      
      setInvitations(prev => [newInvite, ...prev]);
      setEmail('');
      setRole('admin');
      setOrganizationId('');
      setOpenModal(false);
      setSubmitting(false);
      show('Invitation sent successfully', 'success');
    }, 500);
  };

  const handleResend = async (id: string) => {
    setActionId(id);
    
    // Simulate API call
    setTimeout(() => {
      setInvitations(prev => prev.map(inv => 
        inv.id === id 
          ? { ...inv, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'PENDING' as InviteStatus }
          : inv
      ));
      setActionId(null);
      show('Invitation resent successfully', 'success');
    }, 500);
  };

  const handleRevoke = async (id: string) => {
    const invitation = invitations.find(inv => inv.id === id);
    if (!invitation) return;
    
    if (!confirm(`Are you sure you want to revoke the invitation for ${invitation.email}?`)) return;
    
    setActionId(id);
    
    // Simulate API call
    setTimeout(() => {
      setInvitations(prev => prev.map(inv => 
        inv.id === id ? { ...inv, status: 'REVOKED' as InviteStatus } : inv
      ));
      setActionId(null);
      show('Invitation revoked successfully', 'success');
    }, 500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredInvitations.length} {filteredInvitations.length === 1 ? 'invitation' : 'invitations'} found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Icon icon={faRefresh} spin={loading} size="sm" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            Auto refresh
          </label>
          <button
            onClick={() => setOpenModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Icon icon={faPlus} size="sm" />
            Invite User
          </button>
        </div>
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
                placeholder="Search by email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | '');
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
          >
            {ROLE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as InviteStatus | '');
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
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

      {/* Invitations Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Accepted
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedInvitations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No invitations found. {search || roleFilter || statusFilter ? 'Try adjusting your filters.' : 'Send your first invite.'}
                  </td>
                </tr>
              ) : (
                paginatedInvitations.map((inv) => {
                  const expired = isExpired(inv.expires_at);
                  const statusDisplay = expired && inv.status === 'PENDING' ? 'EXPIRED' : inv.status;
                  
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {inv.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-sm text-xs font-medium capitalize">
                          {inv.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {statusDisplay === 'PENDING' ? (
                          <span className="px-2 py-1 bg-blue-100 border border-blue-200 rounded-sm text-blue-700 text-xs font-medium">
                            PENDING
                          </span>
                        ) : statusDisplay === 'ACCEPTED' ? (
                          <span className="px-2 py-1 bg-green-100 border border-green-200 rounded-sm text-green-700 text-xs font-medium flex items-center gap-1 w-fit">
                            <Icon icon={faCheckCircle} size="xs" />
                            ACCEPTED
                          </span>
                        ) : statusDisplay === 'REVOKED' ? (
                          <span className="px-2 py-1 bg-red-100 border border-red-200 rounded-sm text-red-700 text-xs font-medium">
                            REVOKED
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-sm text-gray-700 text-xs font-medium">
                            EXPIRED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(inv.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(inv.expires_at)}
                        {expired && inv.status === 'PENDING' && (
                          <span className="ml-2 text-xs text-red-600">(Expired)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {inv.accepted_at ? formatDate(inv.accepted_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {statusDisplay === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleResend(inv.id)}
                                disabled={actionId === inv.id}
                                className="px-3 py-1.5 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
                                title="Resend invitation"
                              >
                                <Icon icon={faPaperPlane} size="xs" />
                                {actionId === inv.id ? 'Resending...' : 'Resend'}
                              </button>
                              <button
                                onClick={() => handleRevoke(inv.id)}
                                disabled={actionId === inv.id}
                                className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-sm hover:bg-red-100 text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
                                title="Revoke invitation"
                              >
                                <Icon icon={faTimes} size="xs" />
                                {actionId === inv.id ? 'Revoking...' : 'Revoke'}
                              </button>
                            </>
                          )}
                          {statusDisplay === 'ACCEPTED' && (
                            <span className="text-xs text-gray-500">No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: pageSize }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-sm p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : paginatedInvitations.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No invitations found. {search || roleFilter || statusFilter ? 'Try adjusting your filters.' : 'Send your first invite.'}
            </div>
          ) : (
            paginatedInvitations.map((inv) => {
              const expired = isExpired(inv.expires_at);
              const statusDisplay = expired && inv.status === 'PENDING' ? 'EXPIRED' : inv.status;
              
              return (
                <div key={inv.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{inv.email}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-sm text-xs font-medium capitalize text-gray-700">
                          {inv.role.replace('_', ' ')}
                        </span>
                        {statusDisplay === 'PENDING' ? (
                          <span className="px-2 py-0.5 bg-blue-100 border border-blue-200 rounded-sm text-blue-700 text-xs font-medium">
                            PENDING
                          </span>
                        ) : statusDisplay === 'ACCEPTED' ? (
                          <span className="px-2 py-0.5 bg-green-100 border border-green-200 rounded-sm text-green-700 text-xs font-medium flex items-center gap-1 w-fit">
                            <Icon icon={faCheckCircle} size="xs" />
                            ACCEPTED
                          </span>
                        ) : statusDisplay === 'REVOKED' ? (
                          <span className="px-2 py-0.5 bg-red-100 border border-red-200 rounded-sm text-red-700 text-xs font-medium">
                            REVOKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-sm text-gray-700 text-xs font-medium">
                            EXPIRED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Created: {formatDate(inv.created_at)}</div>
                    <div>Expires: {formatDate(inv.expires_at)} {expired && inv.status === 'PENDING' && <span className="text-red-600">(Expired)</span>}</div>
                    {inv.accepted_at && <div>Accepted: {formatDate(inv.accepted_at)}</div>}
                  </div>
                  {statusDisplay === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleResend(inv.id)}
                        disabled={actionId === inv.id}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1"
                      >
                        <Icon icon={faPaperPlane} size="xs" />
                        {actionId === inv.id ? 'Resending...' : 'Resend'}
                      </button>
                      <button
                        onClick={() => handleRevoke(inv.id)}
                        disabled={actionId === inv.id}
                        className="flex-1 px-3 py-2 bg-red-50 border border-red-200 rounded-sm hover:bg-red-100 text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1"
                      >
                        <Icon icon={faTimes} size="xs" />
                        {actionId === inv.id ? 'Revoking...' : 'Revoke'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredInvitations.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}

      {/* Create Invite Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpenModal(false)}>
          <div className="bg-white rounded-sm border border-gray-200 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Invite User</h2>
              <button
                onClick={() => setOpenModal(false)}
                className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
                aria-label="Close modal"
              >
                <Icon icon={faTimes} size="sm" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  >
                    {ROLE_OPTIONS.filter(opt => opt.value).map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization (Optional)
                  </label>
                  <select
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  >
                    <option value="">No Organization</option>
                    {mockOrganizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Assign user to an organization (optional)</p>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    disabled={submitting}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !email.trim()}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icon icon={faPaperPlane} size="sm" />
                        Send Invite
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

