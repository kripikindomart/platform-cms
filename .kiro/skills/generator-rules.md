# CLI Generator Rules & Best Practices

## 🎯 STAY ON TRACK - FOLLOW THE PLAN

**ATURAN UTAMA UNTUK AI**:

### 0. **SEBELUM NGERJAIN APAPUN - CEK DULU!** ⚠️ SUPER CRITICAL
   ```
   WAJIB CEK DOKUMEN INI DULU:
   
   1. docs/AI-PROGRESS-LOG.md
      → Cek progress sampai mana
      → Cek task apa yang sudah/belum selesai
      → Cek Week berapa sekarang
   
   2. docs/CLI-ENTERPRISE-UPGRADE-PLAN.md (jika terkait CLI)
      → Cek Phase berapa yang sudah selesai
      → Phase berapa yang NEXT
   
   3. docs/TASK-PLAN.md
      → Cek task detail
      → Cek dependencies
   
   4. .github/ISSUE_TEMPLATE/
      → Cek issue yang sudah ada
      → Lihat status (COMPLETE/PENDING)
   
   JANGAN LANGSUNG NGERJAIN!
   BACA DULU, ANALISIS, BARU KERJAKAN!
   ```

### 1. **WORKFLOW SEBELUM NGERJAIN TASK** ⚠️ CRITICAL
   ```
   1. Pahami task dari plan/document
   2. Buat issue TEMPLATE di .github/ISSUE_TEMPLATE/
   3. BUAT ISSUE BENERAN di GitHub pakai gh CLI ✅ WAJIB!
   4. Kerjakan task
   5. Update issue dengan hasil
   6. Close issue pakai gh CLI
   ```

