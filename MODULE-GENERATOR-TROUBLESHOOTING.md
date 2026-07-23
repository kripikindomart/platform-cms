# MODULE GENERATOR - Troubleshooting & Common Issues

**Untuk**: AI Agent yang mengalami masalah saat development  
**Level**: Problem Solving Guide  
**Bahasa**: Indonesia + English untuk code/errors

---

## 🔍 DIAGNOSTIC TOOLS

### Check Generated Files
```bash
# Backend files
ls -la backend/src/modules/{module-name}/
ls -la backend/src/database/schema/tenant/{table-name}.schema.ts
ls -la backend/migrations/*{table-name}*

# Frontend files
ls -la frontend/app/\(private\)/org/\[tenant\]/portal/{module-name}/
```

### Check Database
```sql
-- Check module metadata
SELECT * FROM public.visual_modules WHERE module_name = 'your_module';

-- Check module fields
SELECT * FROM public.visual_module_fields WHERE module_id = X;

-- Check permissions (tenant schema)
SELECT * FROM tenant_10.permissions 
WHERE action LIKE '%your_module%';

-- Check menu items (tenant schema)
SELECT * FROM tenant_10.menu_items 
WHERE module_name = 'your_module';
```

### Check Logs
```bash
# Backend logs (saat generate)
cd backend
npm run start:dev

# Watch for:
# - "Generating module: {name}"
# - "Generated X files successfully"
# - "Creating permissions..."
# - "Creating menu item..."
```

---

## ❌ COMMON ERRORS & SOLUTIONS

### Error 1: "Column ui_config does not exist"

**Error Message**:
```
DrizzleQueryError: column "ui_config" does not exist
```

**Cause**: Migration belum dijalankan untuk menambah kolom `ui_config`

**Solution**:
```bash
cd backend

# Check if migration file exists
ls migrations/fix-visual-modules-ui-config.sql

# If not exists, create it:
cat > migrations/fix-visual-modules-ui-config.sql << 'EOF'
-- Add ui_config column to visual_modules
ALTER TABLE public.visual_modules 
ADD COLUMN IF NOT EXISTS ui_config JSONB DEFAULT '{"createFormType":"page","editFormType":"page"}';

COMMENT ON COLUMN public.visual_modules.ui_config IS 'UI configuration for form display (modal vs page)';
EOF

# Run migration
npm run db:migrate
# OR manually:
psql -U postgres -d platform_cms -f migrations/fix-visual-modules-ui-config.sql

# Verify
psql -U postgres -d platform_cms -c "\d public.visual_modules"
```

---

### Error 2: "Relation tenant_X.permissions does not exist"

**Error Message**:
```
error: relation "tenant_10.permissions" does not exist
```

**Cause**: Tenant schema belum punya tabel permissions

**Solution 1** - Graceful (sudah diimplementasi):
```typescript
// Code sudah handle ini dengan check table existence:
const tableCheck = await this.db.execute(sql.raw(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = '${tenantSchema}' 
    AND table_name = 'permissions'
  )
`));

