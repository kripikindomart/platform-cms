-- Fix visual_modules unique constraint to allow soft-deleted duplicates
-- Drop existing unique constraint
ALTER TABLE public.visual_modules 
DROP CONSTRAINT IF EXISTS visual_modules_module_name_key;

-- Create partial unique index (only for non-deleted records)
CREATE UNIQUE INDEX visual_modules_module_name_unique 
ON public.visual_modules (module_name) 
WHERE deleted_at IS NULL;

-- Comment
COMMENT ON INDEX visual_modules_module_name_unique IS 'Unique constraint on module_name, allowing duplicates for soft-deleted records';
