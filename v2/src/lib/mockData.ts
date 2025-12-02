// Mock data for ResolveIt v2
import { User, Ticket, TicketPriority, DashboardStats, UserRole, TicketStatus } from '@/types';

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

// Mock Users
export const mockUsers: User[] = [
  // Create specific agents first
  ...mockAgents.map((agent, i) => ({
    id: i + 1,
    email: `${agent.first_name.toLowerCase()}@resolveit.rw`,
    first_name: agent.first_name,
    last_name: agent.last_name,
    role: 'agent' as UserRole,
    is_active: true,
    created_at: randomDate(new Date(2024, 0, 1), new Date()),
    updated_at: randomDate(new Date(2024, 0, 1), new Date()),
  })),
  // Add other users (admins, customers, etc.)
  ...Array.from({ length: 45 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const roles: UserRole[] = ['super_admin', 'admin', 'customer'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    return {
      id: mockAgents.length + i + 1,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@resolveit.rw`,
      first_name: firstName,
      last_name: lastName,
      role: role,
      is_active: Math.random() > 0.1, // 90% active
      created_at: randomDate(new Date(2024, 0, 1), new Date()),
      updated_at: randomDate(new Date(2024, 0, 1), new Date()),
    };
  }),
];

// Mock Ticket Priorities
export const mockPriorities: TicketPriority[] = [
  { id: 1, name: 'Low' },
  { id: 2, name: 'Medium' },
  { id: 3, name: 'High' },
  { id: 4, name: 'Critical' },
];

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

// Get agent users for ticket assignment (will be set after mockUsers is created)
let agentUsers: User[] = [];

export const mockTickets: Ticket[] = Array.from({ length: 200 }, (_, i) => {
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const createdBy = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  const assignee = status !== 'New' && agentUsers.length > 0 
    ? agentUsers[Math.floor(Math.random() * agentUsers.length)] 
    : undefined;
  const priority = mockPriorities[Math.floor(Math.random() * mockPriorities.length)];
  const createdAt = randomDate(new Date(2024, 0, 1), new Date());
  const updatedAt = randomDate(new Date(createdAt), new Date());
  
  return {
    id: i + 1,
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

// Set agent users after mockUsers is created
agentUsers = mockUsers.filter(u => u.role === 'agent');

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
    { name: 'Critical', value: mockTickets.filter(t => t.priority_id === 4).length },
    { name: 'High', value: mockTickets.filter(t => t.priority_id === 3).length },
    { name: 'Medium', value: mockTickets.filter(t => t.priority_id === 2).length },
    { name: 'Low', value: mockTickets.filter(t => t.priority_id === 1).length },
  ],
};

