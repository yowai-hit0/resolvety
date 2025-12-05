'use client';

import { useState, useEffect } from 'react';
import Icon, { 
  faCog, 
  faEnvelope, 
  faShield, 
  faTicketAlt, 
  faUpload, 
  faBell,
  faBuilding,
  faSave,
  faTimes,
  faCheckCircle,
} from '@/app/components/Icon';
import { useToast } from '@/app/components/Toaster';
import { UserRole } from '@/types';
import { DetailPageSkeleton } from '@/app/components/Skeleton';

interface SettingsData {
  general: {
    systemName: string;
    systemDomain: string;
    supportEmail: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  email: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    smtpFromEmail: string;
    smtpFromName: string;
    smtpSecure: boolean;
  };
  security: {
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecial: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  tickets: {
    defaultPriority: string;
    autoAssignEnabled: boolean;
    autoAssignStrategy: string;
    slaEnabled: boolean;
    slaResponseTime: number;
    slaResolutionTime: number;
    allowCustomerReopen: boolean;
  };
  fileUpload: {
    maxFileSize: number;
    allowedImageTypes: string;
    allowedAudioTypes: string;
    allowedVideoTypes: string;
    allowedDocumentTypes: string;
  };
  notifications: {
    emailNotifications: boolean;
    ticketCreated: boolean;
    ticketAssigned: boolean;
    ticketStatusChanged: boolean;
    ticketResolved: boolean;
    newComment: boolean;
    mentionNotifications: boolean;
  };
  organization: {
    allowMultipleOrganizations: boolean;
    defaultOrganization: string;
    organizationIsolation: boolean;
  };
}

const defaultSettings: SettingsData = {
  general: {
    systemName: 'ResolveIt',
    systemDomain: 'resolveit.rw',
    supportEmail: 'support@resolveit.rw',
    timezone: 'Africa/Kigali',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  email: {
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpFromEmail: 'noreply@resolveit.rw',
    smtpFromName: 'ResolveIt',
    smtpSecure: false,
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
  },
  tickets: {
    defaultPriority: 'Medium',
    autoAssignEnabled: false,
    autoAssignStrategy: 'round-robin',
    slaEnabled: false,
    slaResponseTime: 4,
    slaResolutionTime: 24,
    allowCustomerReopen: true,
  },
  fileUpload: {
    maxFileSize: 50,
    allowedImageTypes: 'jpg,jpeg,png,gif,webp',
    allowedAudioTypes: 'mp3,wav,ogg,aac,m4a',
    allowedVideoTypes: 'mp4,avi,mov,wmv,webm',
    allowedDocumentTypes: 'pdf,doc,docx,xls,xlsx,txt',
  },
  notifications: {
    emailNotifications: true,
    ticketCreated: true,
    ticketAssigned: true,
    ticketStatusChanged: true,
    ticketResolved: true,
    newComment: true,
    mentionNotifications: true,
  },
  organization: {
    allowMultipleOrganizations: true,
    defaultOrganization: '',
    organizationIsolation: true,
  },
};

export default function AdminSettingsPage() {
  const { show } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');

  useEffect(() => {
    // Get user role from session
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('resolveitAuth');
      if (auth) {
        try {
          const user = JSON.parse(auth);
          setUserRole(user.role || 'admin');
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }
    }

    // Load settings (mock - in real app, fetch from API)
    setLoading(true);
    setTimeout(() => {
      // In real app, fetch from API
      const savedSettings = localStorage.getItem('resolveitSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Error loading settings:', e);
        }
      }
      setLoading(false);
    }, 300);
  }, []);

  const isSuperAdmin = userRole === 'super_admin';

