#!/bin/bash

# Test script to check all API endpoints
API_BASE="http://localhost:3000/api"

echo "=== Testing API Endpoints ==="
echo ""

# Test 1: Health check (if exists)
echo "1. Testing health endpoint..."
curl -s "$API_BASE/health" 2>&1 | head -5
echo ""
echo "---"
echo ""

# Test 2: Organizations (should require auth)
echo "2. Testing organizations endpoint (no auth - should fail)..."
curl -s "$API_BASE/organizations?skip=0&take=10" 2>&1 | head -10
echo ""
echo "---"
echo ""

# Test 3: Check if backend is running
echo "3. Testing if backend is accessible..."
if curl -s --connect-timeout 2 "$API_BASE" > /dev/null 2>&1; then
    echo "✓ Backend is running on port 3000"
else
    echo "✗ Backend is NOT running on port 3000"
fi
echo ""

# Test 4: Check frontend
echo "4. Testing if frontend is accessible..."
if curl -s --connect-timeout 2 "http://localhost:3001" > /dev/null 2>&1; then
    echo "✓ Frontend is running on port 3001"
else
    echo "✗ Frontend is NOT running on port 3001"
fi
echo ""

echo "=== Test Complete ==="

