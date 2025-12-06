// Mock data for ResolveIt v2
import { User, Ticket, TicketPriority, DashboardStats, UserRole, TicketStatus, Invitation, InviteStatus, Organization } from '@/types';

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 'William', 'Sophia', 'Richard', 'Isabella', 'Joseph', 'Mia', 'Thomas', 'Charlotte', 'Charles', 'Amelia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];

// Generate random date within last year
function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

// Generate random phone number
function randomPhone(): string {
  return `+250788${Math.floor(100000 + Math.random() * 900000)}`;
}

// Generate ticket code
function generateTicketCode(index: number): string {
  return `RT-${String(index + 1).padStart(6, '0')}`;
}

// Mock Agents - Specific names
const mockAgents = [
  { first_name: 'Perfect', last_name: '' },
  { first_name: 'Nancy', last_name: '' },
  { first_name: 'Eric', last_name: '' },
  { first_name: 'Hubert', last_name: '' },
  { first_name: 'TCP', last_name: '' },
];

// Helper function to generate UUID-like string
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Mock Users - Note: mockOrganizations must be defined before this
// We'll assign users to organizations after organizations are created
export const mockUsers: User[] = [
  // Super Admin (specific user for testing) - no organization
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'superadmin@resolveit.rw',
    first_name: 'Super',
    last_name: 'Admin',
    role: 'super_admin' as UserRole,
    is_active: true,
    organization_id: undefined,
    created_at: randomDate(new Date(2024, 0, 1), new Date()),
    updated_at: randomDate(new Date(2024, 0, 1), new Date()),
  },
  // Regular Admin (specific user for testing) - assigned to first org
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'admin@resolveit.rw',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin' as UserRole,
    is_active: true,
    organization_id: '00000000-0000-0000-0000-000000000101', // First organization
    created_at: randomDate(new Date(2024, 0, 1), new Date()),
    updated_at: randomDate(new Date(2024, 0, 1), new Date()),
  },
  // Create specific agents first - assign to different organizations
  ...mockAgents.map((agent, i) => ({
    id: `00000000-0000-0000-0000-${String(i + 3).padStart(12, '0')}`,
    email: `${agent.first_name.toLowerCase()}@resolveit.rw`,
    first_name: agent.first_name,
    last_name: agent.last_name,
    role: 'agent' as UserRole,
    is_active: true,
    organization_id: `00000000-0000-0000-0000-${String((i % 3) + 101).padStart(12, '0')}`, // Distribute across first 3 orgs
    created_at: randomDate(new Date(2024, 0, 1), new Date()),
    updated_at: randomDate(new Date(2024, 0, 1), new Date()),
  })),
  // Add other users (admins, customers, etc.) - assign to organizations
  ...Array.from({ length: 43 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const roles: UserRole[] = ['admin', 'customer'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    // Assign to random organization (1-3) or no organization
    const orgIndex = Math.random() > 0.2 ? Math.floor(Math.random() * 3) + 1 : undefined;
    const orgId = orgIndex ? `00000000-0000-0000-0000-${String(orgIndex + 100).padStart(12, '0')}` : undefined;
    
    return {
      id: generateUUID(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@resolveit.rw`,
      first_name: firstName,
      last_name: lastName,
      role: role,
      is_active: Math.random() > 0.1, // 90% active
      organization_id: orgId,
      created_at: randomDate(new Date(2024, 0, 1), new Date()),
      updated_at: randomDate(new Date(2024, 0, 1), new Date()),
    };
  }),
];

// Mock Tags (Categories)
export const mockTags = [
  { id: '00000000-0000-0000-0000-000000000201', name: 'Technical', is_active: true },
  { id: '00000000-0000-0000-0000-000000000202', name: 'Billing', is_active: true },
  { id: '00000000-0000-0000-0000-000000000203', name: 'Support', is_active: true },
  { id: '00000000-0000-0000-0000-000000000204', name: 'Feature Request', is_active: true },
  { id: '00000000-0000-0000-0000-000000000205', name: 'Bug', is_active: true },
  { id: '00000000-0000-0000-0000-000000000206', name: 'Urgent', is_active: true },
  { id: '00000000-0000-0000-0000-000000000207', name: 'Hardware', is_active: true },
  { id: '00000000-0000-0000-0000-000000000208', name: 'Software', is_active: true },
];

// Mock Ticket Priorities
export const mockPriorities: TicketPriority[] = [
  { id: '00000000-0000-0000-0000-000000000301', name: 'Low', sort_order: 1, is_active: true },
  { id: '00000000-0000-0000-0000-000000000302', name: 'Medium', sort_order: 2, is_active: true },
  { id: '00000000-0000-0000-0000-000000000303', name: 'High', sort_order: 3, is_active: true },
  { id: '00000000-0000-0000-0000-000000000304', name: 'Critical', sort_order: 4, is_active: true },
];

// Mock Invitations
export const mockInvitations: Invitation[] = Array.from({ length: 15 }, (_, i) => {
  const roles: UserRole[] = ['admin', 'agent'];
  const statuses: InviteStatus[] = ['PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED'];
  const role = roles[Math.floor(Math.random() * roles.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const createdDate = randomDate(new Date(2024, 0, 1), new Date());
  const expiresDate = new Date(new Date(createdDate).getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from creation
  const acceptedDate = status === 'ACCEPTED' ? randomDate(new Date(createdDate), new Date()) : undefined;
  
  return {
    id: `00000000-0000-0000-0000-${String(i + 401).padStart(12, '0')}`,
    email: `invite${i + 1}@resolveit.rw`,
    role: role,
    token: `token-${i + 1}-${Math.random().toString(36).substring(7)}`,
    expires_at: expiresDate.toISOString(),
    status: status,
    created_at: createdDate,
    accepted_at: acceptedDate,
  };
});

// Mock Tickets
const statuses: TicketStatus[] = ['New', 'Assigned', 'In_Progress', 'On_Hold', 'Resolved', 'Closed', 'Reopened'];
const subjects = [
  'Network connectivity issue',
  'Software installation request',
  'Password reset needed',
  'Email configuration problem',
  'Printer not working',
  'System access denied',
  'Data backup request',
  'Application crash',
  'Performance issue',
  'Feature request',
  'Bug report',
  'Account locked',
  'Permission issue',
  'Hardware malfunction',
  'Integration problem',
];

const locations = [
  'Kigali - Nyarutarama',
  'Kigali - Kacyiru',
  'Kigali - Kimisagara',
  'Kigali - Remera',
  'Kigali - Kicukiro',
  'Huye',
  'Musanze',
  'Rubavu',
];

// Get agent users for ticket assignment
const agentUsers = mockUsers.filter(u => u.role === 'agent');

export const mockTickets: Ticket[] = Array.from({ length: 200 }, (_, i) => {
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const createdBy = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  // Assign tickets to agents (except for 'New' status, but we'll assign some anyway for chart data)
  // Distribute tickets evenly among agents for better chart visualization
  const assignee = agentUsers.length > 0 
    ? agentUsers[i % agentUsers.length] 
    : undefined;
  const priority = mockPriorities[Math.floor(Math.random() * mockPriorities.length)];
  const createdAt = randomDate(new Date(2024, 0, 1), new Date());
  const updatedAt = randomDate(new Date(createdAt), new Date());
  
  return {
    id: generateUUID(),
    ticket_code: generateTicketCode(i),
    subject: `${subject} #${i + 1}`,
    description: `Detailed description for ${subject.toLowerCase()}. This is a comprehensive explanation of the issue that needs to be resolved.`,
    requester_email: `requester${i}@resolveit.rw`,
    requester_name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    requester_phone: randomPhone(),
    location: locations[Math.floor(Math.random() * locations.length)],
    status: status,
    created_at: createdAt,
    updated_at: updatedAt,
    resolved_at: status === 'Resolved' || status === 'Closed' ? randomDate(new Date(createdAt), new Date()) : undefined,
    closed_at: status === 'Closed' ? randomDate(new Date(createdAt), new Date()) : undefined,
    created_by_id: createdBy.id,
    assignee_id: assignee?.id,
    priority_id: priority.id,
    created_by: createdBy,
    assignee: assignee,
    priority: priority,
    comments_count: Math.floor(Math.random() * 10),
    attachments_count: Math.floor(Math.random() * 5),
  };
});

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalTickets: mockTickets.length,
  activeTickets: mockTickets.filter(t => ['New', 'Assigned', 'In_Progress', 'On_Hold', 'Reopened'].includes(t.status)).length,
  resolvedTickets: mockTickets.filter(t => t.status === 'Resolved').length,
  closedTickets: mockTickets.filter(t => t.status === 'Closed').length,
  newToday: mockTickets.filter(t => {
    const today = new Date();
    const ticketDate = new Date(t.created_at);
    return ticketDate.toDateString() === today.toDateString();
  }).length,
  assignedTickets: mockTickets.filter(t => t.status === 'Assigned').length,
  inProgressTickets: mockTickets.filter(t => t.status === 'In_Progress').length,
  onHoldTickets: mockTickets.filter(t => t.status === 'On_Hold').length,
};

// Mock chart data
export const mockChartData = {
  ticketsByDay: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: Math.floor(Math.random() * 20) + 5,
    };
  }),
  ticketsByStatus: [
    { name: 'New', value: mockTickets.filter(t => t.status === 'New').length },
    { name: 'Assigned', value: mockTickets.filter(t => t.status === 'Assigned').length },
    { name: 'In Progress', value: mockTickets.filter(t => t.status === 'In_Progress').length },
    { name: 'On Hold', value: mockTickets.filter(t => t.status === 'On_Hold').length },
    { name: 'Resolved', value: mockTickets.filter(t => t.status === 'Resolved').length },
    { name: 'Closed', value: mockTickets.filter(t => t.status === 'Closed').length },
    { name: 'Reopened', value: mockTickets.filter(t => t.status === 'Reopened').length },
  ],
  ticketsByAgent: mockAgents.map((agent, index) => {
    const agentUser = mockUsers.find(u => u.first_name === agent.first_name && u.role === 'agent');
    return {
      name: agent.first_name,
      count: agentUser ? mockTickets.filter(t => t.assignee_id === agentUser.id).length : 0,
    };
  }).sort((a, b) => b.count - a.count),
  ticketsByPriority: [
    { name: 'Critical', value: mockTickets.filter(t => t.priority_id === '00000000-0000-0000-0000-000000000304').length },
    { name: 'High', value: mockTickets.filter(t => t.priority_id === '00000000-0000-0000-0000-000000000303').length },
    { name: 'Medium', value: mockTickets.filter(t => t.priority_id === '00000000-0000-0000-0000-000000000302').length },
    { name: 'Low', value: mockTickets.filter(t => t.priority_id === '00000000-0000-0000-0000-000000000301').length },
  ],
  ticketsByCategory: mockTags.map(tag => {
    // Distribute tickets evenly among tags for visualization
    const ticketsPerTag = Math.floor(mockTickets.length / mockTags.length);
    const remainder = mockTickets.length % mockTags.length;
    const baseCount = ticketsPerTag;
    // Add remainder to first few tags
    const tagIndex = mockTags.indexOf(tag);
    const count = baseCount + (tagIndex < remainder ? 1 : 0);
    return {
      name: tag.name,
      value: count,
    };
  }).sort((a, b) => b.value - a.value),
};

