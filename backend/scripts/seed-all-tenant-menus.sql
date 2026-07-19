-- ================================================
-- Seed Menus for ALL Tenants (Dynamic)
-- ================================================
-- Automatically creates menu structure for all active tenants
-- ================================================

DO $$
DECLARE
    tenant_record RECORD;
    tenant_schema TEXT;
    dashboard_menu_id BIGINT;
    user_mgmt_menu_id BIGINT;
    tenant_mgmt_menu_id BIGINT;
    content_menu_id BIGINT;
    system_menu_id BIGINT;
BEGIN
    -- Loop through all active tenants
    FOR tenant_record IN 
        SELECT id, slug, schema_name 
        FROM public.tenants 
        WHERE is_active = true 
        AND deleted_at IS NULL
    LOOP
        tenant_schema := tenant_record.schema_name;
        
        RAISE NOTICE 'Seeding menus for tenant: % (schema: %)', tenant_record.slug, tenant_schema;
        
        -- Check if menus table exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = tenant_schema AND table_name = 'menus'
        ) THEN
            RAISE NOTICE '[SKIP] Menus table does not exist for tenant: %', tenant_record.slug;
            CONTINUE;
        END IF;
        
        -- Clear existing menus (optional - comment out if you want to keep existing)
        EXECUTE format('DELETE FROM %I.menu_items', tenant_schema);
        EXECUTE format('DELETE FROM %I.menus', tenant_schema);
        
        -- Insert Main Menus
        EXECUTE format('
            INSERT INTO %I.menus (name, slug, icon, "order", is_active, created_at, updated_at) VALUES
            (''Dashboard'', ''dashboard'', ''LayoutDashboard'', 1, true, NOW(), NOW()),
            (''User Management'', ''user-management'', ''Users'', 2, true, NOW(), NOW()),
            (''Tenant Management'', ''tenant-management'', ''Building2'', 3, true, NOW(), NOW()),
            (''Content'', ''content'', ''FileText'', 4, true, NOW(), NOW()),
            (''System'', ''system'', ''Settings'', 5, true, NOW(), NOW())
        ', tenant_schema);
        
        -- Get menu IDs
        EXECUTE format('SELECT id FROM %I.menus WHERE slug = ''dashboard''', tenant_schema) INTO dashboard_menu_id;
        EXECUTE format('SELECT id FROM %I.menus WHERE slug = ''user-management''', tenant_schema) INTO user_mgmt_menu_id;
        EXECUTE format('SELECT id FROM %I.menus WHERE slug = ''tenant-management''', tenant_schema) INTO tenant_mgmt_menu_id;
        EXECUTE format('SELECT id FROM %I.menus WHERE slug = ''content''', tenant_schema) INTO content_menu_id;
        EXECUTE format('SELECT id FROM %I.menus WHERE slug = ''system''', tenant_schema) INTO system_menu_id;
        
        -- Insert Dashboard Menu Items
        EXECUTE format('
            INSERT INTO %I.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission, created_at, updated_at) VALUES
            ($1, ''dashboard'', ''Dashboard'', ''/org/%s/portal'', ''LayoutDashboard'', 1, true, ''dashboard.read.tenant'', NOW(), NOW())
        ', tenant_schema, tenant_record.slug) USING dashboard_menu_id;
        
        -- Insert User Management Menu Items
        EXECUTE format('
            INSERT INTO %I.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission, created_at, updated_at) VALUES
            ($1, ''users'', ''Users'', ''/org/%s/portal/users'', ''Users'', 1, true, ''users.read.tenant'', NOW(), NOW()),
            ($1, ''roles'', ''Roles'', ''/org/%s/portal/roles'', ''Shield'', 2, true, ''roles.read.tenant'', NOW(), NOW()),
            ($1, ''permissions'', ''Permissions'', ''/org/%s/portal/permissions'', ''Lock'', 3, true, ''permissions.read.tenant'', NOW(), NOW())
        ', tenant_schema, tenant_record.slug, tenant_record.slug, tenant_record.slug) USING user_mgmt_menu_id;
        
        -- Insert Tenant Management Menu Items (Platform Admin only)
        IF tenant_record.slug = 'w6qezvzj01ofe4n2iny3y32tv2' THEN
            EXECUTE format('
                INSERT INTO %I.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission, created_at, updated_at) VALUES
                ($1, ''tenants'', ''All Tenants'', ''/org/%s/portal/tenants'', ''Building2'', 1, true, ''tenant.read.platform'', NOW(), NOW()),
                ($1, ''tenant-users'', ''Cross-Tenant Users'', ''/org/%s/portal/tenant-users'', ''UserCog'', 2, true, ''user.assign_tenant.platform'', NOW(), NOW()),
                ($1, ''tenant-health'', ''Tenant Health'', ''/org/%s/portal/tenant-health'', ''Activity'', 3, true, ''health.read.platform'', NOW(), NOW())
            ', tenant_schema, tenant_record.slug, tenant_record.slug, tenant_record.slug) USING tenant_mgmt_menu_id;
        ELSE
            -- For regular tenants, just show tenant info
            EXECUTE format('
                INSERT INTO %I.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission, created_at, updated_at) VALUES
                ($1, ''tenant-info'', ''Organization Info'', ''/org/%s/portal/tenant-info'', ''Building2'', 1, true, ''tenant.read.tenant'', NOW(), NOW())
            ', tenant_schema, tenant_record.slug) USING tenant_mgmt_menu_id;
        END IF;
        
        -- Insert Content Menu Items
        EXECUTE format('
            INSERT INTO %I.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission, created_at, updated_at) VALUES
            ($1, ''menus'', ''Menu Management'', ''/org/%s/portal/menus'', ''Menu'', 1, true, ''menus.read.tenant'', NOW(), NOW())
        ', tenant_schema, tenant_record.slug) USING content_menu_id;
        
        -- Insert System Menu Items
        EXECUTE format('
            INSERT INTO %I.menu_items (menu_id, module_name, label, url, icon, "order", is_active, required_permission, created_at, updated_at) VALUES
            ($1, ''settings'', ''Settings'', ''/org/%s/portal/settings'', ''Settings'', 1, true, ''settings.update.tenant'', NOW(), NOW())
        ', tenant_schema, tenant_record.slug) USING system_menu_id;
        
        RAISE NOTICE 'Successfully seeded menus for tenant: %', tenant_record.slug;
        
    END LOOP;
    
    RAISE NOTICE 'Menu seeding complete for all tenants!';
END $$;

-- Verification: Show menu counts per tenant
SELECT 
    t.slug as tenant_slug,
    t.schema_name,
    (
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = t.schema_name 
        AND table_name = 'menus'
    ) as has_menus_table,
    (
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = t.schema_name 
        AND table_name = 'menu_items'
    ) as has_menu_items_table
FROM public.tenants t
WHERE t.is_active = true
AND t.deleted_at IS NULL
ORDER BY t.created_at;

-- Show sample from first tenant that has menus
DO $$
DECLARE
    tenant_slug TEXT;
BEGIN
    SELECT t.slug INTO tenant_slug
    FROM public.tenants t
    WHERE t.is_active = true
    AND t.deleted_at IS NULL
    AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = t.schema_name AND table_name = 'menus'
    )
    ORDER BY t.created_at
    LIMIT 1;
    
    IF tenant_slug IS NOT NULL THEN
        RAISE NOTICE '';
        RAISE NOTICE '=== SAMPLE MENU FROM TENANT: % ===', tenant_slug;
        
        EXECUTE format('
            SELECT 
                m.name as menu_name,
                mi.label as item_label,
                mi.url,
                mi.icon,
                mi.required_permission
            FROM tenant_%s.menus m
            LEFT JOIN tenant_%s.menu_items mi ON m.id = mi.menu_id
            WHERE m.deleted_at IS NULL
            ORDER BY m."order", mi."order"
            LIMIT 20
        ', REPLACE(tenant_slug, '-', ''), REPLACE(tenant_slug, '-', ''));
    ELSE
        RAISE NOTICE 'No tenant with menus table found';
    END IF;
END $$;
