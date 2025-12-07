# Schema Audit & Status Summary

## Complete Status Definitions

### UserRole Enum
- `super_admin` - Full system access
- `admin` - Administrative access
- `agent` - Support agent access
- `customer` - Customer access

### TicketStatus Enum
- `New` - Newly created ticket
- `Assigned` - Assigned to an agent
- `In_Progress` - Currently being worked on
- `On_Hold` - Temporarily paused
- `Resolved` - Issue resolved, awaiting confirmation
- `Closed` - Ticket closed
- `Reopened` - Ticket reopened after closure

### InviteStatus Enum
- `PENDING` - Invitation sent, awaiting acceptance
- `ACCEPTED` - Invitation accepted
- `REVOKED` - Invitation revoked by admin
- `EXPIRED` - Invitation expired

## Audit Fields Coverage

### All Models Include:
✅ **created_at** - Timestamp when record was created
✅ **updated_at** - Timestamp when record was last updated (auto-updated)

### Models with created_by_id & updated_by_id:
✅ **User** - Tracks who created/updated the user
✅ **Organization** - Tracks who created/updated the organization
✅ **Ticket** - Tracks who created/updated the ticket
✅ **Category** - Tracks who created/updated the category
✅ **TicketPriority** - Tracks who created/updated the priority
✅ **Invite** - Tracks who created/updated the invite
✅ **Comment** - Has author_id (creator) and updated_by_id (if edited)

### Models with Additional Status Fields:
✅ **User** - `is_active` (Boolean), `last_login_at` (DateTime)
✅ **Organization** - `is_active` (Boolean)
✅ **Ticket** - `status` (TicketStatus enum), `resolved_at`, `closed_at`
✅ **Category** - `is_active` (Boolean)
✅ **TicketPriority** - `is_active` (Boolean), `sort_order` (Int)
✅ **Invite** - `status` (InviteStatus enum), `accepted_at`
✅ **Attachment** - `is_deleted` (Boolean), `deleted_at`, `deleted_by_id`

### Special Tracking Fields:
- **Ticket**: `resolved_at`, `closed_at` - Track resolution lifecycle
- **User**: `last_login_at` - Track user activity
- **Attachment**: `is_deleted`, `deleted_at`, `deleted_by_id` - Soft delete tracking
- **TicketPriority**: `sort_order` - For ordering priorities

## Complete Field Coverage by Model

### User
- ✅ id (UUID)
- ✅ email, password_hash, first_name, last_name
- ✅ role (UserRole enum)
- ✅ is_active (Boolean)
- ✅ organization_id (UUID, optional)
- ✅ created_at, updated_at
- ✅ created_by_id, updated_by_id
- ✅ last_login_at

### Organization
- ✅ id (UUID)
- ✅ name, domain, email, phone, address
- ✅ is_active (Boolean)
- ✅ created_at, updated_at
- ✅ created_by_id, updated_by_id

### Ticket
- ✅ id (UUID)
- ✅ ticket_code (unique)
- ✅ subject, description
- ✅ requester_email, requester_name, requester_phone, location
- ✅ status (TicketStatus enum)
- ✅ created_at, updated_at
- ✅ resolved_at, closed_at
- ✅ created_by_id, updated_by_id
- ✅ assignee_id, priority_id

### Comment
- ✅ id (UUID)
- ✅ content
- ✅ is_internal (Boolean)
- ✅ created_at, updated_at
- ✅ ticket_id, author_id, updated_by_id

### TicketEvent
- ✅ id (UUID)
- ✅ change_type, old_value, new_value
- ✅ created_at
- ✅ ticket_id, user_id

### Attachment
- ✅ id (UUID)
- ✅ original_filename, stored_filename, mime_type, size
- ✅ is_deleted (Boolean)
- ✅ uploaded_at, deleted_at
- ✅ ticket_id, uploaded_by_id, deleted_by_id

### TicketPriority
- ✅ id (UUID)
- ✅ name (unique)
- ✅ is_active (Boolean)
- ✅ sort_order (Int)
- ✅ created_at, updated_at
- ✅ created_by_id, updated_by_id

### Category
- ✅ id (UUID)
- ✅ name (unique)
- ✅ is_active (Boolean)
- ✅ created_at, updated_at
- ✅ created_by_id, updated_by_id

### TicketCategory
- ✅ id (UUID)
- ✅ created_at
- ✅ ticket_id, category_id

### Invite
- ✅ id (UUID)
- ✅ email, role, token
- ✅ status (InviteStatus enum)
- ✅ expires_at, accepted_at
- ✅ created_at, updated_at
- ✅ created_by_id, updated_by_id

## Indexes for Performance

All models have appropriate indexes on:
- Primary keys (automatic)
- Foreign keys
- Status fields
- Timestamp fields (created_at, updated_at)
- Searchable fields (email, name)
- Unique constraints where needed

## Data Integrity

- ✅ All foreign keys properly defined
- ✅ Cascade deletes where appropriate
- ✅ SetNull for optional audit fields
- ✅ Unique constraints on email, token, ticket_code, name fields
- ✅ Default values for status fields
- ✅ Default values for is_active fields

