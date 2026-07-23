# Implementation Tasks: Visual CRUD Builder UI

**Feature Name**: Visual CRUD Builder UI  
**Version**: 1.0.0  
**Status**: Ready for Implementation  
**Based on**: requirements.md v1.0.0, design.md v1.0.0

---

## IMPLEMENTATION PHASES

### Phase 1: Database & Backend Foundation (8-10 hours)
### Phase 2: Code Generation Engine (10-12 hours)
### Phase 3: Frontend UI Components (12-15 hours)
### Phase 4: Integration & Testing (6-8 hours)

**Total Estimated Time**: 36-45 hours (~1 week full-time)

---

## PHASE 1: DATABASE & BACKEND FOUNDATION

### Task 1.1: Create Database Schema
**Priority**: P0 - CRITICAL  
**Estimated Time**: 2 hours  
**Dependencies**: None

**Deliverables**:
- [ ] Create migration file: `create-module-generator-tables.sql`
- [ ] Table: `generated_modules` dengan 14 columns
- [ ] Table: `generated_module_fields` dengan 11 columns
- [ ] Indexes: 8 indexes total
- [ ] Foreign keys: 3 FKs
- [ ] Run migration: `npm run db:push`

**Acceptance Criteria**:
- [ ] Tables created di tenant schema
- [ ] All indexes created
- [ ] Foreign keys working
- [ ] Can insert/query test data

**Files to Create**:
```
backend/migrations/create-module-generator-tables.sql
backend/src/database/schema/tenant/generated-modules.schema.ts
backend/src/database/schema/tenant/generated-module-fields.schema.ts
```

**SQL Preview**:
```sql
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
```

---

### Task 1.2: Create Drizzle Entities
**Priority**: P0 - CRITICAL  
**Estimated Time**: 1 hour  
**Dependencies**: Task 1.1

**Deliverables**:
- [ ] Entity: `generated-module.entity.ts`
- [ ] Entity: `generated-module-field.entity.ts`
- [ ] Export entities di `tenant/index.ts`
- [ ] TypeScript types generated

**Acceptance Criteria**:
- [ ] Entities compile without errors
- [ ] Type inference working
- [ ] Relations defined correctly

**Files to Create**:
```
backend/src/modules/module-generator/entities/generated-module.entity.ts
backend/src/modules/module-generator/entities/generated-module-field.entity.ts
```

---

### Task 1.3: Create Module Generator Module Structure
**Priority**: P0 - CRITICAL  
**Estimated Time**: 1 hour  
**Dependencies**: None

**Deliverables**:
- [ ] Module: `module-generator.module.ts`
- [ ] Controller: `module-generator.controller.ts` (skeleton)
- [ ] Service: `module-generator.service.ts` (skeleton)
- [ ] Repository: `module-metadata.repository.ts`
- [ ] Register module di `app.module.ts`

**Acceptance Criteria**:
- [ ] Module registered successfully
- [ ] Dependency injection working
- [ ] App compiles and starts

**Files to Create**:
```
backend/src/modules/module-generator/
├── module-generator.module.ts
├── module-generator.controller.ts
├── module-generator.service.ts
├── module-metadata.repository.ts
└── dto/
```

**Module Template**:
```typescript
@Module({
  imports: [
    CaslModule,
    // Will import PermissionsModule, MenusModule
  ],
  controllers: [ModuleGeneratorController],
  providers: [
    ModuleGeneratorService,
    CodeGenerationService,
    TemplateService,
    ModuleMetadataRepository,
  ],
  exports: [ModuleGeneratorService],
})
export class ModuleGeneratorModule {}
```

---

### Task 1.4: Create DTOs
**Priority**: P0 - CRITICAL  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.3

**Deliverables**:
- [ ] DTO: `generate-module.dto.ts` (with validation)
- [ ] DTO: `module-field.dto.ts` (with validation)
- [ ] DTO: `validation-rule.dto.ts`
- [ ] DTO: `query-modules.dto.ts`
- [ ] DTO: `module-response.dto.ts`
- [ ] DTO: `module-detail-response.dto.ts`

**Acceptance Criteria**:
- [ ] All DTOs have class-validator decorators
- [ ] Validation rules comprehensive
- [ ] Response DTOs transform entities correctly

**Files to Create**:
```
backend/src/modules/module-generator/dto/
├── generate-module.dto.ts
├── module-field.dto.ts
├── validation-rule.dto.ts
├── query-modules.dto.ts
├── module-response.dto.ts
└── module-detail-response.dto.ts
```

