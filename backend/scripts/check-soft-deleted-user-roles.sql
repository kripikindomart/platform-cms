-- Check soft-deleted user_roles in a tenant
-- Usage: Replace the tenant ID and schema name below

-- Step 1: Find the tenant schema
SELECT id, name, slug, schema_name 
FROM public.tenants 
WHERE id = 10;

-- Step 2: Check if deleted_at column exists in that tenant's schema
-- Replace 'tenant_w6qezvzj01ofe4n2iny3y32tv2' with actual schema_name from Step 1
SET search_path TO tenant_w6qezvzj01ofe4n2iny3y32tv2, public;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'tenant_w6qezvzj01ofe4n2iny3y32tv2'
AND table_name = 'user_roles' 
AND column_name IN ('deleted_at', 'deleted_by');

-- Step 3: Check soft-deleted roles for user 3
SELECT 
  ur.id,
  ur.user_id,
  u.email,
  u.name as user_name,
  ur.role_id,
  r.name as role_name,
  r.display_name as role_display_name,
  ur.deleted_at,
  ur.deleted_by,
  del_user.email as deleted_by_email,
  ur.assigned_at,
  ur.assigned_by
FROM user_roles ur
JOIN public.users u ON u.id = ur.user_id
LEFT JOIN roles r ON r.id = ur.role_id
LEFT JOIN public.users del_user ON del_user.id = ur.deleted_by
WHERE ur.user_id = 3
ORDER BY ur.deleted_at DESC NULLS FIRST;

-- Step 4: Count soft-deleted vs active roles for user 3
SELECT 
  CASE 
    WHEN deleted_at IS NOT NULL THEN 'Soft Deleted'
    ELSE 'Active'
  END as status,
  COUNT(*) as count
FROM user_roles
WHERE user_id = 3
GROUP BY CASE WHEN deleted_at IS NOT NULL THEN 'Soft Deleted' ELSE 'Active' END;

-- Step 5: Check all roles in this tenant
SELECT 
  id,
  name,
  display_name,
  description,
  created_at
FROM roles
ORDER BY name;

RESET search_path;
