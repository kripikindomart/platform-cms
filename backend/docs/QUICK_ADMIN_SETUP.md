# Quick Admin Setup Guide

## Current State

Backend saat ini membaca users dari **PUBLIC schema**, bukan tenant schema. Ini adalah behavior saat ini yang perlu diketahui.

## Create SuperAdmin User

### Step 1: Create User in Public Schema

```sql
-- File: create-superadmin-public.sql
INSERT INTO public.users (
  email,
  name,
  password_hash,
  is_active,
  is_verified,
  created_at,
  updated_at
) VALUES (
  'admin@platform.com',
  'Super Admin',
  '$2b$12$xpmUE7BuwcMzi0P8Gf3oaOvXx5MkJfnhhlNJuV6Qtx7EN7pFMLoJ.',  -- Password: Admin123456
  true,
  true,
  NOW(),
  NOW()
) 
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW()
RETURNING id, email;
```

Execute:
```bash
psql -U postgres -d platform_cms -f create-superadmin-public.sql
```

### Step 2: Create SuperAdmin Role in Tenant Schema

```sql
-- This creates role in EACH tenant schema
INSERT INTO tenant_demo_company.roles (
  name,
  display_name,
  description,
  is_system,
  is_active,
  created_at,
  updated_at
) VALUES (
  'superadmin',
  'Super Administrator',
  'Full system access with all permissions',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING
RETURNING id;
```

### Step 3: Assign All Permissions to SuperAdmin Role

```sql
-- Assign ALL permissions to SuperAdmin role
INSERT INTO tenant_demo_company.role_permissions (
  role_id,
  permission_id,
  assigned_by,
  assigned_at
)
SELECT 
  (SELECT id FROM tenant_demo_company.roles WHERE name = 'superadmin'),
  p.id,
  (SELECT id FROM public.users WHERE email = 'admin@platform.com'),
  NOW()
FROM tenant_demo_company.permissions p
ON CONFLICT DO NOTHING;
```

### Step 4: Assign SuperAdmin Role to User

```sql
-- Link user (from public) to role (from tenant)
INSERT INTO tenant_demo_company.user_roles (
  user_id,
  role_id,
  assigned_by,
  assigned_at
)
VALUES (
  (SELECT id FROM public.users WHERE email = 'admin@platform.com'),
  (SELECT id FROM tenant_demo_company.roles WHERE name = 'superadmin'),
  (SELECT id FROM public.users WHERE email = 'admin@platform.com'),
  NOW()
)
ON CONFLICT DO NOTHING;
```

## All-in-One Setup Script

```sql
-- File: setup-superadmin.sql

-- 1. Create user in public schema
INSERT INTO public.users (email, name, password_hash, is_active, is_verified, created_at, updated_at)
VALUES ('admin@platform.com', 'Super Admin', '$2b$12$xpmUE7BuwcMzi0P8Gf3oaOvXx5MkJfnhhlNJuV6Qtx7EN7pFMLoJ.', true, true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW();

-- 2. Create SuperAdmin role in tenant schema
INSERT INTO tenant_demo_company.roles (name, display_name, description, is_system, is_active, created_at, updated_at)
VALUES ('superadmin', 'Super Administrator', 'Full system access', true, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. Assign all permissions
INSERT INTO tenant_demo_company.role_permissions (role_id, permission_id, assigned_by, assigned_at)
SELECT 
  (SELECT id FROM tenant_demo_company.roles WHERE name = 'superadmin'),
  p.id,
  (SELECT id FROM public.users WHERE email = 'admin@platform.com'),
  NOW()
FROM tenant_demo_company.permissions p
ON CONFLICT DO NOTHING;

-- 4. Assign role to user
INSERT INTO tenant_demo_company.user_roles (user_id, role_id, assigned_by, assigned_at)
VALUES (
  (SELECT id FROM public.users WHERE email = 'admin@platform.com'),
  (SELECT id FROM tenant_demo_company.roles WHERE name = 'superadmin'),
  (SELECT id FROM public.users WHERE email = 'admin@platform.com'),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify setup
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  r.id as role_id,
  r.name as role_name,
  r.display_name,
  COUNT(rp.permission_id) as permission_count
FROM public.users u
JOIN tenant_demo_company.user_roles ur ON u.id = ur.user_id
JOIN tenant_demo_company.roles r ON ur.role_id = r.id
LEFT JOIN tenant_demo_company.role_permissions rp ON r.id = rp.role_id
WHERE u.email = 'admin@platform.com'
GROUP BY u.id, u.email, u.name, r.id, r.name, r.display_name;
```

Execute:
```bash
psql -U postgres -d platform_cms -f setup-superadmin.sql
```

## Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -d '{
    "email": "admin@platform.com",
    "password": "Admin123456"
  }'
```

Expected response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": 5,
    "email": "admin@platform.com",
    "name": "Super Admin",
    ...
  }
}
```

## Login Credentials

- **Email**: `admin@platform.com`
- **Password**: `Admin123456`
- **Tenant**: `demo_company`

## Generate New Password Hash

If you need to change the password:

```javascript
// generate-password.js
const bcrypt = require('bcrypt');

async function generate() {
  const password = 'YourNewPassword';
  const hash = await bcrypt.hash(password, 12);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

generate();
```

```bash
node generate-password.js
```

Then update SQL script with the new hash.

## Troubleshooting

### Login returns "Invalid credentials"

1. **Check user exists in public schema:**
   ```sql
   SELECT id, email, is_active FROM public.users 
   WHERE email = 'admin@platform.com';
   ```

2. **Verify password hash:**
   ```javascript
   const bcrypt = require('bcrypt');
   const hash = '$2b$12$...'; // From database
   bcrypt.compare('Admin123456', hash).then(console.log);
   ```

3. **Check backend is reading from public:**
   - Add console.log in `users.repository.ts`
   - Restart backend
   - Try login and check logs

### User has no roles/permissions

```sql
-- Check role assignment
SELECT * FROM tenant_demo_company.user_roles 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'admin@platform.com');

-- Check permissions
SELECT COUNT(*) FROM tenant_demo_company.role_permissions
WHERE role_id = (SELECT id FROM tenant_demo_company.roles WHERE name = 'superadmin');
```

### Cannot access protected routes

1. Check JWT token is included in requests
2. Verify `X-Tenant-Slug` header is sent
3. Check tenant exists and is active
4. Verify user_roles table references public.users correctly
