/**
 * Create upload_settings table in all tenant schemas
 * Stores URL format configuration for different file categories
 */

-- Function to create upload_settings table in a schema
CREATE OR REPLACE FUNCTION create_upload_settings_table(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.upload_settings (
      id SERIAL PRIMARY KEY,
      
      -- Configuration fields
      category VARCHAR(50) NOT NULL,
      url_format VARCHAR(50) NOT NULL,
      thumbnail_size INTEGER DEFAULT 200,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      
      -- Audit fields
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      created_by INTEGER,
      updated_by INTEGER,
      
      -- Soft delete fields
      deleted_at TIMESTAMP WITH TIME ZONE,
      deleted_by INTEGER,
      
      -- Constraints
      CONSTRAINT upload_settings_category_unique UNIQUE (category)
    );
    
    -- Create index on deleted_at for soft delete queries
    CREATE INDEX IF NOT EXISTS idx_upload_settings_deleted_at 
    ON %I.upload_settings(deleted_at);
    
    -- Create index on category
    CREATE INDEX IF NOT EXISTS idx_upload_settings_category 
    ON %I.upload_settings(category);
    
    -- Add check constraints for enum values
    ALTER TABLE %I.upload_settings
    ADD CONSTRAINT check_category 
    CHECK (category IN (''image'', ''document'', ''video'', ''audio'', ''other''));
    
    ALTER TABLE %I.upload_settings
    ADD CONSTRAINT check_url_format 
    CHECK (url_format IN (''direct_view'', ''thumbnail'', ''download'', ''embed_view''));
    
    ALTER TABLE %I.upload_settings
    ADD CONSTRAINT check_thumbnail_size 
    CHECK (thumbnail_size >= 100 AND thumbnail_size <= 2000);
  ', schema_name, schema_name, schema_name, schema_name, schema_name, schema_name);
  
  RAISE NOTICE 'Created upload_settings table in schema: %', schema_name;
END;
$$ LANGUAGE plpgsql;

-- Apply to all existing tenant schemas
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  FOR tenant_record IN 
    SELECT schema_name 
    FROM public.tenants 
    WHERE deleted_at IS NULL
  LOOP
    PERFORM create_upload_settings_table(tenant_record.schema_name);
  END LOOP;
END $$;

-- Drop the function after use
DROP FUNCTION IF EXISTS create_upload_settings_table(TEXT);
