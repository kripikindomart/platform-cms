# Schema Architecture - Platform CMS

## 🏗️ Current Implementation

### Database Structure Overview

```
platform_cms (Database)
│
├── PUBLIC SCHEMA
│   ├── tenants                 ← Tenant registry
│   ├── users                   ← ALL users (shared)
│   ├── modules                 ← Available modules
│   ├── tenant_modules          ← Module enablement per tenant
│   ├── system_settings         ← Global settings
│   └── cli_metadata            ← CLI generator metadata
│
├── TENANT_DEMO_COMPANY SCHEMA
│   ├── roles                   ← Tenant-specific roles
│   ├── permissions             ← Tenant-specific permissions
│   ├── user_roles              ← FK to public.users (!)
│   ├── role_permissions        ← Role-permission mapping
│   ├── menus                   ← Navigation
│   ├── menu_items              ← Menu structure
│   ├── categories              ← Generated module
│   ├── tags                    ← Generated module
│   ├── audit_logs              ← Audit trail
│   └── sessions                ← User sessions
│
└── TENANT_COMPANY_B SCHEMA (Example)
    ├── roles                   ← DIFFERENT roles!
    ├── permissions             ← DIFFERENT permissions!
    ├── user_roles              ← FK to public.users
    ├── products                ← Generated module (different!)
    └── orders                  ← Generated module (different!)
```

## 📊 Data Flow

### Login Flow

```
1. User Login Request
   POST /api/auth/login
   Headers: X-Tenant-Slug: demo_company
   Body: { email, password }
   
2. Backend Query PUBLIC Schema
   SELECT * FROM public.users 
   WHERE email = 'user@example.com'
   
3. Verify Password
   bcrypt.compare(input, hash_from_db)
   
4. Validate Tenant
   SELECT * FROM public.tenants 
   WHERE slug = 'demo_company'
   
5. Set Tenant Context
   SET search_path TO "tenant_demo_company", public
   
6. Load Roles from TENANT Schema
   SELECT r.* 
   FROM tenant_demo_company.user_roles ur
   JOIN tenant_demo_company.roles r ON ur.role_id = r.id
   WHERE ur.user_id = ? ← User ID from public.users!
   
7. Generate JWT
   { sub: userId, email, tenantId, schemaName }
   
8. Return Token + User Data
```

### Data Access Flow

```
1. Authenticated Request
   GET /api/roles
   Headers: 
     - Authorization: Bearer <token>
     - X-Tenant-Slug: demo_company
   
2. Middleware Validates
   - JWT token valid
   - Tenant exists
   - User has access to tenant
   
3. Set Search Path
   SET search_path TO "tenant_demo_company", public
   
4. Execute Query
   SELECT * FROM roles  ← Automatically reads from tenant_demo_company.roles
   WHERE deleted_at IS NULL
   
5. Return Data
   Only data from tenant_demo_company schema
```

## 🔗 Foreign Key Relationships

### Critical: user_roles FK Configuration

```sql
-- TENANT SCHEMA: user_roles table
CREATE TABLE tenant_demo_company.user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,  ← References PUBLIC.users
  role_id BIGINT NOT NULL,  ← References tenant_demo_company.roles
  assigned_by BIGINT,       ← References PUBLIC.users
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- FK to PUBLIC SCHEMA
ALTER TABLE tenant_demo_company.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id)  ← Cross-schema FK!
  ON DELETE CASCADE;

ALTER TABLE tenant_demo_company.user_roles
  ADD CONSTRAINT user_roles_assigned_by_fkey
  FOREIGN KEY (assigned_by) 
  REFERENCES public.users(id)
  ON DELETE SET NULL;

-- FK to TENANT SCHEMA
ALTER TABLE tenant_demo_company.user_roles
  ADD CONSTRAINT user_roles_role_id_fkey
  FOREIGN KEY (role_id) 
  REFERENCES tenant_demo_company.roles(id)
  ON DELETE CASCADE;
```

**Key Point**: `user_id` di tenant schema **HARUS** reference `public.users.id`!

## 🎯 What Happens to Tenant Schemas?

### Tenant Schema Purpose

**Tenant schemas menyimpan:**
1. ✅ **Roles** - Isolated per tenant
2. ✅ **Permissions** - Customizable per tenant
3. ✅ **Business Data** - Products, orders, content, etc.
4. ✅ **Generated Modules** - CLI-generated features
5. ✅ **Audit Logs** - Tenant-specific history
6. ✅ **Menus** - Custom navigation

**Tenant schemas TIDAK menyimpan:**
- ❌ Users (ada di public.users)
- ❌ Tenant registry (ada di public.tenants)
- ❌ Global modules (ada di public.modules)

### Example: Two Tenants