// Mock Organizations - Only 3 organizations including TCP
export const mockOrganizations: Organization[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    name: 'The Commons Project',
    domain: 'thecommonsproject.org',
    email: 'contact@thecommonsproject.org',
    phone: '+1-212-555-0100',
    address: '745 5th Ave Ste 5, New York, NY 10151, USA',
    is_active: true,
    created_at: randomDate(new Date(2023, 0, 1), new Date()),
    updated_at: randomDate(new Date(2023, 0, 1), new Date()),
    users_count: 25,
    tickets_count: 150,
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    name: 'Rwanda ICT Chamber',
    domain: 'rwandaictchamber.rw',
    email: 'contact@rwandaictchamber.rw',
    phone: '+250788123456',
    address: 'Kigali, Rwanda',
    is_active: true,
    created_at: randomDate(new Date(2023, 0, 1), new Date()),
    updated_at: randomDate(new Date(2023, 0, 1), new Date()),
    users_count: 18,
    tickets_count: 120,
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    name: 'Hanga Hubs',
    domain: 'hangahubs.rw',
    email: 'contact@hangahubs.rw',
    phone: '+250788654321',
    address: 'Kigali, Rwanda',
    is_active: true,
    created_at: randomDate(new Date(2023, 0, 1), new Date()),
    updated_at: randomDate(new Date(2023, 0, 1), new Date()),
    users_count: 15,
    tickets_count: 95,
  },
];

