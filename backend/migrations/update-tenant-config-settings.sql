-- Migration: Update tenant config column with tenant-level settings
-- Description: Add tenant-level configuration for org switching, branding, etc.
-- Author: System
-- Date: 2026-07-18

-- Update existing tenants with default config
-- This migration updates the 'config' JSONB column in tenants table

-- Example tenant config structure:
-- {
--   "allow_org_switching": true,
--   "force_single_tenant_mode": false,
--   "branding": {
--     "primary_color": "#3B82F6",
--     "logo_url": null
--   },
--   "security": {
--     "session_timeout": 86400,
--     "require_2fa": false
--   },
--   "features": {
--     "enable_api_access": true,
--     "enable_webhooks": false
--   }
-- }

-- Update all tenants with default config if config is null or empty
UPDATE public.tenants
SET config = (
    CASE 
        WHEN config IS NULL OR config::text = '' THEN '{}'::jsonb
        ELSE config::jsonb
    END
) || jsonb_build_object(
    'allow_org_switching', true,
    'force_single_tenant_mode', false,
    'branding', jsonb_build_object(
        'primary_color', '#3B82F6',
        'logo_url', NULL
    ),
    'security', jsonb_build_object(
        'session_timeout', 86400,
        'require_2fa', false,
        'allowed_ip_ranges', NULL
    ),
    'features', jsonb_build_object(
        'enable_api_access', true,
        'enable_webhooks', false,
        'enable_audit_logs', true
    )
)
WHERE config IS NULL 
   OR NOT (config::jsonb ? 'allow_org_switching');

-- Add comments
COMMENT ON COLUMN public.tenants.config IS 'Tenant-level configuration including org switching, branding, security, and features';

-- Example: Update platform admin tenant to disable org switching
-- (Uncomment and adjust tenant_slug as needed)
-- UPDATE public.tenants
-- SET config = config || jsonb_build_object('allow_org_switching', false)
-- WHERE slug = 'w6qezvzj01ofe4n2iny3y32tv2';
