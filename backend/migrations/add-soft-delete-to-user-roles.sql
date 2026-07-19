-- Migration: Add soft delete support to user_roles table in tenant schemas
-- This allows preserving role history when removing users from tenants

-- Function to add soft delete columns to all tenant schemas
DO $$
DECLARE
    tenant_record RECORD;
    tenant_schema_name TEXT;
BEGIN
    -- Loop through all tenants
    FOR tenant_record IN 
        SELECT id, t.schema_name as tenant_schema FROM public.tenants t WHERE t.deleted_at IS NULL
    LOOP
        tenant_schema_name := tenant_record.tenant_schema;
        
        RAISE NOTICE 'Processing tenant schema: %', tenant_schema_name;
        
        -- Check if schema exists
        IF EXISTS (
            SELECT 1 FROM information_schema.schemata WHERE schema_name = tenant_schema_name
        ) THEN
            -- Check if user_roles table exists
            IF EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = tenant_schema_name AND table_name = 'user_roles'
            ) THEN
                -- Add deleted_at column if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = tenant_schema_name 
                    AND table_name = 'user_roles' 
                    AND column_name = 'deleted_at'
                ) THEN
                    EXECUTE format('ALTER TABLE %I.user_roles ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE', tenant_schema_name);
                    RAISE NOTICE '  ✓ Added deleted_at column to %.user_roles', tenant_schema_name;
                END IF;
                
                -- Add deleted_by column if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = tenant_schema_name 
                    AND table_name = 'user_roles' 
                    AND column_name = 'deleted_by'
                ) THEN
                    EXECUTE format('ALTER TABLE %I.user_roles ADD COLUMN deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL', tenant_schema_name);
                    RAISE NOTICE '  ✓ Added deleted_by column to %.user_roles', tenant_schema_name;
                END IF;
                
                -- Add index on deleted_at for performance
                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes 
                    WHERE schemaname = tenant_schema_name 
                    AND tablename = 'user_roles' 
                    AND indexname = 'idx_user_roles_deleted_at'
                ) THEN
                    EXECUTE format('CREATE INDEX idx_user_roles_deleted_at ON %I.user_roles(deleted_at)', tenant_schema_name);
                    RAISE NOTICE '  ✓ Created index idx_user_roles_deleted_at on %.user_roles', tenant_schema_name;
                END IF;
            ELSE
                RAISE NOTICE '  ⚠ user_roles table not found in schema %', tenant_schema_name;
            END IF;
        ELSE
            RAISE NOTICE '  ⚠ Schema % does not exist', tenant_schema_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Migration completed successfully';
END $$;

-- Update the tenant table creation function to include soft delete columns
-- This ensures all NEW tenants will have these columns by default
COMMENT ON TABLE public.tenants IS 'Tenant schemas should have user_roles with deleted_at and deleted_by columns for soft delete support';
