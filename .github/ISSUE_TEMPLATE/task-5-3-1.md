# Task 5.3.1: CLI Metadata Database Schema

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 3 jam  
**Dependencies**: Task 5.3 (CRUD Generator)  
**Status**: Belum Dimulai

---

## Tujuan Task

Membuat database schema untuk tracking semua modules, fields, dan validations yang di-generate oleh CLI. Schema ini akan menjadi foundation untuk intelligent CLI generator yang trackable dan reversible.

---

## Yang Akan Dikerjakan

### 1. Database Tables (4 tables)

**Table: `generated_modules`**
Track semua modules yang di-generate.

Fields:
- id, name, display_name, description
- has_tenant_isolation, has_soft_delete, has_audit
- generated_files (JSON array)
- cli_command, generator_version
- is_active, created_at, created_by, deleted_at

**Table: `module_fields`**
Track semua fields dalam setiap module.

Fields:
- id, module_id (FK), name, display_name, description
- field_type (enum), input_type (enum)
- is_required, is_unique, is_nullable
- length, min_value, max_value, precision, scale
- enum_values (JSON), relation_module, relation_type
- placeholder, help_text
- is_searchable, is_sortable, is_filterable
- show_in_list, show_in_detail, show_in_form
- order, created_at, updated_at

**Table: `field_validations`**
Track validation rules untuk setiap field.

Fields:
- id, field_id (FK)
- validation_type (enum)
- validation_params (JSON)
- error_message, order
- created_at

**Table: `generation_history`**
Audit trail untuk semua CLI operations.

Fields:
- id, operation, module_id (FK)
- command, options (JSON)
- success, error_message
- files_created, files_modified, files_deleted (JSON arrays)
- can_rollback, rollback_data (JSON)
- created_at, created_by

### 2. Enums (3 enums)

**Enum: `field_type`**
Values: string, text, number, integer, float, decimal, boolean, date, datetime, timestamp, email, url, uuid, json, enum, relation

**Enum: `input_type`**
Values: text, textarea, number, email, password, url, tel, date, datetime-local, time, checkbox, radio, select, multiselect, file, image, color, range, wysiwyg, markdown, json-editor, relation-select

**Enum: `validation_type`**
Values: required, unique, email, url, min, max, minLength, maxLength, pattern, custom

### 3. Files

**Schema File**:
- `backend/src/database/schema/public/cli-metadata.schema.ts` (✅ already created)

**Migration File**:
- Generate dengan drizzle-kit

**Index File Update**:
- Export dari `backend/src/database/schema/public/index.ts`

---

## Kriteria Selesai (Checklist)

### Schema
- [ ] 4 tables defined dengan drizzle-orm
- [ ] 3 enums defined
- [ ] Foreign keys configured
- [ ] Indexes added untuk performance
- [ ] Type exports added

### Migration
- [ ] Migration file generated
- [ ] Migration tested (up)
- [ ] Migration rollback tested (down)
- [ ] Schema created in database

### Integration
- [ ] Exported dari public schema index
- [ ] Can import dan use types
- [ ] Type-check passes
- [ ] Can query via Drizzle

---

## Cara Testing

### 1. Generate Migration

```bash
cd backend
npm run db:generate
```

Expected: Migration file created in `src/database/migrations/`

### 2. Run Migration

```bash
npm run db:migrate
```

Expected: Tables created in public schema

### 3. Verify Schema

```sql
-- Connect to database
psql -U postgres -d platform_cms

-- Check tables
\dt public.generated_modules
\dt public.module_fields
\dt public.field_validations
\dt public.generation_history

-- Check enums
\dT+ field_type
\dT+ input_type
\dT+ validation_type

-- Verify structure
\d public.generated_modules
\d public.module_fields
```

Expected: All tables and enums exist

### 4. Test Drizzle Query

Create test script `backend/src/scripts/test-cli-schema.ts`:

```typescript
import { db } from '../database/drizzle.provider';
import { generatedModules, moduleFields } from '../database/schema/public';

async function test() {
  // Test insert
  const module = await db.insert(generatedModules).values({
    name: 'test-module',
    display_name: 'Test Module',
    generated_files: ['file1.ts', 'file2.ts'],
    cli_command: 'cms generate module test',
    generator_version: '0.1.0',
  }).returning();

  console.log('Module created:', module);

  // Test query
  const modules = await db.select().from(generatedModules);
  console.log('All modules:', modules);
}

test();
```

Run:
```bash
npx tsx src/scripts/test-cli-schema.ts
```

Expected: Can insert and query successfully

---

## Implementation Notes

### Schema Design Decisions

**1. Why separate tables?**
- Normalization: Avoid data duplication
- Flexibility: Easy to query fields independently
- Scalability: Can add more field attributes later

**2. Why JSON columns?**
- `generated_files`: Array of file paths (flexible length)
- `enum_values`: Dynamic enum values per field
- `validation_params`: Different params per validation type
- `rollback_data`: Backup data structure varies

**3. Why enums?**
- Type safety: Prevent invalid values
- Performance: Enum is more efficient than varchar
- Documentation: Self-documenting allowed values

**4. Indexes untuk performance**:
```typescript
// Add indexes
.index('idx_modules_name').on(generatedModules.name)
.index('idx_fields_module').on(moduleFields.module_id)
.index('idx_validations_field').on(fieldValidations.field_id)
```

### Migration Strategy

**Drizzle Kit Config** (already in `backend/drizzle.config.ts`):
```typescript
export default {
  schema: './src/database/schema/**/*.ts',
  out: './src/database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};
```

**Generate Migration**:
```bash
npm run db:generate
# Creates: 0003_cli_metadata.sql
```

**Migration File Structure**:
```sql
-- Create enums
CREATE TYPE field_type AS ENUM (...);
CREATE TYPE input_type AS ENUM (...);
CREATE TYPE validation_type AS ENUM (...);

-- Create tables
CREATE TABLE generated_modules (...);
CREATE TABLE module_fields (...);
CREATE TABLE field_validations (...);
CREATE TABLE generation_history (...);

-- Create indexes
CREATE INDEX ...;
```

---

## Security Notes

1. **Access Control**: Only admins should access CLI metadata
2. **Rollback Data**: Don't store sensitive data dalam rollback_data
3. **Command History**: Sanitize sensitive flags (--password, --api-key)
4. **FK Constraints**: Use CASCADE delete untuk cleanup

---

## Documentation References

- CLI-ADVANCED-SPEC.md Section 1 - Database Schema
- ERD-DATABASE.md - Database design principles
- Drizzle ORM Docs - Schema definition

---

## Next Task

Setelah task ini selesai:
- Lanjut ke **Task 5.3.2: CLI Metadata Service** (service untuk save/read metadata)

---

## Output Expected

Setelah task selesai:
1. Schema file complete dengan 4 tables + 3 enums
2. Migration file generated
3. Migration applied to database
4. Tables exist dan queryable
5. Type exports working
6. Can insert dan query via Drizzle
7. Type-check passing

**Database Ready**:
```sql
platform_cms=# \dt public.generated_*
                    List of relations
 Schema |        Name         | Type  |  Owner
--------+---------------------+-------+----------
 public | generated_modules   | table | postgres
 public | generation_history  | table | postgres

platform_cms=# \dt public.module_*
                 List of relations
 Schema |      Name       | Type  |  Owner
--------+-----------------+-------+----------
 public | module_fields   | table | postgres

platform_cms=# \dT
              List of data types
 Schema |      Name        | Description
--------+------------------+-------------
 public | field_type       | 
 public | input_type       | 
 public | validation_type  | 
```
