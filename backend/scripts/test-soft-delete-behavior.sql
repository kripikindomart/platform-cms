-- Test Soft Delete Behavior in Tenant
-- This script simulates what happens when user is soft-deleted

-- Step 1: Find tenant and user
SELECT 
  'Tenant Info' as step,
  id, name, slug, schema_name 
FROM public.tenants 
WHERE id = 10;

-- Step 2: Set search path to tenant schema
SET search_path TO tenant_w6qezvzj01ofe4n2iny3y32tv2, public;

-- Step 3: Check current state of user 3
SELECT 
  'Before Soft Delete' as step,
  ur.user_id,
  u.email,
  ur.role_id,
  r.display_name as role,
  ur.deleted_at,
  ur.deleted_by
FROM user_roles ur
JOIN public.users u ON u.id = ur.user_id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = 3;

-- Step 4: Simulate the getTenantUsers query BEFORE soft delete
SELECT 
  'Query Result - Before Delete' as step,
  u.id,
  u.email,
  u.name,
  COUNT(*) as total_roles,
  COUNT(*) FILTER (WHERE ur.deleted_at IS NULL) as active_roles,
  CASE 
    WHEN COUNT(*) FILTER (WHERE ur.deleted_at IS NULL) > 0 THEN true
    ELSE false
  END as has_active_roles
FROM user_roles ur
INNER JOIN public.users u ON u.id = ur.user_id
WHERE u.deleted_at IS NULL AND u.id = 3
GROUP BY u.id, u.email, u.name;

-- Step 5: Simulate soft delete (DON'T RUN THIS IF TESTING REAL DATA)
-- UPDATE user_roles SET deleted_at = NOW(), deleted_by = 10 WHERE user_id = 3 AND deleted_at IS NULL;

-- Step 6: Check state after soft delete (if you ran step 5)
SELECT 
  'After Soft Delete' as step,
  ur.user_id,
  u.email,
  ur.role_id,
  r.display_name as role,
  ur.deleted_at,
  ur.deleted_by
FROM user_roles ur
JOIN public.users u ON u.id = ur.user_id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = 3;

-- Step 7: Simulate the getTenantUsers query AFTER soft delete
SELECT 
  'Query Result - After Delete' as step,
  u.id,
  u.email,
  u.name,
  COUNT(*) as total_roles,
  COUNT(*) FILTER (WHERE ur.deleted_at IS NULL) as active_roles,
  CASE 
    WHEN COUNT(*) FILTER (WHERE ur.deleted_at IS NULL) > 0 THEN true
    ELSE false
  END as has_active_roles
FROM user_roles ur
INNER JOIN public.users u ON u.id = ur.user_id
WHERE u.deleted_at IS NULL AND u.id = 3
GROUP BY u.id, u.email, u.name;

-- Expected Results:
-- Before: has_active_roles = true  (user shows as Active)
-- After:  has_active_roles = false (user shows as Inactive but STILL IN LIST)

RESET search_path;
