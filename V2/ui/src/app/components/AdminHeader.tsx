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
  faArrowRight,
  faUser,
  faSpinner
} from './Icon';
import { TicketsAPI, UsersAPI, AgentAPI } from '@/lib/api';

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
  const [searchResults, setSearchResults] = useState<{
    tickets: any[];
    users: any[];
  }>({ tickets: [], users: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('admin');
  const [userName, setUserName] = useState<string>(adminName);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const authRaw = sessionStorage.getItem('resolveitAuth');
      if (authRaw) {
        const auth = JSON.parse(authRaw) as { role?: string; name?: string; email?: string } | null;
        if (auth) {
          if (auth.role) {
            setUserRole(auth.role);
          }
          if (auth.name) {
            setUserName(auth.name);
          } else if (auth.email) {
            setUserName(auth.email.split('@')[0]);
          }
        }
      }
    } catch (error) {
      console.error('Unable to load user info', error);
    }
  }, []);

  // Mock notifications data
  const notifications = [
    { id: 1, type: 'ticket', title: '5 new tickets assigned', time: '2 hours ago', read: false, icon: faTicketAlt },
    { id: 2, type: 'system', title: 'System maintenance scheduled', time: '5 hours ago', read: false, icon: faFileAlt },
    { id: 3, type: 'alert', title: 'High ticket volume today', time: '1 day ago', read: true, icon: faTicketAlt },
    { id: 4, type: 'update', title: 'New user registered', time: '2 days ago', read: true, icon: faFileAlt },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults({ tickets: [], users: [] });
      setSearchOpen(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        // For agents, only search their own tickets; for admins, search all tickets
        const isAgent = userRole === 'agent';
        
        const searchPromises = [
          isAgent 
            ? AgentAPI.myTickets({ search: searchTerm.trim(), skip: 0, take: 5 })
            : TicketsAPI.list({ search: searchTerm.trim(), skip: 0, take: 5 }),
          // Only search users if admin/super_admin
          (userRole === 'admin' || userRole === 'super_admin')
            ? UsersAPI.list({ search: searchTerm.trim(), skip: 0, take: 5 })
            : Promise.resolve({ data: [] }),
        ];

        const [ticketsResponse, usersResponse] = await Promise.all(searchPromises);

        setSearchResults({
          tickets: ticketsResponse.data || [],
          users: usersResponse.data || [],
        });
        setSearchOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({ tickets: [], users: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, userRole]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    if (userMenuOpen || notificationsOpen || searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen, notificationsOpen, searchOpen]);

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchTerm.trim() && (searchResults.tickets.length > 0 || searchResults.users.length > 0)) {
      setSearchOpen(true);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (type: 'ticket' | 'user', id: string) => {
    setSearchOpen(false);
    setSearchTerm('');
    if (type === 'ticket') {
      const ticketPath = userRole === 'agent' ? `/agent/tickets/${id}` : `/admin/tickets/${id}`;
      router.push(ticketPath);
    } else {
      router.push(`/admin/users/${id}`);
    }
  };

  // Handle Enter key in search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      // Navigate to tickets page with search
      setSearchOpen(false);
      const ticketsPath = userRole === 'agent' 
        ? `/agent/tickets?search=${encodeURIComponent(searchTerm.trim())}`
        : `/admin/tickets?search=${encodeURIComponent(searchTerm.trim())}`;
      router.push(ticketsPath);
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('resolveitAuth');
    sessionStorage.removeItem('resolveitRole');
    sessionStorage.removeItem('adminName');
    document.cookie = 'resolveitAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center h-20 w-full">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-gray-100 transition-colors lg:hidden ml-6"
          aria-label="Toggle menu"
        >
          <Icon icon={sidebarOpen ? faTimes : faBars} className="text-gray-700" />
        </button>

        {/* Search Input - Left side */}
        <div className="flex-shrink-0 pl-6 pr-4 hidden md:block" ref={searchRef}>
          <div className="relative w-80 max-w-md">
            <Icon 
              icon={searchLoading ? faSpinner : faSearch} 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 ${searchLoading ? 'animate-spin' : ''}`} 
              size="sm" 
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tickets, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent"
            />

            {/* Search Results Dropdown */}
            {searchOpen && (searchResults.tickets.length > 0 || searchResults.users.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg z-50 max-h-96 overflow-y-auto">
                {/* Tickets Results */}
                {searchResults.tickets.length > 0 && (
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Tickets ({searchResults.tickets.length})
                    </div>
                    {searchResults.tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => handleSearchResultClick('ticket', ticket.id)}
                        className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 rounded-sm transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent/10">
                          <Icon icon={faTicketAlt} className="text-accent" size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {ticket.ticket_code}: {ticket.subject}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {ticket.requester_name || ticket.requester_email || 'No requester'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Users Results */}
                {searchResults.users.length > 0 && (
                  <div className="p-2 border-t border-gray-200">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Users ({searchResults.users.length})
                    </div>
                    {searchResults.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSearchResultClick('user', user.id)}
                        className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 rounded-sm transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100">
                          <Icon icon={faUser} className="text-primary-600" size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* View All Link */}
                {searchTerm.trim() && (
                  <div className="p-2 border-t border-gray-200">
                    <Link
                      href={userRole === 'agent' 
                        ? `/agent/tickets?search=${encodeURIComponent(searchTerm.trim())}`
                        : `/admin/tickets?search=${encodeURIComponent(searchTerm.trim())}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-accent hover:bg-gray-50 rounded-sm transition-colors"
                    >
                      <span>View all results</span>
                      <Icon icon={faArrowRight} size="xs" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {searchOpen && !searchLoading && searchTerm.trim() && searchResults.tickets.length === 0 && searchResults.users.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg z-50 p-4">
                <p className="text-sm text-gray-500 text-center">No results found</p>
              </div>
            )}
          </div>
        </div>

        {/* Spacer to push right content to the right */}
        <div className="flex-1"></div>

        {/* Right: Notifications & User Menu */}
        <div className="flex items-center gap-3 flex-shrink-0 px-4 sm:px-6 lg:px-8">
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
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 z-50 max-h-96 overflow-y-auto rounded-sm">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <Link
                      href={userRole === 'agent' ? '/agent/dashboard' : '/admin/dashboard'}
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
                          href={userRole === 'agent' ? '/agent/dashboard' : '/admin/dashboard'}
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
                        href={userRole === 'agent' ? '/agent/dashboard' : '/admin/dashboard'}
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
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-600">
                  {userRole === 'agent' ? 'Agent' : userRole === 'super_admin' ? 'Super Admin' : 'Administrator'}
                </p>
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
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 z-50 rounded-sm">
                  <div className="py-1">
                    <Link
                      href={userRole === 'agent' ? '/agent/settings' : '/admin/settings'}
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
    </header>
  );
}

