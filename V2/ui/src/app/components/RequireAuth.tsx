'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loadUser } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkAuth = async () => {
      setLoading(true);
      
      try {
        // Wait a bit for localStorage to be available and token to initialize
        // Increased delay to ensure token is stored after login redirect
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Get fresh token from store (which reads from localStorage)
        const currentToken = useAuthStore.getState().token || 
                           (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
        
        // If no token at all, redirect to login
        if (!currentToken) {
          sessionStorage.setItem('redirect_after_login', pathname);
          router.push('/auth/login');
          setLoading(false);
          return;
        }

        // Get current user from store
        let currentUser = useAuthStore.getState().user;
        
        // If user not loaded, try to load it
        if (!currentUser) {
          try {
            await loadUser();
            // Get user again after loadUser
            currentUser = useAuthStore.getState().user;
          } catch (error: any) {
            // If loadUser fails with 401, token is invalid
            if (error?.response?.status === 401 || error?.response?.status === 403) {
              console.log('Token invalid, redirecting to login');
              useAuthStore.getState().logout();
              sessionStorage.setItem('redirect_after_login', pathname);
              router.push('/auth/login');
              setLoading(false);
              return;
            }
            // For other errors, log but don't redirect (might be network issue)
            // Give it another try after a short delay
            console.error('Error loading user, retrying:', error);
            try {
              await new Promise(resolve => setTimeout(resolve, 500));
              await loadUser();
              currentUser = useAuthStore.getState().user;
            } catch (retryError: any) {
              console.error('Retry also failed:', retryError);
              // Only redirect if it's an auth error
              if (retryError?.response?.status === 401 || retryError?.response?.status === 403) {
                useAuthStore.getState().logout();
                sessionStorage.setItem('redirect_after_login', pathname);
                router.push('/auth/login');
                setLoading(false);
                return;
              }
            }
          }
        }

        // If still no user after trying to load, redirect
        if (!currentUser) {
          sessionStorage.setItem('redirect_after_login', pathname);
          router.push('/auth/login');
          setLoading(false);
          return;
        }

        const userRole = currentUser.role;

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
            setLoading(false);
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        // Only logout and redirect if it's an auth error
        const authError = error as any;
        if (authError?.response?.status === 401 || authError?.response?.status === 403) {
          useAuthStore.getState().logout();
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      checkAuth();
    }
  }, [mounted, router, pathname, allowedRoles]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
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

