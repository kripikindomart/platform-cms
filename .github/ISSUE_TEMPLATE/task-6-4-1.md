---
name: "[TASK 6.4.1] Generate Categories Module"
about: Generate Categories CRUD module menggunakan CLI Enterprise
title: "[TASK 6.4.1] Generate Categories Module"
labels: enhancement, cli-generator, week-12-13
assignees: ''
---

## Deskripsi Task

Generate Categories CRUD module menggunakan CLI Enterprise yang sudah dibangun. Module ini untuk master data categories dengan nested category support.

**Priority**: P1 - HIGH  
**Estimated Time**: 2 hours  
**Week**: 12-13  
**Dependencies**: Task 5.5.1 (CLI Enterprise Phase 3.1 complete)

---

## Objectives

Generate Categories module dengan fitur lengkap:
- CRUD operations (Create, Read, Update, Delete)
- Nested categories support (parent-child relationship)
- Soft delete
- Pagination, filtering, sorting, search
- Tenant isolation

---

## Implementation Steps

### 1. Generate Module menggunakan CLI

```bash
cd cli
npm start generate crud categories -- --fields="parent_id:number,name:string:255!,slug:string:255!,description:text,type:string:50,order:number" --relation="parent_id:categories:many-to-one" --searchable="name,description" --sortable="name,order,created_at" --filterable="type,parent_id" --tenant --soft-delete --audit
```

### 2. Verify Generated Files

Files yang harus ter-generate (9 files):
- [FAIL] `backend/src/modules/categories/categories.module.ts`
- [FAIL] `backend/src/modules/categories/categories.controller.ts`
- [FAIL] `backend/src/modules/categories/categories.service.ts`
- [FAIL] `backend/src/modules/categories/categories.repository.ts`
- [FAIL] `backend/src/modules/categories/entities/category.entity.ts`
- [FAIL] `backend/src/modules/categories/dto/create-category.dto.ts`
- [FAIL] `backend/src/modules/categories/dto/update-category.dto.ts`
- [FAIL] `backend/src/modules/categories/dto/category-response.dto.ts`
- [FAIL] `backend/src/modules/categories/dto/query-category.dto.ts`

### 3. Manual Customizations

#### 3.1 Add Nested Category Logic (categories.service.ts)
```typescript
/**
 * Get category tree (nested structure)
 */
async getCategoryTree(): Promise<CategoryTreeNode[]> {
  const allCategories = await this.repository.findAll();
  return this.buildTree(allCategories);
}

/**
 * Build nested tree from flat list
 */
private buildTree(categories: Category[], parentId: number | null = null): CategoryTreeNode[] {
  return categories
    .filter(cat => cat.parent_id === parentId)
    .map(cat => ({
      ...cat,
      children: this.buildTree(categories, cat.id),
    }));
}

/**
 * Get category path (breadcrumb)
 */
async getCategoryPath(id: number): Promise<Category[]> {
  const category = await this.repository.findById(id);
  if (!category) return [];
  
  const path: Category[] = [category];
  let current = category;
  
  while (current.parent_id) {
    current = await this.repository.findById(current.parent_id);
    if (current) path.unshift(current);
  }
  
  return path;
}
```

#### 3.2 Add Tree Endpoints (categories.controller.ts)
```typescript
@Get('tree')
async getCategoryTree() {
  const tree = await this.service.getCategoryTree();
  return { success: true, data: tree };
}

@Get(':id/path')
async getCategoryPath(@Param('id') id: number) {
  const path = await this.service.getCategoryPath(id);
  return { success: true, data: path };
}
```

### 4. Type-check & Build

```bash
cd backend
npm run type-check
npm run lint
npm run build
```

### 5. Generate Migration

```bash
npm run migration:generate
npm run migration:run
```

### 6. Manual Testing

