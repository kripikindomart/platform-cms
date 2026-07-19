-- Check current tenant data
SELECT id, name, slug, is_active, created_at 
FROM public.tenants 
WHERE deleted_at IS NULL;

-- Update tenant name if empty (update slug to your actual tenant slug)
UPDATE public.tenants 
SET 
  name = 'Platform CMS',
  updated_at = NOW()
WHERE slug = 'w6qezvzj01ofe4n2iny3y32tv2' 
  AND (name IS NULL OR name = '');

-- Verify the update
SELECT id, name, slug, is_active 
FROM public.tenants 
WHERE slug = 'w6qezvzj01ofe4n2iny3y32tv2';