---

### Task 1.5: Create Repository Layer
**Priority**: P1 - HIGH  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.2, 1.4

**Deliverables**:
- [ ] Repository methods:
  - `create(data)` - Save module metadata
  - `findById(id)` - Get module with fields
  - `findAll(query)` - List with pagination
  - `update(id, data)` - Update metadata
  - `softDelete(id)` - Soft delete module
  - `existsByName(name)` - Check uniqueness

**Acceptance Criteria**:
- [ ] All methods tested (unit tests)
- [ ] Tenant context respected
- [ ] Soft delete working
- [ ] Pagination working

**File**: `backend/src/modules/module-generator/module-metadata.repository.ts`

---

## PHASE 2: CODE GENERATION ENGINE

### Task 2.1: Create Template Service
**Priority**: P0 - CRITICAL  
**Estimated Time**: 3 hours  
**Dependencies**: None

**Deliverables**:
- [ ] Service: `template.service.ts`
- [ ] Methods:
  - `loadTemplate(name)` - Load Handlebars template
  - `renderTemplate(name, context)` - Render with data
  - `compileTemplate(content)` - Compile template string
- [ ] Template cache (in-memory)
- [ ] Reuse existing CLI templates (from `cli/templates/`)

**Acceptance Criteria**:
- [ ] Can load templates from CLI directory
- [ ] Rendering works correctly
- [ ] Cache prevents redundant reads
- [ ] Error handling for missing templates

**File**: `backend/src/modules/module-generator/template.service.ts`

**Template Paths**:
```typescript
const TEMPLATE_PATHS = {
  module: 'cli/templates/backend/module/module.hbs',
  controller: 'cli/templates/backend/module/controller.hbs',
  service: 'cli/templates/backend/module/service.hbs',
  repository: 'cli/templates/backend/module/repository.hbs',
  entity: 'cli/templates/backend/module/entities/entity.hbs',
  createDto: 'cli/templates/backend/module/dto/create.hbs',
  updateDto: 'cli/templates/backend/module/dto/update.hbs',
  queryDto: 'cli/templates/backend/module/dto/query.hbs',
  responseDto: 'cli/templates/backend/module/dto/response.hbs',
};
```

---

### Task 2.2: Create Code Generation Service
**Priority**: P0 - CRITICAL  
**Estimated Time**: 5 hours  
**Dependencies**: Task 2.1

**Deliverables**:
- [ ] Service: `code-generation.service.ts`
- [ ] Methods:
  - `generateModuleFiles(context)` - Generate all 12 files
  - `writeFile(path, content)` - Write to filesystem
  - `createDirectory(path)` - Create directories
  - `deleteModuleFiles(moduleName)` - Cleanup
  - `rollbackGeneration(moduleName)` - Rollback on error

**Acceptance Criteria**:
- [ ] Generates 12 files correctly
- [ ] Files compile without errors
- [ ] Follows platform coding standards
- [ ] Atomic operation (all or nothing)
- [ ] Rollback works correctly

**File**: `backend/src/modules/module-generator/code-generation.service.ts`

**Generation Steps**:
```typescript
async generateModuleFiles(context: TemplateContext): Promise<string[]> {
  const files: string[] = [];
  
  try {
    // 1. Create module directory
    await this.createDirectory(`backend/src/modules/${context.moduleName}`);
    
    // 2. Generate module file
    files.push(await this.generateFile('module', context));
    
    // 3. Generate controller
    files.push(await this.generateFile('controller', context));
    
    // 4. Generate service
    files.push(await this.generateFile('service', context));
    
    // 5. Generate repository
    files.push(await this.generateFile('repository', context));
    
    // 6. Generate entity
    files.push(await this.generateFile('entity', context));
    
    // 7. Generate DTOs (4 files)
    files.push(...await this.generateDtos(context));
    
    // 8. Generate tests (3 files)
    files.push(...await this.generateTests(context));
    
    return files;
  } catch (error) {
    // Rollback: delete all generated files
    await this.rollbackGeneration(context.moduleName);
    throw error;
  }
}
```

---

### Task 2.3: Create Permission & Menu Integration
**Priority**: P1 - HIGH  
**Estimated Time**: 2 hours  
**Dependencies**: Task 2.2

