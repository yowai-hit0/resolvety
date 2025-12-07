'use client';

import { create } from 'zustand';
import { AuthAPI } from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: User; token: string } | { error: string }>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') || null : null,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await AuthAPI.login(email, password);
      console.log('Login response:', response); // Debug log
      
      const token = response.accessToken || response.token;
      const user = response.user || response.data?.user || response.data;

      if (!token) {
        console.error('No token in response:', response);
        throw new Error('Invalid response from server: No token received');
      }

      if (!user) {
        console.error('No user in response:', response);
        throw new Error('Invalid response from server: No user data received');
      }

      // Store token immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        // Also store in sessionStorage for backward compatibility
        sessionStorage.setItem('resolveitAuth', JSON.stringify(user));
        sessionStorage.setItem('resolveitRole', user.role);
        sessionStorage.setItem('adminName', `${user.first_name} ${user.last_name}`);
      }

      // Update store with user and token
      set({ user, token, loading: false, error: null });
      
      // Verify token was stored
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken !== token) {
          console.error('Token storage mismatch!');
        }
      }
      
      return { user, token };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
      set({ error: errorMessage, loading: false });
      return { error: errorMessage };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('resolveitAuth');
      sessionStorage.removeItem('resolveitRole');
      sessionStorage.removeItem('adminName');
    }
    set({ user: null, token: null, error: null });
  },

  loadUser: async () => {
    const token = get().token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    if (!token) {
      set({ user: null, loading: false });
      return;
    }

    // Update token in store if it was read from localStorage
    if (!get().token && token) {
      set({ token });
    }

    set({ loading: true, error: null });
    try {
      const response = await AuthAPI.profile();
      
      // Handle different response formats
      // Backend might return user directly or wrapped in response.data
      let user = null;
      if (response) {
        if (response.user) {
          user = response.user;
        } else if (response.data?.user) {
          user = response.data.user;
        } else if (response.data && typeof response.data === 'object' && response.data.id) {
          // User object is directly in response.data
          user = response.data;
        } else if (response.id) {
          // User object is directly in response
          user = response;
        }
      }
      
      if (user && user.id && user.email) {
        set({ user, loading: false, error: null });
        // Also update sessionStorage for backward compatibility
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('resolveitAuth', JSON.stringify(user));
          sessionStorage.setItem('resolveitRole', user.role);
          sessionStorage.setItem('adminName', `${user.first_name} ${user.last_name}`);
        }
      } else {
        // Invalid user data - log for debugging but don't throw
        console.warn('Invalid user data received:', response);
        // Only logout if it's an auth error, otherwise just set error
        set({ error: 'Invalid user data', loading: false });
      }
    } catch (error: any) {
      // Only logout on 401/403 (unauthorized/forbidden)
      // Don't logout on network errors or other issues
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('Token expired or invalid, logging out');
        get().logout();
      } else {
        // For other errors (network, etc.), just set error but keep token
        console.error('Error loading user profile:', error);
        set({ error: error?.message || 'Failed to load user profile', loading: false });
      }
    }
  },

  setUser: (user: User | null) => set({ user }),
  setToken: (token: string | null) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
    set({ token });
  },
}));

