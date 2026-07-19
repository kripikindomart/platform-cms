#!/bin/bash

# Test login and menu access

echo "1. Login..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -d @tests/test-login.json)

echo "$RESPONSE" | head -c 200
echo ""
echo ""

# Extract token using grep and sed
TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\(.*\)"/\1/')

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get token"
  exit 1
fi

echo "2. Token received: ${TOKEN:0:50}..."
echo ""

echo "3. Fetching menus..."
MENU_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Slug: demo_company" \
  http://localhost:3000/api/menuses/for-user)

echo "$MENU_RESPONSE"
echo ""

# Check if success
if echo "$MENU_RESPONSE" | grep -q '"code"'; then
  echo "ERROR: Request failed"
  exit 1
else
  echo "SUCCESS: Menu accessed successfully"
fi
