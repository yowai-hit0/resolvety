# ResolveIt UI Feature Analysis

## Complete Feature List

### Authentication & User Management
- Login (email/password)
- Register (name, email, phone, password)
- Accept Invitation (token-based, name, password)
- User Profile Management
- Role-based access (super_admin, admin, agent, customer)
- User status toggle (active/inactive)
- User search and filtering
- User pagination

### Tickets Management
- Create Ticket (subject, description, requester info, location, priority, assignee, tags, attachments)
- List Tickets (table & card views)
- Ticket Detail View
- Update Ticket (status, priority, assignee, tags)
- Ticket Filtering (status, priority, assignee, search)
- Ticket Sorting (multiple fields)
- Ticket Pagination
- Bulk Operations (assign, status change)
- Saved Views
- Ticket Comments (internal/public)
- Ticket Attachments (images, audio, video)
- Ticket Events/History
- Ticket Status Workflow (New → Assigned → In_Progress → On_Hold → Resolved → Closed → Reopened)

### Categories & Priorities
- Create/Edit/Delete Categories (renamed from Tags)
- Create/Edit/Delete Priorities
- Category assignment to tickets
- Priority assignment to tickets

### Invitations
- Create Invitation (email, role, expiration)
- List Invitations (with status filtering)
- Resend Invitation
- Revoke Invitation
- Accept Invitation (public endpoint)

### Organizations (Super Admin Only)
- Create Organization
- Edit Organization
- Delete Organization
- View Organization Details
- Organization Users Management
- Organization Tickets View

### Dashboards
**Admin Dashboard:**
- Stats: Active Tickets, Completed Tickets, Total Tickets, New Today
- Charts: Tickets per Day (30 days), Tickets by Status, Tickets by Priority, Tickets by Agent, Tickets by Category

**Agent Dashboard:**
- Stats: Assigned Tickets, Open Now, Resolved (30d), Completion Rate
- Charts: Tickets per Day, Performance by Status, Tickets by Status, Tickets by Priority

### Analytics
**General Analytics:**
- Time period selection (7d, 30d, 90d, all)
- Overview stats
- Multiple chart types (Area, Donut, Bar, Line)

**Ticket Analytics:**
- Total Tickets, Resolved, Active, Avg Resolution Time
- Tickets per Day
- Tickets by Status, Priority, Agent, Category
- Status Trend Over Time
- Top Agents

**User Analytics:**
- Total Users, Active Users, Users with Tickets
- User Registration Trend
- Users by Role, Organization
- Top Active Users
- Role Distribution Over Time

### Settings (Super Admin)
- General (system name, domain, email, timezone, date/time format)
- Email (SMTP configuration)
- Security (password requirements, session timeout, login attempts)
- Tickets (default priority, auto-assign, SLA settings)
- File Upload (max size, allowed types)
- Notifications (email notification preferences)
- Organization (multi-org settings)

### Agent Features
- View Assigned Tickets Only
- Update Ticket Status
- Update Ticket Priority
- Add Comments
- Upload Attachments

## Data Models Required

### User
- id (UUID), email, password_hash, first_name, last_name, role, is_active
- organization_id (UUID, optional)
- created_at, updated_at

### Ticket
- id (UUID), ticket_code, subject, description
- requester_email, requester_name, requester_phone, location
- status, priority_id (UUID), assignee_id (UUID), created_by_id (UUID)
- created_at, updated_at, resolved_at, closed_at

### Comment
- id (UUID), ticket_id (UUID), author_id (UUID), content, is_internal
- created_at

### Attachment
- id (UUID), ticket_id (UUID), uploaded_by_id (UUID)
- original_filename, stored_filename, mime_type, size
- uploaded_at

### TicketEvent
- id (UUID), ticket_id (UUID), user_id (UUID), change_type, old_value, new_value
- created_at

### Category (renamed from Tag)
- id (UUID), name

### TicketCategory (renamed from TicketTag)
- id (UUID), ticket_id (UUID), category_id (UUID), created_at

### TicketPriority
- id (UUID), name

### Invite
- id (UUID), email, role, token, expires_at, status
- created_at, accepted_at

### Organization (NEW - not in current schema)
- id (UUID), name, domain, email, phone, address, is_active
- created_at, updated_at

### Settings (NEW - needs storage)
- System-wide settings stored in database or config

## API Endpoints Needed

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/profile

### Tickets
- GET /api/tickets (with filters, pagination, sorting)
- GET /api/tickets/:id
- POST /api/tickets
- PUT /api/tickets/:id
- POST /api/tickets/:id/comments
- POST /api/tickets/:id/attachments
- DELETE /api/tickets/:id/attachments/:attachmentId
- GET /api/tickets/stats
- POST /api/tickets/bulk-assign
- POST /api/tickets/bulk-status

### Users
- GET /api/users (admin only, with filters)
- GET /api/users/:id
- GET /api/users/me
- PUT /api/users/:id
- PATCH /api/users/:id/status
- GET /api/users/stats

### Categories (renamed from Tags)
- GET /api/categories
- POST /api/categories
- PUT /api/categories/:id
- DELETE /api/categories/:id

### Priorities
- GET /api/tickets/priorities
- POST /api/tickets/priorities
- PUT /api/tickets/priorities/:id
- DELETE /api/tickets/priorities/:id

### Invites
- POST /api/invites
- GET /api/invites
- POST /api/invites/:id/resend
- POST /api/invites/:id/revoke
- POST /api/invites/accept

### Organizations (NEW)
- GET /api/organizations
- GET /api/organizations/:id
- POST /api/organizations
- PUT /api/organizations/:id
- DELETE /api/organizations/:id
- GET /api/organizations/:id/users
- GET /api/organizations/:id/tickets

### Admin
- GET /api/admin/dashboard
- GET /api/admin/analytics
- GET /api/admin/analytics/tickets
- GET /api/admin/analytics/users
- GET /api/admin/analytics/agent-performance

### Agent
- GET /api/agent/dashboard
- GET /api/agent/tickets
- PATCH /api/agent/tickets/:id/status
- PATCH /api/agent/tickets/:id/priority
- GET /api/agent/performance

### Settings (NEW)
- GET /api/settings
- PUT /api/settings (or per-section endpoints)

## Migration Considerations

### Current Database → New Database
1. Users: Map existing users, convert Int IDs to UUIDs, preserve email mapping
2. Tickets: Map all ticket data, convert all Int IDs to UUIDs, maintain relationships
3. Comments: Preserve all comments, convert IDs to UUIDs
4. Attachments: Map attachment records (files may need separate migration), convert IDs to UUIDs
5. Categories: Map existing tags to categories, convert IDs to UUIDs
6. Priorities: Map existing priorities, convert IDs to UUIDs
7. Invites: Map existing invites, convert IDs to UUIDs
8. TicketEvents: Map all event history, convert IDs to UUIDs
9. Organizations: NEW - may need to create default org or assign users
10. **ID Conversion**: All Int IDs must be converted to UUIDs during migration
11. **Tag→Category**: All tag references must be renamed to category references

### Data Preservation
- All existing ticket data must be preserved
- User relationships must be maintained
- Attachment references must be preserved
- Event history must be maintained

