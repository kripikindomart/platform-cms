# Testing Guide: Single Tenant Mode

## Prerequisites

1. Backend running on `http://localhost:3000`
2. Frontend running on `http://localhost:3001` (or configured port)
3. PostgreSQL database with migrations applied
4. At least 2 tenants created
5. Test user account

## Test Scenario 1: Enable Single Tenant Mode via API

### Step 1: Create Test User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "singleuser@test.com",
    "name": "Single Tenant User",
    "password": "Test123456"
  }'
```

### Step 2: Login and Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "singleuser@test.com",
    "password": "Test123456"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": 11,
    "email": "singleuser@test.com",
    "name": "Single Tenant User",
    "is_verified": true
  },
  "redirect": {
    "shouldAutoRedirect": false,
    "tenantId": null,
    "tenantSlug": null
  }
}
```

### Step 3: Get User's Tenants
```bash
curl -X GET http://localhost:3000/api/users/my-tenants \
  -H "Authorization: Bearer {token}"
```

**Expected Response:**
```json
{
  "user_id": 11,
  "user_email": "singleuser@test.com",
  "tenants": [
    {
      "id": 2,
      "slug": "9the1kyfo0waz62w01w6l7u543",
      "name": "Demo Company",
      "role_name": "member",
      "role_display_name": "Member"
    }
  ],
  "default_tenant": null
}
```

### Step 4: Enable Single Tenant Mode
```bash
curl -X PUT http://localhost:3000/api/users/me/preferences \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "is_single_tenant_mode": true,
    "default_tenant_id": 2,
    "skip_org_selection": true,
    "show_org_switcher": false
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "user_id": 11,
  "is_single_tenant_mode": true,
  "default_tenant_id": 2,
  "skip_org_selection": true,
  "show_org_switcher": false,
  "theme": "light",
  "language": "id",
  "timezone": "Asia/Jakarta",
  "created_at": "2026-07-18T10:00:00.000Z",
  "updated_at": "2026-07-18T10:15:00.000Z"
}
```

### Step 5: Login Again - Verify Auto-Redirect
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "singleuser@test.com",
    "password": "Test123456"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": 11,
    "email": "singleuser@test.com",
    "name": "Single Tenant User",
    "is_verified": true
  },
  "redirect": {
    "shouldAutoRedirect": true,
    "tenantId": 2,
    "tenantSlug": "9the1kyfo0waz62w01w6l7u543"
  }
}
```

✅ **Success Criteria:**
- `shouldAutoRedirect` is `true`
- `tenantSlug` is populated
- Frontend will redirect to `/org/{tenantSlug}/portal`

---

## Test Scenario 2: Enable Single Tenant Mode via SQL

### Direct SQL Update
```sql
-- Get user ID
SELECT id, email FROM public.users WHERE email = 'singleuser@test.com';

-- Get tenant ID
SELECT id, slug, name FROM public.tenants;

-- Enable single tenant mode
UPDATE public.user_preferences
SET 
    is_single_tenant_mode = true,
    default_tenant_id = 2,
    skip_org_selection = true,
    show_org_switcher = false,
    updated_at = NOW()
WHERE user_id = 11;

-- Verify
SELECT * FROM public.user_preferences WHERE user_id = 11;
```

### Login and Verify
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "singleuser@test.com",
    "password": "Test123456"
  }'
```

✅ **Success Criteria:** Same as Scenario 1, Step 5

---

## Test Scenario 3: Admin Manage User Preferences (Frontend UI)

### Step 1: Login as Admin
1. Go to `http://localhost:3001/login`
2. Login with admin credentials
3. Navigate to `/portal/users`

### Step 2: Access User Preferences
1. Find test user in users list
2. Click **Actions** dropdown (⋮)
3. Select **Preferences**
4. Should redirect to `/portal/users/{id}/preferences`

### Step 3: Enable Single Tenant Mode
1. Toggle **Enable Single Tenant Mode** to ON
2. Select **Default Organization** from available tenants
3. Verify **Hide Organization Switcher** is automatically enabled
4. Click **Save Preferences**

### Step 4: Verify Settings Applied
1. Logout test user (if logged in)
2. Login as test user
3. Should skip `/organizations` page
4. Should land directly on `/org/{slug}/portal`
5. Tenant switcher should be **hidden** in header

✅ **Success Criteria:**
- User skips organization selection
- Auto-redirected to default tenant
- Tenant switcher not visible in header

---

## Test Scenario 4: Disable Single Tenant Mode

### Via API
```bash
curl -X PUT http://localhost:3000/api/users/me/preferences \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "is_single_tenant_mode": false,
    "default_tenant_id": null,
    "skip_org_selection": false,
    "show_org_switcher": true
  }'
```

