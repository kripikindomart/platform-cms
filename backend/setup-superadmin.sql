-- ================================================
-- Setup SuperAdmin User for Platform CMS
-- ================================================
-- This script creates a SuperAdmin user with full access
-- 
-- Login Credentials:
--   Email: admin@platform.com
--   Password: Admin123456
--   Tenant: demo_company
-- ================================================

-- 1. Create user in PUBLIC schema (where backend reads from)
INSERT INTO public.users (
  email, 
  name, 
  password_hash, 
  is_active, 
  is_verified, 
  created_at, 
  updated_at
)
VALUES (
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
  is_active = true,
  is_verified = true,
  updated_at = NOW();

-- 2. Create SuperAdmin role in TENANT schema
INSERT INTO tenant_demo_company.roles (
  name, 
  display_name, 
  description, 
  is_system, 
  is_active, 
  created_at, 
  updated_at
)
VALUES (
  'superadmin', 
  'Super Administrator', 
  'Full system access with all permissions', 
  true, 
  true, 
  NOW(), 
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- 3. Assign ALL permissions to SuperAdmin role
INSERT INTO tenant_demo_company.role_permissions (
  role_id, 
  permission_id, 
  assigned_by, 
  assigned_at
)
SELECT 
  (SELECT id FROM tenant_demo_company.roles WHERE name = 'superadmin' LIMIT 1),
  p.id,
  (SELECT id FROM public.users WHERE email = 'admin@platform.com' LIMIT 1),
  NOW()
FROM tenant_demo_company.permissions p
WHERE NOT EXISTS (
  SELECT 1 FROM tenant_demo_company.role_permissions rp
  WHERE rp.role_id = (SELECT id FROM tenant_demo_company.roles WHERE name = 'superadmin' LIMIT 1)
    AND rp.permission_id = p.id
);

-- 4. Assign SuperAdmin role to user
INSERT INTO tenant_demo_company.user_roles (
  user_id, 
  role_id, 
  assigned_by, 
  assigned_at
)
SELECT 
  (SELECT id FROM public.users WHERE email = 'admin@platform.com' LIMIT 1),
  (SELECT id FROM tenant_demo_company.roles WHERE name = 'superadmin' LIMIT 1),
  (SELECT id FROM public.users WHERE email = 'admin@platform.com' LIMIT 1),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM tenant_demo_company.user_roles ur
  WHERE ur.user_id = (SELECT id FROM public.users WHERE email = 'admin@platform.com' LIMIT 1)
    AND ur.role_id = (SELECT id FROM tenant_demo_company.roles WHERE name = 'superadmin' LIMIT 1)
);

-- ================================================
-- Verification Query
-- ================================================
\echo ''
\echo '✅ SuperAdmin Setup Complete!'
\echo ''
\echo 'User Details:'
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.is_active,
  u.is_verified,
  r.id as role_id,
  r.name as role_name,
  r.display_name as role_display_name,
  COUNT(DISTINCT rp.permission_id) as permission_count
FROM public.users u
LEFT JOIN tenant_demo_company.user_roles ur ON u.id = ur.user_id
LEFT JOIN tenant_demo_company.roles r ON ur.role_id = r.id
LEFT JOIN tenant_demo_company.role_permissions rp ON r.id = rp.role_id
WHERE u.email = 'admin@platform.com'
GROUP BY u.id, u.email, u.name, u.is_active, u.is_verified, r.id, r.name, r.display_name;

\echo ''
\echo 'Login Credentials:'
\echo '  Email:    admin@platform.com'
\echo '  Password: Admin123456'
\echo '  Tenant:   demo_company'
\echo ''
\echo 'Test login with:'
\echo '  curl -X POST http://localhost:3000/api/auth/login \'
\echo '    -H "Content-Type: application/json" \'
\echo '    -H "X-Tenant-Slug: demo_company" \'
\echo '    -d '"'"'{"email":"admin@platform.com","password":"Admin123456"}'"'"''
\echo ''
