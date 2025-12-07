# Public API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require API Key authentication via one of these methods:
- Header: `X-API-Key: <your-api-key>`
- Header: `Authorization: Bearer <your-api-key>`

Additionally, the requesting IP address must be whitelisted for the app.

## Endpoints

### 1. GET `/api/v1/categories`
Get all available categories for ticket classification.

**Headers:**
- `X-API-Key`: Your API key

**Response (200):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Technical Support",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Error Responses:**
- `401`: Invalid or missing API key
- `403`: IP address not whitelisted

---

### 2. GET `/api/v1/priorities`
Get all available priorities for ticket creation.

**Headers:**
- `X-API-Key`: Your API key

**Response (200):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "High",
    "sort_order": 1,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Error Responses:**
- `401`: Invalid or missing API key
- `403`: IP address not whitelisted

---

### 3. POST `/api/v1/users/register`
Register a new user in the organization associated with the API key.

**Headers:**
- `X-API-Key`: Your API key
- `Content-Type`: application/json

**Request Body:**
```json
{
  "email": "user@example.com",        // Optional
  "phone": "+1234567890",              // Required
  "password": "SecurePassword123!",     // Required
  "first_name": "John",                // Required
  "last_name": "Doe"                   // Required
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer",
  "organization_id": "123e4567-e89b-12d3-a456-426614174001",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400`: Invalid input data or user already exists
- `401`: Invalid or missing API key
- `403`: IP address not whitelisted

**Notes:**
- If email is not provided, a unique email will be auto-generated from the phone number
- User will be assigned the "customer" role by default
- User will be created in the app's organization

---

### 4. GET `/api/v1/users/profile`
Get user profile by email or user ID.

**Headers:**
- `X-API-Key`: Your API key

**Query Parameters:**
- `email` (optional): User email address
- `user_id` (optional): User UUID
- **At least one must be provided**

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer",
  "organization_id": "123e4567-e89b-12d3-a456-426614174001",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400`: Invalid input data or user does not belong to organization
- `404`: User not found
- `401`: Invalid or missing API key
- `403`: IP address not whitelisted

---

### 5. POST `/api/v1/tickets`
Create a new support ticket.

**Headers:**
- `X-API-Key`: Your API key
- `Content-Type`: application/json

**Request Body:**
```json
{
  "subject": "API Created Ticket",                    // Required
  "description": "Ticket description",                // Required
  "requester_email": "requester@example.com",         // Optional
  "requester_name": "John Requester",                 // Optional
  "requester_phone": "+1234567890",                   // Required
  "location": "Office Building A, Room 101",           // Optional
  "priority_id": "123e4567-e89b-12d3-a456-426614174000",  // Required
  "category_ids": [                                    // Optional
    "123e4567-e89b-12d3-a456-426614174001",
    "123e4567-e89b-12d3-a456-426614174002"
  ],
  "assignee_id": "123e4567-e89b-12d3-a456-426614174003"  // Optional
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "ticket_code": "RES-1234567890ABC",
  "subject": "API Created Ticket",
  "description": "Ticket description",
  "status": "New",
  "requester_email": "requester@example.com",
  "requester_name": "John Requester",
  "requester_phone": "+1234567890",
  "location": "Office Building A, Room 101",
  "priority": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "High"
  },
  "assignee": null,
  "categories": [
    {
      "category": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "name": "Technical Support"
      }
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400`: Invalid input data
- `404`: Priority or category not found
- `401`: Invalid or missing API key
- `403`: IP address not whitelisted

---

### 6. GET `/api/v1/tickets`
Get tickets for a user (tickets they created or are assigned to).

**Headers:**
- `X-API-Key`: Your API key

**Query Parameters:**
- `user_email` (optional): User email address
- `user_id` (optional): User UUID
- `status` (optional): Filter by status (`New`, `Assigned`, `In_Progress`, `On_Hold`, `Resolved`, `Closed`, `Reopened`)
- `skip` (optional): Number of records to skip (default: 0)
- `take` (optional): Number of records to return (default: 10)
- **At least one of `user_email` or `user_id` must be provided**

**Response (200):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "ticket_code": "RES-1234567890ABC",
      "subject": "Ticket Subject",
      "status": "New",
      "priority": { "id": "...", "name": "High" },
      "categories": [...],
      "comments": [...],
      "attachments": [...],
      "ticket_events": [...],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "skip": 0,
  "take": 10,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Error Responses:**
- `400`: Invalid input data or user does not belong to organization
- `404`: User not found
- `401`: Invalid or missing API key
- `403`: IP address not whitelisted

---

### 7. GET `/api/v1/tickets/:ticketId`
Get a specific ticket with all details for a user.

**Headers:**
- `X-API-Key`: Your API key

**Path Parameters:**
- `ticketId`: Ticket UUID

**Query Parameters:**
- `user_email` (optional): User email address
- `user_id` (optional): User UUID
- **At least one of `user_email` or `user_id` must be provided**

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "ticket_code": "RES-1234567890ABC",
  "subject": "Ticket Subject",
  "description": "Full ticket description",
  "status": "New",
  "priority": { "id": "...", "name": "High" },
  "categories": [
    {
      "category": {
        "id": "...",
        "name": "Technical Support"
      }
    }
  ],
  "comments": [
    {
      "id": "...",
      "content": "Comment text",
      "author": {
        "id": "...",
        "email": "agent@example.com",
        "first_name": "Agent",
        "last_name": "Name"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "attachments": [
    {
      "id": "...",
      "file_name": "document.pdf",
      "file_path": "/uploads/...",
      "file_size": 1024,
      "uploaded_by": {
        "id": "...",
        "email": "user@example.com",
        "first_name": "User",
        "last_name": "Name"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "ticket_events": [
    {
      "id": "...",
      "event_type": "status_changed",
      "old_value": "New",
      "new_value": "Assigned",
      "user": {
        "id": "...",
        "email": "agent@example.com",
        "first_name": "Agent",
        "last_name": "Name"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400`: Invalid input data or user does not belong to organization
- `404`: User or ticket not found, or user does not have access
- `401`: Invalid or missing API key
- `403`: IP address not whitelisted

---

## Testing

### Using the Test Script
```bash
cd v2/backend
./scripts/test-public-api.sh <YOUR_API_KEY>
```

### Using cURL
```bash
# Get Categories
curl -X GET "http://localhost:3000/api/v1/categories" \
  -H "X-API-Key: YOUR_API_KEY"

# Register User
curl -X POST "http://localhost:3000/api/v1/users/register" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Using Swagger UI
1. Open http://localhost:3000/api/docs
2. Find the "Public API" section
3. Click "Authorize" and enter your API key
4. Test endpoints interactively

---

## Swagger Documentation Status

✅ All 7 endpoints are fully documented in Swagger:
1. ✅ GET `/api/v1/categories`
2. ✅ GET `/api/v1/priorities`
3. ✅ POST `/api/v1/users/register`
4. ✅ GET `/api/v1/users/profile`
5. ✅ POST `/api/v1/tickets`
6. ✅ GET `/api/v1/tickets`
7. ✅ GET `/api/v1/tickets/:ticketId`

All endpoints include:
- ✅ Operation summaries and descriptions
- ✅ Request/response schemas
- ✅ Query parameters documentation
- ✅ Path parameters documentation
- ✅ Error response codes
- ✅ Authentication requirements

