-- Create validation_types table (Master Data)
CREATE TABLE IF NOT EXISTS public.validation_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  requires_value BOOLEAN NOT NULL DEFAULT false,
  value_type VARCHAR(20), -- 'number', 'string', 'regex', 'json'
  applicable_field_types TEXT[], -- Array of field types this validation applies to
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create visual_module_field_validations table
CREATE TABLE IF NOT EXISTS public.visual_module_field_validations (
  id BIGSERIAL PRIMARY KEY,
  field_id BIGINT NOT NULL REFERENCES public.visual_module_fields(id) ON DELETE CASCADE,
  validation_type_id INTEGER NOT NULL REFERENCES public.validation_types(id) ON DELETE RESTRICT,
  validation_value TEXT, -- Store as text, will be parsed based on value_type
  error_message TEXT,
  validation_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_visual_field_validations_field_id ON public.visual_module_field_validations(field_id);
CREATE INDEX idx_visual_field_validations_type_id ON public.visual_module_field_validations(validation_type_id);

-- Seed validation types
INSERT INTO public.validation_types (code, name, description, requires_value, value_type, applicable_field_types) VALUES
  -- Basic validations
  ('required', 'Required', 'Field must not be empty', false, NULL, ARRAY['string', 'text', 'number', 'boolean', 'date', 'datetime', 'email', 'url', 'uuid', 'json', 'enum']),
  
  -- String validations
  ('minLength', 'Minimum Length', 'Minimum character length for string', true, 'number', ARRAY['string', 'text', 'email', 'url']),
  ('maxLength', 'Maximum Length', 'Maximum character length for string', true, 'number', ARRAY['string', 'text', 'email', 'url']),
  ('pattern', 'Regex Pattern', 'Must match regular expression pattern', true, 'regex', ARRAY['string', 'text', 'email', 'url']),
  
  -- Number validations
  ('min', 'Minimum Value', 'Minimum numeric value', true, 'number', ARRAY['number']),
  ('max', 'Maximum Value', 'Maximum numeric value', true, 'number', ARRAY['number']),
  ('integer', 'Integer Only', 'Must be an integer (no decimals)', false, NULL, ARRAY['number']),
  ('positive', 'Positive Number', 'Must be a positive number', false, NULL, ARRAY['number']),
  ('negative', 'Negative Number', 'Must be a negative number', false, NULL, ARRAY['number']),
  
  -- Format validations
  ('email', 'Email Format', 'Must be a valid email address', false, NULL, ARRAY['string', 'email']),
  ('url', 'URL Format', 'Must be a valid URL', false, NULL, ARRAY['string', 'url']),
  ('uuid', 'UUID Format', 'Must be a valid UUID', false, NULL, ARRAY['string', 'uuid']),
  
  -- Array/JSON validations
  ('arrayMinLength', 'Min Array Length', 'Minimum number of items in array', true, 'number', ARRAY['json']),
  ('arrayMaxLength', 'Max Array Length', 'Maximum number of items in array', true, 'number', ARRAY['json']),
  
  -- Custom
  ('custom', 'Custom Validation', 'Custom validation logic', true, 'string', ARRAY['string', 'text', 'number', 'boolean', 'date', 'datetime', 'email', 'url', 'uuid', 'json', 'enum'])
ON CONFLICT (code) DO NOTHING;

-- Comments
COMMENT ON TABLE public.validation_types IS 'Master data for available validation types';
COMMENT ON TABLE public.visual_module_field_validations IS 'Validation rules for visual module fields';
COMMENT ON COLUMN public.validation_types.requires_value IS 'Whether this validation type requires a value (e.g., minLength requires a number)';
COMMENT ON COLUMN public.validation_types.value_type IS 'Data type of the validation value: number, string, regex, json';
COMMENT ON COLUMN public.validation_types.applicable_field_types IS 'Array of field types this validation can be applied to';
