# CLI Generator - Complete Guide
**Platform CMS CLI - Dokumentasi Lengkap untuk AI dan Developer**

**Last Updated**: 2026-07-11  
**Status**: PRODUCTION READY ✅  
**Phases Complete**: 1, 2, 3.1, 4, 5

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Installation & Setup](#installation--setup)
3. [Available Commands](#available-commands)
4. [CRUD Generation Guide](#crud-generation-guide)
5. [Interactive Mode](#interactive-mode)
6. [Field Definitions](#field-definitions)
7. [Database Workflow](#database-workflow)
8. [Module Management](#module-management)
9. [Testing Generated Code](#testing-generated-code)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Generate Module (3 Steps)
```bash
# 1. Generate module
cd cli
node bin/cms.js generate crud product --fields="name:string:255,price:decimal:10:2" --tenant --soft-delete --audit

# 2. Sync database (NO PROMPTS - recommended for development)
cd ../backend
npm run db:push

# 3. Apply permissions
npm run permissions:apply product
```

### Interactive Mode (Guided)
```bash
cd cli
node bin/cms.js generate crud --interactive
# Follow prompts: name → options → fields → summary → confirm
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm/yarn

### CLI Location
```
platform-cms/
├── cli/
│   ├── bin/cms.js          ← Entry point
│   ├── src/
│   │   ├── commands/       ← Command implementations
│   │   ├── generators/     ← Generator logic
│   │   ├── templates/      ← Handlebars templates
│   │   └── utils/          ← Helper functions
│   └── package.json
```

### Build CLI
```bash
cd cli
npm install
npm run build
```

---

## Available Commands

### 1. `generate crud` - Generate Full CRUD Module

**Syntax**:
```bash
node bin/cms.js generate crud <name> [options]
node bin/cms.js g crud <name> [options]          # Alias
```

**Options**:
- `-i, --interactive` - Launch interactive mode
- `--fields <fields>` - Field definitions
- `--tenant` - Enable tenant isolation (RECOMMENDED)
- `--soft-delete` - Enable soft delete (RECOMMENDED)
- `--audit` - Enable audit logging (RECOMMENDED)
- `--searchable <fields>` - Searchable fields (comma-separated)
- `--filterable <fields>` - Filterable fields (comma-separated)
- `--sortable <fields>` - Sortable fields (comma-separated)
- `--dry-run` - Preview without creating files
- `--force` - Overwrite existing files

**What It Generates** (12 files):
```
backend/src/modules/{name}/
├── {name}.module.ts           ← NestJS module
├── {name}.controller.ts       ← REST endpoints
├── {name}.service.ts          ← Business logic
├── {name}.repository.ts       ← Data access (extends BaseRepository)
├── {name}.controller.spec.ts  ← Controller tests
├── {name}.service.spec.ts     ← Service tests
├── {name}.repository.spec.ts  ← Repository tests
├── entities/
│   └── {name}.entity.ts       ← Drizzle schema
└── dto/
    ├── create-{name}.dto.ts   ← Create DTO
    ├── update-{name}.dto.ts   ← Update DTO
    ├── query-{name}.dto.ts    ← Query/filter DTO
    └── {name}-response.dto.ts ← Response DTO

backend/src/database/migrations/permissions/
└── {name}-permissions.sql     ← Permission seeds
```

**Features Included**:
- ✅ Multi-tenancy support (schema switching)
- ✅ Soft delete (deleted_at, deleted_by)
- ✅ Audit trail (created_by, updated_by)
- ✅ Pagination (page, limit)
- ✅ Filtering (custom fields)
- ✅ Sorting (field, order)
- ✅ Search (full-text on searchable fields)
- ✅ CASL permissions (read, create, update, delete)
- ✅ Swagger/OpenAPI docs
- ✅ Unit & integration tests

---

### 2. `list` - List Generated Modules

**Syntax**:
```bash
node bin/cms.js list [options]
node bin/cms.js ls [options]     # Alias
```

**Options**:
- `-d, --detail` - Show detailed information

**Output Example**:
```
Generated Modules
==================================================

Found 2 module(s):

  ✓ products             12 files   ✓ entity
  ✓ categories           12 files   ✓ entity

Legend:
  ✓ = has tests/entity
  ○ = missing tests/entity
```

---

### 3. `delete module` - Delete Generated Module

**Syntax**:
```bash
node bin/cms.js delete module <name> [options]
node bin/cms.js rm module <name> [options]     # Alias
```

**Options**:
- `--force` - Skip confirmation
- `--keep-db` - Keep database (only delete files)

**What It Deletes**:
1. ✅ Module folder (`backend/src/modules/{name}/`)
2. ✅ Import from `app.module.ts`
3. ✅ Entity export from `schema/tenant/index.ts`
4. ✅ Schema file (if exists)
5. ✅ Junction tables (many-to-many)
6. ✅ Migration files
7. ✅ Permission migration
8. ✅ Database table (public + tenant schema)
9. ✅ Metadata (soft delete in `generated_modules`)

**Safety Features**:
- Confirmation prompt (unless `--force`)
- Graceful error handling
- Clear summary of what was deleted

---

## CRUD Generation Guide

### Basic Example
```bash
node bin/cms.js g crud product \
  --fields="name:string:255,price:decimal:10:2,stock:integer" \
  --tenant --soft-delete --audit
```

### With Query Options
```bash
node bin/cms.js g crud product \
  --fields="name:string:255,price:decimal:10:2,description:text" \
  --searchable="name,description" \
  --filterable="price" \
  --sortable="name,price,created_at" \
  --tenant --soft-delete --audit
```

### Complex Example (Relations)
```bash
# Many-to-one relation
node bin/cms.js g crud product \
  --fields="name:string,category_id:integer" \
  --relation="category_id:categories:many-to-one" \
  --tenant --soft-delete
```

---

## Interactive Mode

### Launch Interactive Mode
```bash
node bin/cms.js generate crud --interactive
# or short
node bin/cms.js g crud -i
```

### Interactive Flow
```
📦 Module Information
? Module name (singular): product
? Enable tenant isolation? Yes
? Enable soft delete? Yes
? Enable audit logging? Yes

🔧 Field Definitions
Format: name:type[:length][:precision:scale]
Example: name:string:255, price:decimal:10:2, active:boolean
Press Enter with empty input to finish

? Field 1 (or Enter to finish): name:string:255
? Field 2 (or Enter to finish): price:decimal:10:2
? Field 3 (or Enter to finish): stock:integer
? Field 4 (or Enter to finish): [Enter]

🔍 Query Options
Available fields: name, price, stock
Enter field names separated by commas

? Searchable fields (comma separated): name
? Filterable fields (comma separated): price,stock
? Sortable fields (comma separated): name,price

📋 Generation Summary

Module: product
Tenant Isolation: ✓
Soft Delete: ✓
Audit Logging: ✓
Fields: 3 field(s)
  1. name:string:255
  2. price:decimal:10:2
  3. stock:integer
Searchable: name
Filterable: price,stock
Sortable: name,price

? Generate module with these settings? Yes

✓ Generated 12 file(s) successfully!
```

### Interactive Mode Features
- ✅ Guided step-by-step prompts
- ✅ Field validation (name format, type checking)
- ✅ Summary preview before generation
- ✅ Confirmation prompt
- ✅ Graceful cancellation (Ctrl+C)
- ✅ Default values for quick setup

---

## Field Definitions

### Field Syntax
```
name:type[:length][:precision:scale][:modifiers]
```

### Supported Types
```typescript
'string'      // VARCHAR with length
'text'        // TEXT (no length limit)
'number'      // NUMERIC (alias for decimal)
'integer'     // INTEGER
'float'       // REAL
'decimal'     // DECIMAL with precision:scale
'boolean'     // BOOLEAN
'date'        // DATE
'datetime'    // TIMESTAMP
'timestamp'   // TIMESTAMP
'email'       // VARCHAR(255) with email validation
'url'         // VARCHAR(255) with URL validation
'uuid'        // UUID
'json'        // JSONB
'enum'        // ENUM (requires --enum option)
```

### Field Examples
```bash
# String with length
name:string:255

# Decimal with precision and scale
price:decimal:10:2

# Integer
stock:integer

# Boolean
is_active:boolean

# Email (auto-validated)
email:email

# Text (no length limit)
description:text

# Datetime
published_at:datetime
```

### Auto-Generated Fields
These fields are **ALWAYS** added automatically:
```typescript
id: serial PRIMARY KEY
created_at: timestamp DEFAULT now()
updated_at: timestamp DEFAULT now()
created_by: integer (if --audit)
updated_by: integer (if --audit)
deleted_at: timestamp (if --soft-delete)
deleted_by: integer (if --soft-delete and --audit)
```

---

## Database Workflow

### Development Workflow (RECOMMENDED)
```bash
# 1. Generate module
cd cli
node bin/cms.js g crud product --fields="name:string:255,price:decimal:10:2" --tenant --soft-delete --audit

# 2. Sync schema to DB (NO PROMPTS)
cd ../backend
npm run db:push

# 3. Apply permissions
npm run permissions:apply product

# 4. Test
npm run start:dev
curl http://localhost:3000/api/products
```

**Why `db:push`?**
- ✅ No interactive prompts
- ✅ Direct schema sync
- ✅ Instant changes
- ✅ Perfect for development

### Production Workflow
```bash
# 1. Generate module
cd cli
node bin/cms.js g crud product --fields="name:string:255"

# 2. Generate migration file (WITH REVIEW)
cd ../backend
npm run db:generate
# Review: src/database/migrations/XXXX_*.sql

# 3. Apply migration
npm run db:migrate

# 4. Apply permissions
npm run permissions:apply product
```

**Why `db:generate`?**
- ✅ Creates reviewable SQL files
- ✅ Version controlled
- ✅ Rollback support
- ✅ Safe for production

### Key Differences
| Command | Development | Production |
|---------|-------------|------------|
| `db:push` | ✅ Recommended | ❌ Not safe |
| `db:generate` | ⚠️ Too slow | ✅ Required |
| Creates migration files | ❌ No | ✅ Yes |
| Interactive prompts | ❌ No | ✅ Yes |
| Reviewable | ❌ No | ✅ Yes |

---

## Module Management

### Check Generated Modules
```bash
# Simple list
node bin/cms.js list

# Detailed info
node bin/cms.js list --detail
```

### Delete Module
```bash
# With confirmation
node bin/cms.js delete module product

# Force delete (no confirmation)
node bin/cms.js delete module product --force

# Keep database (only delete files)
node bin/cms.js delete module product --keep-db
```

### Delete Test Modules
```bash
# Delete all test-*, demo-*, example-* modules
node bin/cms.js delete test-modules
```

---

## Testing Generated Code

### Run Tests
```bash
cd backend

# All tests
npm run test

# Specific module
npm run test -- products

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

### Generated Tests Include
- ✅ **Service tests**: CRUD operations, findAllWithQuery, pagination
- ✅ **Controller tests**: GET, POST, PATCH, DELETE endpoints
- ✅ **Repository tests**: tenant context, soft delete
- ✅ **Error handling**: 404, validation errors
- ✅ **Auth guards**: CASL permissions

### Manual Testing
```bash
# Start server
npm run start:dev

# Test endpoints (need auth token)
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Slug: tenant_1"

curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Slug: tenant_1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":99.99}'
```

---

## Troubleshooting

### Problem: Module already exists
```bash
# Delete first
node bin/cms.js delete module old-module

# Then regenerate
node bin/cms.js g crud old-module --fields="..."
```

### Problem: Drizzle prompts "Is X created or renamed?"
**Cause**: Leftover tables in database from deleted modules

**Solution 1: Use `db:push` (Development)**
```bash
npm run db:push  # No prompts
```

**Solution 2: Clean database manually**
```bash
# Check leftover tables
psql -U postgres -d platform_cms -c "\dt public.*"
psql -U postgres -d platform_cms -c "\dt tenant_1.*"

# Drop leftover tables
psql -U postgres -d platform_cms -c "DROP TABLE IF EXISTS public.old_table CASCADE;"
psql -U postgres -d platform_cms -c "DROP TABLE IF EXISTS tenant_1.old_table CASCADE;"
```

### Problem: Import errors after deletion
**Solution**: Check and fix manually
```bash
# Check app.module.ts
# Remove deleted module imports

# Restart TypeScript server in IDE
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Problem: Permission denied when testing
**Solution**: Apply permissions
```bash
npm run permissions:apply <module-name>
```

### Problem: Compilation errors
**Solution**: Rebuild CLI
```bash
cd cli
npm run build
```

---

## Best Practices

### ✅ DO
1. **Always use `--tenant --soft-delete --audit`** for production modules
2. **Use `db:push` for development** (fast, no prompts)
3. **Use `db:generate` for production** (reviewable, safe)
4. **Test after generation** (compile, run tests, manual test)
5. **Delete test modules** before committing
6. **Use interactive mode** for complex modules
7. **Apply permissions** after generation

### ❌ DON'T
1. **Don't skip `--tenant`** (breaks multi-tenancy)
2. **Don't skip `--soft-delete`** (loses data on delete)
3. **Don't use `!` in Windows CMD** (causes errors)
4. **Don't commit test modules** (clean up first)
5. **Don't skip permissions** (API will return 403)
6. **Don't manually fix generated code** (fix template instead)

---

## Common Patterns

### E-commerce Product
```bash
node bin/cms.js g crud product \
  --fields="name:string:255,sku:string:50,price:decimal:10:2,stock:integer,description:text,is_active:boolean" \
  --searchable="name,sku,description" \
  --filterable="price,stock,is_active" \
  --sortable="name,price,created_at" \
  --tenant --soft-delete --audit
```

### Blog Post
```bash
node bin/cms.js g crud post \
  --fields="title:string:255,slug:string:255,content:text,published_at:datetime,is_published:boolean" \
  --searchable="title,content" \
  --filterable="is_published" \
  --sortable="title,published_at,created_at" \
  --tenant --soft-delete --audit
```

### User Profile
```bash
node bin/cms.js g crud profile \
  --fields="user_id:integer,bio:text,avatar_url:url,phone:string:20,address:text" \
  --tenant --soft-delete --audit
```

---

## Advanced Features

### 1. Range Filtering
Auto-generated for date/number fields when `--filterable`:
```bash
# Date range
GET /api/products?order_date_from=2024-01-01&order_date_to=2024-12-31

# Number range
GET /api/products?price_min=100&price_max=500
```

### 2. Full-text Search
When `--searchable` is used:
```bash
GET /api/products?search=laptop
```

### 3. Pagination
Always available:
```bash
GET /api/products?page=1&limit=10
```

### 4. Sorting
When `--sortable` is used:
```bash
GET /api/products?sort=price&order=desc
```

### 5. Combined Query
```bash
GET /api/products?search=laptop&price_min=500&price_max=2000&sort=price&order=asc&page=1&limit=10
```

---

## Template Customization

### Template Location
```
cli/templates/backend/module/
├── module.hbs
├── controller.hbs
├── service.hbs
├── repository.hbs
├── service.spec.hbs
├── controller.spec.hbs
├── repository.spec.hbs
├── entities/
│   └── entity.hbs
└── dto/
    ├── create.hbs
    ├── update.hbs
    ├── query.hbs
    └── response.hbs
```

### After Template Changes
```bash
cd cli
npm run build  # Always rebuild!
```

---

## Phase Status

### ✅ Complete (Production Ready)
- **Phase 1**: Database & Validation
- **Phase 2**: Relations Support
- **Phase 3.1**: Query Features
- **Phase 4**: Test Generation
- **Phase 5**: Interactive Mode

### ⏳ Pending (Optional)
- **Phase 6**: Frontend Types Generation

---

## Quick Reference Card

```bash
# GENERATE
cms g crud <name> --fields="..." --tenant --soft-delete --audit
cms g crud -i  # Interactive

# LIST
cms list
cms ls -d      # Detail

# DELETE
cms delete module <name>
cms rm module <name> --force

# DATABASE
npm run db:push      # Development (no prompts)
npm run db:generate  # Production (with review)
npm run db:migrate   # Apply migration

# PERMISSIONS
npm run permissions:apply <module>

# TEST
npm run test
npm run test -- <module>
npm run start:dev
```

---

## Related Documentation
- `generator-rules.md` - Generator rules & best practices
- `cli-commands.md` - CLI commands reference
- `platform-cms-rules.md` - Platform architecture
- `CLI-ENTERPRISE-UPGRADE-PLAN.md` - Phase details

---

**Remember**: CLI saves ~80% development time. Use it for everything! 🚀
