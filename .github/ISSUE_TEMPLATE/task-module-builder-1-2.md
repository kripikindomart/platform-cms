---
name: Task Module Builder 1.2
about: Create Drizzle Entities untuk Module Generator
title: '[TASK 1.2] Create Drizzle Entities untuk Module Generator'
labels: ['backend', 'P0-critical', 'enhancement']
assignees: ''
---

## Task 1.2: Create Drizzle Entities untuk Module Generator

**Sprint**: Week 1 (Days 1-2) - Backend Foundation  
**Priority**: P0 - CRITICAL  
**Estimated Time**: 1 jam  
**Dependencies**: Task 1.1 (Database Schema)  
**Status**: [PENDING] BELUM DIMULAI

---

## Objective

Membuat Drizzle entity files untuk `generated_modules` dan `generated_module_fields` di module `module-generator`. Entity files ini akan digunakan oleh repository layer untuk database operations dengan type-safe approach.

---

## Goals

1. Create 2 entity files di folder `module-generator/entities/`
2. Re-export dari schema files yang sudah dibuat di Task 1.1
3. Verify type inference working
4. Pastikan compatible dengan repository layer

---

## Deliverables

### 1. Entity File untuk Generated Modules
**File**: `backend/src/modules/module-generator/entities/generated-module.entity.ts`

**What to build**:
- [ ] Import dan re-export dari schema file
- [ ] Export types (GeneratedModule, NewGeneratedModule)
- [ ] Add JSDoc comments untuk documentation
- [ ] Consistent dengan pattern entity lain

**Code Structure**:
```typescript
/**
 * Generated Module Entity
 * Re-export dari tenant schema untuk use di module-generator service/repository
 */
export { 
  generatedModules,
  type GeneratedModule,
  type NewGeneratedModule,
} from '../../../database/schema/tenant/generated-modules.schema';
```

---

### 2. Entity File untuk Generated Module Fields
**File**: `backend/src/modules/module-generator/entities/generated-module-field.entity.ts`

**What to build**:
- [ ] Import dan re-export dari schema file
- [ ] Export types (GeneratedModuleField, NewGeneratedModuleField)
- [ ] Add JSDoc comments untuk documentation
- [ ] Consistent dengan pattern entity lain

**Code Structure**:
```typescript
/**
 * Generated Module Field Entity
 * Re-export dari tenant schema untuk use di module-generator service/repository
 */
export { 
  generatedModuleFields,
  type GeneratedModuleField,
  type NewGeneratedModuleField,
} from '../../../database/schema/tenant/generated-module-fields.schema';
```

---

### 3. Create entities/ Directory
**Directory**: `backend/src/modules/module-generator/entities/`

**What to do**:
- [ ] Create folder `entities/` di module-generator
- [ ] Place 2 entity files di folder ini
- [ ] Follow standard project structure

---

## Acceptance Criteria

### File Structure
- [ ] Directory `backend/src/modules/module-generator/entities/` exists
- [ ] File `generated-module.entity.ts` created
- [ ] File `generated-module-field.entity.ts` created
- [ ] Files follow naming convention (kebab-case)

### Code Quality
- [ ] Imports correct dari schema files
- [ ] Types exported correctly
- [ ] JSDoc comments present
- [ ] No TypeScript errors

### Type Inference
- [ ] `GeneratedModule` type available
- [ ] `NewGeneratedModule` type available
- [ ] `GeneratedModuleField` type available
- [ ] `NewGeneratedModuleField` type available
- [ ] Type-check passes: `npm run type-check`

### Integration
- [ ] Entity dapat di-import dari repository
- [ ] Compatible dengan Drizzle ORM operations
- [ ] Consistent dengan existing entity pattern

---

## Testing Checklist

### Test 1: Create Directory Structure
```bash
cd backend/src/modules
mkdir -p module-generator/entities
ls -la module-generator/
```

**Expected Result**: Directory `entities/` exists

---

### Test 2: Type-Check Passes
```bash
cd backend
npm run type-check
```

**Expected Result**: No TypeScript errors, compilation successful

---

### Test 3: Verify Type Inference
**File**: `test-types.ts` (temporary test file)
```typescript
import { 
  GeneratedModule, 
  NewGeneratedModule 
} from './entities/generated-module.entity';

// Should infer types correctly
const newModule: NewGeneratedModule = {
  tenantId: 1,
  moduleName: 'test',
  displayName: 'Test',
  createdBy: 1,
};

// Should have all properties
const module: GeneratedModule = {
  id: 1,
  tenantId: 1,
  moduleName: 'test',
  displayName: 'Test',
  // ... all fields should be available
};
```

