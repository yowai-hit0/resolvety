// ResolveIt Types

export type UserRole = 'super_admin' | 'admin' | 'agent' | 'customer';

export type TicketStatus = 'New' | 'Assigned' | 'In_Progress' | 'On_Hold' | 'Resolved' | 'Closed' | 'Reopened';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  organization_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
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
  created_by_id: number;
  assignee_id?: number;
  priority_id: number;
  created_by?: User;
  assignee?: User;
  priority?: TicketPriority;
  tags?: Tag[];
  comments_count?: number;
  attachments_count?: number;
}

export interface TicketPriority {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  content: string;
  is_internal: boolean;
  created_at: string;
  ticket_id: number;
  author_id: number;
  author?: User;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Attachment {
  id: number;
  original_filename: string;
  stored_filename: string;
  mime_type: string;
  size?: number;
  uploaded_at: string;
  ticket_id: number;
  uploaded_by_id: number;
  uploaded_by?: User;
}

export interface TicketEvent {
  id: number;
  ticket_id: number;
  user_id: number;
  change_type: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  user?: User;
}

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface Invitation {
  id: number;
  email: string;
  role: UserRole;
  token: string;
  expires_at: string;
  status: InviteStatus;
  created_at: string;
  accepted_at?: string;
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
  id: number;
  name: string;
  domain?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  users_count?: number;
  tickets_count?: number;
}

