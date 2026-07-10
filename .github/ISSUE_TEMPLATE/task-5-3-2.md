---
name: Task 5.3.2 - CLI Metadata Service
about: Implement service layer for CLI metadata operations
title: '[TASK 5.3.2] CLI Metadata Service'
labels: ['task', 'backend', 'service', 'cli', 'week-10-11']
assignees: ''
---

## Task 5.3.2: CLI Metadata Service

**Sprint**: Week 10-11 - CLI Builder Tool Development  
**Priority**: P0 - CRITICAL  
**Estimated Time**: 4 hours  
**Dependencies**: Task 5.3.1 (CLI Metadata Database Schema)

---

## 📋 Objective

Implement complete service layer untuk CLI metadata operations. Service ini akan digunakan oleh CLI untuk save metadata setiap kali generate module, dan menyediakan API endpoints untuk frontend consume metadata.

---

## 🎯 Goals

1. Create CliMetadataRepository dengan database operations
2. Create CliMetadataService dengan business logic
3. Create CliMetadataController dengan API endpoints
4. Integrate with app.module.ts
5. Test with type-check, lint, build

---

## 📦 Deliverables

### 1. CLI Metadata Repository

**File**: `backend/src/core/cli-metadata/cli-metadata.repository.ts`

**Methods** (28 methods total):

**Generated Modules** (9 methods):
- `createModule()` - Create module record
- `findModuleByName()` - Find active module by name
- `findModuleById()` - Find module by ID
- `findAllModules()` - Find all modules (with includeDeleted option)
- `findModuleWithFields()` - Find module with fields and validations
- `softDeleteModule()` - Soft delete module
- `restoreModule()` - Restore soft deleted module
- `hardDeleteModule()` - Hard delete (use with caution)
- `countModules()` - Count modules

**Module Fields** (6 methods):
- `createField()` - Create field record
- `createFields()` - Create multiple fields (batch)
- `findFieldsByModuleId()` - Find all fields for module
- `findFieldById()` - Find field by ID
- `updateField()` - Update field
- `deleteFieldsByModuleId()` - Delete all fields for module

**Field Validations** (4 methods):
- `createValidation()` - Create validation record
- `createValidations()` - Create multiple validations (batch)
- `findValidationsByFieldId()` - Find validations for field
- `deleteValidationsByFieldId()` - Delete validations for field

**Generation History** (5 methods):
- `createHistory()` - Create history record
- `findHistoryByModuleId()` - Find history for module
- `findRecentHistory()` - Find recent history (limit)
- `findHistoryById()` - Find history by ID
- `countHistory()` - Count history records

### 2. CLI Metadata Service

**File**: `backend/src/core/cli-metadata/cli-metadata.service.ts`

**Main Methods** (11 methods):

**Save Operations** (2 methods):
- `saveModuleMetadata()` - Save complete module (module + fields + validations)
- `recordGeneration()` - Record CLI operation in history

**Query Operations** (6 methods):
- `getAllModules()` - Get all modules
- `getModuleByName()` - Get module by name
- `getModuleWithFields()` - Get module with fields and validations
- `getModuleFields()` - Get module fields only
- `getFieldValidations()` - Get field validations
- `getHistory()` - Get recent history

**Additional Queries** (3 methods):
- `getHistoryByModule()` - Get history for specific module
- `getStatistics()` - Get metadata statistics
- `moduleExists()` - Check if module exists

**Delete & Restore** (2 methods):
- `deleteModule()` - Soft delete module and record history
- `restoreModule()` - Restore deleted module and record history

### 3. CLI Metadata Controller

**File**: `backend/src/core/cli-metadata/cli-metadata.controller.ts`

**API Endpoints** (7 endpoints):
- `GET /api/cli/metadata/modules` - List all modules
- `GET /api/cli/metadata/modules/:name` - Get module details
- `GET /api/cli/metadata/modules/:name/fields` - Get module with fields
- `GET /api/cli/metadata/modules/:name/fields-only` - Get fields only
- `GET /api/cli/metadata/history` - Get generation history
- `GET /api/cli/metadata/modules/:name/history` - Get module history
- `GET /api/cli/metadata/statistics` - Get statistics

### 4. DTOs

**Files**:
- `dto/save-module-metadata.dto.ts` - For saving module metadata
- `dto/record-generation.dto.ts` - For recording operations

**Interfaces**:
- `SaveModuleMetadataDto` - Complete module data
- `SaveFieldMetadataDto` - Field data with validations
- `SaveValidationMetadataDto` - Validation rules
- `RecordGenerationDto` - Operation tracking

---

## ✅ Acceptance Criteria

