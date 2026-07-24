# MODULE GENERATOR - Status & Panduan Lanjutan

**Dibuat**: 23 Juli 2026  
**Untuk**: AI Agent lain (Claude Code Web) yang akan melanjutkan development  
**Bahasa**: Indonesia (sesuai project rules)

---

## 📋 RINGKASAN SINGKAT

Platform CMS memiliki fitur **Visual Module Builder** yang memungkinkan user membuat CRUD module melalui UI tanpa coding manual.

**Flow**: Schema Builder → Form Builder → Assign to Tenant → Generate Code (Backend + Frontend + Database)

**Status Saat Ini**: 
- ✅ Backend generation LENGKAP (12+ files)
- ✅ Hard delete module BERFUNGSI (hapus semua files + database records)
- ✅ Menu & Permissions generation BERFUNGSI
- ✅ UI Config (Modal vs Page) tersimpan di database
- ✅ Frontend generation SELESAI (list/create/edit, modal & page, sesuai uiConfig) - lihat "UPDATE 23 Juli 2026" di bawah
- ⚠️ Validation rules generation MASIH BELUM (tersimpan di DB, belum di-generate ke code)

---

## 🎯 APA YANG SUDAH SELESAI

### 1. Hard Delete Module - DELETE SEMUA FILE ✅
**Status**: COMPLETE  
**File**: `backend/src/modules/module-generator/services/code-generation.service.ts`

**Fungsi**: `rollbackGeneration(moduleName: string)`

**Yang Dihapus**:
- Backend folder: `src/modules/{moduleName}`
- Frontend folder: `frontend/app/(private)/org/[tenant]/portal/{moduleName}`
- Schema file: `src/database/schema/tenant/{tableName}.schema.ts`
- Migration files: `migrations/*-create-{tableName}.sql`
- Menu items: dari semua tenant schemas (by `module_name`)
- Permissions: dari semua tenant schemas (by `action` prefix)

**Testing**: Sudah ditest dengan module "blog" - semua file terhapus sempurna.

---

### 2. Modal Dialog Option di Form Builder ✅
**Status**: COMPLETE  
**File**: `backend/src/database/schema/public/visual-modules.schema.ts`

**Kolom**: `ui_config` (JSONB)

**Struktur**:
```json
{
  "createFormType": "modal" | "page",
  "editFormType": "modal" | "page"
}
```

**Migration**: `backend/migrations/fix-visual-modules-ui-config.sql`

**Frontend**: Form builder page sudah ada UI untuk pilih Modal vs Page
- File: `frontend/app/(private)/org/[tenant]/portal/module-builder/[id]/form-builder/page.tsx`
- Save functionality sudah ada di `frontend/hooks/use-module-generator.ts`

**Testing**: Kolom sudah ada di database, save/load sudah berfungsi.

---

### 3. Menu & Permissions Generation ✅
**Status**: COMPLETE  
**File**: `backend/src/modules/module-generator/services/code-generation.service.ts`

**Method 1**: `createPermissions(moduleName, tenantSchema)` 
- Membuat 4 permissions: `view_`, `create_`, `update_`, `delete_`
- Insert ke `{tenantSchema}.permissions` table
- Gunakan `ON CONFLICT DO NOTHING` untuk idempotency
- Graceful degradation: jika table tidak ada, skip dengan warning

**Method 2**: `createMenuItem(moduleName, displayName, tenantSchema)`
- Insert/update ke `{tenantSchema}.menus` (Main Menu)
- Insert menu item ke `{tenantSchema}.menu_items` dengan `module_name`
- Set `required_permission` = `view_{moduleName}`
- Graceful degradation: jika table tidak ada, skip dengan warning

**Method 3**: `deleteMenuItems(moduleName)` - Cleanup saat delete module

**Method 4**: `deletePermissions(moduleName)` - Cleanup saat delete module

**Query Pattern**:
```sql
-- Menu Items
DELETE FROM {schema}.menu_items WHERE module_name = 'blog';

-- Permissions
DELETE FROM {schema}.permissions 
WHERE action IN ('view_blog', 'create_blog', 'update_blog', 'delete_blog');
```

