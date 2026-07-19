-- Add branding columns to tenants table
-- This allows tenants to customize their appearance

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#8b5cf6';

-- Update existing tenant with default name if empty
UPDATE public.tenants 
SET name = 'Platform CMS'
WHERE name IS NULL OR name = '';

COMMENT ON COLUMN public.tenants.logo_url IS 'URL to tenant logo image';
COMMENT ON COLUMN public.tenants.primary_color IS 'Primary brand color in hex format (e.g., #6366f1)';
COMMENT ON COLUMN public.tenants.secondary_color IS 'Secondary brand color in hex format (e.g., #8b5cf6)';
