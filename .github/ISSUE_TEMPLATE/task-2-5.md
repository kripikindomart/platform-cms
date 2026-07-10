# Task 2.5: Tenant Provisioning Service (Simplified)

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 4 jam  
**Dependencies**: Task 2.1, 2.2, 2.3  
**Status**: Belum Dimulai

---

## Tujuan Task

Implement tenant provisioning service untuk create tenant lengkap dengan schema setup dan initial data seeding.

**Note**: User creation akan ditambahkan di Week 5-7 (Authentication). Task ini fokus pada tenant infrastructure provisioning.

---

## Yang Akan Dikerjakan

### 1. Struktur File

File yang akan dibuat:

```
backend/src/modules/tenants/
├── tenants.module.ts              (baru) - Tenants module
├── tenants.service.ts             (baru) - Tenant provisioning logic
├── tenants.repository.ts          (baru) - Tenant database operations
├── dto/
│   ├── create-tenant.dto.ts       (baru) - DTO untuk create tenant
│   └── tenant-response.dto.ts     (baru) - Response DTO
└── interfaces/
    └── tenant-provision.interface.ts (baru) - Provision result interface
```

### 2. Tenant Provisioning Service

**Fungsi**: Service untuk provision new tenant dengan complete setup

**Provisioning Flow**:
1. Validate input (name, slug uniqueness)
2. Create tenant record di public.tenants
3. Generate schema name (tenant_{slug})
4. CREATE SCHEMA di PostgreSQL
5. Run migrations untuk tenant schema (create 11 tables)
6. Seed default data (roles, permissions)
7. Return provision result
8. Rollback on failure

**Methods**:
- `provisionTenant(dto)` - Complete tenant provisioning
- `validateTenantData(dto)` - Validate before create
- `generateSlug(name)` - Generate URL-friendly slug
- `createTenantRecord(data)` - Create in public.tenants
- `setupTenantSchema(schemaName)` - Schema + migrations + seed
- `rollbackProvision(tenantId, schemaName)` - Cleanup on failure

### 3. Tenants Repository

**Fungsi**: Database operations untuk tenants table

**Methods**:
- `create(data)` - Create tenant record
- `findById(id)` - Find by ID
- `findBySlug(slug)` - Find by slug
- `findAll(filters)` - List tenants with pagination
- `update(id, data)` - Update tenant
- `softDelete(id)` - Soft delete tenant
- `restore(id)` - Restore soft deleted tenant

### 4. DTOs

**CreateTenantDto**:
```typescript
{
  name: string;           // Tenant name (required)
  domain?: string;        // Custom domain (optional)
  subscriptionTier?: 'free' | 'basic' | 'pro' | 'enterprise';
  config?: TenantConfig;  // Custom configuration
}
```

**TenantResponseDto**:
```typescript
{
  id: number;
  name: string;
  slug: string;
  domain?: string;
  schemaName: string;
  subscriptionTier: string;
  isActive: boolean;
  createdAt: Date;
}
```

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] File `tenants.module.ts` sudah dibuat
- [ ] File `tenants.service.ts` sudah dibuat dengan provisioning logic
- [ ] File `tenants.repository.ts` sudah dibuat
- [ ] File `create-tenant.dto.ts` sudah dibuat dengan Zod validation
- [ ] File `tenant-response.dto.ts` sudah dibuat
- [ ] Provisioning flow working (create tenant + schema + migrations + seed)
- [ ] Rollback functionality working
- [ ] Duplicate slug validation working
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Can provision tenant successfully
- [ ] Schema created dengan 11 tables
- [ ] Default roles dan permissions seeded

---

## Cara Testing

### 1. Type Check & Lint

```bash
cd backend
npm run type-check
npm run lint
```

Expected: No errors

### 2. Provision Test Tenant

Buat simple test script `src/scripts/test-provision.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TenantsService } from '../modules/tenants/tenants.service';

async function test() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const tenantsService = app.get(TenantsService);

  console.log('Creating test tenant...');
  
  const result = await tenantsService.provisionTenant({
    name: 'Demo Company',
    subscriptionTier: 'free',
  });

  console.log('Tenant created:', result);

  await app.close();
}

test();
```

Run:
```bash
ts-node src/scripts/test-provision.ts
```

Expected output:
```
Creating test tenant...
Tenant created: {
  tenant: {
    id: 1,
    name: 'Demo Company',
    slug: 'demo-company',
    schemaName: 'tenant_demo_company',
    subscriptionTier: 'free',
    isActive: true
  },
  schemaCreated: true,
  tablesCreated: 11,
  rolesSeeded: 3,
  permissionsSeeded: 20
}
```

### 3. Verify Schema Created

```bash
npm run tenant:info tenant_demo_company
```

Expected: Schema exists with 11 tables

### 4. Verify Data Seeded

