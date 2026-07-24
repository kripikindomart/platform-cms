# Testing Frontend Generation - Panduan Manual

**Branch**: `claude/add-skill-c09nwj`  
**Feature**: Frontend CRUD Pages Generation  
**Tester**: Manual testing via Postman/Browser

---

## 🎯 Yang Akan Ditest

Frontend generation sekarang sudah bisa generate:
1. **List Page** (`page.tsx`) - Table dengan pagination
2. **Create Modal** - Dialog untuk create (jika `createFormType: 'modal'`)
3. **Create Page** - Full page untuk create (jika `createFormType: 'page'`)
4. **Edit Modal** - Dialog untuk edit (jika `editFormType: 'modal'`)
5. **Edit Page** - Full page untuk edit (jika `editFormType: 'page'`)
6. **Delete Dialog** - Confirmation dialog
7. **DataTable Component** - Reusable table
8. **React Hook** - `use-{module}.ts` untuk data fetching
9. **API Service** - Service layer untuk API calls

---

## 📋 Prerequisites

### 1. Backend Running
```bash
cd backend
npm run start:dev

# Wait until you see:
# [Nest] ... - Application is running on: http://localhost:3000
```

### 2. Frontend Running (optional, untuk visual test)
```bash
cd frontend
npm run dev

# Access: http://localhost:3001
```

### 3. Get JWT Token

**Option A**: Login via API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -d '{
    "email": "admin@platform.com",
    "password": "your-password"
  }'

# Response will have: { "access_token": "eyJ..." }
# Copy the token!
```

**Option B**: Login via Frontend
- Go to: http://localhost:3001/login
- Login dengan admin credentials
- Open DevTools → Application → Local Storage
- Copy token dari `auth_token` atau similar

---

## 🧪 Test Case 1: Generate Module dengan Modal Forms

**Scenario**: Simple CRUD module (≤5 fields) → Use modals

### Step 1: Create Module Schema

```bash
curl -X POST http://localhost:3000/api/module-generator \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "moduleName": "categories",
    "displayName": "Categories",
    "description": "Product categories",
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
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Schema berhasil disimpan! Lanjutkan ke Form Builder.",
  "data": {
    "id": 1,
    "moduleName": "categories",
    "displayName": "Categories",
    "status": "draft",
    "fieldsCount": 3,
    "nextStep": "form_builder"
  }
}
```

**Copy the `id` from response!** (misal: `1`)

---

### Step 2: Update UI Config (MODAL)

```bash
curl -X PATCH http://localhost:3000/api/module-generator/1 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "uiConfig": {
      "createFormType": "modal",
      "editFormType": "modal"
    }
  }'
```

**Expected**: Success response

---

### Step 3: Assign to Tenant (Generate!)

```bash
curl -X POST http://localhost:3000/api/module-generator/1/assign \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Module 'categories' berhasil di-assign ke tenant",
  "data": {
    "moduleId": 1,
    "moduleName": "categories",
    "displayName": "Categories",
    "tenantId": 1,
    "filesCreated": 18,  // ← Should be ~18 files now (backend + frontend)
    "permissionsCreated": 4,
    "menuItemCreated": true,
    "files": [
      "src/modules/categories/...",
      "frontend/app/(private)/org/[tenant]/portal/categories/..."
    ]
  }
}
```

**Check `filesCreated` should be ~18** (bukan 12 lagi!)

---

### Step 4: Verify Generated Files

**Backend files** (should exist):
```bash
ls backend/src/modules/categories/
# Expected:
# - categories.module.ts
# - categories.controller.ts
# - categories.service.ts
# - categories.repository.ts
# - dto/ (4 files)

ls backend/src/database/schema/tenant/
# Expected:
# - categories.schema.ts

ls backend/migrations/
# Expected:
# - *-create-categories.sql
```

**Frontend files** (NEW - should exist):
```bash
ls frontend/app/\(private\)/org/\[tenant\]/portal/categories/
# Expected:
# - page.tsx  (List page)
# - components/
#   - categories-table.tsx  (DataTable)
#   - create-categories-modal.tsx  (Create modal)
#   - edit-categories-modal.tsx  (Edit modal)
#   - delete-categories-dialog.tsx  (Delete confirmation)
# - hooks/
#   - use-categories.ts  (React hook)
# - services/
#   - categories.service.ts  (API service)
```

---

### Step 5: Verify TypeScript Compilation

```bash
# Backend
cd backend
npm run type-check
# Should: PASS with no errors

