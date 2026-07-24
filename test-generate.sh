#!/bin/bash

# Quick Test: Generate Module dengan Frontend
# Branch: claude/add-skill-c09nwj

echo "🚀 Testing Module Generator dengan Frontend Generation"
echo ""

# Configuration
API_BASE="http://localhost:3000/api"
TENANT_SLUG="demo_company"
JWT_TOKEN=""  # Will get from login

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 0: Login (get JWT token)
echo "================================================"
echo "[STEP 0] Login to get JWT token..."
echo "================================================"
echo ""
echo "Please run this first to get token:"
echo ""
echo -e "${YELLOW}curl -X POST $API_BASE/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"X-Tenant-Slug: $TENANT_SLUG\" \\"
echo "  -d '{\"email\":\"admin@platform.com\",\"password\":\"your-password\"}'${NC}"
echo ""
read -p "Paste JWT token here: " JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
  echo -e "${RED}❌ Token is required!${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✓ Token received${NC}"
echo ""

# Step 1: Create Module Schema
echo "================================================"
echo "[STEP 1] Creating module schema: test-categories"
echo "================================================"
echo ""

CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/module-generator" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "moduleName": "test-categories",
    "displayName": "Test Categories",
    "description": "Test module for frontend generation",
    "isTenantIsolated": true,
    "hasSoftDelete": true,
    "hasAudit": true,
    "fields": [
      {
        "name": "name",
        "label": "Category Name",
        "type": "string",
        "length": 255,
        "isRequired": true,
        "isUnique": true,
        "isVisibleInList": true,
        "order": 1
      },
      {
        "name": "description",
        "label": "Description",
        "type": "text",
        "isRequired": false,
        "isUnique": false,
        "isVisibleInList": true,
        "order": 2
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "boolean",
        "isRequired": true,
        "isUnique": false,
        "isVisibleInList": true,
        "order": 3
      }
    ],
    "searchableFields": ["name", "description"],
    "filterableFields": ["is_active"],
    "sortableFields": ["name", "created_at"]
  }')

echo "$CREATE_RESPONSE"
echo ""

# Extract module ID
MODULE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ -z "$MODULE_ID" ]; then
  echo -e "${RED}❌ Failed to create module!${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Module created with ID: $MODULE_ID${NC}"
echo ""

# Step 2: Update UI Config (use modals)
echo "================================================"
echo "[STEP 2] Updating UI config (modal forms)..."
echo "================================================"
echo ""

UPDATE_RESPONSE=$(curl -s -X PATCH "$API_BASE/module-generator/$MODULE_ID" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "uiConfig": {
      "createFormType": "modal",
      "editFormType": "modal"
    }
  }')

echo "$UPDATE_RESPONSE"
echo ""
echo -e "${GREEN}✓ UI config updated${NC}"
echo ""

# Wait a bit
sleep 2

# Step 3: Assign to Tenant (Generate!)
echo "================================================"
echo "[STEP 3] Assigning to tenant & generating code..."
echo "================================================"
echo ""

ASSIGN_RESPONSE=$(curl -s -X POST "$API_BASE/module-generator/$MODULE_ID/assign" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "$ASSIGN_RESPONSE"
echo ""

# Check files created count
FILES_CREATED=$(echo "$ASSIGN_RESPONSE" | grep -o '"filesCreated":[0-9]*' | grep -o '[0-9]*')

echo ""
if [ "$FILES_CREATED" -gt "12" ]; then
  echo -e "${GREEN}✓ Generation completed! Files created: $FILES_CREATED${NC}"
  echo -e "${GREEN}  (Expected ~18 files with frontend generation)${NC}"
else
  echo -e "${YELLOW}⚠ Only $FILES_CREATED files created${NC}"
  echo -e "${YELLOW}  (Expected ~18 files with frontend generation)${NC}"
fi
echo ""

# Step 4: Verify Files
echo "================================================"
echo "[STEP 4] Verifying generated files..."
echo "================================================"
echo ""

echo "Backend files:"
ls -1 backend/src/modules/test-categories/ 2>/dev/null && echo -e "${GREEN}✓ Backend module exists${NC}" || echo -e "${RED}✗ Backend module missing${NC}"
ls backend/src/database/schema/tenant/test_categories.schema.ts 2>/dev/null && echo -e "${GREEN}✓ Schema file exists${NC}" || echo -e "${RED}✗ Schema file missing${NC}"
ls backend/migrations/*test_categories*.sql 2>/dev/null && echo -e "${GREEN}✓ Migration file exists${NC}" || echo -e "${RED}✗ Migration file missing${NC}"

echo ""
echo "Frontend files:"
ls frontend/app/\(private\)/org/\[tenant\]/portal/test-categories/page.tsx 2>/dev/null && echo -e "${GREEN}✓ List page exists${NC}" || echo -e "${RED}✗ List page missing${NC}"
ls frontend/app/\(private\)/org/\[tenant\]/portal/test-categories/components/ 2>/dev/null && echo -e "${GREEN}✓ Components folder exists${NC}" || echo -e "${RED}✗ Components folder missing${NC}"
ls frontend/app/\(private\)/org/\[tenant\]/portal/test-categories/hooks/ 2>/dev/null && echo -e "${GREEN}✓ Hooks folder exists${NC}" || echo -e "${RED}✗ Hooks folder missing${NC}"
ls frontend/app/\(private\)/org/\[tenant\]/portal/test-categories/services/ 2>/dev/null && echo -e "${GREEN}✓ Services folder exists${NC}" || echo -e "${RED}✗ Services folder missing${NC}"

echo ""
echo "================================================"
echo "🎉 Test completed!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Check TypeScript compilation:"
echo "   cd backend && npm run type-check"
echo "   cd frontend && npm run type-check"
echo ""
echo "2. Start frontend and test in browser:"
echo "   cd frontend && npm run dev"
echo "   Navigate to: http://localhost:3001/org/$TENANT_SLUG/portal/test-categories"
echo ""
echo "3. Clean up test module when done:"
echo "   curl -X DELETE $API_BASE/module-generator/$MODULE_ID \\"
echo "     -H \"X-Tenant-Slug: $TENANT_SLUG\" \\"
echo "     -H \"Authorization: Bearer \$JWT_TOKEN\""
echo ""
