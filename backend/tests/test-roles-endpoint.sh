#!/bin/bash

echo "Test Roles Endpoint"
echo "==================="

# Login
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -d '{"email":"admin@platform.com","password":"Admin123456"}')

echo "Login response:"
echo "$RESPONSE" | head -c 300
echo ""
echo ""

TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\(.*\)"/\1/')

if [ -z "$TOKEN" ]; then
  echo "ERROR: No token received"
  exit 1
fi

echo "Token extracted: ${TOKEN:0:60}..."
echo ""

# Test roles endpoint
echo "Testing GET /api/roles..."
ROLES_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Slug: demo_company" \
  http://localhost:3000/api/roles)

HTTP_STATUS=$(echo "$ROLES_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$ROLES_RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response Body:"
echo "$BODY"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✓ SUCCESS"
else
  echo "✗ FAILED with status $HTTP_STATUS"
fi
