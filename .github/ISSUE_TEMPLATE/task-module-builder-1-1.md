---
name: Task Module Builder 1.1
about: Create Database Schema untuk Module Generator
title: '[TASK 1.1] Create Database Schema untuk Module Generator'
labels: ['backend', 'P0-critical', 'enhancement']
assignees: ''
---

## Task 1.1: Create Database Schema untuk Module Generator

**Sprint**: Week 1 (Days 1-2) - Backend Foundation  
**Priority**: P0 - CRITICAL  
**Estimated Time**: 2 jam  
**Dependencies**: None  
**Status**: [PENDING] BELUM DIMULAI

---

## Objective

Membuat database schema untuk menyimpan metadata module yang di-generate melalui Visual CRUD Builder UI. Schema ini akan track informasi module, fields, validations, dan query configurations.

---

## Goals

1. Create 2 tables di tenant schema: `generated_modules` dan `generated_module_fields`
2. Setup proper indexes untuk performance
3. Setup foreign keys untuk referential integrity
4. Verify schema works dengan test data

---

## Deliverables

### 1. Migration File
**File**: `backend/migrations/create-module-generator-tables.sql`

**What to build**:
- [ ] SQL script untuk create 2 tables
- [ ] Table `generated_modules` dengan 19 columns
- [ ] Table `generated_module_fields` dengan 11 columns
- [ ] 8 indexes total untuk optimasi query
- [ ] 3 foreign keys ke `public.users`
- [ ] Comments pada schema untuk dokumentasi

**SQL Structure**:
```sql
-- Table 1: generated_modules
CREATE TABLE generated_modules (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  module_name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_tenant_isolated BOOLEAN NOT NULL DEFAULT true,
  has_soft_delete BOOLEAN NOT NULL DEFAULT true,
  has_audit BOOLEAN NOT NULL DEFAULT true,
  visibility VARCHAR(20) NOT NULL DEFAULT 'private',
  searchable_fields TEXT[],
  filterable_fields TEXT[],
  sortable_fields TEXT[],
  fields_count INTEGER NOT NULL DEFAULT 0,
  permissions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT NOT NULL REFERENCES public.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by BIGINT REFERENCES public.users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id)
);

-- Indexes untuk generated_modules
CREATE INDEX idx_generated_modules_tenant_id ON generated_modules(tenant_id);
CREATE INDEX idx_generated_modules_module_name ON generated_modules(module_name);
CREATE INDEX idx_generated_modules_created_by ON generated_modules(created_by);
CREATE INDEX idx_generated_modules_deleted_at ON generated_modules(deleted_at);

-- Table 2: generated_module_fields
CREATE TABLE generated_module_fields (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES generated_modules(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  field_length INTEGER,
  precision INTEGER,
  scale INTEGER,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_unique BOOLEAN NOT NULL DEFAULT false,
  default_value TEXT,
  validations JSONB DEFAULT '[]'::jsonb,
  field_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(module_id, field_name)
);

-- Indexes untuk generated_module_fields
CREATE INDEX idx_generated_module_fields_module_id ON generated_module_fields(module_id);
CREATE INDEX idx_generated_module_fields_field_order ON generated_module_fields(field_order);
```

---

### 2. Drizzle Schema Files
**Files**: 
- `backend/src/database/schema/tenant/generated-modules.schema.ts`
- `backend/src/database/schema/tenant/generated-module-fields.schema.ts`

**What to build**:
- [ ] Drizzle table definition untuk `generated_modules`
- [ ] Drizzle table definition untuk `generated_module_fields`
- [ ] Export TypeScript types (inferSelect, inferInsert)
- [ ] Add exports ke `tenant/index.ts`

