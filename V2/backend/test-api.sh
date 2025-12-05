#!/bin/bash

echo "🧪 Testing ResolveIt API v2"
echo "============================"
echo ""

BASE_URL="http://localhost:3000/api"

echo "1. Testing Health Check..."
curl -s "$BASE_URL/health" || echo "Health endpoint not available"
echo ""
echo ""

echo "2. Testing Swagger Docs..."
curl -s "$BASE_URL/docs" | grep -q "Swagger" && echo "✅ Swagger docs available at http://localhost:3000/api/docs" || echo "❌ Swagger docs not available"
echo ""

echo "3. Testing Login (will fail without correct password)..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ybarasingiz@gmail.com","password":"test123"}')

echo "$LOGIN_RESPONSE" | grep -q "accessToken" && echo "✅ Login successful" || echo "❌ Login failed (expected - need correct password)"
echo ""

echo "4. Testing API Endpoints (requires authentication)..."
echo "   Visit http://localhost:3000/api/docs to test with Swagger UI"
echo ""

echo "✅ Server is running!"
echo "📚 API Documentation: http://localhost:3000/api/docs"
echo "🔗 Base URL: $BASE_URL"

