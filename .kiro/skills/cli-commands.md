# Platform CMS - CLI Commands Reference

## 📋 Module Generation Workflow (RECOMMENDED)

**Complete end-to-end workflow**:

```bash
# Step 1: Generate module dengan CLI
cd cli
node bin/cms.js generate crud products \
  --fields="name:string:255,price:decimal:10:2" \
  --filterable="price" \
  --tenant --soft-delete --audit

# Step 2: Generate & push database migration
cd ../backend
npm run db:generate
npm run db:push  # Interactive - select "create table"

# Step 3: Apply permissions automatically ✅ NEW!
npm run permissions:apply products

# Step 4: Start server & test
npm run start:dev
# Test: http://localhost:3000/api/products
```

**Available Scripts**:
- `npm run permissions:apply <module>` - Apply permissions & assign to admin role
- `npm run permissions:apply <module> <tenant>` - Apply for specific tenant

**What permissions:apply does**:
1. ✅ Reads `migrations/permissions/<module>-permissions.sql`
2. ✅ Replaces tenant_1 with target tenant (default: tenant_1)
3. ✅ Inserts permissions (read, create, update, delete)
4. ✅ Auto-assigns all permissions to admin role (role_id=1)
5. ✅ Shows created permissions list

---

## CLI Location
- **Path**: `cli/bin/cms.js`
- **Usage**: `node cli/bin/cms.js <command> [options]`

## Available Commands

### 1. generate (alias: g)
Generate a new module or CRUD resource

**Syntax**:
```bash
node cli/bin/cms.js generate module <module-name>
node cli/bin/cms.js g module <module-name>
```

**Options**:
- `--fields <json>` - JSON string defining fields
- `--api-only` - Generate API only (skip frontend)
- `--frontend-only` - Generate frontend only (skip API)

**Example**:
```bash
# Generate full module
node cli/bin/cms.js generate module categories
node cli/bin/cms.js g module categories

# Generate CRUD with custom fields
node cli/bin/cms.js generate crud products --fields="name:string,price:number"

# API only
node cli/bin/cms.js generate module orders --api-only
```

### 2. delete (alias: rm)
Delete an existing module and all its files

**Syntax**:
```bash
node cli/bin/cms.js delete module <module-name>
node cli/bin/cms.js rm module <module-name>

# Delete multiple test modules
node cli/bin/cms.js delete test-modules
```

**Example**:
```bash
node cli/bin/cms.js delete module categories
node cli/bin/cms.js rm module products
```

**What it deletes**:
- All backend module files
- All frontend pages
- Migration files (if exists)
- Module registration from AppModule

**Safety**:
- Asks for confirmation before deletion
- Creates backup of deleted files
- Updates import statements in other files

### 3. module list
List all generated modules

**Syntax**:
```bash
node cli/bin/cms.js module list
```

**Output**:
- Module name
- Number of files
- Last modified date
- API endpoints

### 4. migration generate
Generate database migration

**Syntax**:
```bash
node cli/bin/cms.js migration generate <migration-name>
```

**Example**:
```bash
node cli/bin/cms.js migration generate add-users-table
```

### 5. migration run
Run pending migrations

**Syntax**:
```bash
node cli/bin/cms.js migration run [options]
```

**Options**:
- `--tenant <slug>` - Run for specific tenant
- `--all-tenants` - Run for all tenants

**Example**:
```bash
# Run for default tenant
node cli/bin/cms.js migration run

# Run for specific tenant
node cli/bin/cms.js migration run --tenant tenant_1

# Run for all tenants
node cli/bin/cms.js migration run --all-tenants
```

## Common Workflows

### Creating New Feature Module
```bash
# 1. Generate module
node cli/bin/cms.js module generate invoices --fields '[
  {"name":"invoice_number","type":"string","required":true},
  {"name":"amount","type":"number","required":true},
  {"name":"status","type":"string","default":"draft"}
]'

# 2. Review generated files
# 3. Customize business logic if needed
# 4. Run migration
node cli/bin/cms.js migration run

# 5. Start server and test
npm run start:dev
```

### Removing Feature Module
```bash
# 1. Delete module
node cli/bin/cms.js module delete invoices

# 2. Confirm deletion
# 3. Cleanup any manual references
# 4. Restart server
```

### Testing Generated Module
```bash
# 1. Generate test module
node cli/bin/cms.js module generate test-items

# 2. Test CRUD operations
curl -X POST http://localhost:3000/api/test-items \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Slug: tenant_1" \
  -d '{"name":"Test Item"}'

# 3. Delete when done
node cli/bin/cms.js module delete test-items
```

## Important Notes

### Multi-Tenancy
- All generated modules are tenant-aware by default
- Repository layer automatically handles schema switching
- Always include `X-Tenant-Slug` header in API requests

### Security
- Generated controllers include CASL permission guards
- Default permissions: `{resource}.read`, `{resource}.create`, `{resource}.update`, `{resource}.delete`
- Edit permissions in controller decorators if needed

### Customization
After generation, you can customize:
- Business logic in Service layer
- Validation rules in DTOs
- Query filters in Repository
- UI components in Frontend

### Best Practices
1. Always use kebab-case for module names
2. Run migrations after generating modules
3. Test in development before committing
4. Review generated code for security
5. Add tests for critical business logic

## Troubleshooting

### Module already exists
```bash
# Delete first, then regenerate
node cli/bin/cms.js module delete old-module
node cli/bin/cms.js module generate old-module
```

### Migration conflicts
```bash
# Check migration status
node cli/bin/cms.js migration list

# Rollback if needed
node cli/bin/cms.js migration rollback --steps 1

# Regenerate
node cli/bin/cms.js migration generate fix-conflicts
```

### Import errors after deletion
- Check `app.module.ts` - remove deleted module imports
- Check other modules that reference deleted module
- Restart TypeScript server in IDE

## Related Documentation
- See `docs/CLI-BUILDER-SPEC.md` for complete specification
- See `cli/README.md` for development guide
- See `docs/TECHNICAL-ARCHITECTURE.md` for architecture details
