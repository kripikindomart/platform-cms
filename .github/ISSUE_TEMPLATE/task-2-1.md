# Task 2.1: Create Global Schema (public)

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 4 jam  
**Dependencies**: Task 1.3  
**Status**: Belum Dimulai

---

## Tujuan Task

Membuat database schema untuk global tables (public schema) menggunakan Drizzle ORM. Schema ini menyimpan data yang shared across semua tenants: tenants registry, modules, permissions template, dan system settings.

---

## Yang Akan Dikerjakan

### 1. Struktur File

File schema yang akan dibuat:

```
backend/src/database/schema/public/
├── tenants.schema.ts           (baru)
├── modules.schema.ts            (baru)
├── module-permissions.schema.ts (baru)
├── system-settings.schema.ts    (baru)
└── index.ts                     (baru, export semua)
```

### 2. Table: tenants

**Fungsi**: Registry semua tenants dalam platform

**Schema Fields**:
- `id` (bigserial, PK)
- `name` (varchar 255, NOT NULL) - Display name
- `slug` (varchar 100, UNIQUE, NOT NULL) - URL-friendly identifier
- `domain` (varchar 255, UNIQUE nullable) - Custom domain
- `schema_name` (varchar 100, UNIQUE, NOT NULL) - PostgreSQL schema name (tenant_xxx)
- `subscription_tier` (varchar 50, NOT NULL) - free, basic, pro, enterprise
- `subscription_expires_at` (timestamp tz, nullable)
- `config` (text/jsonb, nullable) - Custom tenant configuration
- `is_active` (boolean, NOT NULL, default true)
- **Audit fields**: `created_at`, `updated_at`, `created_by`, `updated_by`
- **Soft delete**: `deleted_at`, `deleted_by`

**Indexes**:
- `slug` (unique)
- `domain` (unique, partial where domain IS NOT NULL)
- `is_active`
- `deleted_at` (partial where deleted_at IS NULL)

### 3. Table: modules

**Fungsi**: Registry semua modules yang tersedia dalam platform

**Schema Fields**:
- `id` (bigserial, PK)
- `name` (varchar 100, UNIQUE, NOT NULL) - Module identifier (kebab-case)
- `display_name` (varchar 255, NOT NULL) - Display name
- `description` (text, nullable)
- `icon` (varchar 50, nullable) - Icon name (lucide icons)
- `route_prefix` (varchar 100, UNIQUE, NOT NULL) - Route prefix (/users, /roles)
- `is_core` (boolean, NOT NULL, default false) - Cannot be disabled
- `is_active` (boolean, NOT NULL, default true)
- `order` (integer, NOT NULL, default 0) - Display order
- `version` (varchar 20, NOT NULL) - Module version (1.0.0)
- **Audit fields**: `created_at`, `updated_at`

**Indexes**:
- `name` (unique)
- `route_prefix` (unique)
- `is_active`
- `is_core`
- `order`

**No Soft Delete**: Module tidak perlu soft delete

### 4. Table: module_permissions

**Fungsi**: Template permissions per module (global)

**Schema Fields**:
- `id` (bigserial, PK)
- `module_id` (bigint, FK to modules, NOT NULL)
- `resource` (varchar 100, NOT NULL) - Resource name (users, roles)
- `action` (varchar 50, NOT NULL) - create, read, update, delete, export, import
- `scope` (varchar 50, NOT NULL) - own, tenant, all
- `description` (text, nullable)
- **Audit field**: `created_at`

**Constraints**:
- FK: `module_id` → `modules(id)` ON DELETE CASCADE
- UNIQUE: `(module_id, resource, action, scope)`
- CHECK: `action IN ('create', 'read', 'update', 'delete', 'export', 'import')`
- CHECK: `scope IN ('own', 'tenant', 'all')`

**Indexes**:
- `module_id`
- `resource`

**No Soft Delete**: Permissions adalah reference data

### 5. Table: system_settings

**Fungsi**: System-wide configuration (key-value store)

**Schema Fields**:
- `id` (bigserial, PK)
- `key` (varchar 100, UNIQUE, NOT NULL) - Setting key
- `value` (text, nullable) - Setting value
- `type` (varchar 50, NOT NULL) - string, number, boolean, json
- `description` (text, nullable)
- `is_public` (boolean, NOT NULL, default false) - Frontend accessible?
- **Audit fields**: `created_at`, `updated_at`, `updated_by`

**Constraints**:
- UNIQUE: `key`
- CHECK: `type IN ('string', 'number', 'boolean', 'json')`

**Indexes**:
- `key` (unique)
- `is_public`

