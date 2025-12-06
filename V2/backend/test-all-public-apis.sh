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
echo -e "${BLUE}  Complete Public API Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if API key is provided
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: API Key required${NC}"
  echo -e "${YELLOW}Usage: $0 <API_KEY>${NC}"
  echo -e "${YELLOW}Example: $0 api_key_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890${NC}"
  exit 1
fi

API_KEY="$1"
TEST_PHONE="+1234567890"
TEST_USER_ID=""
TEST_TICKET_ID=""
PRIORITY_ID=""
CATEGORY_IDS=""

echo -e "${YELLOW}Using API Key: ${API_KEY:0:20}...${NC}\n"

# Test 1: Get Categories
echo -e "${YELLOW}[1/8] Testing GET /api/v1/categories...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$PUBLIC_API_URL/categories" \
  -H "X-API-Key: $API_KEY")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
  CATEGORY_IDS=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(','.join([str(c['id']) for c in data[:2]]))" 2>/dev/null)
  echo "$BODY" | python3 -m json.tool 2>/dev/null | head -10 || echo "$BODY" | head -5
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
  exit 1
fi
echo ""

# Test 2: Get Priorities
echo -e "${YELLOW}[2/8] Testing GET /api/v1/priorities...${NC}"
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
  exit 1
fi
echo ""

# Test 3: Register User
echo -e "${YELLOW}[3/8] Testing POST /api/v1/users/register...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$PUBLIC_API_URL/users/register" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
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
  exit 1
fi
echo ""

# Test 4: Get User Profile
if [ -n "$TEST_USER_ID" ]; then
  echo -e "${YELLOW}[4/8] Testing GET /api/v1/users/profile?phone=$TEST_PHONE...${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$PUBLIC_API_URL/users/profile?phone=$TEST_PHONE" \
    -H "X-API-Key: $API_KEY")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
    PROFILE_USER_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['id'])" 2>/dev/null)
    if [ "$PROFILE_USER_ID" = "$TEST_USER_ID" ]; then
      echo -e "${GREEN}✅ User ID matches!${NC}"
    fi
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
  fi
  echo ""
fi

# Test 5: Create Ticket
if [ -n "$TEST_USER_ID" ] && [ -n "$PRIORITY_ID" ]; then
  echo -e "${YELLOW}[5/8] Testing POST /api/v1/tickets...${NC}"
  CATEGORY_ARRAY="[]"
  if [ -n "$CATEGORY_IDS" ]; then
    CATEGORY_ARRAY="[$(echo $CATEGORY_IDS | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/')]"
  fi
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$PUBLIC_API_URL/tickets" \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"subject\": \"Test Ticket from API\",
      \"description\": \"This is a test ticket created via the Public API\",
      \"user_id\": \"$TEST_USER_ID\",
      \"priority_id\": \"$PRIORITY_ID\",
      \"category_ids\": $CATEGORY_ARRAY,
      \"location\": \"Test Location\"
    }")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
    TEST_TICKET_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['id'])" 2>/dev/null)
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -30 || echo "$BODY" | head -15
  else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
  fi
  echo ""
fi

# Test 6: Get User Tickets
if [ -n "$TEST_USER_ID" ]; then
  echo -e "${YELLOW}[6/8] Testing GET /api/v1/tickets?user_id=$TEST_USER_ID...${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$PUBLIC_API_URL/tickets?user_id=$TEST_USER_ID&skip=0&take=10" \
    -H "X-API-Key: $API_KEY")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
    TICKET_COUNT=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('total', 0))" 2>/dev/null)
    echo -e "${GREEN}✅ Found $TICKET_COUNT ticket(s)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -40 || echo "$BODY" | head -20
  else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
  fi
  echo ""
fi

# Test 7: Get Specific Ticket
if [ -n "$TEST_TICKET_ID" ] && [ -n "$TEST_USER_ID" ]; then
  echo -e "${YELLOW}[7/8] Testing GET /api/v1/tickets/$TEST_TICKET_ID?user_id=$TEST_USER_ID...${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$PUBLIC_API_URL/tickets/$TEST_TICKET_ID?user_id=$TEST_USER_ID" \
    -H "X-API-Key: $API_KEY")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -50 || echo "$BODY" | head -25
  else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
  fi
  echo ""
fi

# Test 8: Get User Tickets with Status Filter
if [ -n "$TEST_USER_ID" ]; then
  echo -e "${YELLOW}[8/8] Testing GET /api/v1/tickets?user_id=$TEST_USER_ID&status=New...${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$PUBLIC_API_URL/tickets?user_id=$TEST_USER_ID&status=New&skip=0&take=10" \
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

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ All Tests Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"
echo -e "${YELLOW}📚 Swagger Documentation: http://localhost:3000/api/docs${NC}"
echo -e "${YELLOW}🔗 Public API Base URL: $PUBLIC_API_URL${NC}"