**Deliverables**:
- [ ] Method: `createPermissions(moduleName, schema)` - Insert 4 permissions
- [ ] Method: `assignPermissionsToRole(permissions, roleId)` - Assign to current user role
- [ ] Method: `createMenuItem(moduleName, schema)` - Insert menu item
- [ ] Integration with existing PermissionsService
- [ ] Integration with existing MenusService

**Acceptance Criteria**:
- [ ] 4 permissions created correctly
- [ ] Permissions assigned to user role
- [ ] Menu item created in "Main Menu"
- [ ] Required permission set correctly

**File**: `backend/src/modules/module-generator/code-generation.service.ts` (add methods)

**Permission Template**:
```typescript
const permissions = [
  { resource: moduleName, action: 'read', scope: 'tenant' },
  { resource: moduleName, action: 'create', scope: 'tenant' },
  { resource: moduleName, action: 'update', scope: 'tenant' },
  { resource: moduleName, action: 'delete', scope: 'tenant' },
];
```

---

### Task 2.4: Create Database Migration Service
**Priority**: P1 - HIGH  
**Estimated Time**: 2 hours  
**Dependencies**: Task 2.2

**Deliverables**:
- [ ] Method: `runMigration(moduleName)` - Apply Drizzle migration
- [ ] Method: `generateMigration(entity)` - Generate migration file
- [ ] Method: `dropTable(tableName, schema)` - For delete operation
- [ ] Integration with Drizzle CLI

**Acceptance Criteria**:
- [ ] Migration runs successfully
- [ ] Table created in tenant schema
- [ ] Table dropped correctly on delete
- [ ] Error handling for migration failures

**File**: `backend/src/modules/module-generator/migration.service.ts`

**Implementation**:
```typescript
async runMigration(moduleName: string): Promise<boolean> {
  try {
    // Option 1: Use drizzle-kit push
    await execAsync('npm run db:push', { cwd: 'backend' });
    
    // Option 2: Direct SQL execution
    // await this.db.execute(sql`CREATE TABLE ...`);
    
    return true;
  } catch (error) {
    this.logger.error(`Migration failed: ${error.message}`);
    return false;
  }
}
```

---

## PHASE 3: FRONTEND UI COMPONENTS

### Task 3.1: Create API Service Layer
**Priority**: P0 - CRITICAL  
**Estimated Time**: 2 hours  
**Dependencies**: None

**Deliverables**:
- [ ] Service: `module-generator.service.ts`
- [ ] Methods:
  - `generate(data)` - POST /module-generator/generate
  - `list(params)` - GET /module-generator/modules
  - `getDetails(id)` - GET /module-generator/modules/:id
  - `delete(id)` - DELETE /module-generator/modules/:id
  - `validateName(name)` - POST /module-generator/validate-name
- [ ] TypeScript interfaces for all DTOs

**Acceptance Criteria**:
- [ ] All methods type-safe
- [ ] Error handling consistent
- [ ] Axios interceptors working

**File**: `frontend/lib/api/services/module-generator.service.ts`

---

### Task 3.2: Create React Query Hooks
**Priority**: P0 - CRITICAL  
**Estimated Time**: 1 hour  
**Dependencies**: Task 3.1

**Deliverables**:
- [ ] Hook: `useGenerateModule()` - Mutation
- [ ] Hook: `useModules(params)` - Query with pagination
- [ ] Hook: `useModuleDetails(id)` - Query
- [ ] Hook: `useDeleteModule()` - Mutation
- [ ] Hook: `useValidateModuleName(name)` - Query with debounce

**Acceptance Criteria**:
- [ ] Hooks use TanStack Query
- [ ] Cache invalidation working
- [ ] Loading states exposed
- [ ] Error states exposed

**File**: `frontend/hooks/use-module-generator.ts`

---

### Task 3.3: Create ModuleForm Component
**Priority**: P0 - CRITICAL  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.2

**Deliverables**:
- [ ] Component: `ModuleForm.tsx`
- [ ] Form fields:
  - Module Name (with real-time validation)
  - Display Name (auto-populate from module name)
  - Description (textarea, optional)
  - Checkboxes: Tenant Isolation, Soft Delete, Audit (all default true)
- [ ] Zod validation schema
- [ ] React Hook Form integration

**Acceptance Criteria**:
- [ ] Form validates input
- [ ] Real-time module name validation
- [ ] Display name auto-populates
- [ ] Error messages in Indonesian
- [ ] Accessible (keyboard navigation)

**File**: `frontend/app/(private)/org/[tenant]/portal/module-builder/components/ModuleForm.tsx`