**Tenant A (demo_company):**
```sql
tenant_demo_company.roles:
- id: 1, name: 'admin', display_name: 'Administrator'
- id: 2, name: 'editor', display_name: 'Content Editor'

tenant_demo_company.permissions:
- id: 1, resource: 'products', action: 'create'
- id: 2, resource: 'products', action: 'delete'

tenant_demo_company.products:
- id: 1, name: 'Laptop', price: 15000000
- id: 2, name: 'Mouse', price: 250000
```

**Tenant B (company_b):**
```sql
tenant_company_b.roles:
- id: 1, name: 'manager', display_name: 'Store Manager'
- id: 2, name: 'cashier', display_name: 'Cashier'

tenant_company_b.permissions:
- id: 1, resource: 'orders', action: 'approve'
- id: 2, resource: 'invoices', action: 'generate'

tenant_company_b.orders:
- id: 1, customer: 'John', total: 5000000
- id: 2, customer: 'Jane', total: 3000000
```

**Shared Public Data:**
```sql
public.users:
- id: 1, email: 'admin@platform.com', name: 'Super Admin'
- id: 2, email: 'john@company.com', name: 'John Doe'

public.tenants:
- id: 1, slug: 'demo_company', name: 'Demo Company'
- id: 2, slug: 'company_b', name: 'Company B'
```

### User Assignment

```sql
-- User 1 has roles in BOTH tenants
tenant_demo_company.user_roles:
- user_id: 1, role_id: 1 (admin in demo_company)

tenant_company_b.user_roles:
- user_id: 1, role_id: 1 (manager in company_b)

-- User 2 only in Tenant B
tenant_company_b.user_roles:
- user_id: 2, role_id: 2 (cashier in company_b)
```

**Result**: User 1 dapat login ke KEDUA tenant dengan role berbeda!

## 🚀 CLI Generator & Tenant Schemas

### Module Generation

When you run:
```bash
npm run generate:module products --tenant demo_company
```

**What Happens:**

1. **Read Template**
   ```
   templates/module-template/
   ├── entity.template.ts
   ├── dto.template.ts
   ├── service.template.ts
   └── controller.template.ts
   ```

2. **Generate Code**
   ```
   src/modules/products/
   ├── products.entity.ts
   ├── products.dto.ts
   ├── products.service.ts
   └── products.controller.ts
   ```

3. **Create Migration**
   ```sql
   CREATE TABLE tenant_demo_company.products (
     id BIGSERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     price DECIMAL(15,2),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     created_by BIGINT REFERENCES public.users(id)
   );
   ```

4. **Register Module**
   ```sql
   INSERT INTO public.modules (name, slug, version)
   VALUES ('Products', 'products', '1.0.0');
   
   INSERT INTO public.tenant_modules (tenant_id, module_id, is_enabled)
   VALUES (1, 5, true);
   ```

5. **Different Tenant = Different Schema!**
   ```bash
   npm run generate:module products --tenant company_b
   ```
   Creates: `tenant_company_b.products` (ISOLATED!)

## 📈 Scaling Considerations

### Advantages

✅ **Strong Isolation**: Cannot query other tenant's data accidentally
✅ **Per-Tenant Backup**: `pg_dump --schema=tenant_demo_company`
✅ **Custom Modules**: Each tenant can have different modules
✅ **Performance**: Index per schema, no giant shared tables
✅ **Compliance**: Data residency per schema

### Challenges

⚠️ **Schema Proliferation**: 1000 tenants = 1000 schemas
⚠️ **Migration Complexity**: Must run migrations on ALL schemas
⚠️ **Connection Pool**: PostgreSQL connection limits
⚠️ **Backup Time**: Must backup each schema separately

### When to Refactor

Consider moving to **Row-Level Security (RLS)** if:
- More than 500 tenants
- Need cross-tenant analytics
- Want simpler migrations
- Cloud-hosted (limited schemas)

## 🔍 Inspection Queries

### Check All Schemas

```sql
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name LIKE 'tenant_%'
ORDER BY schema_name;
```

### Check User Roles Across Tenants

```sql
SELECT 
  u.email,
  t.name as tenant_name,
  r.display_name as role
FROM public.users u
JOIN tenant_demo_company.user_roles ur ON u.id = ur.user_id
JOIN tenant_demo_company.roles r ON ur.role_id = r.id
JOIN public.tenants t ON t.slug = 'demo_company'
WHERE u.email = 'admin@platform.com';
```

### Check Tables in Tenant Schema

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_demo_company'
ORDER BY table_name;
```

### Check FK Constraints

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'tenant_demo_company'
ORDER BY tc.table_name, kcu.column_name;
```

## 🎓 Summary

**Current Architecture:**
- Users: `public.users` (shared)
- Roles: `tenant_xxx.roles` (isolated)
- Data: `tenant_xxx.*` (isolated)
- FK: `tenant_xxx.user_roles.user_id` → `public.users.id`

**Login:** Always check `public.users`
**Authorization:** Load roles from `tenant_xxx.user_roles`
**Data Access:** Query `tenant_xxx` tables via search_path

**Result:** Strong isolation + flexible user management! 🚀
