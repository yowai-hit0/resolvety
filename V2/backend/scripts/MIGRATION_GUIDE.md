# Data Migration Guide

## Overview
This script migrates data from ResolveIt v1 (old database with Int IDs) to ResolveIt v2 (new database with UUID IDs) while **preserving ALL relationships**.

## What Gets Migrated

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
The script creates ID mappings to convert:
- Int IDs → UUID IDs
- Preserves all foreign key relationships
- Validates relationships before migration

## Running the Migration

### Prerequisites
```bash
cd backend-v2
npm install
```

### Set Environment Variables
Ensure `.env` has:
```env
DATABASE_URL=postgresql://admin:Zoea2025Secure@172.16.40.61:5432/resolveit
OLD_DATABASE_URL=postgresql://neondb_owner:npg_Smq0sbr4eKGN@ep-damp-bread-agyxow1t.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Run Migration
```bash
npm run migrate:data
```

## Verification

After migration, the script will:
- ✅ Count all migrated records
- ✅ Verify ticket-comment relationships
- ✅ Verify ticket-category relationships
- ✅ Report any missing relationships

## Error Handling

The script will:
- ❌ Skip records with missing foreign keys
- ❌ Report errors for invalid relationships
- ✅ Continue migration even if some records fail
- ✅ Provide detailed error messages

## Rollback

If migration fails:
1. The new database remains unchanged
2. You can re-run the migration
3. Old database is never modified (read-only)

## Notes

- **Audit Fields**: `created_by_id` and `updated_by_id` are set to `created_by_id` for tickets (old schema doesn't have this)
- **Organizations**: All users are assigned to a default organization
- **IP Addresses**: Not in old schema, so left as null
- **User Sessions**: Not in old schema, so not migrated
- **Login Attempts**: Not in old schema, so not migrated

