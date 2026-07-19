# Multi-Tenant Architecture Documentation

## Overview

Platform CMS menggunakan **Schema-per-Tenant** architecture dengan **Shared Users** model untuk isolasi data yang kuat namun tetap flexible untuk multi-tenant access.

## Architecture Design

### Database Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      PUBLIC SCHEMA                           │
├─────────────────────────────────────────────────────────────┤
│  tenants                  → Tenant configuration             │
│  users                    → All users (cross-tenant)         │
│  tenant_user_mapping      → User-to-Tenant relationship      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  TENANT_XXX SCHEMA (Isolated)                │
├─────────────────────────────────────────────────────────────┤
│  roles                    → Tenant-specific roles            │
│  permissions              → Tenant-specific permissions      │
│  user_roles               → User-Role mapping                │
│  role_permissions         → Role-Permission mapping          │
│  menus                    → Navigation/menus                 │
│  menu_items               → Menu items                       │
│  categories               → Content categories               │
│  tags                     → Content tags                     │
│  [business_data]          → Other tenant data                │
└─────────────────────────────────────────────────────────────┘
```

### Why This Design?

**PUBLIC SCHEMA for Users:**
- ✅ Single source of truth for authentication
- ✅ User dapat akses multiple tenants
- ✅ Centralized user management
- ✅ Simpler credential management

**TENANT SCHEMA for Business Data:**
- ✅ Strong data isolation (schema-level)
- ✅ Cannot query across tenants accidentally
- ✅ Per-tenant backup/restore capability
- ✅ Tenant-specific roles & permissions

## User Registration & Login Flow

### 1. Registration Flow

```typescript
POST /api/auth/register
Headers: X-Tenant-Slug: demo_company
Body: { email, password, name }

Backend Flow:
1. Validate tenant exists (lookup public.tenants by slug)
2. Create user in public.users with tenant_id
3. Create entry in public.tenant_user_mapping
4. Return auth token with tenant context
```

**Database Operations:**
```sql
-- 1. Verify tenant exists
SELECT id, slug FROM public.tenants 
WHERE slug = 'demo_company' AND is_active = true;

-- 2. Create user
INSERT INTO public.users (email, password_hash, name, tenant_id, ...)
VALUES (...);

-- 3. Map user to tenant
INSERT INTO public.tenant_user_mapping (user_id, tenant_id, role)
VALUES (user_id, tenant_id, 'member');
```

### 2. Login Flow

```typescript
POST /api/auth/login
Headers: X-Tenant-Slug: demo_company
Body: { email, password }

Backend Flow:
1. Find user in public.users by email
2. Verify password hash
3. Load tenant from header
4. Verify user has access to tenant (tenant_user_mapping)
5. Set search_path to tenant schema
6. Load user roles from tenant_xxx.user_roles
7. Generate JWT with { userId, email, tenantId }
8. Return token + user data
```

**Database Operations:**
```sql
-- 1. Find user
SELECT * FROM public.users 
WHERE email = 'user@example.com' AND deleted_at IS NULL;

-- 2. Verify tenant access
SELECT * FROM public.tenant_user_mapping
WHERE user_id = ? AND tenant_id = ?;

-- 3. Set tenant context
SET search_path TO "tenant_demo_company", public;

-- 4. Load roles (now reads from tenant schema)
SELECT r.* FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = ?;
```

### 3. Authenticated Request Flow

```typescript
GET /api/users
Headers: 
  - Authorization: Bearer <token>
  - X-Tenant-Slug: demo_company

Middleware Chain:
1. JWT Auth Guard → Verify token, extract userId
2. Tenant Middleware → Extract tenant slug from header
3. Tenant Context → Load tenant, verify user access
4. Set search_path → SET search_path TO "tenant_xxx", public
5. Execute Request → All queries now scoped to tenant
```

## Tenant Isolation

### How Isolation Works

1. **Network Level**: Each request must include `X-Tenant-Slug` header
2. **Application Level**: Middleware validates user has access to tenant
3. **Database Level**: PostgreSQL `search_path` ensures queries hit correct schema
4. **Repository Level**: All queries executed within tenant schema context

### Example: Creating a Role

```typescript
// Controller
@Post()
async create(@Body() dto: CreateRoleDto, @CurrentUser() user: User) {
  // Tenant context already set by middleware
  return this.rolesService.create(dto, user.id);
}

// Service
async create(dto: CreateRoleDto, userId: number) {
  return this.rolesRepository.create({
    name: dto.name,
    display_name: dto.display_name,
    created_by: userId,
  });
}

// Repository (BaseRepository)
async create(data: Partial<T>, userId?: number): Promise<T> {
  return this.withTenantSchema(async () => {
    // search_path is "tenant_demo_company", public
    // This INSERT goes to tenant_demo_company.roles
    const results = await this.db
      .insert(this.table)
      .values({ ...data, created_by: userId })
      .returning();
    return results[0];
  });
}

// SQL Executed:
// SET search_path TO "tenant_demo_company", public;
// INSERT INTO roles (name, display_name, created_by, ...) 
// VALUES (...) RETURNING *;
// RESET search_path;
```

## Security Considerations

### ✅ What's Protected

1. **Schema Isolation**: Cannot accidentally query other tenant's data
2. **User Verification**: Middleware verifies user belongs to tenant
3. **JWT Validation**: Token includes tenant ID for validation
4. **Foreign Keys**: All tenant data references within same schema

### ⚠️ Important Notes

1. **Public Users Table**: Users are shared, must filter by tenant_id when listing
2. **Cross-Tenant Users**: Support users with access to multiple tenants
3. **SuperAdmin**: Can have a special role to access all tenants
4. **Schema Naming**: Always use `tenant_` prefix for tenant schemas

## Migration Path (Current → Target)

### Current State Issues
- ❌ Users exist in both public AND tenant schemas
- ❌ Backend reads from public but CLI creates in tenant
- ❌ Inconsistent data location

### Migration Steps

**Step 1: Consolidate Users to Public**
```sql
-- Move all tenant users to public (if needed)
INSERT INTO public.users (email, name, password_hash, ...)
SELECT email, name, password_hash, ... 
FROM tenant_demo_company.users
WHERE email NOT IN (SELECT email FROM public.users);

