-- Add ui_config column to visual_modules table
-- This column stores UI/UX configuration for form display (modal vs page)

ALTER TABLE visual_modules 
ADD COLUMN IF NOT EXISTS ui_config TEXT NOT NULL DEFAULT '{"createFormType":"page","editFormType":"page"}';

-- Add comment
COMMENT ON COLUMN visual_modules.ui_config IS 'UI/UX configuration (JSON) for form display type (modal or page)';