**Testing**: Sudah ditest - menu dan permissions terbuat otomatis saat assign module ke tenant.

---

### 4. Fix Date Field Handling di Repository Template ✅
**Status**: COMPLETE  
**File**: `backend/src/modules/module-generator/templates/repository.ts.hbs`

**Issue**: Generated repository passing `Date` objects ke Drizzle, tapi date/datetime columns expect ISO strings.

**Solution**: Template sekarang generate code simple tanpa Date conversion. Date handling dilakukan di DTO/Service layer sebelum masuk repository.

**Before** (WRONG):
```typescript
date: dto.date instanceof Date ? dto.date.toISOString() : dto.date
```

**After** (CORRECT):
```typescript
// Simple spread, date sudah dalam format string dari DTO
...dto
```

**Note**: Blog module sudah dihapus saat testing, jadi fix ini ada di template untuk future generations.

---

## UPDATE 23 Juli 2026 - Frontend Generation SELESAI

**Dikerjakan oleh**: AI Agent (Claude Code Web), lanjutan dari handoff di bawah ini.

`generateFrontendPages()` di `code-generation.service.ts` sudah diimplementasikan penuh (sebelumnya `return []`). Setiap assign module ke tenant sekarang generate 9 file frontend tambahan:

- `lib/api/services/{moduleName}.service.ts` - API client (list/getById/create/update/delete)
- `hooks/use-{moduleName}.ts` - data hook (loading/error/pagination state)
- `app/(private)/org/[tenant]/portal/{moduleName}/page.tsx` - list page
- `.../components/{moduleName}-table.tsx` - table + pagination + dropdown actions
- `.../components/delete-dialog.tsx` - konfirmasi hapus
- Create form: `.../components/create-{moduleName}-modal.tsx` ATAU `.../create/page.tsx`, tergantung `uiConfig.createFormType`
- Edit form: `.../components/edit-{moduleName}-modal.tsx` ATAU `.../[id]/edit/page.tsx`, tergantung `uiConfig.editFormType`

Template Handlebars-nya ada di `backend/src/modules/module-generator/templates/frontend/`. Styling mengikuti pola premium yang sudah dipakai di halaman lain (rounded-2xl, gradient indigo->purple, shadcn/ui + react-hook-form + zod), teks UI Bahasa Indonesia.

**Bug tambahan yang ikut diperbaiki** (ditemukan saat implementasi, bukan scope awal tapi memblokir hasil generate yang benar):
- `buildFieldContext()` tidak pernah meneruskan `label`, `isVisibleInList`, `enumOptions` ke template context walau sudah ada di DTO - kolom tabel dan form jadi tanpa label.
- `getTypeMapping()` tidak punya entry untuk type `'number'` dan `'enum'` (padahal itu persis nilai yang divalidasi `ModuleFieldDto.type`) - field number diam-diam ke-generate sebagai VARCHAR, bukan NUMERIC.
- `rollbackGeneration()` (hard delete) belum menghapus file service/hook frontend yang lokasinya di luar folder `portal/{moduleName}` - sekarang sudah ditambahkan.

**Belum tuntas / follow-up**: tabel `visual_module_fields` belum punya kolom `enum_options`, jadi opsi enum cuma bertahan di jalur create+assign satu request; assign-by-id dari draft module yang sudah tersimpan belum bawa `enumOptions` (juga `isRequired`/`isUnique`/`validations` - ini sudah jadi TODO lama di `module-generator.service.ts`).

Cara testing manual ada di bagian "CARA TESTING" di bawah - jalankan Test 1 (Generate Module Baru) lalu cek folder frontend ikut ter-generate.

---

## 🔴 APA YANG BELUM SELESAI (sisa dari sebelum update di atas)

### 1. Validation Rules Generation ❌
**Priority**: MEDIUM  
**Status**: Database schema sudah ada, generation belum

**Tables**:
- `public.validation_types` - Jenis validasi (min, max, email, dll)
- `public.field_validations` - Mapping field → validations

