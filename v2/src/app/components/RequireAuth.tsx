'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkAuth = () => {
      try {
        const authRaw = sessionStorage.getItem('resolveitAuth');
        if (!authRaw) {
          sessionStorage.setItem('redirect_after_login', pathname);
          router.push('/auth/login');
          return;
        }

        const auth = JSON.parse(authRaw);
        const userRole = auth.role;

        // If allowedRoles is specified, check if user role is allowed
        if (allowedRoles && allowedRoles.length > 0) {
          if (!allowedRoles.includes(userRole)) {
            // Redirect to appropriate dashboard based on role
            if (userRole === 'admin' || userRole === 'super_admin') {
              router.push('/admin/dashboard');
            } else if (userRole === 'agent') {
              router.push('/agent/dashboard');
            } else {
              router.push('/auth/login');
            }
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        sessionStorage.removeItem('resolveitAuth');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, allowedRoles]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

