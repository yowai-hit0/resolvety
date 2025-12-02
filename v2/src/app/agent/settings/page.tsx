'use client';

import { useState, useEffect } from 'react';
import Icon, { 
  faCog, 
  faUser,
  faBell,
  faTicketAlt,
  faSave,
  faLock,
} from '@/app/components/Icon';
import { useToast } from '@/app/components/Toaster';

interface AgentSettingsData {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  preferences: {
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    defaultPriority: string;
    autoAcceptTickets: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    ticketAssigned: boolean;
    ticketStatusChanged: boolean;
    newComment: boolean;
    mentionNotifications: boolean;
  };
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}

const defaultSettings: AgentSettingsData = {
  profile: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  preferences: {
    timezone: 'Africa/Kigali',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    defaultPriority: 'Medium',
    autoAcceptTickets: false,
  },
  notifications: {
    emailNotifications: true,
    ticketAssigned: true,
    ticketStatusChanged: true,
    newComment: true,
    mentionNotifications: true,
  },
  security: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
};

export default function AgentSettingsPage() {
  const { show } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState<AgentSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    // Get user info from session
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('resolveitAuth');
      if (auth) {
        try {
          const user = JSON.parse(auth);
          setUserInfo({
            name: user.name || '',
            email: user.email || '',
          });
          
          // Set initial profile data
          if (user.name) {
            const nameParts = user.name.split(' ');
            setSettings(prev => ({
              ...prev,
              profile: {
                ...prev.profile,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email || '',
              },
            }));
          }
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }
    }

    // Load settings (mock - in real app, fetch from API)
    setLoading(true);
    setTimeout(() => {
      const savedSettings = localStorage.getItem('resolveitAgentSettings');
      if (savedSettings) {
        try {
          const saved = JSON.parse(savedSettings);
          setSettings(prev => ({
            ...prev,
            ...saved,
            security: defaultSettings.security, // Don't load password fields
          }));
        } catch (e) {
          console.error('Error loading settings:', e);
        }
      }
      setLoading(false);
    }, 300);
  }, []);

  const handleChange = (section: keyof AgentSettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async (section?: keyof AgentSettingsData) => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      if (section) {
        // Save specific section
        const currentSettings = JSON.parse(localStorage.getItem('resolveitAgentSettings') || JSON.stringify(defaultSettings));
        currentSettings[section] = settings[section];
        localStorage.setItem('resolveitAgentSettings', JSON.stringify(currentSettings));
        show(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`, 'success');
      } else {
        // Save all settings (except security passwords)
        const settingsToSave = {
          ...settings,
          security: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          },
        };
        localStorage.setItem('resolveitAgentSettings', JSON.stringify(settingsToSave));
        show('All settings saved successfully!', 'success');
      }
      setHasChanges(false);
      setSaving(false);
    }, 500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.security.currentPassword) {
      show('Current password is required.', 'error');
      return;
    }
    
    if (!settings.security.newPassword) {
      show('New password is required.', 'error');
      return;
    }
    
    if (settings.security.newPassword.length < 6) {
      show('New password must be at least 6 characters long.', 'error');
      return;
    }
    
    if (settings.security.newPassword !== settings.security.confirmPassword) {
      show('New passwords do not match.', 'error');
      return;
    }
    
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSettings(prev => ({
        ...prev,
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
      }));
      setSaving(false);
      show('Password changed successfully!', 'success');
    }, 500);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: faUser },
    { id: 'preferences', label: 'Preferences', icon: faCog },
    { id: 'notifications', label: 'Notifications', icon: faBell },
    { id: 'security', label: 'Security', icon: faLock },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your profile and preferences
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="btn btn-primary btn-sm"
          >
            <Icon icon={faSave} size="sm" className="mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-sm p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-sm transition-colors
                    ${activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  style={activeTab === tab.id ? { backgroundColor: '#eef2ff', color: '#0f36a5' } : undefined}
                >
                  <Icon icon={tab.icon} size="sm" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-9">
          <div className="bg-white border border-gray-200 rounded-sm p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => handleSave('profile')}
                    disabled={saving}
                    className="btn btn-primary btn-sm"
                  >
                    <Icon icon={faSave} size="sm" className="mr-2" />
                    Save
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.profile.firstName}
                      onChange={(e) => handleChange('profile', 'firstName', e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.profile.lastName}
                      onChange={(e) => handleChange('profile', 'lastName', e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleChange('profile', 'email', e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.profile.phone}
                      onChange={(e) => handleChange('profile', 'phone', e.target.value)}
                      className="input"
                      placeholder="+250788123456"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Settings */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
                  <button
                    onClick={() => handleSave('preferences')}
                    disabled={saving}
                    className="btn btn-primary btn-sm"
                  >
                    <Icon icon={faSave} size="sm" className="mr-2" />
                    Save
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={settings.preferences.timezone}
                      onChange={(e) => handleChange('preferences', 'timezone', e.target.value)}
                      className="select"
                    >
                      <option value="Africa/Kigali">Africa/Kigali (GMT+2)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">America/New_York (GMT-5)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Format
                    </label>
                    <select
                      value={settings.preferences.dateFormat}
                      onChange={(e) => handleChange('preferences', 'dateFormat', e.target.value)}
                      className="select"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Format
                    </label>
                    <select
                      value={settings.preferences.timeFormat}
                      onChange={(e) => handleChange('preferences', 'timeFormat', e.target.value)}
                      className="select"
                    >
                      <option value="12h">12-hour</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Priority
                    </label>
                    <select
                      value={settings.preferences.defaultPriority}
                      onChange={(e) => handleChange('preferences', 'defaultPriority', e.target.value)}
                      className="select"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.preferences.autoAcceptTickets}
                        onChange={(e) => handleChange('preferences', 'autoAcceptTickets', e.target.checked)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Auto-accept assigned tickets</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Automatically accept tickets when they are assigned to you
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  <button
                    onClick={() => handleSave('notifications')}
                    disabled={saving}
                    className="btn btn-primary btn-sm"
                  >
                    <Icon icon={faSave} size="sm" className="mr-2" />
                    Save
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Email Notifications</span>
                  </label>

                  {settings.notifications.emailNotifications && (
                    <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.ticketAssigned}
                          onChange={(e) => handleChange('notifications', 'ticketAssigned', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Ticket Assigned to Me</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.ticketStatusChanged}
                          onChange={(e) => handleChange('notifications', 'ticketStatusChanged', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Ticket Status Changed</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.newComment}
                          onChange={(e) => handleChange('notifications', 'newComment', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">New Comment on My Tickets</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.mentionNotifications}
                          onChange={(e) => handleChange('notifications', 'mentionNotifications', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Mention Notifications</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={settings.security.currentPassword}
                      onChange={(e) => handleChange('security', 'currentPassword', e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={settings.security.newPassword}
                      onChange={(e) => handleChange('security', 'newPassword', e.target.value)}
                      className="input"
                      required
                      minLength={6}
                    />
                    <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={settings.security.confirmPassword}
                      onChange={(e) => handleChange('security', 'confirmPassword', e.target.value)}
                      className="input"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={saving || !settings.security.currentPassword || !settings.security.newPassword || !settings.security.confirmPassword}
                      className="btn btn-primary"
                    >
                      <Icon icon={faSave} size="sm" className="mr-2" />
                      {saving ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

