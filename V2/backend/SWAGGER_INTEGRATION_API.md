# Integration API - Swagger Documentation

All Integration API endpoints are fully documented in Swagger. Access the interactive API documentation at:

**`http://localhost:3000/api/docs`**

## Endpoint Groups

### 1. Apps Management (`/api/apps`)
All endpoints require JWT authentication (Bearer token).

#### GET `/api/apps`
- **Summary**: Get all apps
- **Description**: Retrieve a paginated list of apps. Optionally filter by organization.
- **Query Parameters**:
  - `organization_id` (optional): Filter by organization UUID
  - `skip` (optional): Number of records to skip (pagination)
  - `take` (optional): Number of records to return (pagination)
- **Response**: 200 - List of apps with pagination info

#### GET `/api/apps/:id`
- **Summary**: Get app by ID
- **Description**: Retrieve detailed information about a specific app including API keys and IP whitelist
- **Response**: 200 - App details with related data

#### POST `/api/apps`
- **Summary**: Create a new app
- **Description**: Create a new application for API integration
- **Request Body**: `CreateAppDto`
  - `name` (required): App name
  - `description` (optional): App description
  - `organization_id` (required): Organization UUID
- **Response**: 201 - Created app

#### PUT `/api/apps/:id`
- **Summary**: Update app
- **Request Body**: `UpdateAppDto`
  - `name` (optional): Updated name
  - `description` (optional): Updated description
  - `is_active` (optional): Active status
- **Response**: 200 - Updated app

#### DELETE `/api/apps/:id`
- **Summary**: Delete app
- **Response**: 200 - Success message

### 2. API Key Management (`/api/apps/:id/api-keys`)

#### POST `/api/apps/:id/api-keys`
- **Summary**: Create API key for app
- **Description**: Generate a new API key for the app. **The key will only be shown once - store it securely!**
- **Request Body**: `CreateApiKeyDto`
  - `name` (optional): Key name
  - `expires_at` (optional): Expiration date (ISO 8601)
- **Response**: 201 - API key object (includes the key only once!)

#### GET `/api/apps/:id/api-keys`
- **Summary**: Get all API keys for app
- **Description**: List all API keys (shows key prefix, not full key)
- **Response**: 200 - List of API keys

#### DELETE `/api/apps/:id/api-keys/:keyId`
- **Summary**: Revoke API key
- **Description**: Deactivate an API key (sets is_active to false)
- **Response**: 200 - Success message

### 3. IP Whitelist Management (`/api/apps/:id/ip-whitelist`)

#### POST `/api/apps/:id/ip-whitelist`
- **Summary**: Add IP to whitelist
- **Request Body**: `CreateIpWhitelistDto`
  - `ip_address` (required): IP address or CIDR (e.g., `192.168.1.0/24`)
  - `description` (optional): Description
- **Response**: 201 - Created whitelist entry

#### GET `/api/apps/:id/ip-whitelist`
- **Summary**: Get IP whitelist for app
- **Response**: 200 - List of whitelisted IPs

#### PUT `/api/apps/:id/ip-whitelist/:ipId`
- **Summary**: Update IP whitelist entry
- **Request Body**: `UpdateIpWhitelistDto`
  - `ip_address` (optional): Updated IP/CIDR
  - `description` (optional): Updated description
  - `is_active` (optional): Active status
- **Response**: 200 - Updated entry

#### DELETE `/api/apps/:id/ip-whitelist/:ipId`
- **Summary**: Remove IP from whitelist
- **Response**: 200 - Success message

### 4. Public API (`/api/v1`)
All endpoints require API key authentication (X-API-Key header or Authorization: Bearer).

#### POST `/api/v1/users/register`
- **Summary**: Register a new user via API
- **Description**: Register a new user in the organization associated with the API key. The user will be assigned the "customer" role by default.
- **Headers**:
  - `X-API-Key`: Your API key
  - OR `Authorization: Bearer <api-key>`
- **Request Body**: `ApiRegisterUserDto`
  - `email` (required): User email
  - `password` (required): User password
  - `first_name` (required): First name
  - `last_name` (required): Last name
  - `phone` (optional): Phone number
- **Response**: 201 - Created user object
- **Error Responses**:
  - 400: Invalid input or user already exists
  - 401: Invalid or missing API key
  - 403: IP address not whitelisted

#### POST `/api/v1/tickets`
- **Summary**: Create a new ticket via API
- **Description**: Create a new support ticket in the organization associated with the API key. The ticket will be associated with a system user.
- **Headers**:
  - `X-API-Key`: Your API key
  - OR `Authorization: Bearer <api-key>`
- **Request Body**: `ApiCreateTicketDto`
  - `subject` (required): Ticket subject
  - `description` (required): Ticket description
  - `requester_email` (optional): Requester email
  - `requester_name` (optional): Requester name
  - `requester_phone` (required): Requester phone
  - `location` (optional): Location
  - `priority_id` (required): Priority UUID
  - `category_ids` (optional): Array of category UUIDs
  - `assignee_id` (optional): Assignee user UUID
- **Response**: 201 - Created ticket object
- **Error Responses**:
  - 400: Invalid input data
  - 404: Priority or category not found
  - 401: Invalid or missing API key
  - 403: IP address not whitelisted

## Testing in Swagger

1. **Authenticate**: First, use the `/api/auth/login` endpoint to get a JWT token
2. **Click "Authorize"**: In Swagger UI, click the "Authorize" button and enter: `Bearer <your-jwt-token>`
3. **Test Apps Endpoints**: All `/api/apps/*` endpoints will use this token
4. **Create an App**: Use POST `/api/apps` to create a new app
5. **Generate API Key**: Use POST `/api/apps/:id/api-keys` to generate an API key (save it!)
6. **Add IP Whitelist**: Use POST `/api/apps/:id/ip-whitelist` to whitelist your IP
7. **Test Public API**: 
   - Click "Authorize" again
   - Select "apiKey" or "bearer" scheme
   - Enter your API key
   - Test `/api/v1/users/register` and `/api/v1/tickets`

## Example API Key Format

API keys are generated in the format:
```
rsk_<random-base64-string>
```

Example:
```
api_key_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

## Security Notes

- API keys are hashed using bcrypt before storage
- Keys are only shown once when created - store them securely!
- If IP whitelist is empty, all IPs are allowed
- If IP whitelist has entries, only whitelisted IPs can access the API
- IP is extracted from `X-Forwarded-For` header or connection remote address

## Response Examples

### Create API Key Response
```json
{
  "api_key": "rsk_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
  "key_prefix": "rsk_AbC",
  "name": "Production Key",
  "expires_at": "2025-12-31T23:59:59Z",
  "message": "Store this API key securely. It will not be shown again."
}
```

### Create Ticket Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "ticket_code": "RES-1234567890ABC",
  "subject": "API Created Ticket",
  "description": "This ticket was created via API",
  "status": "New",
  "priority": { ... },
  "categories": [ ... ],
  "created_at": "2025-01-01T00:00:00Z"
}
```

