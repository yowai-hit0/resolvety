# API Testing Guide

## Server Status
✅ **Server is running on:** http://localhost:3000
✅ **API Base URL:** http://localhost:3000/api
✅ **Swagger Documentation:** http://localhost:3000/api/docs

## Available Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user profile (requires auth)

### Tickets
- `GET /api/tickets` - Get all tickets (requires auth)
  - Query params: `skip`, `take`
- `GET /api/tickets/:id` - Get ticket by ID (requires auth)

### Users
- `GET /api/users` - Get all users (requires auth)
  - Query params: `skip`, `take`

## Testing with Swagger UI

1. Open http://localhost:3000/api/docs in your browser
2. Click "Authorize" button
3. Enter your JWT token (get it from login)
4. Test endpoints directly from Swagger UI

## Testing with cURL

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ybarasingiz@gmail.com","password":"YOUR_PASSWORD"}'
```

### 2. Get Tickets (with token)
```bash
curl http://localhost:3000/api/tickets?skip=0&take=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Ticket by ID
```bash
curl http://localhost:3000/api/tickets/TICKET_UUID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Migrated Data Available

- ✅ **9 Users** - Ready for login
- ✅ **104 Tickets** - Ready for testing
- ✅ **43 Comments** - Linked to tickets
- ✅ **82 Attachments** - Linked to tickets
- ✅ **240 Ticket Events** - Audit trail
- ✅ **115 Ticket-Category relationships** - All preserved

## Notes

- All endpoints require JWT authentication (except login/register)
- Use Swagger UI for interactive testing
- All data is from migrated database
- UUIDs are used for all IDs