**Flow**:
1. User pilih validations di Form Builder
2. Save ke `field_validations` table
3. Generate DTOs dengan validation decorators
4. Generate frontend form validation (zod/yup)

**Current**: Validations tersimpan di database tapi tidak di-generate ke code.

---

### 3. Migration Auto-Run ❌
**Priority**: LOW  
**Status**: Migration file di-generate tapi tidak auto-run

**Current Behavior**:
- Generate migration file: `migrations/{timestamp}-create-{table}.sql`
- User harus manual run: `npm run db:migrate`

**Enhancement Needed**:
- Auto-run migration setelah generate (optional flag)
- Rollback migration saat delete module
- Migration history tracking

---

## 📂 FILE-FILE PENTING

### Core Module Generator
```
backend/src/modules/module-generator/
├── services/
│   ├── code-generation.service.ts    ← MAIN: Generate semua files
│   ├── template.service.ts           ← Handlebars template rendering
│   └── filesystem.service.ts         ← File operations
├── module-generator.service.ts       ← Business logic
├── module-metadata.repository.ts     ← Database operations
├── module-generator.controller.ts    ← REST API endpoints
└── dto/
    └── generate-module.dto.ts        ← Input DTO
```

### Templates (Handlebars)
```
backend/src/modules/module-generator/templates/
├── module.ts.hbs              ← NestJS module
├── controller.ts.hbs          ← Controller dengan CRUD endpoints
├── service.ts.hbs             ← Business logic
├── repository.ts.hbs          ← Data access (Drizzle)
├── entity.ts.hbs              ← Database schema (Drizzle)
├── migration.sql.hbs          ← SQL migration
├── dto-create.ts.hbs          ← Create DTO
├── dto-update.ts.hbs          ← Update DTO
├── dto-query.ts.hbs           ← Query DTO
└── dto-response.ts.hbs        ← Response DTO
```

### Frontend Form Builder
```
frontend/app/(private)/org/[tenant]/portal/module-builder/
├── page.tsx                           ← List modules
├── [id]/
│   ├── schema-builder/page.tsx       ← Step 1: Define table & fields
│   └── form-builder/page.tsx         ← Step 2: Configure UI (modal/page)
```

### Database Schema
```
backend/src/database/schema/
├── public/
│   ├── visual-modules.schema.ts      ← Module metadata (global)
│   └── visual-module-fields.schema.ts ← Field definitions
└── tenant/
    ├── menu-items.schema.ts          ← Tenant menus
    └── permissions.schema.ts         ← Tenant permissions
```

### Documentation
```
backend/docs/
├── MULTI_TENANT_ARCHITECTURE.md      ← Multi-tenancy explained
├── SCHEMA_ARCHITECTURE.md            ← Database structure
└── FINAL_SCHEMA_ARCHITECTURE.md      ← Updated architecture
```

### Skills (AI Context)
```
.kiro/skills/
├── platform-cms-rules.md             ← Development rules (WAJIB BACA!)
├── generator-rules.md                ← Generator specific rules
├── cli-commands.md                   ← Available CLI commands
└── AI-CONTEXT-FILES.md               ← What files to read first
```

---

## 🏗️ ARSITEKTUR SINGKAT

### Database Structure
```
PUBLIC SCHEMA (shared across tenants)
├── users                 ← ALL users
├── tenants               ← Tenant registry
├── visual_modules        ← Module metadata (global)
└── visual_module_fields  ← Field definitions

TENANT_xxx SCHEMA (isolated per tenant)
├── roles                 ← Tenant roles
├── permissions           ← Tenant permissions
├── user_roles            ← User → Role mapping (FK to public.users)
├── menu_items            ← Tenant menus
└── {generated_tables}    ← Tables dari module generator
```

### Multi-Tenancy Flow
1. User login dengan `X-Tenant-Slug` header
2. JWT contains `tenantId`
3. Middleware sets `search_path` to `tenant_{id}`
4. All queries automatically scoped to tenant schema

