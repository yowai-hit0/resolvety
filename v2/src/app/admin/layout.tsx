'use client';

import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import RequireAuth from '../components/RequireAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <RequireAuth allowedRoles={['admin', 'super_admin']}>
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCollapsedChange={setSidebarCollapsed}
        />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <AdminHeader
            adminName="Administrator"
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}

