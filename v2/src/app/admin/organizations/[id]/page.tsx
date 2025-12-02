'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockOrganizations, mockUsers } from '@/lib/mockData';
import { Organization, User } from '@/types';
import Icon, { 
  faBuilding, 
  faUsers, 
  faEdit, 
  faTrash, 
  faPlus, 
  faTimes, 
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
} from '@/app/components/Icon';
import { useToast } from '@/app/components/Toaster';
import Pagination from '@/app/components/Pagination';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { show } = useToast();
  const orgId = params?.id ? parseInt(params.id as string) : null;
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    email: '',
    phone: '',
    address: '',
    is_active: true,
  });

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      const foundOrg = mockOrganizations.find(o => o.id === orgId);
      if (foundOrg) {
        setOrganization(foundOrg);
        setFormData({
          name: foundOrg.name,
          domain: foundOrg.domain || '',
          email: foundOrg.email || '',
          phone: foundOrg.phone || '',
          address: foundOrg.address || '',
          is_active: foundOrg.is_active,
        });
        
        // Get users for this organization
        const orgUsers = mockUsers.filter(u => u.organization_id === orgId);
        setUsers(orgUsers);
      }
      setLoading(false);
    }, 300);
  }, [orgId]);

  // Filter users in organization
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [users, search]);

  // Filter available users to add
  const availableUsers = useMemo(() => {
    let filtered = allUsers.filter(u => !u.organization_id || u.organization_id !== orgId);

    if (userSearch.trim()) {
      const searchLower = userSearch.toLowerCase();
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [allUsers, orgId, userSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, page, pageSize]);

  const handleSaveEdit = () => {
    if (!formData.name.trim()) {
      show('Organization name is required', 'error');
      return;
    }

    if (!organization) return;

    setOrganization({
      ...organization,
      ...formData,
      updated_at: new Date().toISOString(),
    });
    setShowEditModal(false);
    show('Organization updated successfully', 'success');
  };

  const handleAddUser = (user: User) => {
    if (!orgId) return;
    setUsers([...users, { ...user, organization_id: orgId }]);
    setAllUsers(allUsers.map(u => 
      u.id === user.id ? { ...u, organization_id: orgId } : u
    ));
    setShowAddUserModal(false);
    setUserSearch('');
    show(`User ${user.first_name} ${user.last_name} added to organization`, 'success');
  };

  const handleRemoveUser = (user: User) => {
    setUsers(users.filter(u => u.id !== user.id));
    setAllUsers(allUsers.map(u => 
      u.id === user.id ? { ...u, organization_id: undefined as number | undefined } : u
    ));
    show(`User ${user.first_name} ${user.last_name} removed from organization`, 'success');
  };

  const handleDelete = () => {
    if (!organization) return;
    router.push('/admin/organizations');
    show('Organization deleted successfully', 'success');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Organization not found</p>
        <button
          onClick={() => router.push('/admin/organizations')}
          className="btn btn-primary"
        >
          Back to Organizations
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
            onClick={() => router.push('/admin/organizations')}
            className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <Icon icon={faArrowLeft} className="text-gray-600" size="sm" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Organization Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Icon icon={faEdit} size="sm" />
            Edit Organization
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

      {/* Organization Info Card */}
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Organization Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
            <p className="mt-1 text-sm text-gray-900">{organization.name}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</label>
            <p className="mt-1 text-sm text-gray-900">{organization.domain || '-'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
            <p className="mt-1 text-sm text-gray-900">{organization.email || '-'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
            <p className="mt-1 text-sm text-gray-900">{organization.phone || '-'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</label>
            <p className="mt-1 text-sm text-gray-900">{organization.address || '-'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
            <div className="mt-1">
              {organization.is_active ? (
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
            <p className="mt-1 text-sm text-gray-900">{formatDate(organization.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icon icon={faUsers} className="text-gray-600" size="sm" />
              Users ({users.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">Manage users in this organization</p>
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Icon icon={faPlus} size="sm" />
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Icon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="sm" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No users in this organization
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRemoveUser(user)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove from organization"
                      >
                        <Icon icon={faTimes} size="sm" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
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
                onClick={() => setShowEditModal(false)}
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

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-gray-200 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add User to Organization</h2>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setUserSearch('');
                }}
                className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
              >
                <Icon icon={faTimes} size="sm" />
              </button>
            </div>
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Icon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="sm" />
                <input
                  type="text"
                  placeholder="Search users to add..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {availableUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {userSearch ? 'No users found' : 'All users are already in this organization'}
                </div>
              ) : (
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-sm hover:bg-gray-50"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddUser(user)}
                        className="btn btn-primary btn-sm"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-gray-200 w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Delete Organization</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <strong>{organization.name}</strong>? This action cannot be undone.
              </p>
              {users.length > 0 && (
                <p className="text-sm text-yellow-600 mb-4">
                  ⚠️ This organization has {users.length} user(s). They will be removed from the organization.
                </p>
              )}
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
    </div>
  );
}

