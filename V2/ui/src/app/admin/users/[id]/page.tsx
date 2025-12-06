'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UsersAPI, TicketsAPI } from '@/lib/api';
import { User } from '@/types';
import Icon, { faArrowLeft, faCheck, faTimes } from '@/app/components/Icon';
import { DetailPageSkeleton } from '@/app/components/Skeleton';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id as string | undefined;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userStats, setUserStats] = useState<{
    totalTickets: number;
    assignedTickets: number;
    createdTickets: number;
  } | null>(null);

  // Fetch user data
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await UsersAPI.get(userId);
        setUser(userData);

        // Fetch user statistics
        try {
          const [createdTickets, assignedTickets] = await Promise.all([
            TicketsAPI.list({ created_by: userId, take: 1 }).then(r => r.total || 0),
            TicketsAPI.list({ assignee: userId, take: 1 }).then(r => r.total || 0),
          ]);
          
          setUserStats({
            totalTickets: createdTickets + assignedTickets,
            createdTickets,
            assignedTickets,
          });
        } catch (error) {
          console.error('Failed to fetch user statistics:', error);
          setUserStats({ totalTickets: 0, createdTickets: 0, assignedTickets: 0 });
        }
      } catch (error: any) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleToggleStatus = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await UsersAPI.updateStatus(user.id, { is_active: !user.is_active });
      setUser(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status. Please try again.');
    } finally {
      setSaving(false);
    }
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


  if (loading) {
    return <DetailPageSkeleton showHeader showStats />;
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

            {/* Organizations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organizations</label>
              {user.user_organizations && user.user_organizations.length > 0 ? (
                <div className="space-y-2">
                  {user.user_organizations.map((uo) => (
                    <div key={uo.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{uo.organization?.name || 'Unknown'}</span>
                        {uo.is_primary && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-sm font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : user.organization ? (
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-sm">
                  <span className="text-sm text-gray-900">{user.organization.name}</span>
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-sm font-medium">
                    Legacy
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No organizations assigned</p>
              )}
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

