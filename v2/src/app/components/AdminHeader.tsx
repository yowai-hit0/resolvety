'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon, { 
  faBars, 
  faTimes, 
  faBell, 
  faRightFromBracket, 
  faUserShield, 
  faSearch, 
  faCog, 
  faChevronDown,
  faFileAlt,
  faTicketAlt,
  faArrowRight
} from './Icon';

interface AdminHeaderProps {
  adminName?: string;
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
  sidebarCollapsed?: boolean;
}

export default function AdminHeader({ 
  adminName = 'Admin',
  onMenuToggle,
  sidebarOpen = false,
  sidebarCollapsed = false
}: AdminHeaderProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const notifications = [
    { id: 1, type: 'ticket', title: '5 new tickets assigned', time: '2 hours ago', read: false, icon: faTicketAlt },
    { id: 2, type: 'system', title: 'System maintenance scheduled', time: '5 hours ago', read: false, icon: faFileAlt },
    { id: 3, type: 'alert', title: 'High ticket volume today', time: '1 day ago', read: true, icon: faTicketAlt },
    { id: 4, type: 'update', title: 'New user registered', time: '2 days ago', read: true, icon: faFileAlt },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (userMenuOpen || notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen, notificationsOpen]);

  const handleLogout = () => {
    sessionStorage.removeItem('resolveitAuth');
    sessionStorage.removeItem('resolveitRole');
    sessionStorage.removeItem('adminName');
    document.cookie = 'resolveitAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center h-20">
        {/* Left: Menu Toggle & Logo - Fixed width matching sidebar */}
        <div className={`flex items-center gap-4 px-4 sm:px-6 lg:px-8 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Icon icon={sidebarOpen ? faTimes : faBars} className="text-gray-700" />
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-gray-900 hidden sm:inline">ResolveIt</span>
            )}
          </Link>
        </div>

        {/* Main Content Area - Search aligned with page content */}
        <div className="flex-1 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Search Input */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Icon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="sm" />
              <input
                type="text"
                placeholder="Search tickets, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Right: Notifications & User Menu */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 hover:bg-gray-100 transition-colors rounded-sm"
                aria-label="Notifications"
              >
                <Icon icon={faBell} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto rounded-sm">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-sm text-accent hover:text-accent-600"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="py-2">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <Link
                          key={notification.id}
                          href="/admin/dashboard"
                          onClick={() => setNotificationsOpen(false)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-accent/5' : ''
                          }`}
                        >
                          <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
                            !notification.read ? 'bg-accent/10' : 'bg-gray-100'
                          }`}>
                            <Icon
                              icon={notification.icon}
                              className={!notification.read ? 'text-accent' : 'text-gray-600'}
                              size="sm"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                  {notifications.length > 5 && (
                    <div className="p-3 border-t border-gray-200 text-center">
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-sm text-accent hover:text-accent-600 flex items-center justify-center gap-1"
                      >
                        View all notifications
                        <Icon icon={faArrowRight} size="xs" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 relative" ref={userMenuRef}>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{adminName}</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors rounded-sm"
                aria-label="User menu"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Icon icon={faUserShield} className="text-accent" />
                </div>
                <Icon icon={faChevronDown} className={`text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} size="sm" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50 rounded-sm">
                  <div className="py-1">
                    <Link
                      href="/admin/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon icon={faCog} className="text-gray-500" size="sm" />
                      <span>Settings</span>
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Icon icon={faRightFromBracket} className="text-gray-500" size="sm" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