### Module Generation Flow
```
Schema Builder (Step 1)
  ↓ Save to visual_modules (public schema)
Form Builder (Step 2)
  ↓ Save ui_config
Assign to Tenant (Step 3)
  ↓ 
  ├─ Generate 12+ backend files
  ├─ Generate migration SQL
  ├─ Create 4 permissions
  ├─ Create 1 menu item
  └─ (TODO) Generate frontend pages
```

---

## 🧪 CARA TESTING

### Test 1: Generate Module Baru
```bash
cd backend
npm run start:dev

# Via API (Postman/cURL):
# 1. POST /api/module-generator (Schema Builder)
# 2. PATCH /api/module-generator/:id (Form Builder - save ui_config)
# 3. POST /api/module-generator/:id/assign (Assign to current tenant)

# Check generated files:
ls src/modules/{module-name}/
ls src/database/schema/tenant/{table-name}.schema.ts
ls migrations/*-create-{table-name}.sql
```

### Test 2: Delete Module
```bash
# Via API:
# DELETE /api/module-generator/:id

# Verify deletion:
ls src/modules/{module-name}/  # Should not exist
ls frontend/app/.../portal/{module-name}/  # Should not exist

# Check database:
psql -U postgres -d platform_cms
SELECT * FROM tenant_10.menu_items WHERE module_name = 'deleted_module';
-- Should return 0 rows
```

### Test 3: Menu & Permissions
```bash
# After assign module to tenant, check:
psql -U postgres -d platform_cms

-- Check permissions
SELECT * FROM tenant_10.permissions 
WHERE action LIKE 'view_blog%' 
   OR action LIKE 'create_blog%';

-- Check menu items
SELECT * FROM tenant_10.menu_items 
WHERE module_name = 'blog';
```

---

## ⚠️ IMPORTANT NOTES

### 1. Gunakan Linux Commands (Git Bash)
Meskipun Windows, system menggunakan Git Bash:
```bash
# ✅ BENAR
ls -la
cat file.txt
grep "pattern" file.txt

# ❌ SALAH
dir
type file.txt
findstr "pattern" file.txt
```

### 2. NO EMOJI ANYWHERE
```markdown
# ❌ SALAH
✅ Task complete
🚀 Ready to deploy

# ✅ BENAR
[OK] Task complete
[READY] Ready to deploy
```

### 3. Bahasa Indonesia untuk User-Facing Text
- GitHub issues: Bahasa Indonesia
- Error messages: Bahasa Indonesia
- API responses: Bahasa Indonesia
- Code comments: Boleh English untuk technical details

### 4. Date/DateTime Fields
Drizzle expects ISO strings, NOT Date objects:
```typescript
// ❌ SALAH
.values({ date: new Date() })

// ✅ BENAR (at DTO/Service layer)
.values({ date: dto.date }) // dto.date already string from frontend
```

### 5. Graceful Degradation
Methods `createPermissions` dan `createMenuItem` check table existence first:
```typescript
// Check if table exists
const tableCheck = await db.execute(sql.raw(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = '${schema}' AND table_name = 'permissions'
  )
`));

if (!tableExists) {
  logger.warn('Table not found, skipping...');
  return 0; // Don't throw error
}
```

---

## 🚀 LANGKAH SELANJUTNYA (UNTUK AI AGENT BERIKUTNYA)

~~Priority 1: Frontend Generation~~ - SELESAI, lihat "UPDATE 23 Juli 2026" di atas.

Sisa prioritas yang belum dikerjakan:

### Priority 1: Validation Rules Generation
Simpan `enumOptions` ke `visual_module_fields` (perlu migration + repository update), lalu generate validation decorators (DTO) dan zod validation (frontend) dari `field_validations` table.

### Priority 2: Migration Auto-Run
Auto-run migration setelah generate (optional flag), rollback migration saat delete module.

---

*Dokumentasi ini akan dilanjutkan dalam file terpisah untuk menghindari file terlalu panjang.*

**File Berikutnya**: 
- `MODULE-GENERATOR-IMPLEMENTATION-GUIDE.md` - Panduan teknis implementasi
- `MODULE-GENERATOR-TROUBLESHOOTING.md` - Common issues & solutions