if (!tableExists) {
  this.logger.warn('Permissions table not found, skipping...');
  return 0; // Don't throw error
}
```

**Solution 2** - Create table:
```sql
-- Create permissions table in tenant schema
CREATE TABLE tenant_10.permissions (
  id BIGSERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL UNIQUE,
  resource VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Prevention**: Pastikan tenant schema dibuat dengan lengkap saat onboarding tenant baru.

---

### Error 3: "Date type mismatch" in Repository

**Error Message**:
```typescript
Type 'Date' is not assignable to type 'string | SQL<unknown> | ...'
```

**Cause**: Drizzle expects ISO string untuk date/datetime columns, bukan Date objects

**Wrong Code**:
```typescript
// ❌ SALAH
await this.db.insert(table).values({
  published_date: new Date(), // Date object
});
```

**Correct Code**:
```typescript
// ✅ BENAR - Convert at DTO/Service layer
await this.db.insert(table).values({
  published_date: dto.publishedDate, // Already string from frontend
});

// OR if need to convert:
published_date: dto.publishedDate instanceof Date 
  ? dto.publishedDate.toISOString() 
  : dto.publishedDate,
```

**Fix in Template**: Update `repository.ts.hbs` to not auto-convert dates. Let DTO handle it.

---

### Error 4: "Module folder already exists"

**Error Message**:
```
EEXIST: file already exists, mkdir 'src/modules/products'
```

**Cause**: Previous generation failed halfway, atau module belum dihapus proper

**Solution**:
```bash
# Option 1: Hard delete via API
DELETE /api/module-generator/{id}

# Option 2: Manual cleanup
rm -rf backend/src/modules/products
rm -rf frontend/app/\(private\)/org/\[tenant\]/portal/products
rm backend/src/database/schema/tenant/products.schema.ts
rm backend/migrations/*-create-products.sql

# Delete from database
psql -U postgres -d platform_cms << EOF
DELETE FROM public.visual_module_fields WHERE module_id = X;
DELETE FROM public.visual_modules WHERE id = X;
DELETE FROM tenant_10.menu_items WHERE module_name = 'products';
DELETE FROM tenant_10.permissions WHERE action LIKE '%products%';
EOF
```

**Prevention**: Implement atomic transaction atau improve rollback mechanism.

---

### Error 5: "Template not found"

**Error Message**:
```
Error: Template 'frontend/list-page.tsx.hbs' not found
```

**Cause**: Template file belum dibuat atau path salah

**Solution**:
```bash
# Check template location
cd backend/src/modules/module-generator
ls -la templates/
ls -la templates/frontend/

# Create missing template folder
mkdir -p templates/frontend

# Verify path in code
# File: services/template.service.ts
const templatePath = path.join(__dirname, '..', 'templates', templateName);
```

**Debug**:
```typescript
// Add logging in TemplateService
this.logger.log(`Looking for template at: ${templatePath}`);
this.logger.log(`Template exists: ${fs.existsSync(templatePath)}`);
```

---

### Error 6: "Handlebars helper not defined"

**Error Message**:
```
Error: Missing helper: "eq"
```

**Cause**: Handlebars helper belum di-register

**Solution**:
```typescript
// File: services/template.service.ts
import Handlebars from 'handlebars';

constructor() {
  // Register ALL helpers at initialization
  this.registerHelpers();
}

private registerHelpers() {
  // Equality
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  // OR logic
  Handlebars.registerHelper('or', function(...args) {
    args.pop(); // Remove options object
    return args.some(Boolean);
  });

  // NOT logic
  Handlebars.registerHelper('not', function(value) {
    return !value;
  });

  // Case conversions
  Handlebars.registerHelper('pascalCase', (str: string) => { /* ... */ });
  Handlebars.registerHelper('camelCase', (str: string) => { /* ... */ });
  Handlebars.registerHelper('kebabCase', (str: string) => { /* ... */ });
  Handlebars.registerHelper('snakeCase', (str: string) => { /* ... */ });
}
```

---

### Error 7: "Cannot read property 'uiConfig' of undefined"

**Error Message**:
```
TypeError: Cannot read property 'createFormType' of undefined
```

**Cause**: `uiConfig` not passed to generation context, atau null

**Solution**:
```typescript
// File: module-generator.service.ts
const generationResult = await this.codeGenerationService.generateModule(
  generateDto, 
  tenantSchema,
  module?.uiConfig || { createFormType: 'page', editFormType: 'page' }, // Default fallback
);

// In code-generation.service.ts
private buildContext(dto, tenantSchema, uiConfig) {
  return {
    // ...
    uiConfig: uiConfig || {
      createFormType: 'page',
      editFormType: 'page',
    },
  };
}
```

**In Template** - Safe access:
```handlebars
{{#if uiConfig}}
  {{#if (eq uiConfig.createFormType "modal")}}
    {/* Modal code */}
  {{else}}
    {/* Page code */}
  {{/if}}
{{else}}
  {/* Default to page */}
{{/if}}
```

---

### Error 8: "TypeScript compilation failed" after generation

**Error Message**:
```
error TS2304: Cannot find name 'DataTable'
error TS2307: Cannot find module '@/components/ui/data-table'
```

**Cause**: Generated code import components yang belum ada di frontend

**Solution 1** - Check component availability:
```bash
cd frontend
ls -la components/ui/data-table.tsx  # Should exist
ls -la components/ui/form.tsx
ls -la components/ui/input.tsx
```

**Solution 2** - Install missing shadcn components:
```bash
cd frontend
npx shadcn-ui@latest add data-table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add card
```

**Solution 3** - Update template imports:
```typescript
// Use conditional imports or check if components exist
{{#if hasDataTable}}
import { DataTable } from '@/components/ui/data-table';
{{else}}
import { Table } from '@/components/ui/table';
{{/if}}
```

---

### Error 9: "Menu item not appearing in sidebar"

**Symptom**: Module generated successfully, tapi menu tidak muncul di sidebar

**Diagnostic**:
```sql
-- Check if menu item created
SELECT * FROM tenant_10.menu_items WHERE module_name = 'products';

-- Check if menu active
SELECT * FROM tenant_10.menus WHERE slug = 'main-menu';

-- Check user permissions
SELECT p.* 
FROM tenant_10.user_roles ur
JOIN tenant_10.roles r ON ur.role_id = r.id
JOIN tenant_10.role_permissions rp ON r.id = rp.role_id
JOIN tenant_10.permissions p ON rp.permission_id = p.id
WHERE ur.user_id = X AND p.action LIKE '%products%';
```

**Common Causes**:

1. **User tidak punya permission**
```sql
-- Give user permission to view module
INSERT INTO tenant_10.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM tenant_10.roles WHERE name = 'admin'),
  id
FROM tenant_10.permissions 
WHERE action = 'view_products';
```

2. **Menu tidak active**
```sql
UPDATE tenant_10.menu_items 
SET is_active = true 
WHERE module_name = 'products';
```

3. **Frontend sidebar not refreshing**
```bash
# Clear cache and restart
cd frontend
rm -rf .next
npm run dev
```

---

## 🐛 DEBUGGING TIPS

### Enable Verbose Logging

```typescript
// File: code-generation.service.ts
private readonly logger = new Logger(CodeGenerationService.name);

async generateModule(dto, tenantSchema, uiConfig) {
  this.logger.log(`[START] Generating module: ${dto.moduleName}`);
  this.logger.log(`Tenant schema: ${tenantSchema}`);
  this.logger.log(`UI Config: ${JSON.stringify(uiConfig)}`);
  
  try {
    // Generation code
    this.logger.log(`[STEP 1] Generating module file...`);
    const moduleFile = await this.generateModuleFile(context);
    this.logger.log(`[STEP 1] ✓ Created: ${moduleFile}`);
    
    // More steps...
  } catch (error) {
    this.logger.error(`[ERROR] Generation failed at step X: ${error.message}`);
    this.logger.error(error.stack);
    throw error;
  }
}
```

### Test Template Rendering Separately

```typescript
// Create test script: backend/scripts/test-template-render.ts
import { TemplateService } from '../src/modules/module-generator/services/template.service';

async function testRender() {
  const templateService = new TemplateService();
  
  const context = {
    moduleName: 'test-products',
    className: 'TestProducts',
    displayName: 'Test Products',
    fields: [
      { name: 'name', camelCase: 'name', type: 'string', isRequired: true },
    ],
    uiConfig: {
      createFormType: 'modal',
      editFormType: 'modal',
    },
  };
  
  try {
    const rendered = await templateService.render('frontend/list-page.tsx.hbs', context);
    console.log('Rendered template:');
    console.log(rendered);
  } catch (error) {
    console.error('Render failed:', error);
  }
}

testRender();
```

```bash
# Run test
cd backend
npx ts-node scripts/test-template-render.ts
```

### Check File System Permissions

```bash
# Check write permissions
ls -la backend/src/modules/
ls -la frontend/app/\(private\)/org/\[tenant\]/portal/

# Fix if needed (Linux/Mac)
chmod -R 755 backend/src/modules/
chmod -R 755 frontend/app/\(private\)/org/\[tenant\]/portal/

# Windows - run as Administrator if needed
```

---

## 📊 VERIFICATION CHECKLIST

After generation, verify ALL of these:

### Backend Files
- [ ] `src/modules/{name}/{name}.module.ts` exists
- [ ] `src/modules/{name}/{name}.controller.ts` exists
- [ ] `src/modules/{name}/{name}.service.ts` exists
- [ ] `src/modules/{name}/{name}.repository.ts` exists
- [ ] `src/modules/{name}/dto/*.dto.ts` exist (4 files)
- [ ] `src/database/schema/tenant/{table}.schema.ts` exists
- [ ] `migrations/*-create-{table}.sql` exists

### Frontend Files (if implemented)
- [ ] `frontend/app/(private)/org/[tenant]/portal/{name}/page.tsx` exists
- [ ] Create form exists (modal or page)
- [ ] Edit form exists (modal or page)

### Database
- [ ] Module record in `public.visual_modules`
- [ ] Fields in `public.visual_module_fields`
- [ ] Permissions in `tenant_X.permissions` (4 rows)
- [ ] Menu item in `tenant_X.menu_items` (1 row)

### TypeScript Compilation
```bash
cd backend
npm run type-check  # Should pass

cd frontend
npm run type-check  # Should pass
```

### ESLint
```bash
cd backend
npm run lint  # Should pass with no errors

cd frontend
npm run lint  # Should pass with no errors
```

### Runtime Test
```bash
# Start backend
cd backend
npm run start:dev

# Start frontend
cd frontend
npm run dev

# Test CRUD operations via UI
# 1. Navigate to /portal/{module-name}
# 2. Click "Tambah" 
# 3. Fill form & submit
# 4. Verify data appears in list
# 5. Click edit
# 6. Update & save
# 7. Click delete
# 8. Verify deleted
```

---

## 🔧 RECOVERY PROCEDURES

### Complete Module Cleanup (if stuck)

```bash
#!/bin/bash
# File: backend/scripts/cleanup-module.sh

MODULE_NAME=$1
TABLE_NAME=$(echo $MODULE_NAME | tr '-' '_')

if [ -z "$MODULE_NAME" ]; then
  echo "Usage: ./cleanup-module.sh module-name"
  exit 1
fi

echo "Cleaning up module: $MODULE_NAME"

# 1. Delete backend files
echo "[1/5] Deleting backend files..."
rm -rf backend/src/modules/$MODULE_NAME
rm -f backend/src/database/schema/tenant/${TABLE_NAME}.schema.ts
rm -f backend/migrations/*-create-${TABLE_NAME}.sql

# 2. Delete frontend files
echo "[2/5] Deleting frontend files..."
rm -rf frontend/app/\(private\)/org/\[tenant\]/portal/$MODULE_NAME

# 3. Delete from database - public schema
echo "[3/5] Deleting from public schema..."
psql -U postgres -d platform_cms << EOF
DELETE FROM public.visual_module_fields 
WHERE module_id IN (SELECT id FROM public.visual_modules WHERE module_name = '$MODULE_NAME');

DELETE FROM public.visual_modules WHERE module_name = '$MODULE_NAME';
EOF

# 4. Delete from tenant schemas
echo "[4/5] Deleting from tenant schemas..."
for schema in $(psql -U postgres -d platform_cms -t -c "SELECT 'tenant_' || slug FROM public.tenants WHERE deleted_at IS NULL"); do
  echo "  Cleaning $schema..."
  psql -U postgres -d platform_cms << EOF
DELETE FROM ${schema}.menu_items WHERE module_name = '$MODULE_NAME';
DELETE FROM ${schema}.permissions WHERE action LIKE '%${MODULE_NAME}%';
DROP TABLE IF EXISTS ${schema}.${TABLE_NAME} CASCADE;
EOF
done

# 5. Verify cleanup
echo "[5/5] Verifying cleanup..."
ls backend/src/modules/ | grep $MODULE_NAME || echo "  ✓ Backend files deleted"
ls frontend/app/\(private\)/org/\[tenant\]/portal/ | grep $MODULE_NAME || echo "  ✓ Frontend files deleted"
psql -U postgres -d platform_cms -c "SELECT COUNT(*) FROM public.visual_modules WHERE module_name = '$MODULE_NAME';"

echo "Cleanup complete!"
```

Usage:
```bash
chmod +x backend/scripts/cleanup-module.sh
./backend/scripts/cleanup-module.sh products
```

---

## 📞 WHEN TO ASK FOR HELP

Ask the user or check documentation if:

1. **Template Pattern Unclear**: Not sure how existing frontend pages are structured
2. **Component Library**: Don't know which shadcn components are available
3. **Business Logic**: Not sure about validation rules or workflow
4. **Breaking Changes**: Major refactoring needed that affects existing modules
5. **Performance Issues**: Generation taking too long (>30 seconds)

**Don't guess!** Read existing code patterns first:
- Check `frontend/app/(private)/org/[tenant]/portal/mgmt-users/` for patterns
- Check `backend/src/modules/roles/` for backend patterns
- Check `.kiro/skills/platform-cms-rules.md` for project rules

---

## 🎓 LESSONS LEARNED

### 1. Always Check Table Existence
Jangan assume tenant schema punya semua tables. Use graceful degradation.

### 2. Rollback is Critical
Generation bisa fail di tengah jalan. Implement proper rollback.

### 3. Template Testing is Essential
Test template rendering BEFORE full generation. Easier to debug.

### 4. Type Safety Matters
Generated code HARUS pass TypeScript compilation. Test dengan `npm run type-check`.

### 5. Date Handling is Tricky
Drizzle wants strings, not Date objects. Handle conversion at DTO layer.

### 6. UI Config is Important
Modal vs Page is user choice, bukan developer assumption. Respect `uiConfig`.

### 7. Permissions Matter
Generated module useless jika user tidak punya permission to access.

---

## 📚 REFERENSI TAMBAHAN

### Documentation Files
- `backend/docs/MULTI_TENANT_ARCHITECTURE.md` - Multi-tenancy explained
- `.kiro/skills/platform-cms-rules.md` - Development rules
- `.kiro/skills/generator-rules.md` - Generator specific rules

### Code References
- `backend/src/modules/roles/` - Example CRUD module
- `frontend/app/(private)/org/[tenant]/portal/mgmt-users/` - Example frontend pages
- `backend/src/database/schema/` - Database schemas

### Helper Scripts
- `backend/scripts/cleanup-module.sh` - Complete module cleanup
- `backend/scripts/test-template-render.ts` - Test template rendering
- `backend/scripts/check-db-column.ts` - Verify database columns

---

**Selesai!** Semua dokumentasi lengkap. Good luck! 🚀
