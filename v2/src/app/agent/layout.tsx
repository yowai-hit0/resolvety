'use client';

import RequireAuth from '../components/RequireAuth';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={['agent', 'admin', 'super_admin']}>
      <div className="min-h-screen bg-background">
        <div className="p-6">
          {children}
        </div>
      </div>
    </RequireAuth>
  );
}