# Frontend
cd frontend
npm run type-check
# Should: PASS with no errors
```

**If errors**: Check error messages dan fix template atau generated code

---

### Step 6: Visual Test (Browser)

1. **Start frontend**: `npm run dev` (di folder frontend)

2. **Navigate to**: `http://localhost:3001/org/demo_company/portal/categories`

3. **Expected UI**:
   - ✅ List page muncul dengan table
   - ✅ Button "Tambah" ada di kanan atas
   - ✅ Table columns: Name, Description, Active, Actions

4. **Test Create (Modal)**:
   - Click "Tambah" button
   - ✅ Modal dialog muncul (bukan redirect ke page baru)
   - ✅ Form fields: Name, Description, Active (checkbox/switch)
   - Fill form & submit
   - ✅ Modal close, data muncul di table
   - ✅ Toast notification "Berhasil"

5. **Test Edit (Modal)**:
   - Click "Edit" button di row
   - ✅ Modal dialog muncul dengan data existing
   - Edit data & submit
   - ✅ Modal close, data ter-update di table

6. **Test Delete**:
   - Click "Delete" button
   - ✅ Confirmation dialog muncul
   - Confirm delete
   - ✅ Data hilang dari table

---

## 🧪 Test Case 2: Generate Module dengan Page Forms

**Scenario**: Complex CRUD module (>5 fields) → Use separate pages

### Step 1: Create Module Schema

```bash
curl -X POST http://localhost:3000/api/module-generator \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "moduleName": "products",
    "displayName": "Products",
    "description": "Product management",
    "isTenantIsolated": true,
    "hasSoftDelete": true,
    "hasAudit": true,
    "fields": [
      {
        "name": "name",
        "label": "Product Name",
        "type": "string",
        "length": 255,
        "isRequired": true,
        "isUnique": false,
        "isVisibleInList": true,
        "order": 1
      },
      {
        "name": "sku",
        "label": "SKU",
        "type": "string",
        "length": 100,
        "isRequired": true,
        "isUnique": true,
        "isVisibleInList": true,
        "order": 2
      },
      {
        "name": "description",
        "label": "Description",
        "type": "text",
        "isRequired": false,
        "isUnique": false,
        "isVisibleInList": false,
        "order": 3
      },
      {
        "name": "price",
        "label": "Price",
        "type": "decimal",
        "precision": 15,
        "scale": 2,
        "isRequired": true,
        "isUnique": false,
        "isVisibleInList": true,
        "order": 4
      },
      {
        "name": "cost",
        "label": "Cost",
        "type": "decimal",
        "precision": 15,
        "scale": 2,
        "isRequired": true,
        "isUnique": false,
        "isVisibleInList": false,
        "order": 5
      },
      {
        "name": "stock",
        "label": "Stock",
        "type": "integer",
        "isRequired": true,
        "isUnique": false,
        "isVisibleInList": true,
        "order": 6
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "boolean",
        "isRequired": true,
        "isUnique": false,
        "isVisibleInList": true,
        "order": 7
      }
    ],
    "searchableFields": ["name", "sku", "description"],
    "filterableFields": ["is_active", "price"],
    "sortableFields": ["name", "price", "stock", "created_at"]
  }'
```

**Copy the `id`!** (misal: `2`)

---

### Step 2: Update UI Config (PAGE)

```bash
curl -X PATCH http://localhost:3000/api/module-generator/2 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "uiConfig": {
      "createFormType": "page",
      "editFormType": "page"
    }
  }'
```

---

### Step 3: Assign & Generate

