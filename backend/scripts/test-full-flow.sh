#!/bin/bash

echo "=========================================="
echo "Test Full Flow: Login -> Get Menu"
echo "=========================================="
echo ""

# 1. Login
echo "Step 1: Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -d '{"email":"admin@platform.com","password":"Admin123456"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE"
echo ""

# Check if login success
if echo "$LOGIN_RESPONSE" | grep -q '"access_token"'; then
  echo "✓ Login successful"
else
  echo "✗ Login failed"
  exit 1
fi

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\(.*\)"/\1/')
echo "Token: ${TOKEN:0:60}..."
echo ""

# 2. Get Menu
echo "Step 2: Get menu for user..."
MENU_RESPONSE=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Slug: demo_company" \
  http://localhost:3000/api/menuses/for-user)

echo "Menu Response:"
echo "$MENU_RESPONSE"
echo ""

# Check if menu request success
if echo "$MENU_RESPONSE" | grep -q '"code"'; then
  echo "✗ Menu request failed"
  exit 1
else
  echo "✓ Menu request successful"
fi

echo ""
echo "=========================================="
echo "All tests passed!"
echo "=========================================="