-- Create tenant mappings
INSERT INTO public.tenant_user_mapping (user_id, tenant_id)
SELECT u.id, t.id
FROM public.users u
CROSS JOIN public.tenants t
WHERE t.slug = 'demo_company';
```

**Step 2: Drop Users from Tenant Schemas**
```sql
-- Drop foreign keys first
ALTER TABLE tenant_demo_company.user_roles 
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Drop table
DROP TABLE IF EXISTS tenant_demo_company.users;
```

**Step 3: Update Foreign Keys to Public**
```sql
-- user_roles now references public.users
ALTER TABLE tenant_demo_company.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id)
  ON DELETE CASCADE;
```

**Step 4: Update Backend Code**
```typescript
// UsersRepository - Read from public, not tenant schema
async findByEmail(email: string): Promise<User | null> {
  // Do NOT use withTenantSchema for users
  const results = await this.db
    .select()
    .from(publicSchema.users)  // From public, not tenant
    .where(eq(publicSchema.users.email, email))
    .limit(1);
  return results[0] || null;
}
```

## Admin User Creation

### Using CLI (Recommended)

```bash
# Create admin in public schema with tenant mapping
npm run admin:create -- \
  --email admin@platform.com \
  --password Admin123456 \
  --name "Super Admin" \
  --tenant demo_company

# This will:
# 1. Create user in public.users
# 2. Create tenant mapping in public.tenant_user_mapping
# 3. Create SuperAdmin role in tenant schema (if not exists)
# 4. Assign SuperAdmin role to user in tenant_xxx.user_roles
```

### Manual SQL (Alternative)

```sql
-- 1. Create user in public
INSERT INTO public.users (email, name, password_hash, is_active, is_verified)
VALUES ('admin@platform.com', 'Admin', '$2b$12$...', true, true)
RETURNING id;

-- 2. Map to tenant
INSERT INTO public.tenant_user_mapping (user_id, tenant_id, role)
VALUES (user_id, tenant_id, 'admin');

-- 3. Create SuperAdmin role in tenant (if needed)
INSERT INTO tenant_demo_company.roles (name, display_name, is_system)
VALUES ('superadmin', 'Super Administrator', true)
RETURNING id;

-- 4. Assign all permissions to SuperAdmin
INSERT INTO tenant_demo_company.role_permissions (role_id, permission_id)
SELECT role_id, id FROM tenant_demo_company.permissions;

-- 5. Assign role to user
INSERT INTO tenant_demo_company.user_roles (user_id, role_id)
VALUES (user_id, role_id);
```

## Testing Tenant Isolation

### Test 1: Cannot Access Other Tenant's Data

```bash
# Login to tenant A
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: tenant_a" \
  -d '{"email":"user@example.com","password":"password"}'

# Try to access tenant B data (should fail)
curl http://localhost:3000/api/roles \
  -H "Authorization: Bearer <token_from_tenant_a>" \
  -H "X-Tenant-Slug: tenant_b"
  
# Expected: 403 Forbidden or 401 Unauthorized
```

### Test 2: User in Multiple Tenants

```sql
-- Setup: User in two tenants
INSERT INTO public.tenant_user_mapping (user_id, tenant_id, role)
VALUES 
  (1, 1, 'admin'),   -- User 1 in Tenant 1
  (1, 2, 'member');  -- User 1 in Tenant 2

-- User can login to both tenants
-- POST /api/auth/login with X-Tenant-Slug: tenant_a → Success
-- POST /api/auth/login with X-Tenant-Slug: tenant_b → Success
```

### Test 3: Schema Isolation

```sql
-- Even with same role name, data is isolated
INSERT INTO tenant_a.roles (name) VALUES ('editor');
INSERT INTO tenant_b.roles (name) VALUES ('editor');

-- These are DIFFERENT roles in DIFFERENT schemas
-- Cannot query tenant_a.roles when search_path is tenant_b
```

## Best Practices

### DO ✅

1. **Always use tenant middleware** for protected routes
2. **Validate tenant access** before setting context
3. **Use withTenantSchema()** wrapper for all tenant data queries
4. **Store users in public schema** for centralized auth
5. **Use X-Tenant-Slug header** consistently
6. **Log tenant context** in all operations for audit
7. **Test with multiple tenants** to ensure isolation

### DON'T ❌

1. **Don't hardcode schema names** in queries
2. **Don't bypass tenant middleware** for shortcuts
3. **Don't store users in tenant schemas** (use public)
4. **Don't forget to RESET search_path** after queries
5. **Don't trust client-provided tenant ID** (validate!)
6. **Don't share connection pools** across requests without resetting
7. **Don't allow anonymous tenant access** without validation

## Troubleshooting

### Issue: "Tenant context not set"
**Solution**: Ensure tenant middleware runs before repository access

### Issue: "User not found" but exists in database
**Solution**: Check if user table is in correct schema (public vs tenant)

### Issue: Data from wrong tenant appearing
**Solution**: Verify search_path is set correctly in all queries

### Issue: Foreign key violations across schemas
**Solution**: Ensure FK references point to correct schema (public for users)

## References

- [PostgreSQL Schema Documentation](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [NestJS Request Scope](https://docs.nestjs.com/fundamentals/injection-scopes)
