# Testing Multi-Tenant Login

## Current Setup Status

✅ **Backend Updated:**
- Auth service now supports tenant selection
- Auth controller reads `X-Tenant-Slug` header
- Can login to public schema (SuperAdmin) or tenant schema

✅ **Database Setup:**
- SuperAdmin user exists in `public.users`
- SuperAdmin role exists in `tenant_demo_company.roles`
- 14 permissions assigned

⚠️ **Requires Backend Restart:**
Backend must be restarted to load new code!

## Test Scenarios

### Scenario 1: Login as SuperAdmin (Public Schema)

**Currently NOT IMPLEMENTED** - Need to set tenant context properly for public schema users.

For now, SuperAdmin logs in via tenant schema.

### Scenario 2: Login as Tenant User

```bash
# Test with admin user in public schema
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -d '{
    "email": "admin@platform.com",
    "password": "Admin123456"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": 5,
    "email": "admin@platform.com",
    "name": "Super Admin",
    "is_active": true,
    "is_verified": true
  }
}
```

## Current Known Issues

### Issue 1: User in Public Schema, Roles in Tenant Schema

**Problem:**
- User stored in `public.users`
- Roles stored in `tenant_xxx.roles`
- `tenant_xxx.user_roles` references `public.users.id`

**Current Behavior:**
Backend reads user from `public.users` when `X-Tenant-Slug` is provided (not `_superadmin`).

### Issue 2: Backend Needs Restart

After code changes, backend must be restarted:

```bash
# Stop current backend process
# Then restart:
cd backend
npm run start:dev
```

## Recommended Architecture Fix

Based on current implementation, recommend this structure:

### PUBLIC SCHEMA (Shared Users)
```sql
public.users              -- All users (SuperAdmin + Tenant users)
public.tenants            -- Tenant registry
public.tenant_user_access -- Which users can access which tenants
```

### TENANT SCHEMA (Isolated Data)
```sql
tenant_xxx.roles          -- Tenant-specific roles
tenant_xxx.permissions    -- Tenant-specific permissions  
tenant_xxx.user_roles     -- FK to public.users.id
tenant_xxx.role_permissions
tenant_xxx.products       -- Generated modules
```

### Foreign Key Setup

```sql
-- user_roles table in tenant schema references public.users
ALTER TABLE tenant_demo_company.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE tenant_demo_company.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id)
  ON DELETE CASCADE;
```

## Quick Fix for Testing

**Option A: Keep Current Architecture**

User in public, roles in tenant (current state). Backend loads user from public, then loads roles from tenant schema.

**Option B: Move to Full Tenant Isolation**

Create separate user accounts in each tenant schema. Same email can have different credentials per tenant.

## Steps to Get Login Working

### Step 1: Restart Backend

```bash
# In backend directory
npm run start:dev
```

### Step 2: Verify User Exists

```sql
-- Check public schema
SELECT id, email, is_active FROM public.users 
WHERE email = 'admin@platform.com';

-- Check roles assigned
SELECT 
  u.id, u.email, r.name as role_name, COUNT(rp.permission_id) as permissions
FROM public.users u
JOIN tenant_demo_company.user_roles ur ON u.id = ur.user_id
JOIN tenant_demo_company.roles r ON ur.role_id = r.id
LEFT JOIN tenant_demo_company.role_permissions rp ON r.id = rp.role_id
WHERE u.email = 'admin@platform.com'
GROUP BY u.id, u.email, r.name;
```

### Step 3: Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -d '{"email":"admin@platform.com","password":"Admin123456"}'
```

### Step 4: Test Frontend

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:3001/login` and login with:
- Email: `admin@platform.com`
- Password: `Admin123456`

## Debugging

### Check Backend Logs

Look for these log messages:
```
[AUTH] Tenant login detected - tenant: demo_company
[AUTH] Verifying password for: admin@platform.com
[AUTH] Password valid: true
```

### Check Database Connection

```sql
-- Verify tenant exists
SELECT * FROM public.tenants WHERE slug = 'demo_company';

-- Verify user exists
SELECT * FROM public.users WHERE email = 'admin@platform.com';

-- Verify role assignment
SELECT * FROM tenant_demo_company.user_roles 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'admin@platform.com');
```

### Common Errors

**"Tenant not found"**
- Check `X-Tenant-Slug` header is sent
- Verify tenant exists in database
- Check tenant `is_active = true`

**"Invalid credentials"**
- Verify password hash in database
- Check user `is_active = true`
- Ensure backend is using correct schema

**"Cannot read properties of undefined"**
- Backend not restarted after code changes
- Old code still running

## Next Steps

Once login works:

1. ✅ Test JWT token is returned
2. ✅ Test token includes user data
3. ✅ Test protected routes with token
4. ✅ Frontend receives and stores token
5. ✅ Frontend can make authenticated requests
6. ⬜ Build tenant selector in frontend
7. ⬜ Test switching between tenants
8. ⬜ Build SuperAdmin portal for tenant management
