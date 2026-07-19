-- Assign User to All Tenants with superadmin/super_admin Role
-- This script assigns user_id 3 (superadmin@platform.com) to all tenants

-- Tenant 1: Demo Company (9the1kyfo0waz62w01w6l7u543)
DO $$
DECLARE
    v_user_id INT := 3;
    v_tenant_slug TEXT := '9the1kyfo0waz62w01w6l7u543';
    v_role_id INT;
BEGIN
    -- Try 'superadmin' first, then 'super_admin'
    EXECUTE format('SELECT id FROM %I.roles WHERE name IN ($1, $2) ORDER BY id LIMIT 1', 'tenant_' || v_tenant_slug)
    INTO v_role_id
    USING 'superadmin', 'super_admin';
    
    IF v_role_id IS NULL THEN
        RAISE NOTICE 'superadmin/super_admin role not found in tenant_%', v_tenant_slug;
    ELSE
        -- Assign user to role
        EXECUTE format('
            INSERT INTO %I.user_roles (user_id, role_id, assigned_by, assigned_at)
            VALUES ($1, $2, $1, NOW())
            ON CONFLICT (user_id, role_id) DO NOTHING
        ', 'tenant_' || v_tenant_slug)
        USING v_user_id, v_role_id;
        
        RAISE NOTICE 'User % assigned to Demo Company (tenant_%) with role_id %', v_user_id, v_tenant_slug, v_role_id;
    END IF;
END $$;

-- Tenant 2: Acme Corporation (31tsognnnwlpn834rt8sfjvr5j)
DO $$
DECLARE
    v_user_id INT := 3;
    v_tenant_slug TEXT := '31tsognnnwlpn834rt8sfjvr5j';
    v_role_id INT;
BEGIN
    EXECUTE format('SELECT id FROM %I.roles WHERE name IN ($1, $2) ORDER BY id LIMIT 1', 'tenant_' || v_tenant_slug)
    INTO v_role_id
    USING 'superadmin', 'super_admin';
    
    IF v_role_id IS NULL THEN
        RAISE NOTICE 'superadmin/super_admin role not found in tenant_%', v_tenant_slug;
    ELSE
        EXECUTE format('
            INSERT INTO %I.user_roles (user_id, role_id, assigned_by, assigned_at)
            VALUES ($1, $2, $1, NOW())
            ON CONFLICT (user_id, role_id) DO NOTHING
        ', 'tenant_' || v_tenant_slug)
        USING v_user_id, v_role_id;
        
        RAISE NOTICE 'User % assigned to Acme Corporation (tenant_%) with role_id %', v_user_id, v_tenant_slug, v_role_id;
    END IF;
END $$;

-- Tenant 3: Platform Administration (w6qezvzj01ofe4n2iny3y32tv2)
DO $$
DECLARE
    v_user_id INT := 3;
    v_tenant_slug TEXT := 'w6qezvzj01ofe4n2iny3y32tv2';
    v_role_id INT;
BEGIN
    EXECUTE format('SELECT id FROM %I.roles WHERE name IN ($1, $2) ORDER BY id LIMIT 1', 'tenant_' || v_tenant_slug)
    INTO v_role_id
    USING 'superadmin', 'super_admin';
    
    IF v_role_id IS NULL THEN
        RAISE NOTICE 'superadmin/super_admin role not found in tenant_%', v_tenant_slug;
    ELSE
        EXECUTE format('
            INSERT INTO %I.user_roles (user_id, role_id, assigned_by, assigned_at)
            VALUES ($1, $2, $1, NOW())
            ON CONFLICT (user_id, role_id) DO NOTHING
        ', 'tenant_' || v_tenant_slug)
        USING v_user_id, v_role_id;
        
        RAISE NOTICE 'User % assigned to Platform Administration (tenant_%) with role_id %', v_user_id, v_tenant_slug, v_role_id;
    END IF;
END $$;

-- Verify assignments
SELECT 
    '9the1kyfo0waz62w01w6l7u543' as tenant_slug,
    'Demo Company' as tenant_name,
    ur.user_id,
    r.name as role_name,
    r.display_name as role_display_name,
    ur.assigned_at
FROM tenant_9the1kyfo0waz62w01w6l7u543.user_roles ur
JOIN tenant_9the1kyfo0waz62w01w6l7u543.roles r ON ur.role_id = r.id
WHERE ur.user_id = 3

UNION ALL

SELECT 
    '31tsognnnwlpn834rt8sfjvr5j' as tenant_slug,
    'Acme Corporation' as tenant_name,
    ur.user_id,
    r.name as role_name,
    r.display_name as role_display_name,
    ur.assigned_at
FROM tenant_31tsognnnwlpn834rt8sfjvr5j.user_roles ur
JOIN tenant_31tsognnnwlpn834rt8sfjvr5j.roles r ON ur.role_id = r.id
WHERE ur.user_id = 3

UNION ALL

SELECT 
    'w6qezvzj01ofe4n2iny3y32tv2' as tenant_slug,
    'Platform Administration' as tenant_name,
    ur.user_id,
    r.name as role_name,
    r.display_name as role_display_name,
    ur.assigned_at
FROM tenant_w6qezvzj01ofe4n2iny3y32tv2.user_roles ur
JOIN tenant_w6qezvzj01ofe4n2iny3y32tv2.roles r ON ur.role_id = r.id
WHERE ur.user_id = 3

ORDER BY tenant_slug;