  const handleChange = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async (section?: keyof SettingsData) => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // In real app, save to API
      if (section) {
        // Save specific section
        const currentSettings = JSON.parse(localStorage.getItem('resolveitSettings') || JSON.stringify(defaultSettings));
        currentSettings[section] = settings[section];
        localStorage.setItem('resolveitSettings', JSON.stringify(currentSettings));
        show(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`, 'success');
      } else {
        // Save all settings
        localStorage.setItem('resolveitSettings', JSON.stringify(settings));
        show('All settings saved successfully!', 'success');
      }
      setHasChanges(false);
      setSaving(false);
    }, 500);
  };

  const handleReset = (section: keyof SettingsData) => {
    if (confirm(`Are you sure you want to reset ${section} settings to defaults?`)) {
      setSettings(prev => ({
        ...prev,
        [section]: defaultSettings[section],
      }));
      setHasChanges(true);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: faCog },
    { id: 'email', label: 'Email', icon: faEnvelope },
    { id: 'security', label: 'Security', icon: faShield },
    { id: 'tickets', label: 'Tickets', icon: faTicketAlt },
    { id: 'fileUpload', label: 'File Upload', icon: faUpload },
    { id: 'notifications', label: 'Notifications', icon: faBell },
    ...(isSuperAdmin ? [{ id: 'organization', label: 'Organization', icon: faBuilding }] : []),
  ];

  if (loading) {
    return <DetailPageSkeleton showHeader showTabs />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage system configuration and preferences
            {!isSuperAdmin && ' (Limited access)'}
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
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                  <button
                    onClick={() => handleSave('general')}
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
                      System Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.general.systemName}
                      onChange={(e) => handleChange('general', 'systemName', e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Domain
                    </label>
                    <input
                      type="text"
                      value={settings.general.systemDomain}
                      onChange={(e) => handleChange('general', 'systemDomain', e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => handleChange('general', 'timezone', e.target.value)}
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
                      value={settings.general.dateFormat}
                      onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}
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
                      value={settings.general.timeFormat}
                      onChange={(e) => handleChange('general', 'timeFormat', e.target.value)}
                      className="select"
                    >
                      <option value="12h">12-hour</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Email Settings</h2>
                  <button
                    onClick={() => handleSave('email')}
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
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleChange('email', 'smtpHost', e.target.value)}
                      className="input"
                      placeholder="smtp.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleChange('email', 'smtpPort', e.target.value)}
                      className="input"
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleChange('email', 'smtpUser', e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleChange('email', 'smtpPassword', e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.email.smtpFromEmail}
                      onChange={(e) => handleChange('email', 'smtpFromEmail', e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpFromName}
                      onChange={(e) => handleChange('email', 'smtpFromName', e.target.value)}
                      className="input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.email.smtpSecure}
                        onChange={(e) => handleChange('email', 'smtpSecure', e.target.checked)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Use SSL/TLS</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                  <button
                    onClick={() => handleSave('security')}
                    disabled={saving}
                    className="btn btn-primary btn-sm"
                  >
                    <Icon icon={faSave} size="sm" className="mr-2" />
                    Save
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Password Policy</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Length
                        </label>
                        <input
                          type="number"
                          min="6"
                          max="32"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.security.passwordRequireUppercase}
                          onChange={(e) => handleChange('security', 'passwordRequireUppercase', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Require uppercase letters</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.security.passwordRequireLowercase}
                          onChange={(e) => handleChange('security', 'passwordRequireLowercase', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Require lowercase letters</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.security.passwordRequireNumbers}
                          onChange={(e) => handleChange('security', 'passwordRequireNumbers', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Require numbers</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.security.passwordRequireSpecial}
                          onChange={(e) => handleChange('security', 'passwordRequireSpecial', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Require special characters</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Session Management</h3>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Session Timeout (hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="168"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          min="3"
                          max="10"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lockout Duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="1440"
                          value={settings.security.lockoutDuration}
                          onChange={(e) => handleChange('security', 'lockoutDuration', parseInt(e.target.value))}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ticket Settings */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Ticket Settings</h2>
                  <button
                    onClick={() => handleSave('tickets')}
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
                      Default Priority
                    </label>
                    <select
                      value={settings.tickets.defaultPriority}
                      onChange={(e) => handleChange('tickets', 'defaultPriority', e.target.value)}
                      className="select"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Auto-Assign Strategy
                    </label>
                    <select
                      value={settings.tickets.autoAssignStrategy}
                      onChange={(e) => handleChange('tickets', 'autoAssignStrategy', e.target.value)}
                      className="select"
                      disabled={!settings.tickets.autoAssignEnabled}
                    >
                      <option value="round-robin">Round Robin</option>
                      <option value="least-busy">Least Busy</option>
                      <option value="random">Random</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.tickets.autoAssignEnabled}
                        onChange={(e) => handleChange('tickets', 'autoAssignEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Auto-Assignment</span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.tickets.slaEnabled}
                        onChange={(e) => handleChange('tickets', 'slaEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable SLA Tracking</span>
                    </label>
                  </div>

                  {settings.tickets.slaEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SLA Response Time (hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={settings.tickets.slaResponseTime}
                          onChange={(e) => handleChange('tickets', 'slaResponseTime', parseInt(e.target.value))}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SLA Resolution Time (hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={settings.tickets.slaResolutionTime}
                          onChange={(e) => handleChange('tickets', 'slaResolutionTime', parseInt(e.target.value))}
                          className="input"
                        />
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.tickets.allowCustomerReopen}
                        onChange={(e) => handleChange('tickets', 'allowCustomerReopen', e.target.checked)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Allow customers to reopen closed tickets</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Settings */}
            {activeTab === 'fileUpload' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">File Upload Settings</h2>
                  <button
                    onClick={() => handleSave('fileUpload')}
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
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={settings.fileUpload.maxFileSize}
                      onChange={(e) => handleChange('fileUpload', 'maxFileSize', parseInt(e.target.value))}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed Image Types
                    </label>
                    <input
                      type="text"
                      value={settings.fileUpload.allowedImageTypes}
                      onChange={(e) => handleChange('fileUpload', 'allowedImageTypes', e.target.value)}
                      className="input"
                      placeholder="jpg,jpeg,png,gif"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed Audio Types
                    </label>
                    <input
                      type="text"
                      value={settings.fileUpload.allowedAudioTypes}
                      onChange={(e) => handleChange('fileUpload', 'allowedAudioTypes', e.target.value)}
                      className="input"
                      placeholder="mp3,wav,ogg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed Video Types
                    </label>
                    <input
                      type="text"
                      value={settings.fileUpload.allowedVideoTypes}
                      onChange={(e) => handleChange('fileUpload', 'allowedVideoTypes', e.target.value)}
                      className="input"
                      placeholder="mp4,avi,mov"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed Document Types
                    </label>
                    <input
                      type="text"
                      value={settings.fileUpload.allowedDocumentTypes}
                      onChange={(e) => handleChange('fileUpload', 'allowedDocumentTypes', e.target.value)}
                      className="input"
                      placeholder="pdf,doc,docx"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
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
                          checked={settings.notifications.ticketCreated}
                          onChange={(e) => handleChange('notifications', 'ticketCreated', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Ticket Created</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.ticketAssigned}
                          onChange={(e) => handleChange('notifications', 'ticketAssigned', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Ticket Assigned</span>
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
                          checked={settings.notifications.ticketResolved}
                          onChange={(e) => handleChange('notifications', 'ticketResolved', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Ticket Resolved</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.newComment}
                          onChange={(e) => handleChange('notifications', 'newComment', e.target.checked)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">New Comment</span>
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

            {/* Organization Settings (Super Admin Only) */}
            {activeTab === 'organization' && isSuperAdmin && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Organization Settings</h2>
                  <button
                    onClick={() => handleSave('organization')}
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
                      checked={settings.organization.allowMultipleOrganizations}
                      onChange={(e) => handleChange('organization', 'allowMultipleOrganizations', e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow Multiple Organizations</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Organization
                    </label>
                    <select
                      value={settings.organization.defaultOrganization}
                      onChange={(e) => handleChange('organization', 'defaultOrganization', e.target.value)}
                      className="select"
                    >
                      <option value="">None</option>
                      {/* In real app, populate from organizations list */}
                    </select>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.organization.organizationIsolation}
                      onChange={(e) => handleChange('organization', 'organizationIsolation', e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Organization Isolation</span>
                    <span className="text-xs text-gray-500 ml-2">(Users can only see tickets from their organization)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

