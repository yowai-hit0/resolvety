# Integration API Module

This module allows external applications to integrate with ResolveIt through API keys and IP whitelisting.

## Features

- **App Management**: Create and manage apps assigned to organizations
- **API Key Management**: Generate, view, and revoke API keys for apps
- **IP Whitelisting**: Restrict API access to specific IP addresses or CIDR ranges
- **User Registration**: Allow apps to register users in their organization
- **Ticket Creation**: Allow apps to create tickets via API

## Database Schema

### App Model
- `id`: UUID (primary key)
- `name`: App name
- `description`: Optional description
- `organization_id`: Foreign key to Organization
- `is_active`: Boolean flag
- Audit fields: `created_at`, `updated_at`, `created_by_id`, `updated_by_id`

### AppApiKey Model
- `id`: UUID (primary key)
- `app_id`: Foreign key to App
- `key_hash`: Hashed API key (bcrypt)
- `key_prefix`: First 12 characters for display
- `name`: Optional name for the key
- `last_used_at`: Timestamp of last use
- `last_used_ip`: IP address of last use
- `expires_at`: Optional expiration date
- `is_active`: Boolean flag

### AppIpWhitelist Model
- `id`: UUID (primary key)
- `app_id`: Foreign key to App
- `ip_address`: IP address or CIDR (e.g., 192.168.1.0/24)
- `description`: Optional description
- `is_active`: Boolean flag

## API Endpoints

### Admin Endpoints (Require JWT Authentication)

#### Apps Management
- `GET /api/apps` - List all apps (with optional organization filter)
- `GET /api/apps/:id` - Get app details
- `POST /api/apps` - Create a new app
- `PUT /api/apps/:id` - Update app
- `DELETE /api/apps/:id` - Delete app

#### API Key Management
- `POST /api/apps/:id/api-keys` - Create API key (returns key only once!)
- `GET /api/apps/:id/api-keys` - List all API keys for an app
- `DELETE /api/apps/:id/api-keys/:keyId` - Revoke API key

#### IP Whitelist Management
- `POST /api/apps/:id/ip-whitelist` - Add IP to whitelist
- `GET /api/apps/:id/ip-whitelist` - Get IP whitelist
- `PUT /api/apps/:id/ip-whitelist/:ipId` - Update IP whitelist entry
- `DELETE /api/apps/:id/ip-whitelist/:ipId` - Remove IP from whitelist

### Public API Endpoints (Require API Key Authentication)

#### User Registration
```
POST /api/v1/users/register
Headers:
  X-API-Key: rsk_...
  or
  Authorization: Bearer rsk_...

Body:
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890" (optional)
}
```

#### Ticket Creation
```
POST /api/v1/tickets
Headers:
  X-API-Key: rsk_...
  or
  Authorization: Bearer rsk_...

Body:
{
  "subject": "Ticket subject",
  "description": "Ticket description",
  "requester_email": "requester@example.com" (optional),
  "requester_name": "Requester Name" (optional),
  "requester_phone": "1234567890",
  "location": "Location" (optional),
  "priority_id": "uuid-of-priority",
  "category_ids": ["uuid1", "uuid2"] (optional),
  "assignee_id": "uuid-of-assignee" (optional)
}
```

## Security Features

### API Key Authentication
- API keys are hashed using bcrypt before storage
- Keys are only shown once when created
- Keys can be revoked (set to inactive)
- Keys can have expiration dates

### IP Whitelisting
- Supports single IP addresses (IPv4 and IPv6)
- Supports CIDR notation (e.g., 192.168.1.0/24)
- If whitelist is empty, all IPs are allowed
- If whitelist has entries, only whitelisted IPs are allowed
- IP is extracted from request headers (`X-Forwarded-For`, `x-forwarded-for`, or connection remote address)

### Request Flow
1. Client sends request with API key in header
2. `ApiKeyGuard` extracts API key and client IP
3. Service verifies API key hash against stored hashes
4. If valid, checks if app is active
5. If IP whitelist exists, verifies client IP is whitelisted
6. Updates API key `last_used_at` and `last_used_ip`
7. Attaches app info to request for use in controllers

## Usage Example

### 1. Create an App
```bash
POST /api/apps
Authorization: Bearer <jwt-token>
{
  "name": "My Integration App",
  "description": "App for integrating with our system",
  "organization_id": "uuid-of-organization"
}
```

### 2. Generate API Key
```bash
POST /api/apps/{app-id}/api-keys
Authorization: Bearer <jwt-token>
{
  "name": "Production Key",
  "expires_at": "2025-12-31T23:59:59Z" (optional)
}

Response:
{
  "api_key": "rsk_...", // Store this securely!
  "key_prefix": "rsk_abc",
  "name": "Production Key",
  "expires_at": "2025-12-31T23:59:59Z",
  "message": "Store this API key securely. It will not be shown again."
}
```

### 3. Add IP to Whitelist
```bash
POST /api/apps/{app-id}/ip-whitelist
Authorization: Bearer <jwt-token>
{
  "ip_address": "192.168.1.100",
  "description": "Production server"
}

# Or CIDR:
{
  "ip_address": "192.168.1.0/24",
  "description": "Office network"
}
```

### 4. Use API Key to Create Ticket
```bash
POST /api/v1/tickets
X-API-Key: rsk_...
{
  "subject": "API Created Ticket",
  "description": "This ticket was created via API",
  "requester_phone": "1234567890",
  "priority_id": "uuid-of-priority"
}
```

## Notes

- API keys are one-way hashed and cannot be retrieved after creation
- If an app has no IP whitelist entries, all IPs are allowed
- If an app has IP whitelist entries, only whitelisted IPs can use the API
- Users created via API are assigned the `customer` role by default
- Tickets created via API are associated with a system user in the app's organization
- All API endpoints are documented in Swagger at `/api/docs`

## Migration

To apply the database changes, run:
```bash
npx prisma migrate dev --name add_apps_integration
```

Or manually apply the migration SQL from `prisma/migrations/`.