```bash
# Start backend
npm run start:dev

# Test create root category
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Electronics", "slug": "electronics", "type": "product"}'

# Test create child category
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptops", "slug": "laptops", "parent_id": 1, "type": "product"}'

# Test get tree
curl http://localhost:3000/api/categories/tree \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test get path
curl http://localhost:3000/api/categories/1/path \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test pagination
curl "http://localhost:3000/api/categories?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test filtering by type
curl "http://localhost:3000/api/categories?type=product" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test search
curl "http://localhost:3000/api/categories?search=laptop" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test soft delete
curl -X DELETE http://localhost:3000/api/categories/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test restore
curl -X PATCH http://localhost:3000/api/categories/1/restore \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Acceptance Criteria

### Generation
- [FAIL] CLI command runs without errors
- [FAIL] 9 files generated successfully
- [FAIL] Module auto-imported to app.module.ts
- [FAIL] Entity auto-exported to tenant schema index
- [FAIL] Metadata saved to database

### Code Quality
- [FAIL] Type-check passes (npm run type-check)
- [FAIL] Lint passes (npm run lint)
- [FAIL] Build succeeds (npm run build)
- [FAIL] NO EMOJI in generated files

### Foreign Key
- [FAIL] parent_id field has .references(() => categories.id)
- [FAIL] Foreign key has cascade delete
- [FAIL] Self-referential relation works

### Query Features
- [FAIL] Pagination works (page, limit)
- [FAIL] Filtering by type works
- [FAIL] Filtering by parent_id works
- [FAIL] Search in name & description works (case-insensitive)
- [FAIL] Sorting by name, order, created_at works

### CRUD Operations
- [FAIL] Create root category works
- [FAIL] Create child category works
- [FAIL] Get all categories works
- [FAIL] Get single category works
- [FAIL] Update category works
- [FAIL] Soft delete works (deleted_at set)
- [FAIL] Restore works (deleted_at = null)

### Nested Features
- [FAIL] getCategoryTree() returns nested structure
- [FAIL] getCategoryPath() returns breadcrumb path
- [FAIL] Tree endpoint /categories/tree works
- [FAIL] Path endpoint /categories/:id/path works

### Validation
- [FAIL] name required validation works
- [FAIL] slug required & unique validation works
- [FAIL] parent_id must be valid category ID
- [FAIL] Cannot set self as parent

---

## Testing Checklist

Manual testing (dengan curl/Postman):
- [FAIL] Create root category → returns 201
- [FAIL] Create child category → returns 201
- [FAIL] Get all → returns categories with pagination
- [FAIL] Get tree → returns nested structure
- [FAIL] Get path → returns breadcrumb array
- [FAIL] Update category → returns updated data
- [FAIL] Delete category → soft delete (deleted_at not null)
- [FAIL] Restore category → deleted_at = null
- [FAIL] Filter by type → returns filtered results
- [FAIL] Search by name → returns matching results
- [FAIL] Sort by order → returns sorted results

---

## Common Mistakes to Avoid

1. [INFO] JANGAN gunakan emoji di commit message, code, atau documentation
2. [INFO] JANGAN lupa test pagination, filtering, sorting setelah generate
3. [INFO] JANGAN skip manual testing dengan curl
4. [INFO] JANGAN commit tanpa run type-check dan lint
5. [INFO] JANGAN lupa add nested category logic (tree & path methods)
6. [INFO] Self-referential FK perlu testing khusus (parent-child validation)

---

## Files to Modify

### Generated by CLI (auto):
- `backend/src/modules/categories/` (9 files)
- `backend/src/app.module.ts` (auto-import)
- `backend/src/database/schema/tenant/index.ts` (auto-export)

### Manual customization:
- `backend/src/modules/categories/categories.service.ts` - Add tree & path methods
- `backend/src/modules/categories/categories.controller.ts` - Add tree & path endpoints
- `backend/src/modules/categories/dto/create-category.dto.ts` - Add parent validation

---

## Documentation

After completion, update:
- [FAIL] `docs/AI-PROGRESS-LOG.md` - Add Task 6.4.1 entry
- [FAIL] `docs/ISSUE-TRACKING.md` - Mark issue closed
- [FAIL] README.md - Add categories to module list (if exists)

---

## Time Tracking

**Estimated**: 2 hours  
**Actual**: ___ hours  
**Time Saved**: ~8 hours (manual coding would take 10h)

---

## Notes

- Categories module adalah master data penting untuk content organization
- Nested structure memungkinkan category hierarchy (Electronics > Laptops > Gaming Laptops)
- Type field untuk different category types (product, post, page, etc)
- Order field untuk custom sorting dalam same parent
- Slug harus unique untuk URL-friendly navigation

---

## Related Issues

- #26 - Task 5.5.1: Query Builder (CLOSED)
- Week 12-13: Generate Core Modules via CLI

---

## Definition of Done

- [FAIL] Module ter-generate dengan CLI command
- [FAIL] Type-check, lint, build PASS
- [FAIL] Migration generated & applied
- [FAIL] Manual testing completed (semua endpoint tested)
- [FAIL] Nested category logic implemented
- [FAIL] Tree & path endpoints working
- [FAIL] Documentation updated
- [FAIL] Git commit dengan message format: `feat(categories): Task 6.4.1 - Generate categories module`
- [FAIL] Issue closed dengan verification proof