### Via SQL
```sql
UPDATE public.user_preferences
SET 
    is_single_tenant_mode = false,
    default_tenant_id = NULL,
    skip_org_selection = false,
    show_org_switcher = true,
    updated_at = NOW()
WHERE user_id = 11;
```

### Verify
1. Login as test user
2. Should see `/organizations` page
3. Must select organization manually
4. Tenant switcher should be **visible** in header

✅ **Success Criteria:**
- Normal multi-tenant flow restored
- Organization selection required
- Tenant switcher visible

---

## Test Scenario 5: Edge Cases

### Test 5.1: User with Multiple Tenants
```sql
-- Add user to multiple tenants
INSERT INTO tenant_9the1kyfo0waz62w01w6l7u543.user_roles (user_id, role_id)
VALUES (11, 1);

INSERT INTO tenant_31tsognnnwlpn834rt8sfjvr5j.user_roles (user_id, role_id)
VALUES (11, 1);
```

**Expected:** User can still enable single-tenant mode by selecting one default tenant

### Test 5.2: Invalid Default Tenant
```bash
curl -X PUT http://localhost:3000/api/users/me/preferences \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "is_single_tenant_mode": true,
    "default_tenant_id": 9999,
    "skip_org_selection": true
  }'
```

**Expected:** Error response - tenant not found or user has no access

### Test 5.3: Deleted Default Tenant
```sql
-- Soft delete tenant
UPDATE public.tenants SET is_active = false WHERE id = 2;
```

**Expected:** Login should fallback to normal flow (no auto-redirect)

### Test 5.4: User Without Tenants
```sql
-- Remove all tenant access
DELETE FROM tenant_9the1kyfo0waz62w01w6l7u543.user_roles WHERE user_id = 11;
```

**Expected:** 
- Cannot enable single-tenant mode
- Preferences page shows "User has no organization access"

---

## Test Scenario 6: Frontend Behavior

### Test 6.1: Conditional Tenant Switcher
1. Login as single-tenant user (with `show_org_switcher = false`)
2. Check header - tenant switcher should NOT be visible
3. Login as multi-tenant user
4. Check header - tenant switcher SHOULD be visible

### Test 6.2: Organization Page Skip
1. Login as single-tenant user (with `skip_org_selection = true`)
2. Should redirect directly to `/org/{slug}/portal`
3. Never see `/organizations` page

### Test 6.3: Preferences Page UI
1. Navigate to `/portal/users/{id}/preferences`
2. Verify all toggles work:
   - Enable/Disable Single Tenant Mode
   - Default Organization selector
   - Hide Organization Switcher
   - Theme selection
   - Language selection
   - Notification toggles
3. Save and verify changes applied

---

## Verification Queries

### Check User Preferences
```sql
SELECT 
    up.user_id,
    u.email,
    up.is_single_tenant_mode,
    up.default_tenant_id,
    t.slug as default_tenant_slug,
    t.name as default_tenant_name,
    up.skip_org_selection,
    up.show_org_switcher
FROM public.user_preferences up
JOIN public.users u ON up.user_id = u.id
LEFT JOIN public.tenants t ON up.default_tenant_id = t.id
WHERE u.email = 'singleuser@test.com';
```

### Check User's Tenant Access
```sql
-- For tenant: 9the1kyfo0waz62w01w6l7u543
SELECT 
    u.id,
    u.email,
    r.name as role_name
FROM public.users u
JOIN tenant_9the1kyfo0waz62w01w6l7u543.user_roles ur ON u.id = ur.user_id
JOIN tenant_9the1kyfo0waz62w01w6l7u543.roles r ON ur.role_id = r.id
WHERE u.email = 'singleuser@test.com';
```

---

## Troubleshooting

### Issue: Auto-redirect not working
**Check:**
1. User preferences correctly set in database
2. Backend returning `redirect` object in login response
3. Frontend login handler checking `response.redirect?.shouldAutoRedirect`

### Issue: Tenant switcher still visible
**Check:**
1. `show_org_switcher` is `false` in user_preferences
2. Frontend loading preferences via `/api/users/me/preferences`
3. Header component checking `preferences?.show_org_switcher`

### Issue: Preferences not saving
**Check:**
1. User has valid access to `default_tenant_id`
2. Backend endpoint `/api/users/{id}/preferences` accessible
3. Admin has permissions to update user preferences

---

## Clean Up

```sql
-- Reset test user preferences
UPDATE public.user_preferences
SET 
    is_single_tenant_mode = false,
    default_tenant_id = NULL,
    skip_org_selection = false,
    show_org_switcher = true
WHERE user_id = 11;

-- Or delete test user entirely
DELETE FROM public.users WHERE email = 'singleuser@test.com';
```
