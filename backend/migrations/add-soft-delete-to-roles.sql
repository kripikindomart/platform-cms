-- ================================================
-- Add Soft Delete Columns to Roles Table
-- ================================================
-- Add deleted_at and deleted_by columns to roles table in all tenant schemas
-- ================================================

DO $$
DECLARE
    tenant_record RECORD;
    tenant_schema TEXT;
BEGIN
    -- Loop through all active tenants
    FOR tenant_record IN 
        SELECT id, slug, schema_name 
        FROM public.tenants 
        WHERE is_active = true 
        AND deleted_at IS NULL
    LOOP
        tenant_schema := tenant_record.schema_name;
        
        RAISE NOTICE 'Adding soft delete columns to roles table in: %', tenant_schema;
        
        -- Check if deleted_at column exists
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = tenant_schema 
            AND table_name = 'roles' 
            AND column_name = 'deleted_at'
        ) THEN
            EXECUTE format('
                ALTER TABLE %I.roles 
                ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
                ADD COLUMN deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
            ', tenant_schema);
            
            -- Add index on deleted_at
            EXECUTE format('
                CREATE INDEX idx_roles_deleted_at ON %I.roles(deleted_at)
            ', tenant_schema);
            
            RAISE NOTICE '[OK] Added soft delete columns to: %', tenant_schema;
        ELSE
            RAISE NOTICE '[SKIP] Columns already exist in: %', tenant_schema;
        END IF;
        
    END LOOP;
    
    RAISE NOTICE '[COMPLETE] Soft delete migration complete!';
END $$;
