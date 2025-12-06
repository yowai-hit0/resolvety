#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"
PUBLIC_API_URL="$BASE_URL/v1"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Public API Endpoint Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if API key is provided
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: API Key required${NC}"
  echo -e "${YELLOW}Usage: $0 <API_KEY>${NC}"
  echo -e "${YELLOW}Example: $0 rsk_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890${NC}"
  exit 1
fi

API_KEY="$1"
TEST_EMAIL="testuser$(date +%s)@example.com"
TEST_PHONE="+1234567890"
TEST_USER_ID=""

echo -e "${YELLOW}Using API Key: ${API_KEY:0:20}...${NC}\n"

# Test 1: Get Categories
echo -e "${YELLOW}[1/7] Testing GET /api/v1/categories...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$PUBLIC_API_URL/categories" \
  -H "X-API-Key: $API_KEY")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | python3 -m json.tool 2>/dev/null | head -10 || echo "$BODY" | head -5
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi
echo ""

# Test 2: Get Priorities
echo -e "${YELLOW}[2/7] Testing GET /api/v1/priorities...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$PUBLIC_API_URL/priorities" \
  -H "X-API-Key: $API_KEY")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
  PRIORITY_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')" 2>/dev/null)
  echo "$BODY" | python3 -m json.tool 2>/dev/null | head -10 || echo "$BODY" | head -5
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi
echo ""

# Test 3: Register User
echo -e "${YELLOW}[3/7] Testing POST /api/v1/users/register...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$PUBLIC_API_URL/users/register" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"phone\": \"$TEST_PHONE\",
    \"password\": \"TestPassword123!\",
    \"first_name\": \"Test\",
    \"last_name\": \"User\"
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
  TEST_USER_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['id'])" 2>/dev/null)
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi
echo ""

# Test 4: Get User Profile
if [ -n "$TEST_USER_ID" ]; then
  echo -e "${YELLOW}[4/7] Testing GET /api/v1/users/profile (by email)...${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$PUBLIC_API_URL/users/profile?email=$TEST_EMAIL" \
    -H "X-API-Key: $API_KEY")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
  fi
  echo ""
fi

# Test 5: Create Ticket
if [ -n "$PRIORITY_ID" ]; then
  echo -e "${YELLOW}[5/7] Testing POST /api/v1/tickets...${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$PUBLIC_API_URL/tickets" \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"subject\": \"Test Ticket from API\",
      \"description\": \"This is a test ticket created via the Public API\",
      \"requester_email\": \"$TEST_EMAIL\",
      \"requester_name\": \"Test User\",
      \"requester_phone\": \"$TEST_PHONE\",
      \"priority_id\": \"$PRIORITY_ID\",
      \"category_ids\": []
    }")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
    TICKET_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['id'])" 2>/dev/null)
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -20 || echo "$BODY" | head -10
  else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
  fi
  echo ""
fi

# Test 6: Get User Tickets
if [ -n "$TEST_USER_ID" ]; then
  echo -e "${YELLOW}[6/7] Testing GET /api/v1/tickets (user tickets)...${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$PUBLIC_API_URL/tickets?user_email=$TEST_EMAIL&skip=0&take=10" \
    -H "X-API-Key: $API_KEY")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -30 || echo "$BODY" | head -15
  else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
  fi
  echo ""
fi

# Test 7: Get Specific Ticket
if [ -n "$TICKET_ID" ]; then
  echo -e "${YELLOW}[7/7] Testing GET /api/v1/tickets/:ticketId...${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$PUBLIC_API_URL/tickets/$TICKET_ID?user_email=$TEST_EMAIL" \
    -H "X-API-Key: $API_KEY")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -40 || echo "$BODY" | head -20
  else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
  fi
  echo ""
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Test Suite Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"
echo -e "${YELLOW}📚 Swagger Documentation: http://localhost:3000/api/docs${NC}"
echo -e "${YELLOW}🔗 Public API Base URL: $PUBLIC_API_URL${NC}"

