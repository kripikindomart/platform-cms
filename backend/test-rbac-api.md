# RBAC API Testing Guide

## Prerequisites

1. Start the server:
```bash
npm run start:dev
```

2. Ensure test tenant exists with roles and permissions seeded (from tenant provisioning)

3. Register and login as a test user

## Step 1: Register and Login

**Register User**:
```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@demo.com\",\"password\":\"Admin123!@#\",\"name\":\"Admin User\"}"
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@demo.com\",\"password\":\"Admin123!@#\"}"
```

Save the `access_token` from response!

## Step 2: Test Roles API

### List All Roles

```bash
curl -X GET http://localhost:3000/api/roles ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: List of roles (super_admin, admin, user)

**Expected Response**:
```json
[
  {
    "id": 1,
    "name": "super_admin",
    "display_name": "Super Administrator",
    "description": "Full system access",
    "is_system": true,
    "is_active": true,
    "created_by": null,
    "created_at": "2024-01-08T...",
    "updated_at": "2024-01-08T...",
    "deleted_at": null
  },
  {
    "id": 2,
    "name": "admin",
    "display_name": "Administrator",
    "description": "Tenant administrator",
    "is_system": true,
    "is_active": true,
    "created_by": null,
    "created_at": "2024-01-08T...",
    "updated_at": "2024-01-08T...",
    "deleted_at": null
  },
  {
    "id": 3,
    "name": "user",
    "display_name": "User",
    "description": "Basic user access",
    "is_system": true,
    "is_active": true,
    "created_by": null,
    "created_at": "2024-01-08T...",
    "updated_at": "2024-01-08T...",
    "deleted_at": null
  }
]
```

### List Roles with Permissions

```bash
curl -X GET http://localhost:3000/api/roles/with-permissions ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: Roles with their assigned permissions

### Get Role by ID

```bash
curl -X GET http://localhost:3000/api/roles/1 ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: Role details with permissions

### Create New Role

```bash
curl -X POST http://localhost:3000/api/roles ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"editor\",\"display_name\":\"Content Editor\",\"description\":\"Can edit content\",\"is_system\":false}"
```

**Expected (if no permissions)**:
```json
{
  "statusCode": 401,
  "message": "Anda tidak memiliki izin untuk mengakses resource ini"
}
```

This is expected because the user doesn't have `roles.create` permission yet!

### Update Role

```bash
curl -X PATCH http://localhost:3000/api/roles/1 ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"display_name\":\"Super Admin Updated\",\"description\":\"Updated description\"}"
```

Expected: 401 or 400 (cannot update system role)

### Delete Role

```bash
curl -X DELETE http://localhost:3000/api/roles/1 ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: 400 (cannot delete system role)

## Step 3: Test Permission Assignment

### Assign Permissions to Role

```bash
curl -X POST http://localhost:3000/api/roles/1/permissions ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"permission_ids\":[1,2,3]}"
```

Expected: Success or 401 (need roles.update permission)

### Remove Permission from Role

```bash
curl -X DELETE http://localhost:3000/api/roles/1/permissions/1 ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: Success or 401

## Step 4: Test CASL Guard

The CASL guard should automatically block access if user doesn't have required permissions.

**Without Permission**:
- Regular user trying to create role → 401 Unauthorized
- Regular user trying to update role → 401 Unauthorized
- Regular user trying to delete role → 401 Unauthorized

**With Permission**:
- Admin with roles.* permissions can manage roles
- Super admin can do everything (has manage.all)

## Step 5: Assign Role to User

To test permissions, you need to assign a role with permissions to your user.

You'll need to:
1. Create a user_roles entry in database manually OR
2. Create a user roles assignment endpoint (not in current scope)

**Manual SQL** (connect to database):
```sql
-- Set search path to tenant
SET search_path TO tenant_demo_company, public;

-- Assign super_admin role to user ID 1
INSERT INTO user_roles (user_id, role_id, created_by, created_at)
VALUES (1, 1, 1, NOW());
```

After assigning super_admin role:
- Login again to get new token with role
- Try creating role → Should succeed
- Try all operations → Should succeed

## Expected Permission Behavior

### Regular User (no roles):
- ❌ Cannot list roles
- ❌ Cannot create roles
- ❌ Cannot update roles
- ❌ Cannot delete roles
- ❌ Cannot assign permissions

### Admin Role (with roles.* permissions):
- ✅ Can list roles
- ✅ Can create roles
- ✅ Can update roles (except system roles)
- ✅ Can delete roles (except system roles)
- ✅ Can assign permissions

### Super Admin Role:
- ✅ Can do everything (manage all)

## Verification Checklist

- [ ] Type-check passes
- [ ] Lint passes
- [ ] Build succeeds
- [ ] Server starts without errors
- [ ] Can list roles with valid token
- [ ] Cannot list roles without token (401)
- [ ] Cannot access roles endpoints without roles.read permission (401)
- [ ] Super admin can access all endpoints
- [ ] Cannot update/delete system roles
- [ ] Can create custom roles
- [ ] Can assign permissions to roles
- [ ] Permissions are loaded with user roles
- [ ] CASL guard blocks unauthorized access

## Notes

1. **Token Requires Roles**: JWT strategy now loads user roles with permissions, so you need to login after assigning roles.

2. **Super Admin**: Has `manage all` ability, can do everything.

3. **Permission Format**: Permissions use `{resource}.{action}` format (e.g., `roles.create`, `users.read`).

4. **System Roles**: Cannot be updated or deleted (is_system = true).

5. **Slug vs Name**: In this implementation, `roles.name` is the slug (e.g., "super_admin"), and `display_name` is the human-readable name.

## Troubleshooting

**401 on all role endpoints**:
- Check if user has any role assigned
- Check if role has permissions
- Check JWT token is valid
- Check tenant context is set correctly

**Cannot create role**:
- Assign role with `roles.create` permission to user
- Or assign super_admin role

**Permissions not working**:
- Check role_permissions table has entries
- Check user_roles table links user to role
- Check permission slug format is correct (resource.action)
- Login again to refresh token with roles