**No Soft Delete**: Settings adalah configuration data

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] File `tenants.schema.ts` sudah dibuat
- [ ] File `modules.schema.ts` sudah dibuat
- [ ] File `module-permissions.schema.ts` sudah dibuat
- [ ] File `system-settings.schema.ts` sudah dibuat
- [ ] File `index.ts` sudah dibuat (export semua schemas)
- [ ] All schemas menggunakan Drizzle ORM dengan proper types
- [ ] Indexes sudah didefinisikan
- [ ] Foreign keys sudah didefinisikan
- [ ] Type exports (`Type`, `NewType`) sudah ada untuk semua tables
- [ ] Command `npm run type-check` berhasil tanpa error
- [ ] Command `npm run lint` berhasil tanpa error
- [ ] Migration file generated (drizzle-kit generate)
- [ ] Migration dapat dijalankan (drizzle-kit migrate)

---

## Cara Testing

### 1. Type Check

```bash
cd backend
npm run type-check
```

Expected: No TypeScript errors

### 2. Lint Check

```bash
npm run lint
```

Expected: No linting errors

### 3. Generate Migration

```bash
npm run db:generate
```

Expected: Migration file created di `drizzle/migrations/`

### 4. Run Migration

```bash
npm run db:migrate
```

Expected: Tables created in database

### 5. Verify Tables Created

```bash
psql -U postgres -d platform_cms
\dt public.*
```

Expected output:
```
 Schema |        Name         | Type  |  Owner   
--------+---------------------+-------+----------
 public | tenants             | table | postgres
 public | modules             | table | postgres
 public | module_permissions  | table | postgres
 public | system_settings     | table | postgres
```

### 6. Check Indexes

```sql
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

Expected: All defined indexes exist

### 7. Test Insert

```sql
-- Test insert tenant
INSERT INTO public.tenants (name, slug, schema_name, subscription_tier)
VALUES ('Demo Tenant', 'demo', 'tenant_demo', 'free');

-- Test unique constraint
INSERT INTO public.tenants (name, slug, schema_name, subscription_tier)
VALUES ('Another Tenant', 'demo', 'tenant_another', 'free');
-- Should fail with unique constraint violation
```

---

## Implementasi Notes

### Drizzle ORM Best Practices

1. **Use bigserial for IDs**:
   ```typescript
   id: bigserial('id', { mode: 'number' }).primaryKey()
   ```

2. **Timestamps with timezone**:
   ```typescript
   created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
   ```

3. **Nullable foreign keys untuk audit**:
   ```typescript
   created_by: bigint('created_by', { mode: 'number' })
   ```

4. **Indexes**:
   ```typescript
   export const tenants = pgTable('tenants', {
     // columns
   }, (table) => {
     return {
       slugIdx: uniqueIndex('idx_tenants_slug').on(table.slug),
       isActiveIdx: index('idx_tenants_is_active').on(table.is_active),
     };
   });
   ```

5. **Type exports**:
   ```typescript
   export type Tenant = typeof tenants.$inferSelect;
   export type NewTenant = typeof tenants.$inferInsert;
   ```

### Naming Conventions

- **File names**: kebab-case (tenants.schema.ts)
- **Table names**: snake_case (system_settings)
- **Column names**: snake_case (is_active, created_at)
- **Type names**: PascalCase (Tenant, NewTenant)
- **Index names**: idx_tablename_columnname

### Drizzle Config Update

Update `drizzle.config.ts` untuk include new schema path:

```typescript
schema: './src/database/schema/**/*.schema.ts',
```

---

## Database Scripts to Add

Add to `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push"
  }
}
```

---

## Troubleshooting

**Problem**: TypeScript error on inferSelect  
**Solution**: Ensure drizzle-orm latest version installed

**Problem**: Migration tidak generate  
**Solution**: Check drizzle.config.ts path ke schema files

**Problem**: Foreign key error  
**Solution**: Ensure referenced table exists first (modules before module_permissions)

**Problem**: Unique constraint violation  
**Solution**: Check for duplicate data, add WHERE clause untuk partial unique index

**Problem**: Timezone error  
**Solution**: Use `withTimezone: true` untuk timestamp fields

---

## Documentation References

- ERD-DATABASE.md Section 1 - Global schema tables detail
- AI-RULES.md Section 7.2 - Drizzle ORM patterns
- AI-RULES.md Section 7.5 - Soft delete mandatory fields
- AI-RULES.md Section 7.6 - Audit columns mandatory
- Drizzle ORM docs: https://orm.drizzle.team/docs/overview

---

## Security Notes

1. **Soft Delete**: MANDATORY untuk `tenants` (data krusial)
2. **Audit Columns**: Track created_by, updated_by, deleted_by
3. **Unique Constraints**: Prevent duplicate slugs, domains, schema names
4. **Active Status**: is_active flag untuk soft disable
5. **JSONB Config**: Validate structure di application layer, bukan di database

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 2.2: Create Tenant Schema Template** - Create 11 tables untuk tenant schema

---

## Output Expected

Setelah task selesai:
1. 4 schema files created with Drizzle ORM
2. Type-check dan lint passing
3. Migration file generated
4. Tables created in PostgreSQL database
5. Indexes created properly
6. Foreign keys working
7. Can insert test data
8. Unique constraints working
9. Soft delete columns present where needed
10. Audit columns present on all major tables
