-- ================================================
-- Fix Menu URLs After Tenant Slug Migration
-- ================================================
-- Updates menu URLs from old predictable slugs to new random slugs
-- ================================================

DO $$
DECLARE
    tenant_record RECORD;
    tenant_schema TEXT;
    old_slug TEXT;
BEGIN
    RAISE NOTICE 'Starting menu URL fix...';
    
    -- Loop through all active tenants
    FOR tenant_record IN 
        SELECT id, slug, schema_name 
        FROM public.tenants 
        WHERE is_active = true 
        AND deleted_at IS NULL
    LOOP
        tenant_schema := tenant_record.schema_name;
        
        -- Check if menus table exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = tenant_schema 
            AND table_name = 'menus'
        ) THEN
            RAISE NOTICE 'Fixing URLs for tenant: % (schema: %)', tenant_record.slug, tenant_schema;
            
            -- Extract old slug from existing URLs (if any)
            EXECUTE format('
                SELECT DISTINCT 
                    substring(url from ''/org/([^/]+)/'') as old_slug
                FROM %I.menu_items 
                WHERE url LIKE ''/org/%%/portal/%%''
                AND deleted_at IS NULL
                LIMIT 1
            ', tenant_schema) INTO old_slug;
            
            IF old_slug IS NOT NULL AND old_slug != tenant_record.slug THEN
                RAISE NOTICE 'Found old slug: %, replacing with: %', old_slug, tenant_record.slug;
                
                -- Update all menu item URLs
                EXECUTE format('
                    UPDATE %I.menu_items
                    SET 
                        url = REPLACE(url, ''/org/%s/'', ''/org/%s/''),
                        updated_at = NOW()
                    WHERE url LIKE ''/org/%s/%%''
                    AND deleted_at IS NULL
                ', tenant_schema, old_slug, tenant_record.slug, old_slug);
                
                RAISE NOTICE '[OK] Updated URLs for tenant: %', tenant_record.slug;
            ELSE
                RAISE NOTICE '[SKIP] URLs already correct for tenant: %', tenant_record.slug;
            END IF;
        ELSE
            RAISE NOTICE '[SKIP] No menus table for tenant: %', tenant_record.slug;
        END IF;
        
    END LOOP;
    
    RAISE NOTICE '[COMPLETE] Menu URL fix complete!';
END $$;

-- Verification: Show sample URLs from each tenant
DO $$
DECLARE
    tenant_record RECORD;
    tenant_schema TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICATION ===';
    
    FOR tenant_record IN 
        SELECT id, slug, schema_name 
        FROM public.tenants 
        WHERE is_active = true 
        AND deleted_at IS NULL
        ORDER BY created_at
    LOOP
        tenant_schema := tenant_record.schema_name;
        
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = tenant_schema 
            AND table_name = 'menu_items'
        ) THEN
            RAISE NOTICE '';
            RAISE NOTICE 'Tenant: %', tenant_record.slug;
            
            EXECUTE format('
                SELECT 
                    mi.label,
                    mi.url
                FROM %I.menu_items mi
                WHERE mi.deleted_at IS NULL
                ORDER BY mi.id
                LIMIT 3
            ', tenant_schema);
        END IF;
    END LOOP;
END $$;