**Expected Result**: No type errors, autocomplete working

---

### Test 4: Verify Imports
```bash
cd backend/src/modules/module-generator/entities
cat generated-module.entity.ts
cat generated-module-field.entity.ts
```

**Expected Result**: Files exist dan contain correct exports

---

## Files to Create/Modify

### 1. `backend/src/modules/module-generator/entities/generated-module.entity.ts`
**Changes**: Create new file

**Content**:
- Import dari `../../../database/schema/tenant/generated-modules.schema`
- Re-export `generatedModules` table
- Re-export `GeneratedModule` dan `NewGeneratedModule` types
- Add JSDoc comment explaining purpose

---

### 2. `backend/src/modules/module-generator/entities/generated-module-field.entity.ts`
**Changes**: Create new file

**Content**:
- Import dari `../../../database/schema/tenant/generated-module-fields.schema`
- Re-export `generatedModuleFields` table
- Re-export `GeneratedModuleField` dan `NewGeneratedModuleField` types
- Add JSDoc comment explaining purpose

---

## Common Pitfalls

### 1. Import Path Salah
[X] **Wrong**: Relative path salah
```typescript
import { generatedModules } from '../../schema/generated-modules.schema';
```

[OK] **Correct**: Path lengkap dari root module
```typescript
import { generatedModules } from '../../../database/schema/tenant/generated-modules.schema';
```

---

### 2. Type Export Syntax
[X] **Wrong**: Export tanpa `type` keyword
```typescript
export { GeneratedModule } from './schema';
```

[OK] **Correct**: Gunakan `type` keyword untuk type-only export
```typescript
export { type GeneratedModule } from './schema';
```

---

### 3. Naming Inconsistency
[X] **Wrong**: Naming tidak match schema
```typescript
// Schema: generatedModules
// Entity file: generated-modules.entity.ts ❌ (dash di tempat salah)
```

[OK] **Correct**: Naming consistent
```typescript
// Schema: generatedModules
// Entity file: generated-module.entity.ts ✅ (singular form)
```

---

## Documentation References

- Drizzle ORM Types: https://orm.drizzle.team/docs/goodies#type-api
- Platform CMS Rules: `.kiro/skills/platform-cms-rules.md` - Part 2.3 (Entity Structure)
- Task 1.1: `.github/ISSUE_TEMPLATE/task-module-builder-1-1.md` - Database Schema
- Design Doc: `.kiro/specs/crud-builder-ui/design.md` - Section 2 (Database Design)

---

## Success Criteria

**DONE when**:
- [ ] Directory structure created
- [ ] 2 entity files created
- [ ] All imports correct
- [ ] All types exported
- [ ] Type-check passes
- [ ] JSDoc comments added
- [ ] Consistent dengan pattern existing entities
- [ ] Ready untuk digunakan di repository layer

---

## Notes for Implementation

**Time Estimate Breakdown**:
- Create directory: 2 min
- Create entity files: 15 min
- Add JSDoc comments: 10 min
- Test type-check: 5 min
- Verify imports: 5 min
- Documentation: 5 min

**Why Re-export Pattern?**:
- Schema files di `database/schema/tenant/` adalah source of truth
- Entity files di `modules/*/entities/` untuk convenience dan encapsulation
- Repository layer import dari entities (bukan langsung dari schema)
- Easier refactoring dan module isolation

**Pattern Comparison**:
```typescript
// Option A: Direct import dari schema (AVOID)
import { generatedModules } from '../../../database/schema/tenant/generated-modules.schema';

// Option B: Import dari entity (RECOMMENDED)
import { generatedModules } from './entities/generated-module.entity';
```

**What NOT to implement** (defer to later):
- [X] Business logic - Task 1.3 (Service)
- [X] Database operations - Task 1.5 (Repository)
- [X] API endpoints - Phase 2
- [X] Validation logic - Task 1.4 (DTOs)

---

**Created**: 2026-07-22  
**Sprint**: Week 1, Days 1-2  
**Phase**: Phase 1 - Backend Foundation  
**Related Tasks**: Task 1.1 (Database Schema), Task 1.3 (Module Structure), Task 1.5 (Repository)
