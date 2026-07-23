-- Create Settings Table
-- Global application configuration storage

CREATE TABLE IF NOT EXISTS public.settings (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by BIGINT REFERENCES public.users(id),
  UNIQUE(category, key)
);

-- Create index for faster lookups
CREATE INDEX idx_settings_category ON public.settings(category);
CREATE INDEX idx_settings_key ON public.settings(key);

-- Insert default storage settings
INSERT INTO public.settings (category, key, value, description) VALUES
('storage', 'provider', '{"active_provider": "google-drive", "fallback_provider": "local"}', 'Active storage provider configuration'),
('storage', 'google_drive', '{"folder_id": "", "folder_name": "Platform CMS Uploads", "credentials_path": ""}', 'Google Drive configuration'),
('storage', 'limits', '{"max_file_size_mb": 10, "max_image_size_mb": 5, "allowed_image_types": ["jpeg", "png", "gif", "webp", "svg"], "allowed_document_types": ["pdf", "doc", "docx", "xls", "xlsx"]}', 'File upload limits and allowed types'),
('storage', 'folders', '{"images": "images", "documents": "documents", "temp": "temp"}', 'Default folder structure')
ON CONFLICT (category, key) DO NOTHING;

COMMENT ON TABLE public.settings IS 'Global application settings storage';
COMMENT ON COLUMN public.settings.category IS 'Setting category (storage, security, api, etc)';
COMMENT ON COLUMN public.settings.key IS 'Setting key within category';
COMMENT ON COLUMN public.settings.value IS 'Setting value in JSONB format for flexibility';
COMMENT ON COLUMN public.settings.is_encrypted IS 'Whether the value contains encrypted data';
