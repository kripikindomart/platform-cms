---
name: Task 5.3.1 - CLI Metadata Database Schema
about: Implement database schema to track generated modules, fields, and validations
title: '[TASK 5.3.1] CLI Metadata Database Schema'
labels: ['task', 'backend', 'database', 'cli', 'week-10-11']
assignees: ''
---

## Task 5.3.1: CLI Metadata Database Schema

**Sprint**: Week 10-11 - CLI Builder Tool Development  
**Priority**: P0 - CRITICAL  
**Estimated Time**: 3 hours  
**Dependencies**: Task 5.3 (CRUD Generator)

---

## 📋 Objective

Implement database schema untuk track semua modules, fields, dan validations yang di-generate oleh CLI. Schema ini adalah foundation untuk advanced CLI features seperti delete/undo, history tracking, dan frontend auto-form generation.

---

## 🎯 Goals

1. Create 4 tables di public schema untuk CLI metadata
2. Create 4 enums untuk type definitions
3. Generate migration files
4. Apply migrations ke database
5. Verify schema dengan type-check

---

## 📦 Deliverables

### 1. Database Tables (4 tables)

#### Table: `generated_modules`
Track semua modules yang di-generate oleh CLI.

**Columns**:
- `id` - Primary key
- `name` - Module name (unique)
- `display_name` - Human-readable name
- `description` - Module description
- `has_tenant_isolation` - Tenant isolation flag
- `has_soft_delete` - Soft delete flag
- `has_audit` - Audit logging flag
- `generated_files` - JSON array of file paths
- `cli_command` - Original CLI command
- `generator_version` - CLI version
- `is_active` - Active status
- `created_at`, `created_by` - Audit fields
- `deleted_at` - Soft delete

#### Table: `module_fields`
Track all fields in each module dengan complete metadata.

**Columns**:
- `id` - Primary key
- `module_id` - FK to generated_modules
- `name` - Field name
- `display_name` - Human-readable name
- `description` - Field description
- `field_type` - Database field type (enum)
- `is_required`, `is_unique`, `is_nullable` - Constraints
- `default_value` - Default value
- `length`, `precision`, `scale` - Numeric constraints
- `enum_values` - JSON array for enum fields
- `relation_module`, `relation_type` - Relation info
- `input_type` - Frontend input type (enum)
- `placeholder`, `help_text` - UI helpers
- `is_searchable`, `is_sortable`, `is_filterable` - Query flags
- `show_in_list`, `show_in_detail`, `show_in_form` - Display flags
- `order` - Display order
- `created_at`, `updated_at` - Timestamps

#### Table: `field_validations`
Track validation rules for each field.

**Columns**:
- `id` - Primary key
- `field_id` - FK to module_fields
- `validation_type` - Validation type (enum)
- `validation_params` - JSON params
- `error_message` - Custom error message
- `order` - Validation order
- `created_at` - Timestamp

#### Table: `generation_history`
Audit trail for all CLI operations.

**Columns**:
- `id` - Primary key
- `operation` - Operation type (generate, update, delete)
- `module_id` - FK to generated_modules
- `command` - Full CLI command
- `options` - JSON command options
- `success` - Success flag
- `error_message` - Error message if failed
- `files_created`, `files_modified`, `files_deleted` - File tracking
- `can_rollback` - Rollback flag
- `rollback_data` - JSON backup data
- `created_at`, `created_by` - Audit fields

### 2. Enums (4 enums)

- `field_type` - Database field types (16 values)
- `input_type` - Frontend input types (22 values)
- `validation_type` - Validation types (14 values)
- `relation_type` - Relation types (4 values)

### 3. Files Created/Modified

- [x] `backend/src/database/schema/public/cli-metadata.schema.ts` - Schema definitions
- [x] `backend/src/database/schema/public/index.ts` - Export CLI metadata
- [x] `backend/src/database/migrations/0002_sleepy_the_fury.sql` - Migration file

---

## ✅ Acceptance Criteria