---

### Task 3.4: Create FieldManager Component
**Priority**: P0 - CRITICAL  
**Estimated Time**: 3 hours  
**Dependencies**: None

**Deliverables**:
- [ ] Component: `FieldManager.tsx`
- [ ] Table/List display with columns: Name, Type, Required, Unique, Actions
- [ ] Actions: Edit, Delete, Move Up, Move Down
- [ ] Add Field button
- [ ] Empty state
- [ ] Drag-drop reordering (optional, can use up/down buttons)

**Acceptance Criteria**:
- [ ] Can add multiple fields
- [ ] Can edit existing field
- [ ] Can delete field (with confirmation)
- [ ] Can reorder fields
- [ ] Shows field count

**File**: `frontend/app/(private)/org/[tenant]/portal/module-builder/components/FieldManager.tsx`

---

### Task 3.5: Create FieldForm Component
**Priority**: P0 - CRITICAL  
**Estimated Time**: 4 hours  
**Dependencies**: None

**Deliverables**:
- [ ] Component: `FieldForm.tsx`
- [ ] Form fields:
  - Field Name (with validation)
  - Field Type (dropdown, 15+ options)
  - Conditional fields:
    - Length (for string/varchar)
    - Precision & Scale (for decimal)
    - Enum Values (for enum)
  - Required checkbox
  - Unique checkbox
  - Default Value input
  - Validations multi-select
- [ ] Modal/Dialog wrapper
- [ ] Zod validation

**Acceptance Criteria**:
- [ ] Conditional fields show/hide correctly
- [ ] Type dropdown has all 15+ types
- [ ] Validation options comprehensive
- [ ] Form validates before submit
- [ ] Can be used for both add and edit

**File**: `frontend/app/(private)/org/[tenant]/portal/module-builder/components/FieldForm.tsx`

**Field Types Dropdown**:
```typescript
const FIELD_TYPES = [
  { value: 'string', label: 'String (VARCHAR)', showLength: true },
  { value: 'text', label: 'Text (TEXT)' },
  { value: 'integer', label: 'Integer (INT)' },
  { value: 'decimal', label: 'Decimal (NUMERIC)', showPrecision: true },
  { value: 'float', label: 'Float (REAL)' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'DateTime (TIMESTAMP)' },
  { value: 'email', label: 'Email (validated)' },
  { value: 'url', label: 'URL (validated)' },
  { value: 'uuid', label: 'UUID' },
  { value: 'json', label: 'JSON (JSONB)' },
  { value: 'enum', label: 'Enum (select)', showValues: true },
];
```

---

### Task 3.6: Create QueryConfig Component
**Priority**: P1 - HIGH  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.4

**Deliverables**:
- [ ] Component: `QueryConfig.tsx`
- [ ] Multi-select: Searchable Fields (only text/string)
- [ ] Multi-select: Filterable Fields (all except text/json)
- [ ] Multi-select: Sortable Fields (all fields)
- [ ] Hint texts explaining each option

**Acceptance Criteria**:
- [ ] Only shows fields that are added
- [ ] Disables incompatible options
- [ ] Clear labels and hints
- [ ] Selections persist

**File**: `frontend/app/(private)/org/[tenant]/portal/module-builder/components/QueryConfig.tsx`

---

### Task 3.7: Create Module Builder Page
**Priority**: P0 - CRITICAL  
**Estimated Time**: 3 hours  
**Dependencies**: Tasks 3.3, 3.4, 3.5, 3.6

**Deliverables**:
- [ ] Page: `module-builder/page.tsx`
- [ ] Layout: Stepper/Wizard or single page
- [ ] Sections:
  1. Module Info (ModuleForm)
  2. Fields (FieldManager + FieldForm)
  3. Query Config (QueryConfig)
  4. Preview (optional)
- [ ] Generate Button (bottom right)
- [ ] Loading state during generation
- [ ] Success/error toast notifications
- [ ] Redirect to modules list on success

**Acceptance Criteria**:
- [ ] All components integrated
- [ ] Form submission works
- [ ] Generation completes successfully
- [ ] Shows success message
- [ ] Redirects correctly

**File**: `frontend/app/(private)/org/[tenant]/portal/module-builder/page.tsx`