### 2. **CARA BUAT ISSUE YANG BENAR** ⚠️ PENTING BANGET
   
   **WAJIB PAKAI BAHASA INDONESIA!** 🇮🇩
   
   ```bash
   # ❌ SALAH - Cuma buat template doang
   # Buat file di .github/ISSUE_TEMPLATE/task-x.md
   
   # ✅ BENAR - Buat template + issue di GitHub
   
   # Step 1: Buat template file (BAHASA INDONESIA!)
   # File: .github/ISSUE_TEMPLATE/task-5-5-2.md
   # Isi: Judul, deskripsi, acceptance criteria SEMUA INDONESIA
   
   # Step 2: Buat issue BENERAN di GitHub (TITLE INDONESIA!)
   gh issue create \
     --title "[TASK 5.5.2] Implementasi Fitur Query Lanjutan" \
     --body-file .github/ISSUE_TEMPLATE/task-5-5-2.md
   
   # Output: https://github.com/user/repo/issues/27
   # ✅ Issue #27 created! Ter-track di GitHub!
   
   # Step 3: Kerjakan task
   # ... implement features ...
   
   # Step 4: Close issue setelah selesai (COMMENT INDONESIA!)
   gh issue close 27 --comment "✅ Task selesai. Fitur query lanjutan sudah diimplementasi dan ditest. Lihat commit untuk detail."
   ```
   
   **CHECKLIST SEBELUM BUAT ISSUE**:
   - [ ] Title pakai Bahasa Indonesia? 🇮🇩
   - [ ] Body/deskripsi pakai Bahasa Indonesia? 🇮🇩
   - [ ] Template file sudah dibuat?
   - [ ] Sudah run `gh issue create`?
   - [ ] Issue number sudah dicatat? (ex: #27)
   
   **INGAT**: 
   - Issue HARUS ada di GitHub, bukan cuma template!
   - SEMUA text pakai Bahasa Indonesia!
   - Untuk programmer junior dan AI murah bisa paham!

### 3. **JANGAN LONCAT-LONCAT TASK** ⚠️ CRITICAL
   - ❌ **SALAH**: 3.1 selesai → langsung ke 4 (skip 3.2)
   - ✅ **BENAR**: 3.1 selesai → kerjakan 3.2 → baru ke 4
   - **WAJIB BERURUTAN** meskipun task optional/low priority
   - Selesaikan Phase/Task secara **SEQUENTIAL**
   - **TIDAK ADA** yang boleh di-skip kecuali user bilang explicit

### 2. **SELALU CEK TASK PLAN** sebelum mulai coding
   - Baca `.github/ISSUE_TEMPLATE/task-*.md` untuk task yang sedang dikerjakan
   - Baca `docs/CLI-ENTERPRISE-UPGRADE-PLAN.md` untuk phase yang sedang berjalan
   - Jangan buat task baru, follow existing plan
   - Enhancement = ADD/ENHANCE existing module, bukan new task

### 3. **WORKFLOW PENGERJAAN TASK**:
   ```
   Phase 3.1 COMPLETE ✅
          ↓
   Cek: Apakah ada Phase 3.2? 
          ↓
   ADA → Kerjakan Phase 3.2 (meskipun optional)
          ↓
   Phase 3.2 COMPLETE ✅
          ↓
   Baru boleh ke Phase 4
   ```

### 4. **BUAT GITHUB ISSUE DULU** sebelum implement feature baru
   - Issue template di `.github/ISSUE_TEMPLATE/`
   - Track progress di GitHub, bukan cuma local
   - User bisa lihat progress di GitHub

### 5. **FOKUS PADA TASK YANG ADA**:
   - Week 10-11: CLI Builder (COMPLETE ✅)
   - Week 12-13: Multi-Tenancy + Generate Core Modules (IN PROGRESS 🔄)
   - Jangan skip task yang belum selesai

### 6. **JANGAN GENERATE FILE MD BERLEBIHAN**:
   - ❌ Jangan buat SUMMARY.md, PROGRESS_UPDATE.md, REPORT.md
   - ✅ Update `docs/AI-PROGRESS-LOG.md` saja
   - ✅ Update issue template dengan status

### 7. **CONTEXT TRANSFER PROTOCOL**:
   - Saat context reset/summarize → BACA task plan
   - Cross-check dengan `docs/AI-PROGRESS-LOG.md`
   - Lanjutkan task terakhir, jangan mulai dari awal
   - **CEK PHASE/TASK TERAKHIR** yang selesai, lanjutkan yang berikutnya

## 🪟 WINDOWS CMD COMPATIBILITY

**CRITICAL**: Windows CMD memiliki keterbatasan syntax

### ❌ TIDAK BISA di Windows CMD:
```bash
# Tanda seru (!) menyebabkan error
--fields="name:string:255!"  # ❌ ERROR di Windows

# History expansion di bash
echo "Hello!"  # ❌ ERROR di Windows CMD
```

### ✅ WORKAROUND untuk Windows:
```bash
# Option 1: Escape dengan caret (^)
--fields="name:string:255^!"

# Option 2: Gunakan string tanpa quotes (jika tidak ada spasi)
--fields=name:string:255!

# Option 3: Hindari tanda seru di command line
# Generate dulu, baru edit manual untuk required fields
```

### 📝 Update Skill untuk CLI Commands:
- **JANGAN** pakai tanda seru `!` dalam quoted strings di Windows
- **GUNAKAN** syntax alternatif atau edit manual setelah generate
- **DOKUMENTASI** harus jelas tentang Windows limitations

---

## CRITICAL RULE: Fix Generator, Not Just Generated Code

**ATURAN UTAMA**: Jika menemukan kesalahan pada hasil generate, **WAJIB** fix generator template-nya juga, bukan hanya fix manual pada hasil generate.

### Why This Matters
- Platform CMS adalah sistem yang akan generate ratusan module
- Jika generator salah, semua module baru akan punya bug yang sama
- Fix manual = bug berulang setiap kali generate module baru
- Fix generator = semua module baru langsung benar

### Workflow
```
1. Temukan bug pada hasil generate
   ↓
2. Fix manual dulu (untuk testing proof of concept)
   ↓
3. **WAJIB: Fix generator template yang menghasilkan bug tersebut**
   ↓
4. Test dengan regenerate module
   ↓
5. Verify hasil generate sudah benar
```

## Generator Templates Location

### Backend Templates
- **Path**: `cli/templates/backend/module/`
- **Files**:
  - `module.hbs` - Module definition
  - `controller.hbs` - Controller with routes
  - `service.hbs` - Business logic layer
  - `repository.hbs` - Data access layer ⚠️ CRITICAL
  - `dto/create.hbs` - Create DTO
  - `dto/update.hbs` - Update DTO
  - `dto/query.hbs` - Query DTO
  - `dto/response.hbs` - Response DTO
  - `entity.hbs` - Drizzle entity (if needed)

### Frontend Templates
- **Path**: `cli/templates/frontend/`
- (To be documented)

## Current Known Issues & Fixes

### ✅ FIXED: Module Template - CaslModule Import
**Issue**: Generated modules didn't import CaslModule for RBAC
**Status**: FIXED
**Template**: `module.hbs`
**Solution**: Auto-import CaslModule in all generated modules

### ✅ FIXED: Controller Template - CASL Guards
**Issue**: Generated controllers missing CASL permission guards
**Status**: FIXED
**Template**: `controller.hbs`
**Solution**: Auto-add @UseGuards and @CheckPolicies decorators

### 🔴 CRITICAL: Repository Template - BaseRepository Extension
**Issue**: Generated repositories don't extend BaseRepository
**Impact**: Multi-tenancy schema switching tidak berfungsi
**Status**: NEEDS FIX
**Template**: `repository.hbs`

**Current Generated Code** (SALAH):
```typescript
@Injectable()
export class CategoriesRepository {
  constructor(@Inject('DRIZZLE') private readonly db: NodePgDatabase<typeof tenantSchema>) {}

  async create(data: typeof categories.$inferInsert) {
    return this.db.insert(categories).values(data).returning();
  }
}
```

**Should Generate** (BENAR):
```typescript
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';

export type Category = typeof categories.$inferSelect;

@Injectable()
export class CategoriesRepository extends BaseRepository<Category> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, categories, tenantContext);
  }

  // BaseRepository provides:
  // - create(data, userId)
  // - findById(id)
  // - update(id, data, userId)
  // - softDelete(id, userId)
  // - hardDelete(id)
  // - findAll()
  // - findAllPaginated(filters, options)
  // - count()
  
  // Custom queries use withTenantSchema():
  async findBySlug(slug: string): Promise<Category | null> {
    return this.withTenantSchema(async () => {
      const results = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.slug, slug))
        .limit(1);
      return results[0] || null;
    });
  }
}
```

### 🟡 MEDIUM: DTO Template - Strict TypeScript
**Issue**: Required fields need definite assignment assertion `!`
**Status**: NEEDS FIX
**Template**: `dto/create.hbs`, `dto/response.hbs`

**Current Generated Code** (SALAH):
```typescript
@IsNotEmpty()
name: string;  // ❌ Error: has no initializer
```

**Should Generate** (BENAR):
```typescript
@IsNotEmpty()
name!: string;  // ✅ Definite assignment assertion
```

### 🟡 MEDIUM: Service Template - Use CurrentUser Decorator
**Issue**: Hardcoded user ID instead of getting from request
**Status**: NEEDS FIX
**Template**: `service.hbs`

**Current Generated Code** (SALAH):
```typescript
async create(dto: CreateDto) {
  return this.repository.create({
    ...dto,
    created_by: 1, // ❌ Hardcoded
  });
}
```

**Should Generate** (BENAR):
```typescript
async create(dto: CreateDto, userId: number) {
  return this.repository.create(dto, userId);
}
```

**Controller Should Pass User**:
```typescript
@Post()
@CheckPolicies((ability) => ability.can('create', 'categories'))
async create(@Body() dto: CreateDto, @CurrentUser() user: any) {
  return this.service.create(dto, user.id);
}
```

## Template Update Checklist

Ketika fix generator template:

### Pre-Update
- [ ] Identify bug dalam hasil generate
- [ ] Confirm bug bukan karena manual edit sebelumnya
- [ ] Check template file mana yang responsible

### During Update
- [ ] Backup template original (jika first time fix)
- [ ] Update template dengan fix yang benar
- [ ] Test compile template (jika pakai handlebars syntax)
- [ ] Add comments di template untuk context

### Post-Update
- [ ] Delete test module: `node cli/bin/cms.js delete module test-module`
- [ ] Generate test module: `node cli/bin/cms.js generate module test-module`
- [ ] Verify hasil generate sudah benar
- [ ] Test runtime (compile, run, test endpoints)
- [ ] Commit template changes dengan clear message

## Testing Generated Code

### Must Test After Template Update
```bash
# 1. Delete existing test module
node cli/bin/cms.js delete module test-items

# 2. Generate fresh module
node cli/bin/cms.js generate module test-items

# 3. Check generated files
cat backend/src/modules/test-items/test-items.repository.ts
cat backend/src/modules/test-items/test-items.service.ts
cat backend/src/modules/test-items/test-items.controller.ts

# 4. Compile
cd backend
npm run build

# 5. Start server
npm run start:dev

# 6. Test CRUD endpoints
# - POST /api/test-items
# - GET /api/test-items
# - GET /api/test-items/:id
# - PATCH /api/test-items/:id
# - DELETE /api/test-items/:id

# 7. Verify in database
psql -U postgres -d platform_cms -c "SELECT * FROM tenant_1.test_items;"

# 8. Clean up
node cli/bin/cms.js delete module test-items
```

## Common Template Patterns

### Handlebars Helpers Available
```handlebars
{{pascalCase name}}      → Categories
{{camelCase name}}       → categories
{{kebabCase name}}       → categories
{{snakeCase name}}       → categories
{{singular name}}        → category
{{plural name}}          → categories
{{pascalCase singular}}  → Category
```

### Conditional Rendering
```handlebars
{{#if fields}}
  // Only render if fields exist
{{/if}}

{{#unless isPublic}}
  // Render if NOT public
{{/unless}}

{{#each fields}}
  {{this.name}}: {{this.type}}
{{/each}}
```

### Import Management
```handlebars
// Always use relative imports
import { BaseRepository } from '../../common/database/base.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';
import * as tenantSchema from '../../database/schema/tenant';
```

## Handlebars Template Syntax

### Comments
```handlebars
{{!-- This is a comment --}}
```

### Variables
```handlebars
{{variableName}}
```

### Conditionals
```handlebars
{{#if condition}}
  true block
{{else}}
  false block
{{/if}}
```

### Loops
```handlebars
{{#each items}}
  {{this.property}}
{{/each}}
```

## Priority Fixes Needed

### ✅ P0 - CRITICAL (DONE)
1. **repository.hbs** - ✅ FIXED - Extends BaseRepository
   - Impact: Multi-tenancy working
   - Status: Template updated, tested, verified

### ✅ P1 - HIGH (DONE)
2. **service.hbs** - ✅ FIXED - Uses userId parameter
   - Impact: Proper audit trail
   - Status: Template updated, tested, verified

3. **controller.hbs** - ✅ FIXED - Pass @CurrentUser()
   - Impact: Real user tracking
   - Status: Template updated, tested, verified

4. **dto/*.hbs** - ✅ ALREADY CORRECT
   - Impact: TypeScript compilation
   - Status: Verified, no changes needed

### 🟡 P2 - MEDIUM (TODO)
5. **entity.hbs** - ⚠️ NEEDS FIX - Auto soft delete fields
   - Impact: Manual fix required after generation
   - Enhancement: Should auto-generate deleted_at, deleted_by

## Related Documentation
- CLI Commands: `.kiro/skills/cli-commands.md`
- Architecture: `docs/TECHNICAL-ARCHITECTURE.md`
- Generator Spec: `docs/CLI-BUILDER-SPEC.md`

## Remember
> "Fix the generator, not just the generated code. Think of future developers who will use this tool."

**Every generator fix is an investment** that pays off hundreds of times as more modules are created.

## ⚠️ IMPORTANT: File Management Rules

### Documentation Files
**ALWAYS put documentation/reports in `docs/` folder, NEVER in root!**

✅ **CORRECT**:
```
docs/
├── MULTI_TENANCY_COMPLETE.md
├── GENERATOR_FIX_SUMMARY.md
└── PROGRESS_UPDATE.md
```

❌ **WRONG**:
```
/MULTI_TENANCY_COMPLETE.md    # ❌ Don't clutter root!
/GENERATOR_FIX_SUMMARY.md     # ❌ Belongs in docs/
/PROGRESS_UPDATE.md            # ❌ Move to docs/
```

**Root Directory Should Only Have**:
- README.md
- Package files (package.json, etc.)
- Config files (.env, .gitignore, etc.)
- Folders (docs/, backend/, frontend/, cli/)

**Put documentation files in**:
- `docs/` - Technical docs, reports, summaries
- `.kiro/skills/` - Skill documents for AI
- `.github/ISSUE_TEMPLATE/` - Issue templates
