-- Simple Create Admin User
-- Run this after migrations are complete
-- Password: admin123

-- Create admin user in tenant_1 schema
DO $$
DECLARE
    admin_user_id BIGINT;
    admin_role_id BIGINT;
BEGIN
    -- Insert user
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
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ztJ6aYsbtqC6',
        'Super',
        'Admin',
        true,
        true,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO UPDATE 
    SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO admin_user_id;

    -- Get or create superadmin role
    INSERT INTO tenant_1.roles (name, slug, description, is_system, created_at, updated_at)
    VALUES ('Super Admin', 'super-admin', 'Full system access', true, NOW(), NOW())
    ON CONFLICT (slug) DO NOTHING;
    
    SELECT id INTO admin_role_id FROM tenant_1.roles WHERE slug = 'super-admin';

    -- Assign role to user
    INSERT INTO tenant_1.user_roles (user_id, role_id, created_at)
    VALUES (admin_user_id, admin_role_id, NOW())
    ON CONFLICT (user_id, role_id) DO NOTHING;

    RAISE NOTICE 'Admin user created successfully!';
    RAISE NOTICE 'Email: admin@platform.com';
    RAISE NOTICE 'Password: admin123';
END $$;