**Code Structure**:
```typescript
// generated-modules.schema.ts
import { pgTable, bigserial, varchar, text, boolean, timestamp, bigint, integer } from 'drizzle-orm/pg-core';

export const generatedModules = pgTable('generated_modules', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  tenantId: bigint('tenant_id', { mode: 'number' }).notNull(),
  moduleName: varchar('module_name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description'),
  isTenantIsolated: boolean('is_tenant_isolated').notNull().default(true),
  hasSoftDelete: boolean('has_soft_delete').notNull().default(true),
  hasAudit: boolean('has_audit').notNull().default(true),
  visibility: varchar('visibility', { length: 20 }).notNull().default('private'),
  searchableFields: text('searchable_fields').array(),
  filterableFields: text('filterable_fields').array(),
  sortableFields: text('sortable_fields').array(),
  fieldsCount: integer('fields_count').notNull().default(0),
  permissionsCount: integer('permissions_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: bigint('created_by', { mode: 'number' }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: bigint('updated_by', { mode: 'number' }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: bigint('deleted_by', { mode: 'number' }),
});

export type GeneratedModule = typeof generatedModules.$inferSelect;
export type NewGeneratedModule = typeof generatedModules.$inferInsert;
```

---

### 3. Apply Migration
**Command**: `npm run db:push`

**What to do**:
- [ ] Run migration ke database
- [ ] Verify tables created di tenant schema
- [ ] Check indexes created
- [ ] Check foreign keys working

---

## Acceptance Criteria

### Database
- [ ] Tables created successfully di tenant schema (tenant_xxx)
- [ ] `generated_modules` table memiliki 19 columns
- [ ] `generated_module_fields` table memiliki 11 columns
- [ ] Unique constraint pada `generated_modules.module_name`
- [ ] Unique constraint pada `generated_module_fields(module_id, field_name)`
- [ ] FK dari `generated_module_fields.module_id` ke `generated_modules.id` dengan CASCADE delete
- [ ] FK dari audit fields ke `public.users(id)`

### Indexes
- [ ] 4 indexes pada `generated_modules`
- [ ] 2 indexes pada `generated_module_fields`
- [ ] Index untuk soft delete (deleted_at)
- [ ] Index untuk tenant_id

### Drizzle Schema
- [ ] Schema files compile tanpa error
- [ ] Type inference working (`$inferSelect`, `$inferInsert`)
- [ ] Exported di `tenant/index.ts`
- [ ] Type-check pass: `npm run type-check`

### Testing
- [ ] Can insert test record ke `generated_modules`
- [ ] Can insert test record ke `generated_module_fields`
- [ ] Can query with joins (modules + fields)
- [ ] Soft delete working (deleted_at)
- [ ] Cascade delete working (delete module → delete fields)

---

## Testing Checklist

### Test 1: Create Tables
```bash
cd backend
npm run db:push
```

**Expected Result**: Tables created di tenant schema tanpa error

---

### Test 2: Insert Test Data
```sql
-- Connect ke database
psql -U postgres -d platform_cms

-- Set tenant schema
SET search_path TO tenant_xxx, public;

-- Insert test module
INSERT INTO generated_modules (
  tenant_id, module_name, display_name, description,
  is_tenant_isolated, has_soft_delete, has_audit,
  created_by, fields_count, permissions_count
) VALUES (
  1, 'test_product', 'Test Product', 'Test module untuk validation',
  true, true, true,
  1, 0, 0
) RETURNING id;

-- Insert test fields
INSERT INTO generated_module_fields (
  module_id, field_name, field_type, field_length,
  is_required, is_unique, field_order
) VALUES 
  (1, 'name', 'string', 255, true, false, 1),
  (1, 'price', 'decimal', null, true, false, 2),
  (1, 'stock', 'integer', null, false, false, 3);

-- Query with join
SELECT 
  m.module_name,
  m.display_name,
  m.fields_count,
  f.field_name,
  f.field_type,
  f.is_required
FROM generated_modules m
LEFT JOIN generated_module_fields f ON m.id = f.module_id
WHERE m.deleted_at IS NULL
ORDER BY f.field_order;
```

**Expected Result**: Data tersimpan dan query return correct results

