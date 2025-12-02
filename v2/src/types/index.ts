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