**Page Layout**:
```tsx
export default function ModuleBuilderPage() {
  const [moduleInfo, setModuleInfo] = useState<ModuleInfo>();
  const [fields, setFields] = useState<ModuleField[]>([]);
  const [queryConfig, setQueryConfig] = useState<QueryConfig>();
  
  const generateModule = useGenerateModule();
  
  const handleGenerate = async () => {
    await generateModule.mutateAsync({
      ...moduleInfo,
      fields,
      ...queryConfig,
    });
  };
  
  return (
    <div className="container">
      <PageHeader title="Module Builder" />
      
      <Card>
        <CardHeader>Module Information</CardHeader>
        <CardContent>
          <ModuleForm onChange={setModuleInfo} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>Fields</CardHeader>
        <CardContent>
          <FieldManager fields={fields} onChange={setFields} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>Query Configuration</CardHeader>
        <CardContent>
          <QueryConfig fields={fields} onChange={setQueryConfig} />
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleGenerate} loading={generateModule.isPending}>
          Generate Module
        </Button>
      </div>
    </div>
  );
}
```

---

### Task 3.8: Create Module List Page
**Priority**: P1 - HIGH  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.2

**Deliverables**:
- [ ] Page: `modules/page.tsx`
- [ ] Component: `ModuleTable.tsx`
- [ ] Search input
- [ ] Table columns: Module Name, Display Name, Fields Count, Created Date, Actions
- [ ] Actions: View, Delete
- [ ] Pagination
- [ ] Empty state

**Acceptance Criteria**:
- [ ] Lists all generated modules
- [ ] Search works correctly
- [ ] Pagination works
- [ ] Delete confirmation dialog
- [ ] Real-time updates after delete

**Files**:
```
frontend/app/(private)/org/[tenant]/portal/modules/
├── page.tsx
└── components/
    ├── ModuleTable.tsx
    └── DeleteModuleDialog.tsx
```

---

### Task 3.9: Create Module Detail Page
**Priority**: P2 - MEDIUM  
**Estimated Time**: 2 hours  
**Dependencies**: Task 3.2

**Deliverables**:
- [ ] Page: `modules/[id]/page.tsx`
- [ ] Sections:
  - Module Info
  - Fields List (read-only)
  - Query Config (read-only)
  - Permissions Created
  - Menu Item Info
  - API Endpoints

**Acceptance Criteria**:
- [ ] Shows complete module details
- [ ] Fields displayed in table
- [ ] Can copy API endpoint URLs
- [ ] Delete button (confirmation)

**File**: `frontend/app/(private)/org/[tenant]/portal/modules/[id]/page.tsx`

---

## PHASE 4: INTEGRATION & TESTING

### Task 4.1: Backend Integration Testing
**Priority**: P1 - HIGH  
**Estimated Time**: 3 hours  
**Dependencies**: All Phase 2 tasks

**Deliverables**:
- [ ] Test: Generate module end-to-end
- [ ] Test: List modules with pagination
- [ ] Test: Get module details
- [ ] Test: Delete module
- [ ] Test: Validate module name
- [ ] Test: Rollback on error

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Generated code compiles
- [ ] Database migrations work
- [ ] Permissions created
- [ ] Menu items created

**Test File**: `backend/src/modules/module-generator/module-generator.service.spec.ts`

---

### Task 4.2: Frontend Integration Testing
**Priority**: P2 - MEDIUM  
**Estimated Time**: 2 hours  
**Dependencies**: All Phase 3 tasks

**Deliverables**:
- [ ] Test: Module builder form submission
- [ ] Test: Field add/edit/delete
- [ ] Test: Module list rendering
- [ ] Test: Module detail page
- [ ] Test: Error handling

**Acceptance Criteria**:
- [ ] Component tests pass
- [ ] User flows work end-to-end
- [ ] Error states handled
- [ ] Loading states working

---

### Task 4.3: Manual Testing & Bug Fixes
**Priority**: P1 - HIGH  
**Estimated Time**: 2 hours  
**Dependencies**: All previous tasks

**Test Scenarios**:
- [ ] Generate simple module (3 fields)
- [ ] Generate complex module (10+ fields)
- [ ] Generate with all query options
- [ ] Delete generated module
- [ ] Error: Duplicate module name
- [ ] Error: Invalid field name
- [ ] Error: No fields defined
- [ ] Rollback on generation failure

**Acceptance Criteria**:
- [ ] All scenarios work correctly
- [ ] No critical bugs found
- [ ] UI responsive on mobile
- [ ] Performance < 10 seconds

---