- [x] CliMetadataRepository implemented (28 methods)
- [x] CliMetadataService implemented (11 methods)
- [x] CliMetadataController implemented (7 endpoints)
- [x] DTOs created with Zod validation
- [x] Module integrated in app.module.ts
- [x] Type-check passes
- [x] Lint passes (CLI metadata files)
- [x] Build succeeds
- [x] Error handling (NotFoundException, ConflictException)
- [x] Proper TypeScript types (no any)

---

## 🧪 Testing

### Type Check
```bash
cd backend
npm run type-check
```
**Expected**: ✓ No errors

### Lint Check
```bash
cd backend
npm run lint -- src/core/cli-metadata/**/*.ts
```
**Expected**: ✓ No errors in CLI metadata files

### Build Test
```bash
cd backend
npm run build
```
**Expected**: ✓ Build succeeds

---

## 📚 Documentation References

- **CLI-ADVANCED-SPEC.md** Section 2, 3, 4 - Metadata service & API endpoints
- **TECHNICAL-ARCHITECTURE.md** Section 3.1 - Backend structure
- **AI-RULES.md** Section 5 - Backend coding rules

---

## 🔗 Related Tasks

- **Previous**: Task 5.3.1 - CLI Metadata Database Schema (COMPLETE)
- **Next**: Task 5.3.3 - Enhanced Field Parser
- **Integrates with**: CLI generators (Task 5.2, 5.3)

---

## 📊 Service Features

### 1. Complete Metadata Management
- Save module metadata (module + fields + validations)
- Query metadata (modules, fields, validations)
- Delete & restore modules
- Track generation history

### 2. Business Logic
- Duplicate module prevention
- Soft delete support
- Automatic history recording
- Statistics calculation

### 3. API Endpoints
- RESTful API design
- JWT authentication
- Type-safe responses
- Error handling

### 4. Type Safety
- Strong TypeScript types
- Drizzle ORM integration
- No `any` types (except enum assertions)
- Proper error types

---

## 🎁 Benefits

### For CLI
- ✅ Easy to save metadata after generation
- ✅ Track all operations
- ✅ Delete & undo support ready
- ✅ History for debugging

### For Frontend
- ✅ API to query module metadata
- ✅ Get field definitions with validations
- ✅ Auto-generate forms from metadata
- ✅ Display generation history

### For Project
- ✅ Complete audit trail
- ✅ Module discovery (list all generated)
- ✅ Statistics dashboard ready
- ✅ Foundation for advanced features

---

## 🚀 Example Usage

### Save Module Metadata (from CLI)
```typescript
await metadataService.saveModuleMetadata({
  name: 'products',
  displayName: 'Products',
  hasTenantIsolation: true,
  hasSoftDelete: true,
  hasAudit: true,
  generatedFiles: ['products.module.ts', 'products.controller.ts', ...],
  cliCommand: 'cms generate crud products --fields="..." --tenant',
  generatorVersion: '0.1.0',
  fields: [
    {
      name: 'name',
      displayName: 'Product Name',
      fieldType: 'string',
      inputType: 'text',
      isRequired: true,
      length: 255,
      validations: [
        { validationType: 'required', errorMessage: 'Name is required' },
        { validationType: 'maxLength', validationParams: { max: 255 } },
      ],
      ...
    }
  ],
});
```

### Query Metadata (from API)
```bash
# Get all modules
GET /api/cli/metadata/modules

# Get module with fields
GET /api/cli/metadata/modules/products/fields

# Get generation history
GET /api/cli/metadata/history?limit=10
```

### Frontend Auto-Form Generation
```typescript
// Fetch metadata
const response = await fetch('/api/cli/metadata/modules/products/fields');
const { module } = await response.json();

// Generate form from metadata
module.fields.forEach(field => {
  // Create input based on field.inputType
  // Apply validations from field.validations
  // Show/hide based on field.showInForm
});
```

---

## ⏱️ Time Tracking

**Estimated**: 4 hours  
**Actual**: ___ hours  

**Breakdown**:
- Repository implementation: 1.5 hours
- Service implementation: 1.5 hours
- Controller & DTOs: 0.5 hours
- Testing & fixes: 0.5 hours

---

## ✅ Definition of Done

- [x] CliMetadataModule created
- [x] Repository with 28 methods implemented
- [x] Service with 11 methods implemented
- [x] Controller with 7 endpoints implemented
- [x] DTOs with Zod validation
- [x] Integrated in app.module.ts
- [x] Type-check passes
- [x] Lint passes (CLI files)
- [x] Build succeeds
- [x] Error handling working
- [x] Documentation complete
- [x] Task committed to Git
- [x] Issue closed

---

**Created**: 2024-01-08  
**Sprint**: Week 10-11  
**Phase**: CLI Builder Tool Development
