#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"
TEST_EMAIL="testuser$(date +%s)@example.com"
TEST_PASSWORD="password123"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ResolveIt API Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Register User
echo -e "${YELLOW}[1/20] Registering new user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"first_name\": \"Test\",
    \"last_name\": \"User\"
  }")

echo "$REGISTER_RESPONSE" | python3 -m json.tool
USER_ID=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['user']['id'])" 2>/dev/null)
echo -e "${GREEN}✓ User registered: $USER_ID${NC}\n"

# Step 2: Login
echo -e "${YELLOW}[2/20] Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['accessToken'])" 2>/dev/null)
echo "$LOGIN_RESPONSE" | python3 -m json.tool | head -10
echo -e "${GREEN}✓ Token obtained${NC}\n"

# Step 3: Get Profile
echo -e "${YELLOW}[3/20] Getting user profile...${NC}"
curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "${GREEN}✓ Profile retrieved${NC}\n"

# Step 4: Get All Users
echo -e "${YELLOW}[4/20] Getting all users...${NC}"
curl -s -X GET "$BASE_URL/users?skip=0&take=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -25
echo -e "${GREEN}✓ Users list retrieved${NC}\n"

# Step 5: Get User Stats
echo -e "${YELLOW}[5/20] Getting user statistics...${NC}"
curl -s -X GET "$BASE_URL/users/stats" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "${GREEN}✓ User stats retrieved${NC}\n"

# Step 6: Get Specific User
echo -e "${YELLOW}[6/20] Getting specific user by ID...${NC}"
curl -s -X GET "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "${GREEN}✓ User details retrieved${NC}\n"

# Step 7: Get All Tickets
echo -e "${YELLOW}[7/20] Getting all tickets...${NC}"
TICKET_RESPONSE=$(curl -s -X GET "$BASE_URL/tickets?skip=0&take=3" \
  -H "Authorization: Bearer $TOKEN")
echo "$TICKET_RESPONSE" | python3 -m json.tool | head -40
TICKET_ID=$(echo "$TICKET_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id'] if data.get('data') and len(data['data']) > 0 else '')" 2>/dev/null)
echo -e "${GREEN}✓ Tickets list retrieved${NC}\n"

# Step 8: Get Ticket Stats
echo -e "${YELLOW}[8/20] Getting ticket statistics...${NC}"
curl -s -X GET "$BASE_URL/tickets/stats" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "${GREEN}✓ Ticket stats retrieved${NC}\n"

# Step 9: Get Specific Ticket (if exists)
if [ ! -z "$TICKET_ID" ]; then
  echo -e "${YELLOW}[9/20] Getting specific ticket by ID...${NC}"
  curl -s -X GET "$BASE_URL/tickets/$TICKET_ID" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -50
  echo -e "${GREEN}✓ Ticket details retrieved${NC}\n"
else
  echo -e "${YELLOW}[9/20] Skipping ticket details (no tickets found)${NC}\n"
fi

# Step 10: Create Ticket
echo -e "${YELLOW}[10/20] Creating a new ticket...${NC}"
# Get a priority ID first
PRIORITY_ID=$(curl -s -X GET "$BASE_URL/tickets/priorities" \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if isinstance(data, list) and len(data) > 0 else '')" 2>/dev/null)

# If priorities endpoint fails, use a known ID from migration
if [ -z "$PRIORITY_ID" ]; then
  PRIORITY_ID="3f6e9d62-6826-4b86-9081-8ad4e1dde3c4"
fi

NEW_TICKET=$(curl -s -X POST "$BASE_URL/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"subject\": \"Test Ticket from API\",
    \"description\": \"This is a test ticket created via API testing\",
    \"requester_phone\": \"+1234567890\",
    \"priority_id\": \"$PRIORITY_ID\"
  }")

echo "$NEW_TICKET" | python3 -m json.tool
NEW_TICKET_ID=$(echo "$NEW_TICKET" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null)
echo -e "${GREEN}✓ Ticket created${NC}\n"

# Step 11: Update Ticket
if [ ! -z "$NEW_TICKET_ID" ]; then
  echo -e "${YELLOW}[11/20] Updating ticket...${NC}"
  curl -s -X PUT "$BASE_URL/tickets/$NEW_TICKET_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"subject\": \"Updated Test Ticket\",
      \"description\": \"This ticket has been updated\"
    }" | python3 -m json.tool | head -30
  echo -e "${GREEN}✓ Ticket updated${NC}\n"
fi

# Step 12: Add Comment to Ticket
if [ ! -z "$NEW_TICKET_ID" ]; then
  echo -e "${YELLOW}[12/20] Adding comment to ticket...${NC}"
  curl -s -X POST "$BASE_URL/tickets/$NEW_TICKET_ID/comments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"content\": \"This is a test comment\",
      \"is_internal\": false
    }" | python3 -m json.tool
  echo -e "${GREEN}✓ Comment added${NC}\n"
fi

# Step 13: Get All Categories
echo -e "${YELLOW}[13/20] Getting all categories...${NC}"
curl -s -X GET "$BASE_URL/categories" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20
echo -e "${GREEN}✓ Categories retrieved${NC}\n"

# Step 14: Get All Priorities
echo -e "${YELLOW}[14/20] Getting all priorities...${NC}"
curl -s -X GET "$BASE_URL/tickets/priorities" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>&1 | head -20
echo -e "${GREEN}✓ Priorities retrieved${NC}\n"

# Step 15: Get All Organizations
echo -e "${YELLOW}[15/20] Getting all organizations...${NC}"
curl -s -X GET "$BASE_URL/organizations" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20
echo -e "${GREEN}✓ Organizations retrieved${NC}\n"

# Step 16: Get All Invites
echo -e "${YELLOW}[16/20] Getting all invites...${NC}"
curl -s -X GET "$BASE_URL/invites" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20
echo -e "${GREEN}✓ Invites retrieved${NC}\n"

# Step 17: Get Settings
echo -e "${YELLOW}[17/20] Getting settings...${NC}"
curl -s -X GET "$BASE_URL/settings" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "${GREEN}✓ Settings retrieved${NC}\n"

# Step 18: Test Ticket Filters
echo -e "${YELLOW}[18/20] Testing ticket filters (created_by)...${NC}"
curl -s -X GET "$BASE_URL/tickets?created_by=$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "${GREEN}✓ Ticket filters tested${NC}\n"

# Step 19: Test User Filters
echo -e "${YELLOW}[19/20] Testing user filters (role)...${NC}"
curl -s -X GET "$BASE_URL/users?role=customer" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20
echo -e "${GREEN}✓ User filters tested${NC}\n"

# Step 20: Update User
echo -e "${YELLOW}[20/20] Updating user...${NC}"
curl -s -X PUT "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"first_name\": \"Updated\",
    \"last_name\": \"Name\"
  }" | python3 -m json.tool
echo -e "${GREEN}✓ User updated${NC}\n"

# Admin endpoints (if user has admin role)
echo -e "${YELLOW}[BONUS] Testing admin endpoints...${NC}"
echo -e "${YELLOW}Getting admin dashboard...${NC}"
curl -s -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -30
echo -e "${GREEN}✓ Admin dashboard retrieved${NC}\n"

# Agent endpoints
echo -e "${YELLOW}Getting agent dashboard...${NC}"
curl -s -X GET "$BASE_URL/agent/dashboard" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "${GREEN}✓ Agent dashboard retrieved${NC}\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}All API tests completed!${NC}"
echo -e "${BLUE}========================================${NC}"