### Task 4.4: Documentation
**Priority**: P2 - MEDIUM  
**Estimated Time**: 1 hour  
**Dependencies**: Task 4.3

**Deliverables**:
- [ ] Update README.md dengan Module Builder section
- [ ] API documentation (Swagger annotations)
- [ ] User guide (how to use Module Builder)
- [ ] Developer guide (how to extend)

**Files to Update**:
```
README.md
docs/MODULE-BUILDER-GUIDE.md (new)
backend/src/modules/module-generator/module-generator.controller.ts (Swagger)
```

---

## TASK DEPENDENCIES GRAPH

```
Phase 1: Database & Backend Foundation
1.1 (DB Schema) ──> 1.2 (Entities) ──> 1.5 (Repository)
                       ↓
                    1.3 (Module Structure) ──> 1.4 (DTOs)

Phase 2: Code Generation Engine
2.1 (Template Service) ──> 2.2 (Code Gen Service) ──> 2.3 (Permission/Menu)
                                                   ──> 2.4 (Migration)

Phase 3: Frontend UI
3.1 (API Service) ──> 3.2 (React Query Hooks)
                           ↓
3.3 (ModuleForm)           ↓
3.4 (FieldManager)         ↓
3.5 (FieldForm)            ↓
3.6 (QueryConfig)          ↓
                           ↓
                    3.7 (Builder Page) ──> 3.8 (List Page)
                                       ──> 3.9 (Detail Page)

Phase 4: Integration & Testing
4.1 (Backend Tests)
4.2 (Frontend Tests)
4.3 (Manual Testing)
4.4 (Documentation)
```

---

## RECOMMENDED IMPLEMENTATION ORDER

### Sprint 1 (Week 1, Days 1-2): Backend Foundation
1. Task 1.1 → 1.2 → 1.3 → 1.4 → 1.5
   - Create database schema
   - Create module structure
   - Create DTOs & repository

**Goal**: Backend module structure ready, can save metadata to DB

---

### Sprint 2 (Week 1, Days 3-4): Code Generation
2. Task 2.1 → 2.2 → 2.3 → 2.4
   - Template service
   - Code generation service
   - Permission & menu integration
   - Migration service

**Goal**: Can generate module files, permissions, menu items

---

### Sprint 3 (Week 1, Day 5 - Week 2, Day 1): Frontend Core
3. Task 3.1 → 3.2 → 3.3 → 3.4 → 3.5
   - API service & hooks
   - ModuleForm component
   - FieldManager & FieldForm

**Goal**: Can add module info and fields via UI

---

### Sprint 4 (Week 2, Days 2-3): Frontend Pages
4. Task 3.6 → 3.7 → 3.8 → 3.9
   - QueryConfig component
   - Module Builder page
   - Module List & Detail pages

**Goal**: Complete UI, can generate module from browser

---

### Sprint 5 (Week 2, Days 4-5): Testing & Polish
5. Task 4.1 → 4.2 → 4.3 → 4.4
   - Integration tests
   - Manual testing
   - Bug fixes
   - Documentation

**Goal**: Production-ready, all tests pass, documented

---

## CRITICAL SUCCESS FACTORS

### Must Work Correctly
- [ ] Module generation produces compile-ready code
- [ ] Generated code follows platform standards
- [ ] Permissions auto-assigned to user role
- [ ] Menu items auto-created and visible
- [ ] Rollback works on any failure
- [ ] Tenant isolation maintained

### Performance Targets
- [ ] Generation time < 10 seconds (< 20 fields)
- [ ] Module list loads < 500ms
- [ ] Form input responsive < 100ms

### Code Quality
- [ ] All backend code type-checks
- [ ] All frontend code type-checks
- [ ] No linting errors
- [ ] Test coverage > 70%

---

## RISK MITIGATION

### Risk: Generated Code Quality Issues
**Mitigation**: Reuse existing CLI templates (already tested)

### Risk: Performance Degradation
**Mitigation**: 
- Async file writes
- Template caching
- Limit max fields (50)

### Risk: Filesystem Permission Issues
**Mitigation**:
- Validate write permissions on app start
- Clear error messages
- Rollback mechanism

### Risk: Complex Validations Too Hard for UI
**Mitigation**:
- Start with basic validations
- Defer complex ones to post-MVP
- Allow manual edit after generation

---

**Status**: Ready to Start  
**Next Step**: Begin Task 1.1 (Create Database Schema)  
**Estimated Completion**: 1 week (full-time) or 2-3 weeks (part-time)
