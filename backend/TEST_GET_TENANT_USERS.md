# Test getTenantUsers Query

## Scenario:
1. User 3 (superadmin@platform.com) ada di tenant 10
2. Soft delete user 3 dari tenant 10
3. Check apakah user 3 masih muncul di list dengan status "Inactive"

## Expected Query Behavior:

### Before Soft Delete:
```sql
user_roles table (tenant_w6qezvzj01ofe4n2iny3y32tv2):
user_id | role_id | deleted_at | deleted_by
--------|---------|------------|------------
3       | 1       | NULL       | NULL
```

Query returns:
```json
{
  "id": 3,
  "email": "superadmin@platform.com",
  "roles": [{"id": 1, "name": "superadmin", "display_name": "Super Admin"}],
  "has_active_roles": true,
  "is_active": true
}
```

### After Soft Delete:
```sql
user_roles table (tenant_w6qezvzj01ofe4n2iny3y32tv2):
user_id | role_id | deleted_at          | deleted_by
--------|---------|---------------------|------------
3       | 1       | 2026-07-19 16:00:00 | 10
```

Query SHOULD return:
```json
{
  "id": 3,
  "email": "superadmin@platform.com",
  "roles": [],  // Empty because deleted_at IS NOT NULL
  "has_active_roles": false,  // COUNT(*) FILTER (WHERE deleted_at IS NULL) = 0
  "is_active": false  // Overridden by has_active_roles
}
```

## Key Points:

1. **INNER JOIN user_roles** - User 3 masih muncul karena row masih ada (soft deleted)
2. **roles array = []** - Filtered out karena `ur.deleted_at IS NULL` dalam FILTER
3. **has_active_roles = false** - No active roles
4. **is_active = false** - Overridden in mappedUsers

## SQL Query Structure:

```sql
SELECT 
  u.id,
  u.email,
  u.name,
  -- roles hanya yang deleted_at IS NULL
  COALESCE(
    json_agg(...) FILTER (WHERE r.id IS NOT NULL AND ur.deleted_at IS NULL),
    '[]'
  ) as roles,
  -- check apakah ada active roles
  CASE 
    WHEN COUNT(*) FILTER (WHERE ur.deleted_at IS NULL) > 0 THEN true
    ELSE false
  END as has_active_roles
FROM user_roles ur  -- Include ALL user_roles (active + soft-deleted)
INNER JOIN public.users u ON u.id = ur.user_id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.deleted_at IS NULL  -- Only active users (not user-level deleted)
GROUP BY u.id, ...
```

## Test Steps:

1. Restart backend: `npm run start:dev`
2. Call API: `GET /api/tenants/10/users?page=1&limit=10`
3. Verify user 3 appears in list
4. Toggle switch OFF to soft delete user 3
5. Check backend log for SQL query
6. Verify user 3 STILL in list with `is_active: false`
7. Toggle switch ON to restore
8. Verify user 3 shows `is_active: true`

## Debug Commands:

```bash
# Check backend logs
tail -f backend.log

# Check database directly
psql -U postgres -d platform_cms

# Inside psql:
SET search_path TO tenant_w6qezvzj01ofe4n2iny3y32tv2, public;

SELECT 
  ur.user_id,
  u.email,
  ur.role_id,
  r.display_name,
  ur.deleted_at,
  ur.deleted_by
FROM user_roles ur
JOIN public.users u ON u.id = ur.user_id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = 3;
```

## If Still Disappears:

Check if frontend is filtering out inactive users:
- frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx
- Look for `.filter(u => u.is_active)` or similar