---

### Test 3: Test Cascade Delete
```sql
-- Delete module (should also delete fields)
DELETE FROM generated_modules WHERE module_name = 'test_product';

-- Verify fields also deleted
SELECT COUNT(*) FROM generated_module_fields WHERE module_id = 1;
-- Expected: 0 rows
```

**Expected Result**: Fields otomatis terhapus karena CASCADE

---

### Test 4: Test Soft Delete
```sql
-- Soft delete module
UPDATE generated_modules 
SET deleted_at = NOW(), deleted_by = 1
WHERE module_name = 'test_product';

-- Query excluding soft deleted
SELECT * FROM generated_modules 
WHERE deleted_at IS NULL;

-- Expected: test_product tidak muncul
```

**Expected Result**: Soft delete working correctly

---

## Files to Create/Modify

### 1. `backend/migrations/create-module-generator-tables.sql`
**Changes**: Create new file dengan SQL script lengkap

### 2. `backend/src/database/schema/tenant/generated-modules.schema.ts`
**Changes**: Create new file dengan Drizzle schema

### 3. `backend/src/database/schema/tenant/generated-module-fields.schema.ts`
**Changes**: Create new file dengan Drizzle schema

### 4. `backend/src/database/schema/tenant/index.ts`
**Changes**: Add exports
```typescript
export * from './generated-modules.schema';
export * from './generated-module-fields.schema';
```

---

## Common Pitfalls

### 1. Foreign Key ke Public Schema
[X] **Wrong**: FK langsung tanpa qualify schema
```sql
created_by BIGINT REFERENCES users(id)
```

[OK] **Correct**: Qualify dengan schema
```sql
created_by BIGINT REFERENCES public.users(id)
```

### 2. Array Column di Drizzle
[X] **Wrong**: Tidak specify `.array()`
```typescript
searchableFields: text('searchable_fields')
```

[OK] **Correct**: Use `.array()` untuk PostgreSQL array
```typescript
searchableFields: text('searchable_fields').array()
```

### 3. Timestamp Timezone
[X] **Wrong**: Timestamp tanpa timezone
```typescript
timestamp('created_at')
```

[OK] **Correct**: Dengan timezone
```typescript
timestamp('created_at', { withTimezone: true })
```

---

## Documentation References

- Drizzle ORM Schema: https://orm.drizzle.team/docs/sql-schema-declaration
- Platform CMS Rules: `.kiro/skills/platform-cms-rules.md` - Part 2.3 (Entity Structure)
- Task Plan: `.kiro/specs/crud-builder-ui/tasks.md` - Task 1.1
- Design Doc: `.kiro/specs/crud-builder-ui/design.md` - Section 2 (Database Design)

---

## Success Criteria

**DONE when**:
- [ ] Migration file created
- [ ] Drizzle schema files created
- [ ] Migration applied successfully
- [ ] All indexes created
- [ ] Foreign keys working
- [ ] Type-check passes
- [ ] Test data dapat di-insert dan di-query
- [ ] Soft delete working
- [ ] Cascade delete working
- [ ] Schema exported di tenant/index.ts

---

## Notes for Implementation

**Time Estimate Breakdown**:
- SQL migration script: 30 min
- Drizzle schema files: 30 min
- Apply migration & verify: 30 min
- Testing: 30 min

**Testing Priority**:
1. Test table creation FIRST
2. Test insert/query SECOND
3. Test constraints (FK, unique) THIRD
4. Test soft delete & cascade LAST

**What NOT to implement** (defer to later):
- [X] Repository layer - Task 1.5
- [X] Service layer - Task 1.3
- [X] API endpoints - Phase 2
- [X] Frontend UI - Phase 3

---

**Created**: 2026-07-22  
**Sprint**: Week 1, Days 1-2  
**Phase**: Phase 1 - Backend Foundation  
**Related Tasks**: Task 1.2 (Drizzle Entities), Task 1.5 (Repository)
