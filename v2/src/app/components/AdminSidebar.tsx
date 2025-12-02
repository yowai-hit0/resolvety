'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Icon, {
  faHome,
  faTicketAlt,
  faUsers,
  faChartLine,
  faTag,
  faEnvelope,
  faCog,
  faUserShield,
  faChevronLeft,
  faChevronRight,
  faBars,
  faChevronDown,
  faChevronUp,
  faList,
  faPlus,
  faUserPlus,
} from './Icon';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  children?: MenuItem[];
}

export default function AdminSidebar({ isOpen, onClose, onCollapsedChange }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('resolveitSidebarCollapsed');
    if (saved !== null) {
      const isCollapsed = saved === 'true';
      setCollapsed(isCollapsed);
      onCollapsedChange?.(isCollapsed);
    }
    
    // Auto-expand menu if current path matches
    const currentMenu = menuItems.find(item => 
      item.href === pathname || 
      item.children?.some(child => child.href === pathname)
    );
    if (currentMenu && currentMenu.children) {
      setExpandedMenus(prev => {
        const menuKey = currentMenu.label.toLowerCase().replace(/\s+/g, '-');
        if (!prev.includes(menuKey)) {
          return [...prev, menuKey];
        }
        return prev;
      });
    }
  }, [pathname, onCollapsedChange]);

  useEffect(() => {
    localStorage.setItem('resolveitSidebarCollapsed', collapsed.toString());
    onCollapsedChange?.(collapsed);
  }, [collapsed, onCollapsedChange]);

  useEffect(() => {
    try {
      const authRaw = sessionStorage.getItem('resolveitAuth');
      if (authRaw) {
        const auth = JSON.parse(authRaw) as { role?: string; name?: string; email?: string } | null;
        if (auth?.role === 'admin' || auth?.role === 'super_admin') {
          setUserInfo({
            name: auth.name || 'Administrator',
            email: auth.email || '',
            role: auth.role === 'super_admin' ? 'Super Admin' : 'Admin',
          });
          return;
        }
      }
      setUserInfo({ name: 'Administrator', email: 'admin@resolveit.rw', role: 'Admin' });
    } catch (error) {
      console.error('Unable to load admin info', error);
      setUserInfo({ name: 'Administrator', email: 'admin@resolveit.rw', role: 'Admin' });
    }
  }, []);

  const menuItems: MenuItem[] = [
    { 
      icon: faHome, 
      label: 'Dashboard', 
      href: '/admin/dashboard' 
    },
    {
      icon: faTicketAlt,
      label: 'Tickets',
      children: [
        { icon: faList, label: 'All Tickets', href: '/admin/tickets' },
        { icon: faPlus, label: 'Create Ticket', href: '/admin/tickets/create' },
        { icon: faChartLine, label: 'Ticket Analytics', href: '/admin/tickets/analytics' },
      ],
    },
    {
      icon: faUsers,
      label: 'Users',
      children: [
        { icon: faList, label: 'All Users', href: '/admin/users' },
        { icon: faUserPlus, label: 'Invitations', href: '/admin/users/invitations' },
        { icon: faChartLine, label: 'User Analytics', href: '/admin/users/analytics' },
      ],
    },
    {
      icon: faTag,
      label: 'Tags',
      href: '/admin/tags',
    },
    { 
      icon: faCog, 
      label: 'Settings', 
      href: '/admin/settings' 
    },
  ];

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const toggleMenu = (menuLabel: string) => {
    const menuKey = menuLabel.toLowerCase().replace(/\s+/g, '-');
    setExpandedMenus(prev => 
      prev.includes(menuKey) 
        ? prev.filter(key => key !== menuKey)
        : [...prev, menuKey]
    );
  };

  const isMenuExpanded = (menuLabel: string) => {
    const menuKey = menuLabel.toLowerCase().replace(/\s+/g, '-');
    return expandedMenus.includes(menuKey);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transform transition-all duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'w-20' : 'w-64'}
          flex flex-col
          overflow-y-auto
        `}
      >
        {/* Logo Section */}
        <div className="p-5 border-b border-gray-200 flex-shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2 flex-1">
                <h2 className="text-lg font-semibold text-gray-900">ResolveIt</h2>
                <button
                  onClick={() => setCollapsed(true)}
                  className="ml-auto p-1.5 hover:bg-gray-100 rounded-sm transition-colors text-gray-500 hover:text-gray-700"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <Icon icon={faBars} size="sm" />
                </button>
              </div>
            )}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="p-1.5 hover:bg-gray-100 rounded-sm transition-colors text-gray-500 hover:text-gray-700"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <Icon icon={faBars} size="sm" />
              </button>
            )}
          </div>
        </div>

        {/* User Information Section */}
        {userInfo && (
          <div className={`
            border-b border-gray-200 flex-shrink-0
            ${collapsed ? 'p-3 flex flex-col items-center' : 'p-5'}
          `}>
            <div className={`
              ${collapsed ? 'w-12 h-12' : 'w-24 h-24'}
              rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ${collapsed ? '' : 'mx-auto mb-3'}
            `}>
              <Icon icon={faUserShield} className="text-primary" size={collapsed ? 'sm' : '2x'} />
            </div>
            {!collapsed && (
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 mb-1 truncate">
                  {userInfo.name}
                </div>
                {userInfo.email && (
                  <div className="text-xs text-gray-600 mb-1 truncate">
                    {userInfo.email}
                  </div>
                )}
                <div className="text-xs text-primary font-medium">
                  {userInfo.role}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation - Scrollable */}
        <nav className="flex-1 py-4 overflow-y-auto min-h-0">
          <ul className="space-y-1 px-2">
            {menuItems.map((item, index) => {
              const active = isActive(item.href);
              const hasChildren = item.children && item.children.length > 0;
              const menuKey = item.label.toLowerCase().replace(/\s+/g, '-');
              const isExpanded = isMenuExpanded(item.label);

              if (hasChildren) {
                return (
                  <li key={index}>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3
                        transition-all duration-200
                        ${collapsed ? 'justify-center' : 'justify-between'}
                        ${
                          item.children?.some(child => isActive(child.href))
                            ? 'bg-primary/10 text-primary border-l-4 border-primary'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                        }
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          icon={item.icon}
                          className={item.children?.some(child => isActive(child.href)) ? 'text-primary' : 'text-gray-500'}
                          size="sm"
                        />
                        {!collapsed && (
                          <span className="text-sm font-medium">{item.label}</span>
                        )}
                      </div>
                      {!collapsed && (
                        <Icon
                          icon={isExpanded ? faChevronUp : faChevronDown}
                          className="text-gray-400"
                          size="xs"
                        />
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.children?.map((child, childIndex) => {
                          const childActive = isActive(child.href);
                          return (
                            <li key={childIndex}>
                              <Link
                                href={child.href || '#'}
                                onClick={onClose}
                                className={`
                                  flex items-center gap-3 px-4 py-2
                                  transition-all duration-200
                                  ${
                                    childActive
                                      ? 'bg-primary/5 text-primary border-l-2 border-primary'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                                  }
                                `}
                              >
                                <Icon
                                  icon={child.icon}
                                  className={childActive ? 'text-primary' : 'text-gray-400'}
                                  size="xs"
                                />
                                <span className="text-sm">{child.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={index}>
                  <Link
                    href={item.href || '#'}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-4 py-3
                      transition-all duration-200
                      ${collapsed ? 'justify-center' : ''}
                      ${
                        active
                          ? 'bg-primary/10 text-primary border-l-4 border-primary'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                      }
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      icon={item.icon}
                      className={active ? 'text-primary' : 'text-gray-500'}
                      size="sm"
                    />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Link
            href="/"
            className={`
              flex items-center gap-2 text-xs text-gray-600 hover:text-primary transition-colors
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? 'Back to Website' : undefined}
          >
            {!collapsed && <span>← Back to Website</span>}
            {collapsed && <Icon icon={faChevronLeft} />}
          </Link>
        </div>
      </aside>
    </>
  );
}

