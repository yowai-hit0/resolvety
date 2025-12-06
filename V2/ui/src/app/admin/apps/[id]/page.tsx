'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { App, AppApiKey, AppIpWhitelist } from '@/types';
import { AppsAPI } from '@/lib/api';
import Icon, { 
  faPlug, 
  faEdit, 
  faTrash, 
  faPlus, 
  faTimes, 
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
  faKey,
  faServer,
  faClipboard,
  faEye,
  faEyeSlash,
} from '@/app/components/Icon';
import { useToast } from '@/app/components/Toaster';
import { DetailPageSkeleton } from '@/app/components/Skeleton';

export default function AppDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { show } = useToast();
  const appId = params?.id as string | undefined;
  
  const [app, setApp] = useState<App | null>(null);
  const [apiKeys, setApiKeys] = useState<AppApiKey[]>([]);
  const [ipWhitelist, setIpWhitelist] = useState<AppIpWhitelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [showAddIpModal, setShowAddIpModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [keySearch, setKeySearch] = useState('');
  const [ipSearch, setIpSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [keyFormData, setKeyFormData] = useState({
    name: '',
    expires_at: '',
  });
  const [ipFormData, setIpFormData] = useState({
    ip_address: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!appId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch app details (includes API keys and IP whitelist)
        const appData = await AppsAPI.get(appId);
        setApp(appData);
        setFormData({
          name: appData.name,
          description: appData.description || '',
          is_active: appData.is_active,
        });
        
        // Extract API keys and IP whitelist from response
        setApiKeys(appData.api_keys || []);
        setIpWhitelist(appData.ip_whitelist || []);
      } catch (error: any) {
        show(error?.response?.data?.message || 'Failed to fetch app details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appId, show]);

  // Filter API keys
  const filteredApiKeys = useMemo(() => {
    let filtered = [...apiKeys];

    if (keySearch.trim()) {
      const searchLower = keySearch.toLowerCase();
      filtered = filtered.filter(key =>
        key.key_prefix.toLowerCase().includes(searchLower) ||
        key.name?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [apiKeys, keySearch]);

  // Filter IP whitelist
  const filteredIpWhitelist = useMemo(() => {
    let filtered = [...ipWhitelist];

    if (ipSearch.trim()) {
      const searchLower = ipSearch.toLowerCase();
      filtered = filtered.filter(ip =>
        ip.ip_address.toLowerCase().includes(searchLower) ||
        ip.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [ipWhitelist, ipSearch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveEdit = async () => {
    if (!formData.name.trim()) {
      show('App name is required', 'error');
      return;
    }

    if (!app) return;

    try {
      const updatedApp = await AppsAPI.update(app.id, {
        name: formData.name,
        description: formData.description || undefined,
        is_active: formData.is_active,
      });
      
      setApp(updatedApp);
      setShowEditModal(false);
      show('App updated successfully', 'success');
    } catch (error: any) {
      show(error?.response?.data?.message || 'Failed to update app', 'error');
    }
  };

  const handleDelete = async () => {
    if (!app) return;

    try {
      await AppsAPI.delete(app.id);
      router.push('/admin/apps');
      show('App deleted successfully', 'success');
    } catch (error: any) {
      show(error?.response?.data?.message || 'Failed to delete app', 'error');
    }
  };

  const handleCreateApiKey = async () => {
    if (!app) return;

    try {
      const result = await AppsAPI.createApiKey(app.id, {
        name: keyFormData.name || undefined,
        expires_at: keyFormData.expires_at || undefined,
      });
      
      // Show the key (only shown once)
      setNewApiKey(result.api_key || '');
      setShowCreateKeyModal(false);
      setShowKeyModal(true);
      setKeyFormData({ name: '', expires_at: '' });
      
      // Refresh API keys list
      const keys = await AppsAPI.getApiKeys(app.id);
      setApiKeys(keys);
      
      show('API key created successfully. Copy it now - it won\'t be shown again!', 'success');
    } catch (error: any) {
      show(error?.response?.data?.message || 'Failed to create API key', 'error');
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!app) return;

    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await AppsAPI.revokeApiKey(app.id, keyId);
      
      // Refresh API keys list
      const keys = await AppsAPI.getApiKeys(app.id);
      setApiKeys(keys);
      
      show('API key revoked successfully', 'success');
    } catch (error: any) {
      show(error?.response?.data?.message || 'Failed to revoke API key', 'error');
    }
  };

  const handleAddIp = async () => {
    if (!ipFormData.ip_address.trim()) {
      show('IP address is required', 'error');
      return;
    }

    if (!app) return;

    try {
      await AppsAPI.addIpToWhitelist(app.id, {
        ip_address: ipFormData.ip_address,
        description: ipFormData.description || undefined,
      });
      
      // Refresh IP whitelist
      const ips = await AppsAPI.getIpWhitelist(app.id);
      setIpWhitelist(ips);
      
      setShowAddIpModal(false);
      setIpFormData({ ip_address: '', description: '' });
      show('IP address added to whitelist successfully', 'success');
    } catch (error: any) {
      show(error?.response?.data?.message || 'Failed to add IP address', 'error');
    }
  };

  const handleRemoveIp = async (ipId: string) => {
    if (!app) return;

    if (!confirm('Are you sure you want to remove this IP address from the whitelist?')) {
      return;
    }

    try {
      await AppsAPI.removeIpFromWhitelist(app.id, ipId);
      
      // Refresh IP whitelist
      const ips = await AppsAPI.getIpWhitelist(app.id);
      setIpWhitelist(ips);
      
      show('IP address removed from whitelist successfully', 'success');
    } catch (error: any) {
      show(error?.response?.data?.message || 'Failed to remove IP address', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    show('Copied to clipboard!', 'success');
  };

  if (loading) {
    return <DetailPageSkeleton showHeader />;
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">App not found</p>
        <button
          onClick={() => router.push('/admin/apps')}
          className="btn btn-primary"
        >
          Back to Apps
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/apps')}
            className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <Icon icon={faArrowLeft} className="text-gray-600" size="sm" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
            <p className="text-sm text-gray-600 mt-1">App Integration Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Icon icon={faEdit} size="sm" />
            Edit App
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger flex items-center gap-2"
          >
            <Icon icon={faTrash} size="sm" />
            Delete
          </button>
        </div>
      </div>

      {/* App Info Card */}
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">App Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
            <p className="mt-1 text-sm text-gray-900">{app.name}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</label>
            <p className="mt-1 text-sm text-gray-900">{app.organization?.name || '-'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
            <p className="mt-1 text-sm text-gray-900">{app.description || '-'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
            <div className="mt-1">
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
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(app.created_at)}</p>
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icon icon={faKey} className="text-gray-600" size="sm" />
              API Keys ({apiKeys.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">Manage API keys for this app</p>
          </div>
          <button
            onClick={() => setShowCreateKeyModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Icon icon={faPlus} size="sm" />
            Generate API Key
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Icon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="sm" />
            <input
              type="text"
              placeholder="Search API keys..."
              value={keySearch}
              onChange={(e) => setKeySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {/* API Keys Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Key Prefix
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApiKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No API keys found
                  </td>
                </tr>
              ) : (
                filteredApiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{key.key_prefix}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{key.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {key.last_used_at ? formatDate(key.last_used_at) : 'Never'}
                      </div>
                      {key.last_used_ip && (
                        <div className="text-xs text-gray-500">{key.last_used_ip}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {key.expires_at ? formatDate(key.expires_at) : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {key.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Icon icon={faCheckCircle} size="xs" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Icon icon={faTimesCircle} size="xs" />
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {key.is_active && (
                        <button
                          onClick={() => handleRevokeApiKey(key.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Revoke Key"
                        >
                          <Icon icon={faTrash} size="sm" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IP Whitelist Section */}
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icon icon={faServer} className="text-gray-600" size="sm" />
              IP Whitelist ({ipWhitelist.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">Manage IP addresses allowed to access this app</p>
          </div>
          <button
            onClick={() => setShowAddIpModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Icon icon={faPlus} size="sm" />
            Add IP Address
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Icon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="sm" />
            <input
              type="text"
              placeholder="Search IP addresses..."
              value={ipSearch}
              onChange={(e) => setIpSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {/* IP Whitelist Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  IP Address / CIDR
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
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
              {filteredIpWhitelist.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No IP addresses in whitelist
                  </td>
                </tr>
              ) : (
                filteredIpWhitelist.map((ip) => (
                  <tr key={ip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{ip.ip_address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{ip.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ip.is_active ? (
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
                      {formatDate(ip.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRemoveIp(ip.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove IP"
                      >
                        <Icon icon={faTrash} size="sm" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                onClick={() => setShowEditModal(false)}
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
                Are you sure you want to delete <strong>{app.name}</strong>? This will also delete all associated API keys and IP whitelist entries. This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Generate API Key</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Name (Optional)
                </label>
                <input
                  type="text"
                  value={keyFormData.name}
                  onChange={(e) => setKeyFormData({ ...keyFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="My API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={keyFormData.expires_at}
                  onChange={(e) => setKeyFormData({ ...keyFormData, expires_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateKeyModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApiKey}
                className="btn btn-primary"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">API Key Generated</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                <strong className="text-red-600">Important:</strong> Copy this API key now. It will not be shown again!
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 mb-4">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono text-gray-900 break-all">{newApiKey}</code>
                  <button
                    onClick={() => copyToClipboard(newApiKey)}
                    className="flex-shrink-0 p-2 text-gray-600 hover:text-primary-500 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Icon icon={faClipboard} size="sm" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setNewApiKey('');
                }}
                className="btn btn-primary"
              >
                I've Copied It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add IP Modal */}
      {showAddIpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add IP Address</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Address / CIDR <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ipFormData.ip_address}
                  onChange={(e) => setIpFormData({ ...ipFormData, ip_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="192.168.1.1 or 192.168.1.0/24"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a single IP address (e.g., 192.168.1.1) or CIDR range (e.g., 192.168.1.0/24)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={ipFormData.description}
                  onChange={(e) => setIpFormData({ ...ipFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Production server"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddIpModal(false);
                  setIpFormData({ ip_address: '', description: '' });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIp}
                className="btn btn-primary"
              >
                Add IP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

