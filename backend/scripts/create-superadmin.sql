-- Create Superadmin User
-- Password: admin123 (bcrypt hash dengan 12 rounds)

-- 1. Insert tenant if not exists
INSERT INTO public.tenants (id, name, slug, schema_name, subscription_tier, is_active, created_at, updated_at)
VALUES (1, 'Default Tenant', 'tenant_1', 'tenant_1', 'enterprise', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Create user in tenant_1 schema
SET search_path TO tenant_1;

-- Insert superadmin user
INSERT INTO tenant_1.users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    is_active, 
    is_email_verified,
    email_verified_at,
    created_at, 
    updated_at
)
VALUES (
    'admin@platform.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ztJ6aYsbtqC6', -- Password: admin123
    'Super',
    'Admin',
    true,
    true,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Note: Password is 'admin123'
-- You should change this password after first login!

-- 3. Create superadmin role if not exists
INSERT INTO tenant_1.roles (name, slug, description, is_system, created_at, updated_at)
VALUES (
    'Super Admin',
    'super-admin',
    'Full system access with all permissions',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- 4. Assign superadmin role to user
WITH user_data AS (
    SELECT id FROM tenant_1.users WHERE email = 'admin@platform.com'
),
role_data AS (
    SELECT id FROM tenant_1.roles WHERE slug = 'super-admin'
)
INSERT INTO tenant_1.user_roles (user_id, role_id, created_at)
SELECT user_data.id, role_data.id, NOW()
FROM user_data, role_data
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Show created user
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_active,
    r.name as role_name
FROM tenant_1.users u
LEFT JOIN tenant_1.user_roles ur ON u.id = ur.user_id
LEFT JOIN tenant_1.roles r ON ur.role_id = r.id
WHERE u.email = 'admin@platform.com';
