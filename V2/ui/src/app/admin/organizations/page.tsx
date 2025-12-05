'use client';

import { useState, useMemo, useEffect } from 'react';
import { mockOrganizations } from '@/lib/mockData';
import { Organization } from '@/types';
import Icon, { faSearch, faPlus, faEdit, faTrash, faBuilding, faCheckCircle, faTimesCircle, faEye } from '@/app/components/Icon';
import Pagination from '@/app/components/Pagination';
import { useToast } from '@/app/components/Toaster';
import { TableSkeleton, Skeleton } from '@/app/components/Skeleton';

export default function AdminOrganizationsPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    email: '',
    phone: '',
    address: '',
    is_active: true,
  });
  const [organizations, setOrganizations] = useState(mockOrganizations);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter organizations
  const filteredOrganizations = useMemo(() => {
    let filtered = [...organizations];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchLower) ||
        org.domain?.toLowerCase().includes(searchLower) ||
        org.email?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [organizations, search]);

  // Pagination
  const totalPages = Math.ceil(filteredOrganizations.length / pageSize);
  const paginatedOrganizations = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredOrganizations.slice(start, end);
  }, [filteredOrganizations, page, pageSize]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <TableSkeleton rows={10} cols={6} />
      </div>
    );
  }

  const handleCreate = () => {
    setFormData({
      name: '',
      domain: '',
      email: '',
      phone: '',
      address: '',
      is_active: true,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      domain: org.domain || '',
      email: org.email || '',
      phone: org.phone || '',
      address: org.address || '',
      is_active: org.is_active,
    });
    setShowEditModal(true);
  };

  const handleDelete = (org: Organization) => {
    setSelectedOrg(org);
    setShowDeleteModal(true);
  };

  const handleSaveCreate = () => {
    if (!formData.name.trim()) {
      show('Organization name is required', 'error');
      return;
    }

    const newOrg: Organization = {
      id: organizations.length + 1,
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users_count: 0,
      tickets_count: 0,
    };

    setOrganizations([...organizations, newOrg]);
    setShowCreateModal(false);
    show('Organization created successfully', 'success');
  };

  const handleSaveEdit = () => {
    if (!formData.name.trim()) {
      show('Organization name is required', 'error');
      return;
    }

    if (!selectedOrg) return;

    setOrganizations(organizations.map(org =>
      org.id === selectedOrg.id
        ? { ...org, ...formData, updated_at: new Date().toISOString() }
        : org
    ));
    setShowEditModal(false);
    setSelectedOrg(null);
    show('Organization updated successfully', 'success');
  };

  const handleConfirmDelete = () => {
    if (!selectedOrg) return;

    setOrganizations(organizations.filter(org => org.id !== selectedOrg.id));
    setShowDeleteModal(false);
    setSelectedOrg(null);
    show('Organization deleted successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredOrganizations.length} {filteredOrganizations.length === 1 ? 'organization' : 'organizations'} found
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Icon icon={faPlus} size="sm" />
          Create Organization
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
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon icon={faBuilding} className="text-primary-500" size="sm" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        {org.address && (
                          <div className="text-xs text-gray-500">{org.address}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{org.domain || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{org.email || '-'}</div>
                    {org.phone && (
                      <div className="text-xs text-gray-500">{org.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{org.users_count || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{org.tickets_count || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Icon icon={faCheckCircle} size="xs" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Icon icon={faTimesCircle} size="xs" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(org.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/admin/organizations/${org.id}`}
                        className="text-primary-500 hover:text-primary-700 transition-colors"
                        title="View Details & Manage Users"
                      >
                        <Icon icon={faEye} size="sm" />
                      </a>
                      <button
                        onClick={() => handleEdit(org)}
                        className="text-primary-500 hover:text-primary-700 transition-colors"
                        title="Edit"
                      >
                        <Icon icon={faEdit} size="sm" />
                      </button>
                      <button
                        onClick={() => handleDelete(org)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <Icon icon={faTrash} size="sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {paginatedOrganizations.map((org) => (
            <div key={org.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon={faBuilding} className="text-primary-500" size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{org.name}</div>
                    {org.domain && (
                      <div className="text-xs text-gray-500 truncate">{org.domain}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(org)}
                    className="text-primary-500 hover:text-primary-700 transition-colors"
                  >
                    <Icon icon={faEdit} size="sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(org)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Icon icon={faTrash} size="sm" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Email:</span> {org.email || '-'}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {org.phone || '-'}
                </div>
                <div>
                  <span className="font-medium">Users:</span> {org.users_count || 0}
                </div>
                <div>
                  <span className="font-medium">Tickets:</span> {org.tickets_count || 0}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <a
                    href={`/admin/organizations/${org.id}`}
                    className="text-primary-500 hover:text-primary-700 transition-colors"
                    title="View Details & Manage Users"
                  >
                    <Icon icon={faEye} size="xs" />
                  </a>
                  <button
                    onClick={() => handleEdit(org)}
                    className="text-primary-500 hover:text-primary-700 transition-colors"
                  >
                    <Icon icon={faEdit} size="xs" />
                  </button>
                  <button
                    onClick={() => handleDelete(org)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Icon icon={faTrash} size="xs" />
                  </button>
                </div>
                {org.is_active ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Icon icon={faCheckCircle} size="xs" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Icon icon={faTimesCircle} size="xs" />
                    Inactive
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-500">{formatDate(org.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredOrganizations.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-gray-200 w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create Organization</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  placeholder="example.rw"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  placeholder="contact@example.rw"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  placeholder="+250788123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  placeholder="Kigali, Rwanda"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active_create"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_active_create" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCreate}
                className="btn btn-primary"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-gray-200 w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Organization</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active_edit"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_active_edit" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedOrg(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-gray-200 w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Delete Organization</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <strong>{selectedOrg.name}</strong>? This action cannot be undone.
              </p>
              {selectedOrg.users_count && selectedOrg.users_count > 0 && (
                <p className="text-sm text-yellow-600 mb-4">
                  ⚠️ This organization has {selectedOrg.users_count} user(s) and {selectedOrg.tickets_count || 0} ticket(s).
                </p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedOrg(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