```bash
curl -X POST http://localhost:3000/api/module-generator/2/assign \
  -H "X-Tenant-Slug: demo_company" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Step 4: Verify Frontend Files (PAGE version)

```bash
ls frontend/app/\(private\)/org/\[tenant\]/portal/products/
# Expected:
# - page.tsx  (List page)
# - create/
#   - page.tsx  (Full create page, NOT modal)
# - [id]/
#   - edit/
#     - page.tsx  (Full edit page, NOT modal)
# - components/
#   - products-table.tsx
#   - delete-products-dialog.tsx
# - hooks/
#   - use-products.ts
# - services/
#   - products.service.ts
```

**Key difference**: 
- ✅ `create/page.tsx` exists (full page)
- ✅ `[id]/edit/page.tsx` exists (full page)
- ❌ NO modal files (`create-products-modal.tsx`, `edit-products-modal.tsx`)

---

### Step 5: Visual Test (Browser)

1. Navigate to: `http://localhost:3001/org/demo_company/portal/products`

2. **Test Create (Page)**:
   - Click "Tambah" button
   - ✅ Redirects to `/products/create` (new page, bukan modal)
   - ✅ Full page form dengan sections (Basic Info, Pricing, etc)
   - ✅ Breadcrumb: Home > Products > Create
   - ✅ Back button exists
   - Fill form & submit
   - ✅ Redirects back to list page
   - ✅ Data muncul di table

3. **Test Edit (Page)**:
   - Click "Edit" button
   - ✅ Redirects to `/products/[id]/edit` (new page)
   - ✅ Form ter-populate dengan data existing
   - Edit & submit
   - ✅ Redirects back to list
   - ✅ Data ter-update

---

## ✅ Success Criteria

### Backend
- [x] Module files generated (12 files)
- [x] Migration SQL generated
- [x] Permissions created (4 items)
- [x] Menu item created (1 item)
- [x] TypeScript compilation passes
- [x] ESLint passes

### Frontend (NEW!)
- [x] List page generated with DataTable
- [x] Create form generated (modal OR page, sesuai config)
- [x] Edit form generated (modal OR page, sesuai config)
- [x] Delete dialog generated
- [x] React hooks generated
- [x] API service generated
- [x] TypeScript compilation passes
- [x] ESLint passes
- [x] Forms submittable & working
- [x] Data CRUD operations successful

---

## 🐛 Common Issues

### Issue 1: "Cannot find module '@/components/ui/data-table'"

**Solution**:
```bash
cd frontend
npx shadcn-ui@latest add data-table
```

### Issue 2: "Type errors in generated files"

**Check**:
- Field types mapping correct?
- Import statements correct?
- Component props correct?

**Fix**: Update template files di `backend/src/modules/module-generator/templates/frontend/`

### Issue 3: "Frontend files not generated"

**Check backend logs**:
```bash
# Look for:
# - "Generating frontend pages..."
# - "Generated X frontend files"
# - Any errors in generation
```

**Debug**:
```bash
cd backend
npx ts-node scripts/test-frontend-template-render.ts
# This will test template rendering separately
```

### Issue 4: "Module not appearing in menu"

**Check permissions**:
```sql
-- User has permission?
SELECT * FROM tenant_X.permissions WHERE action LIKE '%module_name%';

-- User's role has permission?
SELECT * FROM tenant_X.role_permissions 
WHERE permission_id IN (
  SELECT id FROM tenant_X.permissions WHERE action LIKE '%module_name%'
);
```

---

## 📊 Test Results Template

Copy this dan fill in hasil testing:

```
## Test Results - [Date]

### Test Case 1: Modal Forms (categories)
- [x] Backend generation: PASS
- [x] Frontend generation: PASS
- [x] Files count: 18 (expected ~18)
- [x] TypeScript compile (backend): PASS
- [x] TypeScript compile (frontend): PASS
- [x] Create modal opens: PASS
- [x] Create form submit: PASS
- [x] Edit modal opens: PASS
- [x] Edit form submit: PASS
- [x] Delete dialog: PASS
- [x] Delete operation: PASS

### Test Case 2: Page Forms (products)
- [ ] Backend generation: 
- [ ] Frontend generation: 
- [ ] Files count: 
- [ ] TypeScript compile (backend): 
- [ ] TypeScript compile (frontend): 
- [ ] Create page navigation: 
- [ ] Create form submit: 
- [ ] Edit page navigation: 
- [ ] Edit form submit: 
- [ ] Delete operation: 

### Issues Found
- Issue 1: [description]
- Issue 2: [description]

### Notes
- [Additional observations]
```

---

**Happy Testing!** 🚀
