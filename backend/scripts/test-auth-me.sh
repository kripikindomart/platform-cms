#!/bin/bash

echo "Test /auth/me endpoint"
echo "======================"

# Login
echo "1. Login..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -d '{"email":"admin@platform.com","password":"Admin123456"}')

TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\(.*\)"/\1/')

if [ -z "$TOKEN" ]; then
  echo "ERROR: No token"
  exit 1
fi

echo "Token: ${TOKEN:0:50}..."
echo ""

# Test /auth/me
echo "2. Test /auth/me..."
ME_RESPONSE=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Slug: demo_company" \
  http://localhost:3000/api/auth/me)

echo "$ME_RESPONSE"
echo ""

if echo "$ME_RESPONSE" | grep -q '"email"'; then
  echo "✓ Auth me SUCCESS"
else
  echo "✗ Auth me FAILED"
fi
