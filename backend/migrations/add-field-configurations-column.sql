-- Add field_configurations column to visual_modules
-- This column stores detailed form configurations per field: inputType, placeholder, helpText, validations

ALTER TABLE public.visual_modules 
ADD COLUMN IF NOT EXISTS field_configurations TEXT;

COMMENT ON COLUMN public.visual_modules.field_configurations IS 'JSON string containing field-level form configurations (inputType, placeholder, helpText, validations)';

-- Example structure:
-- [
--   {
--     "name": "email",
--     "label": "Email Address", 
--     "inputType": "email",
--     "placeholder": "Enter email...",
--     "helpText": "We'll never share your email",
--     "isVisibleInForm": true,
--     "validations": [
--       {"type": "required", "message": "Email is required"},
--       {"type": "email", "message": "Invalid email format"}
--     ],
--     "order": 0
--   }
-- ]
