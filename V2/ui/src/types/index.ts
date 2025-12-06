// ResolveIt Types - Updated for v2 Backend (UUIDs, Categories)

export type UserRole = 'super_admin' | 'admin' | 'agent' | 'customer';

export type TicketStatus = 'New' | 'Assigned' | 'In_Progress' | 'On_Hold' | 'Resolved' | 'Closed' | 'Reopened';

export interface User {
  id: string; // UUID
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  organization_id?: string; // UUID - Deprecated: kept for backward compatibility
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  last_login_ip?: string;
  organization?: Organization; // Deprecated: use user_organizations
  user_organizations?: UserOrganization[]; // New: array of organization relationships
  _count?: {
    tickets_created?: number;
    tickets_assigned?: number;
    comments?: number;
  };
}

export interface UserOrganization {
  id: string; // UUID
  user_id: string; // UUID
  organization_id: string; // UUID
  is_primary: boolean;
  created_at: string;
  created_by_id?: string; // UUID
  organization?: Organization;
}

export interface Ticket {
  id: string; // UUID
  ticket_code: string;
  subject: string;
  description: string;
  requester_email?: string;
  requester_name?: string;
  requester_phone: string;
  location?: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  created_by_id: string; // UUID
  updated_by_id?: string; // UUID
  assignee_id?: string; // UUID
  priority_id: string; // UUID
  created_by?: User;
  updated_by?: User;
  assignee?: User;
  priority?: TicketPriority;
  categories?: Category[]; // Changed from tags
  comments?: Comment[];
  attachments?: Attachment[];
  ticket_events?: TicketEvent[];
  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface TicketPriority {
  id: string; // UUID
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Comment {
  id: string; // UUID
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at?: string;
  ticket_id: string; // UUID
  author_id: string; // UUID
  updated_by_id?: string; // UUID
  author?: User;
}

// Changed from Tag to Category
export interface Category {
  id: string; // UUID
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Legacy alias for backward compatibility during migration
export type Tag = Category;

export interface Attachment {
  id: string; // UUID
  original_filename: string;
  stored_filename: string;
  mime_type: string;
  size?: number;
  uploaded_at: string;
  ticket_id: string; // UUID
  uploaded_by_id: string; // UUID
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by_id?: string; // UUID
  uploaded_by?: User;
}

export interface TicketEvent {
  id: string; // UUID
  ticket_id: string; // UUID
  user_id: string; // UUID
  change_type: string;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  created_at: string;
  user?: User;
}

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface App {
  id: string; // UUID
  name: string;
  description?: string;
  organization_id: string; // UUID
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_id?: string; // UUID
  updated_by_id?: string; // UUID
  organization?: Organization;
  created_by?: User;
  updated_by?: User;
  _count?: {
    api_keys: number;
    ip_whitelist: number;
  };
}

export interface AppApiKey {
  id: string; // UUID
  app_id: string; // UUID
  key_prefix: string; // First 8 chars for display
  name?: string;
  last_used_at?: string;
  last_used_ip?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  created_by_id?: string; // UUID
  created_by?: User;
  // Only returned when creating a new key
  key?: string; // Full key (only shown once)
}

export interface AppIpWhitelist {
  id: string; // UUID
  app_id: string; // UUID
  ip_address: string; // Can be single IP or CIDR
  description?: string;
  is_active: boolean;
  created_at: string;
  created_by_id?: string; // UUID
  created_by?: User;
}

export interface Invitation {
  id: string; // UUID
  email: string;
  role: UserRole;
  token: string;
  expires_at: string;
  status: InviteStatus;
  created_at: string;
  updated_at?: string;
  accepted_at?: string;
  created_by_id?: string; // UUID
  updated_by_id?: string; // UUID
}

export interface DashboardStats {
  totalTickets: number;
  activeTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  newToday: number;
  assignedTickets: number;
  inProgressTickets: number;
  onHoldTickets: number;
}

export interface Organization {
  id: string; // UUID
  name: string;
  domain?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_id?: string; // UUID
  updated_by_id?: string; // UUID
  users_count?: number;
  tickets_count?: number;
}

