# Data Migration Guide

## ⚠️ Migration Status: COMPLETE

**Note:** Data migration from old databases has been completed. This guide is kept for historical reference only.

The ResolveIt application now uses **only one database** located on the production server:
- **Server:** `159.198.65.38`
- **Database:** `resolveit_db`
- **Container:** `devslab-postgres`

## Overview

This script was used to migrate data from ResolveIt v1 (old database with Int IDs) to ResolveIt v2 (new database with UUID IDs) while **preserving ALL relationships**.

## What Was Migrated

### ✅ All Data Preserved
1. **Users** - All user accounts with passwords
2. **Tickets** - All tickets with full details
3. **Comments** - All comments linked to tickets ✅
4. **Attachments** - All attachments linked to tickets ✅
5. **Ticket Events** - All events linked to tickets ✅
6. **Ticket Tags → Categories** - All tags converted to categories ✅
7. **Ticket-Category Relationships** - All tag relationships preserved ✅
8. **Priorities** - All ticket priorities
9. **Invites** - All invitations

### 🔗 Relationships Preserved
- ✅ Ticket → User (created_by, assignee)
- ✅ Ticket → Priority
- ✅ Ticket → Categories (from Tags)
- ✅ Comment → Ticket
- ✅ Comment → User (author)
- ✅ Attachment → Ticket
- ✅ Attachment → User (uploaded_by)
- ✅ TicketEvent → Ticket
- ✅ TicketEvent → User

## Migration Order (Dependencies First)
1. **Priorities** (no dependencies)
2. **Tags → Categories** (no dependencies)
3. **Organizations** (create default)
4. **Users** (no user dependencies)
5. **Tickets** (depends on users, priorities)
6. **Ticket-Category Links** (depends on tickets, categories)
7. **Comments** (depends on tickets, users)
8. **Attachments** (depends on tickets, users)
9. **Ticket Events** (depends on tickets, users)
10. **Invites** (no dependencies)

## ID Mapping
The script created ID mappings to convert:
- Int IDs → UUID IDs
- Preserved all foreign key relationships
- Validated relationships before migration

## Current Database Configuration

The application now uses a single database on the production server:

```env
DATABASE_URL=postgresql://devslab_admin:devslab_secure_password_2024@devslab-postgres:5432/resolveit_db
```

See [database-credentials.md](../database/database-credentials.md) for complete connection details.

## Migration Scripts (Historical)

Migration scripts are located in `scripts/migration/` and are kept for historical reference:
- `migrate-data.ts` - TypeScript migration script
- `migrate-from-old-server.sh` - Complete migration script
- `export-from-old-server.sh` - Export script (no longer needed)
- `import-to-new-server.sh` - Import script (no longer needed)

**Note:** These scripts are no longer needed as migration is complete.

## Verification

Migration verification was completed. All data and relationships were successfully migrated.

## Notes

- **Audit Fields**: `created_by_id` and `updated_by_id` were set appropriately during migration
- **Organizations**: All users were assigned to a default organization
- **IP Addresses**: Not in old schema, so left as null initially
- **User Sessions**: Created as needed by the application
- **Login Attempts**: Tracked by the application going forward