- [x] CLI metadata schema created (4 tables)
- [x] Enums defined (4 enums)
- [x] Migration files generated
- [x] Schema exported from public schema
- [x] Can query metadata via Drizzle
- [x] Type-check passes
- [x] Migration applied to database
- [x] Foreign keys working (cascade deletes)
- [x] JSON fields properly typed

---

## 🧪 Testing

### Type Check
```bash
cd backend
npm run type-check
```
**Expected**: ✓ No errors

### Database Migration
```bash
cd backend
npm run db:push
```
**Expected**: ✓ Tables created in public schema

### Schema Verification
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%generated%' OR table_name LIKE '%module_fields%';

-- Check enums exist
SELECT typname FROM pg_type 
WHERE typname IN ('field_type', 'input_type', 'validation_type', 'relation_type');
```

---

## 📚 Documentation References

- **CLI-ADVANCED-SPEC.md** Section 1 - Database Schema untuk CLI Metadata
- **TECHNICAL-ARCHITECTURE.md** Section 2.1 - Database tech stack
- **ERD-DATABASE.md** - Database architecture patterns
- **AI-RULES.md** Section 7.2 - Drizzle ORM patterns

---

## 🔗 Related Tasks

- **Previous**: Task 5.3 - CRUD Generator (COMPLETE)
- **Next**: Task 5.3.2 - CLI Metadata Service
- **Depends on**: Week 3-4 database setup

---

## 📊 Schema Features

### 1. Complete Field Metadata
- Database field types (string, number, boolean, date, etc.)
- Frontend input types (text, textarea, select, etc.)
- Validation rules (required, email, min/max, etc.)
- Display settings (searchable, sortable, filterable)
- Relation support (one-to-one, one-to-many, etc.)

### 2. Generation Tracking
- Track all CLI commands
- Track generated files
- Track operation success/failure
- Store rollback data for undo

### 3. Frontend Integration Ready
- Input type mapping (DB type → HTML input type)
- Validation rules (shareable dengan frontend)
- Display settings (show in list/detail/form)
- Placeholder dan help text

### 4. Delete & Undo Support
- Soft delete modules (deleted_at)
- Rollback data stored in JSON
- Can restore deleted modules
- Audit trail preserved

---

## 🎁 Benefits

### For Developers
- ✅ Track what CLI has generated
- ✅ View module history
- ✅ Undo mistakes easily
- ✅ Consistent metadata storage

### For Frontend
- ✅ Auto-generate forms from metadata
- ✅ No hardcoded validation rules
- ✅ Always in sync with backend
- ✅ Type-safe from DB to UI

### For Project
- ✅ Complete audit trail
- ✅ Trackable changes
- ✅ Easy onboarding (see generated modules)
- ✅ Documentation via metadata

---

## 🚀 Example Usage (Future)

```typescript
// Query generated modules
const modules = await db.select().from(generatedModules).where(eq(generatedModules.is_active, true));

// Get module with fields
const module = await db.query.generatedModules.findFirst({
  where: eq(generatedModules.name, 'products'),
  with: {
    fields: {
      with: {
        validations: true,
      },
    },
  },
});

// Get generation history
const history = await db.select().from(generationHistory).orderBy(desc(generationHistory.created_at)).limit(10);
```

---

## ⏱️ Time Tracking

**Estimated**: 3 hours  
**Actual**: ___ hours  

**Breakdown**:
- Schema design: 1 hour
- Migration creation: 0.5 hours
- Testing & verification: 0.5 hours
- Documentation: 1 hour

---

## ✅ Definition of Done

- [x] 4 tables created in public schema
- [x] 4 enums defined
- [x] Migration generated and applied
- [x] Type-check passes
- [x] Schema exported correctly
- [x] Foreign keys working
- [x] JSON fields properly typed
- [x] Documentation updated
- [x] Task committed to Git
- [x] Issue closed

---

**Created**: 2024-01-08  
**Sprint**: Week 10-11  
**Phase**: CLI Builder Tool Development
