-- Check User Tenant Assignments
-- Cara pakai: psql -U postgres -d cms -f check-user-tenant-assignments.sql

-- 1. Check all tenants
SELECT id, slug, name, is_active 
FROM public.tenants 
ORDER BY created_at;

-- 2. Check specific user's tenant assignments (ganti user_id)
-- Replace 3 with your user ID
DO $$
DECLARE
    tenant_record RECORD;
    user_id_to_check INT := 3;
BEGIN
    RAISE NOTICE '=== Checking tenant assignments for user_id: % ===', user_id_to_check;
    
    FOR tenant_record IN 
        SELECT id, slug, name 
        FROM public.tenants 
        WHERE is_active = true
        ORDER BY created_at
    LOOP
        BEGIN
            EXECUTE format('
                SELECT 
                    %L as tenant_id,
                    %L as tenant_slug,
                    %L as tenant_name,
                    ur.user_id,
                    ur.role_id,
                    r.name as role_name,
                    r.display_name as role_display_name,
                    ur.assigned_at
                FROM %I.user_roles ur
                JOIN %I.roles r ON ur.role_id = r.id
                WHERE ur.user_id = $1
                ORDER BY ur.assigned_at DESC
            ', 
            tenant_record.id,
            tenant_record.slug,
            tenant_record.name,
            'tenant_' || tenant_record.slug,
            'tenant_' || tenant_record.slug
            ) USING user_id_to_check;
            
            IF FOUND THEN
                RAISE NOTICE 'User % HAS access to tenant: %', user_id_to_check, tenant_record.name;
            ELSE
                RAISE NOTICE 'User % NO access to tenant: %', user_id_to_check, tenant_record.name;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Schema for tenant % does not exist or error: %', tenant_record.slug, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. Manual check untuk specific tenant (ganti slug)
-- Replace 'w6qezvzj01ofe4n2imy3y32tv2' with your tenant slug
SELECT 
    ur.user_id,
    u.email,
    u.name,
    r.name as role_name,
    r.display_name as role_display_name,
    ur.assigned_at
FROM tenant_w6qezvzj01ofe4n2imy3y32tv2.user_roles ur
JOIN public.users u ON ur.user_id = u.id
JOIN tenant_w6qezvzj01ofe4n2imy3y32tv2.roles r ON ur.role_id = r.id
WHERE ur.deleted_at IS NULL
ORDER BY ur.assigned_at DESC;
