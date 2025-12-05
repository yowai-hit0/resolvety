import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('resolveitAuth');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const AuthAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  
  register: (data: { email: string; password: string; first_name: string; last_name: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  
  profile: () =>
    api.get('/auth/profile').then((r) => r.data),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then((r) => r.data),
};

// Tickets API
export const TicketsAPI = {
  list: (params?: {
    skip?: number;
    take?: number;
    status?: string;
    priority?: string;
    assignee?: string;
    created_by?: string;
    updated_by?: string;
    category?: string;
    search?: string;
    created_at_from?: string;
    created_at_to?: string;
    updated_at_from?: string;
    updated_at_to?: string;
  }) =>
    api.get('/tickets', { params }).then((r) => r.data),
  
  get: (id: string) =>
    api.get(`/tickets/${id}`).then((r) => r.data),
  
  create: (data: {
    subject: string;
    description: string;
    requester_phone: string;
    priority_id: string;
    requester_email?: string;
    requester_name?: string;
    location?: string;
    category_ids?: string[];
  }) =>
    api.post('/tickets', data).then((r) => r.data),
  
  update: (id: string, data: {
    subject?: string;
    description?: string;
    status?: string;
    assignee_id?: string;
    priority_id?: string;
    category_ids?: string[];
  }) =>
    api.put(`/tickets/${id}`, data).then((r) => r.data),
  
  addComment: (id: string, data: { content: string; is_internal?: boolean }) =>
    api.post(`/tickets/${id}/comments`, data).then((r) => r.data),
  
  addAttachment: (id: string, data: {
    original_filename: string;
    stored_filename: string;
    mime_type: string;
    size: number;
  }) =>
    api.post(`/tickets/${id}/attachments`, data).then((r) => r.data),
  
  deleteAttachment: (id: string) =>
    api.post(`/tickets/attachments/${id}/delete`).then((r) => r.data),
  
  stats: () =>
    api.get('/tickets/stats').then((r) => r.data),
  
  bulkAssign: (data: { ticket_ids: string[]; assignee_id: string }) =>
    api.post('/tickets/bulk-assign', data).then((r) => r.data),
  
  bulkStatus: (data: { ticket_ids: string[]; status: string }) =>
    api.post('/tickets/bulk-status', data).then((r) => r.data),
};

// Users API
export const UsersAPI = {
  list: (params?: {
    skip?: number;
    take?: number;
    role?: string;
    is_active?: boolean;
    organization?: string;
    search?: string;
  }) =>
    api.get('/users', { params }).then((r) => r.data),
  
  get: (id: string) =>
    api.get(`/users/${id}`).then((r) => r.data),
  
  me: () =>
    api.get('/users/me').then((r) => r.data),
  
  update: (id: string, data: {
    first_name?: string;
    last_name?: string;
    role?: string;
    organization_id?: string;
  }) =>
    api.put(`/users/${id}`, data).then((r) => r.data),
  
  updateStatus: (id: string, data: { is_active: boolean }) =>
    api.patch(`/users/${id}/status`, data).then((r) => r.data),
  
  stats: () =>
    api.get('/users/stats').then((r) => r.data),
  
  create: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    organization_id?: string;
    is_active?: boolean;
  }) =>
    api.post('/users', data).then((r) => r.data),
};

// Categories API (was Tags)
export const CategoriesAPI = {
  list: () =>
    api.get('/categories').then((r) => r.data),
  
  get: (id: string) =>
    api.get(`/categories/${id}`).then((r) => r.data),
  
  create: (data: { name: string }) =>
    api.post('/categories', data).then((r) => r.data),
  
  update: (id: string, data: { name: string }) =>
    api.put(`/categories/${id}`, data).then((r) => r.data),
  
  delete: (id: string) =>
    api.delete(`/categories/${id}`).then((r) => r.data),
};

// Priorities API
export const PrioritiesAPI = {
  list: () =>
    api.get('/priorities').then((r) => r.data),
  
  get: (id: string) =>
    api.get(`/priorities/${id}`).then((r) => r.data),
  
  create: (data: { name: string; sort_order?: number }) =>
    api.post('/priorities', data).then((r) => r.data),
  
  update: (id: string, data: { name: string; sort_order?: number }) =>
    api.put(`/priorities/${id}`, data).then((r) => r.data),
  
  delete: (id: string) =>
    api.delete(`/priorities/${id}`).then((r) => r.data),
};

// Organizations API
export const OrganizationsAPI = {
  list: (params?: { skip?: number; take?: number }) => {
    return api.get('/organizations', { params }).then((r) => r.data);
  },
  
  get: (id: string) =>
    api.get(`/organizations/${id}`).then((r) => r.data),
  
  create: (data: {
    name: string;
    domain?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) =>
    api.post('/organizations', data).then((r) => r.data),
  
  update: (id: string, data: {
    name?: string;
    domain?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) =>
    api.put(`/organizations/${id}`, data).then((r) => r.data),
  
  delete: (id: string) =>
    api.delete(`/organizations/${id}`).then((r) => r.data),
  
  getUsers: (id: string) =>
    api.get(`/organizations/${id}/users`).then((r) => r.data),
  
  getTickets: (id: string) =>
    api.get(`/organizations/${id}/tickets`).then((r) => r.data),
};

// Invites API
export const InvitesAPI = {
  list: (params?: { skip?: number; take?: number }) =>
    api.get('/invites', { params }).then((r) => r.data),
  
  create: (data: { email: string; role: string }) =>
    api.post('/invites', data).then((r) => r.data),
  
  resend: (id: string) =>
    api.post(`/invites/${id}/resend`).then((r) => r.data),
  
  revoke: (id: string) =>
    api.post(`/invites/${id}/revoke`).then((r) => r.data),
  
  accept: (data: { token: string; name?: string; password?: string }) =>
    api.post('/invites/accept', data).then((r) => r.data),
};

// Admin API
export const AdminAPI = {
  dashboard: () =>
    api.get('/admin/dashboard').then((r) => r.data),
  
  analytics: () =>
    api.get('/admin/analytics').then((r) => r.data),
  
  ticketAnalytics: () =>
    api.get('/admin/analytics/tickets').then((r) => r.data),
  
  userAnalytics: () =>
    api.get('/admin/analytics/users').then((r) => r.data),
  
  agentPerformance: () =>
    api.get('/admin/analytics/agent-performance').then((r) => r.data),
};

// Agent API
export const AgentAPI = {
  dashboard: () =>
    api.get('/agent/dashboard').then((r) => r.data),
  
  myTickets: (params?: {
    skip?: number;
    take?: number;
    status?: string;
    priority?: string;
    search?: string;
  }) =>
    api.get('/agent/tickets', { params }).then((r) => r.data),
  
  updateTicketStatus: (id: string, status: string) =>
    api.put(`/agent/tickets/${id}/status`, { status }).then((r) => r.data),
  
  updateTicketPriority: (id: string, priority_id: string) =>
    api.put(`/agent/tickets/${id}/priority`, { priority_id }).then((r) => r.data),
  
  performance: () =>
    api.get('/agent/performance').then((r) => r.data),
};

// Settings API
export const SettingsAPI = {
  get: () =>
    api.get('/settings').then((r) => r.data),
  
  update: (data: any) =>
    api.put('/settings', data).then((r) => r.data),
};