```sql
-- Check roles
SELECT * FROM tenant_demo_company.roles;

-- Check permissions
SELECT * FROM tenant_demo_company.permissions;
```

Expected: Default roles dan permissions exists

### 5. Test Duplicate Prevention

Try creating tenant with same name:
```bash
ts-node src/scripts/test-provision.ts
```

Expected: Error "Tenant dengan slug ini sudah ada"

### 6. Test Rollback

Simulate failure dan verify rollback:
- Tenant record deleted
- Schema dropped

---

## Implementasi Notes

### Slug Generation

Generate URL-friendly slug:

```typescript
private generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Replace spaces with dash
    .replace(/-+/g, '-')          // Replace multiple dashes with single
    .replace(/^-|-$/g, '');       // Remove leading/trailing dashes
}
```

### Schema Setup dengan Drizzle

Use drizzle-kit push untuk create tables:

```typescript
async setupTenantSchema(schemaName: string): Promise<void> {
  // 1. Create schema
  await this.tenantSchemaService.createTenantSchema(schemaName);

  // 2. Set search_path
  await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

  // 3. Run migrations (drizzle-kit push)
  // Note: This needs to be done via CLI or programmatically
  // For now, we'll create tables manually or use migration runner

  // 4. Seed default data
  await this.seedDefaultData(schemaName);

  // 5. Reset search_path
  await this.db.execute(sql.raw('RESET search_path'));
}
```

### Default Data Seeding

Seed roles dan permissions:

```typescript
private async seedDefaultData(schemaName: string): Promise<void> {
  await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

  // Seed roles
  const roles = [
    { name: 'super_admin', display_name: 'Super Admin', is_system: true, is_active: true },
    { name: 'admin', display_name: 'Administrator', is_system: true, is_active: true },
    { name: 'user', display_name: 'User', is_system: false, is_active: true },
  ];

  for (const role of roles) {
    await this.db.execute(sql`
      INSERT INTO roles (name, display_name, is_system, is_active, created_at, updated_at)
      VALUES (${role.name}, ${role.display_name}, ${role.is_system}, ${role.is_active}, NOW(), NOW())
    `);
  }

  // Seed permissions
  const permissions = [
    { resource: 'users', action: 'create', scope: 'tenant' },
    { resource: 'users', action: 'read', scope: 'tenant' },
    { resource: 'users', action: 'update', scope: 'tenant' },
    { resource: 'users', action: 'delete', scope: 'tenant' },
    // ... more permissions
  ];

  for (const perm of permissions) {
    await this.db.execute(sql`
      INSERT INTO permissions (resource, action, scope, created_at)
      VALUES (${perm.resource}, ${perm.action}, ${perm.scope}, NOW())
    `);
  }

  await this.db.execute(sql.raw('RESET search_path'));
}
```

### Rollback on Failure

Transaction-like rollback:

```typescript
async provisionTenant(dto: CreateTenantDto): Promise<ProvisionResult> {
  let tenantId: number | null = null;
  let schemaName: string | null = null;

  try {
    // 1. Create tenant record
    const tenant = await this.tenantsRepository.create(dto);
    tenantId = tenant.id;
    schemaName = tenant.schema_name;

    // 2. Setup schema
    await this.setupTenantSchema(schemaName);

    return {
      success: true,
      tenant,
      schemaCreated: true,
      tablesCreated: 11,
    };
  } catch (error) {
    // Rollback
    if (tenantId) {
      await this.tenantsRepository.hardDelete(tenantId);
    }
    if (schemaName) {
      await this.tenantSchemaService.dropTenantSchema(schemaName);
    }

    throw error;
  }
}
```

---

## Security Notes

1. **Slug Validation**: Ensure slug is safe untuk database schema name
2. **Duplicate Check**: Check slug uniqueness before creating
3. **Input Sanitization**: Clean tenant name dan config
4. **Schema Naming**: Follow tenant_xxx pattern strictly
5. **Rollback**: Always cleanup on failure

---

## Documentation References

- TECHNICAL-ARCHITECTURE.md Section 4.3 - Tenant provisioning flow
- ERD-DATABASE.md Section 1.1 - Tenants table
- AI-RULES.md Section 7 - Database rules

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 2.6: Base Repository with Soft Delete** - Create reusable repository pattern

---

## Output Expected

Setelah task selesai:
1. Tenants module implemented
2. Provisioning service working
3. Repository dengan CRUD operations
4. DTOs dengan validation
5. Can create tenant successfully
6. Schema created dengan 11 tables
7. Default data seeded (roles, permissions)
8. Rollback working on failure
9. Type-check passing
10. Lint passing

**Provisioning Result**:
- Tenant record created in public.tenants
- Schema tenant_xxx created
- 11 tables created in tenant schema
- 3 default roles seeded
- ~20 default permissions seeded
- Ready for user creation (Week 5-7)
