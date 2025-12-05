'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

/**
 * Component to initialize auth state on app mount
 * This ensures the token is loaded from localStorage and user is loaded if token exists
 */
export default function AuthInitializer() {
  const { token, loadUser } = useAuthStore();

  useEffect(() => {
    // On mount, check if we have a token but no user
    // This handles page refreshes
    const initializeAuth = async () => {
      // Small delay to ensure localStorage is available
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const storedToken = typeof window !== 'undefined' 
        ? localStorage.getItem('auth_token') 
        : null;
      
      // If we have a token but no user, try to load user
      if (storedToken && !token) {
        // Token exists in localStorage but not in store, update store
        useAuthStore.getState().setToken(storedToken);
      }
      
      // If we have a token (from store or localStorage) but no user, load user
      const currentToken = token || storedToken;
      const currentUser = useAuthStore.getState().user;
      
      if (currentToken && !currentUser) {
        // Silently try to load user - errors are handled in loadUser
        loadUser().catch((error) => {
          // Only log if it's not a 401/403 (which is expected if token is invalid)
          if (error?.response?.status !== 401 && error?.response?.status !== 403) {
            console.log('Failed to load user on initialization:', error);
          }
        });
      }
    };

    initializeAuth();
  }, []); // Only run on mount

  return null; // This component doesn't render anything
}

