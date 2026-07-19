-- Migration: Create user_preferences table
-- Description: Store user-specific preferences including single-tenant mode settings
-- Author: System
-- Date: 2026-07-18

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Single Tenant Mode Settings
    is_single_tenant_mode BOOLEAN NOT NULL DEFAULT false,
    default_tenant_id BIGINT,
    skip_org_selection BOOLEAN NOT NULL DEFAULT false,
    show_org_switcher BOOLEAN NOT NULL DEFAULT true,
    
    -- UI/UX Preferences
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'id',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    
    -- Notification Preferences
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    push_notifications BOOLEAN NOT NULL DEFAULT true,
    notification_settings JSONB,
    
    -- Additional Settings (flexible JSON)
    additional_settings JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_single_tenant ON public.user_preferences(is_single_tenant_mode);
CREATE INDEX IF NOT EXISTS idx_user_preferences_default_tenant ON public.user_preferences(default_tenant_id);

-- Add foreign key for default_tenant_id (if tenants table exists)
-- Note: This assumes tenants table already exists
ALTER TABLE public.user_preferences 
ADD CONSTRAINT fk_user_preferences_default_tenant 
FOREIGN KEY (default_tenant_id) 
REFERENCES public.tenants(id) 
ON DELETE SET NULL;

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();

-- Comments
COMMENT ON TABLE public.user_preferences IS 'User-specific preferences and settings';
COMMENT ON COLUMN public.user_preferences.is_single_tenant_mode IS 'If true, user will auto-redirect to default tenant on login';
COMMENT ON COLUMN public.user_preferences.default_tenant_id IS 'Default tenant to redirect to when single tenant mode is enabled';
COMMENT ON COLUMN public.user_preferences.skip_org_selection IS 'If true, skip /organizations page and go directly to default tenant';
COMMENT ON COLUMN public.user_preferences.show_org_switcher IS 'If false, hide tenant switcher in header (single-tenant users)';

-- Create default preferences for existing users
INSERT INTO public.user_preferences (user_id, is_single_tenant_mode, skip_org_selection, show_org_switcher)
SELECT 
    id,
    false, -- Default: multi-tenant mode
    false, -- Default: don't skip org selection
    true   -- Default: show org switcher
FROM public.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_preferences WHERE user_preferences.user_id = users.id
);

-- Grant permissions (adjust as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO PUBLIC;
GRANT USAGE, SELECT ON SEQUENCE public.user_preferences_id_seq TO PUBLIC;
