'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { mockUsers, mockTickets } from '@/lib/mockData';
import { User } from '@/types';
import Icon, { faArrowLeft, faCheck, faTimes } from '@/app/components/Icon';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id ? parseInt(params.id as string) : null;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      const foundUser = mockUsers.find(u => u.id === userId);
      setUser(foundUser || null);
      setLoading(false);
    }, 300);
  }, [userId]);

  const handleToggleStatus = async () => {
    if (!user) return;
    
    setSaving(true);
    
    // Mock API call
    setTimeout(() => {
      setUser(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
      setSaving(false);
    }, 300);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get user statistics
  const userStats = user ? {
    totalTickets: mockTickets.filter(t => t.created_by_id === user.id || t.assignee_id === user.id).length,
    assignedTickets: mockTickets.filter(t => t.assignee_id === user.id).length,
    createdTickets: mockTickets.filter(t => t.created_by_id === user.id).length,
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500">
          <Icon icon={faArrowLeft} size="sm" />
          Back to Users
        </Link>
        <div className="bg-white rounded-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500">
            <Icon icon={faArrowLeft} size="sm" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleToggleStatus}
          disabled={saving}
          className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
            user.is_active
              ? 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
              : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
          }`}
        >
          <Icon icon={user.is_active ? faTimes : faCheck} size="sm" />
          {saving ? 'Updating...' : user.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="bg-white rounded-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">User Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="text-sm text-gray-900">{user.first_name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="text-sm text-gray-900">{user.last_name}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="text-sm text-gray-900">{user.email}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="text-sm text-gray-900">
                  <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-sm text-xs">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="text-sm">
                  {user.is_active ? (
                    <span className="px-2 py-1 bg-green-100 border border-green-200 rounded-sm text-green-700 text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 border border-red-200 rounded-sm text-red-700 text-xs">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <div className="text-sm text-gray-600">{formatDate(user.created_at)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <div className="text-sm text-gray-600">{formatDate(user.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="bg-white rounded-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Statistics</h2>
          </div>
          <div className="p-6 space-y-4">
            {userStats ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Tickets</label>
                  <div className="text-2xl font-bold text-gray-900">{userStats.totalTickets}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {userStats.createdTickets} created, {userStats.assignedTickets} assigned
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created Tickets</label>
                  <div className="text-2xl font-bold text-gray-900">{userStats.createdTickets}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Tickets</label>
                  <div className="text-2xl font-bold text-gray-900">{userStats.assignedTickets}</div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No statistics available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

