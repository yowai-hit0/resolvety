'use client';

import { useState, useMemo, useEffect } from 'react';
import { App, Organization } from '@/types';
import Icon, { faSearch, faPlus, faEdit, faTrash, faPlug, faCheckCircle, faTimesCircle, faEye, faKey, faServer } from '@/app/components/Icon';
import Pagination from '@/app/components/Pagination';
import { useToast } from '@/app/components/Toaster';
import { TableSkeleton, Skeleton } from '@/app/components/Skeleton';
import { AppsAPI, OrganizationsAPI } from '@/lib/api';

export default function AdminAppsPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organization_id: '',
    is_active: true,
  });
  const [apps, setApps] = useState<App[]>([]);
  const [totalApps, setTotalApps] = useState(0);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch organizations for dropdown
        const orgsResponse = await OrganizationsAPI.list({ take: 1000 });
        const orgs = Array.isArray(orgsResponse) ? orgsResponse : (orgsResponse.data || []);
        setOrganizations(orgs);
        
        // Fetch apps
        const skip = (page - 1) * pageSize;
        const response = await AppsAPI.list({ skip, take: pageSize });
        
        // Handle both array response and object with data property
        const appsList = Array.isArray(response) ? response : (response.data || []);
        const total = response.total || response.count || appsList.length;
        
        setApps(appsList);
        setTotalApps(total);
      } catch (error: any) {
        show(error?.response?.data?.message || 'Failed to fetch apps', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize, show]);

  // Filter apps
  const filteredApps = useMemo(() => {
    let filtered = [...apps];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchLower) ||
        app.description?.toLowerCase().includes(searchLower) ||
        app.organization?.name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [apps, search]);

  // Pagination - use server-side pagination
  const totalPages = Math.ceil(totalApps / pageSize);
  const paginatedApps = filteredApps;

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
      description: '',
      organization_id: organizations[0]?.id || '',
      is_active: true,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (app: App) => {
    setSelectedApp(app);
    setFormData({
      name: app.name,
      description: app.description || '',
      organization_id: app.organization_id,
      is_active: app.is_active,
    });
    setShowEditModal(true);
  };

  const handleDelete = (app: App) => {
    setSelectedApp(app);
    setShowDeleteModal(true);
  };

  const handleSaveCreate = async () => {
    if (!formData.name.trim()) {
      show('App name is required', 'error');
      return;
    }

    if (!formData.organization_id) {
      show('Organization is required', 'error');
      return;
    }

    try {
      await AppsAPI.create({
        name: formData.name,
        description: formData.description || undefined,
        organization_id: formData.organization_id,
      });

      // Refresh the list
      const skip = (page - 1) * pageSize;
      const response = await AppsAPI.list({ skip, take: pageSize });
      const appsList = Array.isArray(response) ? response : (response.data || []);
      const total = response.total || response.count || appsList.length;
      
      setApps(appsList);
      setTotalApps(total);
      setShowCreateModal(false);
      show('App created successfully', 'success');
    } catch (error: any) {
      show(error?.response?.data?.message || 'Failed to create app', 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.name.trim()) {
      show('App name is required', 'error');
      return;
    }

    if (!selectedApp) return;

    try {
      await AppsAPI.update(selectedApp.id, {
        name: formData.name,
        description: formData.description || undefined,
        is_active: formData.is_active,
      });

      // Refresh the list
      const skip = (page - 1) * pageSize;
      const response = await AppsAPI.list({ skip, take: pageSize });
      const appsList = Array.isArray(response) ? response : (response.data || []);
      const total = response.total || response.count || appsList.length;
      
      setApps(appsList);
      setTotalApps(total);
      setShowEditModal(false);
      setSelectedApp(null);
      show('App updated successfully', 'success');
    } catch (error: any) {
      show(error?.response?.data?.message || 'Failed to update app', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedApp) return;

    try {
      await AppsAPI.delete(selectedApp.id);

      // Refresh the list
      const skip = (page - 1) * pageSize;
      const response = await AppsAPI.list({ skip, take: pageSize });
      const appsList = Array.isArray(response) ? response : (response.data || []);
      const total = response.total || response.count || appsList.length;
      
      setApps(appsList);
      setTotalApps(total);
      setShowDeleteModal(false);
      setSelectedApp(null);
      show('App deleted successfully', 'success');
    } catch (error: any) {
      show(error?.response?.data?.message || 'Failed to delete app', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apps</h1>
          <p className="text-sm text-gray-600 mt-1">
            {totalApps} {totalApps === 1 ? 'app' : 'apps'} found
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Icon icon={faPlus} size="sm" />
          Create App
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
                placeholder="Search apps..."
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

      {/* Apps Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  App
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  API Keys
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  IP Whitelist
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
              {paginatedApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon icon={faPlug} className="text-primary-500" size="sm" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                        {app.description && (
                          <div className="text-xs text-gray-500">{app.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.organization?.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app._count?.api_keys || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app._count?.ip_whitelist || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.is_active ? (
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
                    {formatDate(app.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/admin/apps/${app.id}`}
                        className="text-primary-500 hover:text-primary-700 transition-colors"
                        title="View Details & Manage API Keys"
                      >
                        <Icon icon={faEye} size="sm" />
                      </a>
                      <button
                        onClick={() => handleEdit(app)}
                        className="text-primary-500 hover:text-primary-700 transition-colors"
                        title="Edit"
                      >
                        <Icon icon={faEdit} size="sm" />
                      </button>
                      <button
                        onClick={() => handleDelete(app)}
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
          {paginatedApps.map((app) => (
            <div key={app.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon={faPlug} className="text-primary-500" size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{app.name}</div>
                    {app.description && (
                      <div className="text-xs text-gray-500 truncate">{app.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(app)}
                    className="text-primary-500 hover:text-primary-700 transition-colors"
                  >
                    <Icon icon={faEdit} size="sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(app)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Icon icon={faTrash} size="sm" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Organization:</span> {app.organization?.name || '-'}
                </div>
                <div>
                  <span className="font-medium">API Keys:</span> {app._count?.api_keys || 0}
                </div>
                <div>
                  <span className="font-medium">IP Whitelist:</span> {app._count?.ip_whitelist || 0}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <a
                    href={`/admin/apps/${app.id}`}
                    className="text-primary-500 hover:text-primary-700 transition-colors"
                    title="View Details & Manage API Keys"
                  >
                    <Icon icon={faEye} size="xs" />
                  </a>
                  <button
                    onClick={() => handleEdit(app)}
                    className="text-primary-500 hover:text-primary-700 transition-colors"
                  >
                    <Icon icon={faEdit} size="xs" />
                  </button>
                  <button
                    onClick={() => handleDelete(app)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Icon icon={faTrash} size="xs" />
                  </button>
                </div>
                {app.is_active ? (
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
                <span className="text-xs text-gray-500">{formatDate(app.created_at)}</span>
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
          totalItems={totalApps}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create App</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="My Integration App"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="App description..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.organization_id}
                  onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
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
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit App</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedApp(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Delete App</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{selectedApp?.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedApp(null);
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

