-- Quick script to assign a user to a specific tenant
-- Usage: Edit the variables below and run this script

-- ====================================
-- CONFIGURATION - EDIT THESE VALUES
-- ====================================

DO $$
DECLARE
    -- User to assign (get user_id from public.users)
    v_user_id INT := 3;  -- Change this to your user ID
    
    -- Tenant slug (get from public.tenants)
    v_tenant_slug TEXT := 'w6qezvzj01ofe4n2iny3y32tv2';  -- Change this
    
    -- Role to assign (common: 'superadmin', 'super_admin', 'admin', 'user')
    v_role_name TEXT := 'superadmin';  -- Change this if needed
    
    -- Internal variables
    v_role_id INT;
    v_schema_name TEXT;
BEGIN
    v_schema_name := 'tenant_' || v_tenant_slug;
    
    -- Check if tenant schema exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = v_schema_name
    ) THEN
        RAISE EXCEPTION 'Tenant schema % does not exist', v_schema_name;
    END IF;
    
    -- Check if user exists
    IF NOT EXISTS (
        SELECT 1 FROM public.users WHERE id = v_user_id
    ) THEN
        RAISE EXCEPTION 'User with ID % does not exist', v_user_id;
    END IF;
    
    -- Try to find the role (try multiple common naming conventions)
    EXECUTE format('
        SELECT id FROM %I.roles 
        WHERE name IN ($1, $2, $3, $4)
        ORDER BY 
            CASE name
                WHEN $1 THEN 1  -- Exact match first
                WHEN $2 THEN 2  -- superadmin/super_admin
                WHEN $3 THEN 3  -- admin
                ELSE 4
            END
        LIMIT 1
    ', v_schema_name)
    INTO v_role_id
    USING v_role_name, 
          CASE WHEN v_role_name = 'superadmin' THEN 'super_admin' ELSE 'superadmin' END,
          'admin',
          'user';
    
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Role "%" not found in tenant %. Available roles:', v_role_name, v_tenant_slug;
        -- Show available roles
        EXECUTE format('SELECT name, display_name FROM %I.roles ORDER BY id', v_schema_name);
    END IF;
    
    -- Assign user to role
    EXECUTE format('
        INSERT INTO %I.user_roles (user_id, role_id, assigned_by, assigned_at)
        VALUES ($1, $2, $1, NOW())
        ON CONFLICT (user_id, role_id) DO UPDATE
        SET assigned_at = NOW()
        RETURNING user_id, role_id
    ', v_schema_name)
    USING v_user_id, v_role_id;
    
    -- Success message
    RAISE NOTICE '✅ Successfully assigned user_id=% to tenant=% with role_id=%', 
                 v_user_id, v_tenant_slug, v_role_id;
    
    -- Show the assignment
    EXECUTE format('
        SELECT 
            u.id as user_id,
            u.email,
            u.name,
            r.name as role_name,
            r.display_name as role_display_name,
            ur.assigned_at
        FROM public.users u
        JOIN %I.user_roles ur ON ur.user_id = u.id
        JOIN %I.roles r ON ur.role_id = r.id
        WHERE u.id = $1
        ORDER BY ur.assigned_at DESC
        LIMIT 1
    ', v_schema_name, v_schema_name)
    USING v_user_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
        
        -- Show available tenants
        RAISE NOTICE '';
        RAISE NOTICE 'Available tenants:';
        PERFORM id, slug, name FROM public.tenants ORDER BY name;
        
        -- Show available users
        RAISE NOTICE '';
        RAISE NOTICE 'Available users (first 10):';
        PERFORM id, email, name FROM public.users ORDER BY id LIMIT 10;
END $$;

-- ====================================
-- QUICK REFERENCE
-- ====================================

-- List all tenants:
-- SELECT id, slug, name, is_active FROM public.tenants ORDER BY name;

-- List all users:
-- SELECT id, email, name, is_active FROM public.users ORDER BY id;

-- List roles in a specific tenant:
-- SELECT id, name, display_name FROM tenant_w6qezvzj01ofe4n2iny3y32tv2.roles;

-- Check user's current tenant assignments:
-- SELECT 
--     t.slug as tenant,
--     r.name as role
-- FROM tenant_w6qezvzj01ofe4n2iny3y32tv2.user_roles ur
-- JOIN tenant_w6qezvzj01ofe4n2iny3y32tv2.roles r ON ur.role_id = r.id
-- JOIN public.tenants t ON 'tenant_' || t.slug = 'tenant_w6qezvzj01ofe4n2iny3y32tv2'
-- WHERE ur.user_id = 3;
