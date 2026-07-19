-- Re-assign users that were hard-deleted from tenant 9 (Acme Corporation)
-- Run this AFTER running the soft delete migration

-- Step 1: Check tenant info
SELECT 
  'Tenant 9 Info' as step,
  id, name, slug, schema_name 
FROM public.tenants 
WHERE id = 9;

-- Step 2: Check which users exist in public.users (all users)
SELECT 
  'All Available Users' as step,
  id, email, name, is_active
FROM public.users
WHERE deleted_at IS NULL
ORDER BY id;

-- Step 3: Set search path to tenant 9
SET search_path TO tenant_3ltsognmnw1pn834rt8sfjvr5j, public;

-- Step 4: Check current users in tenant 9
SELECT 
  'Current Users in Tenant 9' as step,
  ur.user_id,
  u.email,
  u.name,
  r.display_name as role,
  ur.deleted_at,
  ur.assigned_at
FROM user_roles ur
JOIN public.users u ON u.id = ur.user_id
LEFT JOIN roles r ON r.id = ur.role_id
ORDER BY ur.user_id;

-- Step 5: Check if soft delete columns exist now
SELECT 
  'Soft Delete Columns Check' as step,
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'tenant_3ltsognmnw1pn834rt8sfjvr5j'
AND table_name = 'user_roles' 
AND column_name IN ('deleted_at', 'deleted_by');

-- Step 6: Check available roles in tenant 9
SELECT 
  'Available Roles in Tenant 9' as step,
  id, name, display_name
FROM roles
WHERE deleted_at IS NULL
ORDER BY id;

-- Step 7: Re-assign missing users (UPDATE user IDs and role IDs as needed)
-- Example: Assign user 3 (superadmin@platform.com) with role 1 (superadmin)

-- UNCOMMENT AND MODIFY AS NEEDED:
/*
-- Assign user 3 with superadmin role (role_id = 1)
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
VALUES (3, 1, 10, NOW())
ON CONFLICT DO NOTHING;

-- Assign user 10 with admin role (role_id = 2, adjust as needed)
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
VALUES (10, 2, 10, NOW())
ON CONFLICT DO NOTHING;
*/

-- Step 8: Verify users after re-assignment (run this AFTER uncommenting step 7)
SELECT 
  'Users After Re-assignment' as step,
  ur.user_id,
  u.email,
  u.name,
  r.display_name as role,
  ur.deleted_at,
  ur.assigned_at
FROM user_roles ur
JOIN public.users u ON u.id = ur.user_id
LEFT JOIN roles r ON r.id = ur.role_id
ORDER BY ur.user_id;

RESET search_path;

-- Instructions:
-- 1. First, identify which users were deleted (check screenshot or memory)
-- 2. Check their user IDs from Step 2 output
-- 3. Check available role IDs from Step 6 output
-- 4. Uncomment and modify Step 7 to assign the correct users with correct roles
-- 5. Run the entire script again to verify

