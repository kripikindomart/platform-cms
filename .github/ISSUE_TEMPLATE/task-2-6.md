# Task 2.6: Base Repository with Soft Delete

**Prioritas**: P1 - HIGH  
**Estimasi Waktu**: 4 jam  
**Dependencies**: Task 2.2, 2.4  
**Status**: Belum Dimulai

---

## Tujuan Task

Implement reusable base repository pattern dengan soft delete support untuk reduce code duplication dan ensure consistency across all repositories.

---

## Yang Akan Dikerjakan

### 1. Struktur File

File yang akan dibuat:

```
backend/src/common/database/
├── base.repository.ts              (baru) - Abstract base repository class
└── repository.interface.ts         (baru) - Repository interfaces
```

### 2. Base Repository Features

**Core Features**:
- Auto soft delete on `delete()` method
- Auto filter deleted records on `find*()` methods
- Restore functionality untuk undelete records
- Tenant-aware queries (automatic schema switching)
- Audit fields auto-populated (created_by, updated_by, deleted_by)
- Type-safe generic implementation

**Methods to Implement**:
- `findAll(filters?)` - Find all active records
- `findById(id)` - Find by ID (exclude deleted)
- `create(data, userId)` - Create record dengan audit fields
- `update(id, data, userId)` - Update record dengan audit fields
- `softDelete(id, userId)` - Soft delete record
- `restore(id)` - Restore soft deleted record
- `hardDelete(id)` - Hard delete (use with caution!)
- `findDeleted()` - Find only deleted records
- `count(filters?)` - Count active records

### 3. Repository Interface

Define standard repository interface:

```typescript
export interface IRepository<T> {
  findAll(filters?: any): Promise<T[]>;
  findById(id: number): Promise<T | null>;
  create(data: Partial<T>, userId: number): Promise<T>;
  update(id: number, data: Partial<T>, userId: number): Promise<T>;
  softDelete(id: number, userId: number): Promise<void>;
  restore(id: number): Promise<void>;
  hardDelete(id: number): Promise<void>;
  findDeleted(): Promise<T[]>;
  count(filters?: any): Promise<number>;
}
```

### 4. Integration dengan Existing Code

**Refactor TenantsRepository**:
- Extend dari BaseRepository
- Remove duplicate code
- Keep tenant-specific methods

**Example Usage**:
```typescript
@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, users, tenantContext);
  }

  // Add custom methods specific to users
  async findByEmail(email: string): Promise<User | null> {
    // Custom implementation
  }
}
```

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] File `base.repository.ts` sudah dibuat
- [ ] File `repository.interface.ts` sudah dibuat
- [ ] BaseRepository dengan 9 core methods implemented
- [ ] IRepository interface defined
- [ ] Soft delete automatic pada delete operations
- [ ] Queries auto-filter deleted records
- [ ] Restore functionality working
- [ ] Tenant-aware queries (automatic schema switching)
- [ ] Audit fields auto-populated
- [ ] Type-safe generic implementation
- [ ] TenantsRepository refactored (optional - can be done later)
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Unit tests untuk BaseRepository (recommended)

---

## Cara Testing

### 1. Type Check & Lint

```bash
cd backend
npm run type-check
npm run lint
```

Expected: No errors

### 2. Unit Tests untuk BaseRepository

Create `base.repository.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { BaseRepository } from './base.repository';
import { TenantContextService } from '../context/tenant-context.service';

describe('BaseRepository', () => {
  let repository: BaseRepository<any>;
  let mockDb: any;
  let mockTenantContext: any;

  beforeEach(async () => {
    mockDb = {
      execute: jest.fn(),
    };

    mockTenantContext = {
      getSchemaName: jest.fn().mockReturnValue('tenant_test'),
    };

    // Create concrete implementation for testing
    class TestRepository extends BaseRepository<any> {
      constructor(db: any, tenantContext: TenantContextService) {
        super(db, {} as any, tenantContext);
      }
    }

    repository = new TestRepository(mockDb, mockTenantContext);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should use tenant schema name', () => {
    repository.findAll();
    expect(mockTenantContext.getSchemaName).toHaveBeenCalled();
  });

  // Add more tests...
});
```

Run:
```bash
npm run test base.repository.spec.ts
```

Expected: All tests pass

### 3. Integration Test dengan Real Repository

Test dengan existing repository (e.g., roles repository):

```typescript
// Create test repository
@Injectable()
export class TestRolesRepository extends BaseRepository<Role> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, roles, tenantContext);
  }
}

// Test soft delete
const role = await rolesRepo.create({ name: 'test' }, userId);
await rolesRepo.softDelete(role.id, userId);
const found = await rolesRepo.findById(role.id);
expect(found).toBeNull(); // Soft deleted records not found

// Test restore
await rolesRepo.restore(role.id);
const restored = await rolesRepo.findById(role.id);
expect(restored).toBeDefined();

// Test findDeleted
const deleted = await rolesRepo.findDeleted();
expect(deleted).toHaveLength(0); // No deleted after restore
```

---

## Implementasi Notes

### Tenant-Aware Query Pattern

Drizzle ORM tidak support dynamic schema switching via `withSchema()` pada runtime. Kita perlu use raw SQL atau set search_path:

**Option 1: Set search_path per query**
```typescript
async findAll(): Promise<T[]> {
  const schemaName = this.tenantContext.getSchemaName();
  
  // Set search_path
  await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));
  
  // Run query
  const results = await this.db
    .select()
    .from(this.table)
    .where(isNull(this.table.deleted_at));
  
  // Reset search_path
  await this.db.execute(sql.raw('RESET search_path'));
  
  return results;
}
```

**Option 2: Use transaction wrapper**
```typescript
async withTenantSchema<R>(fn: () => Promise<R>): Promise<R> {
  const schemaName = this.tenantContext.getSchemaName();
  
  await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));
  
  try {
    return await fn();
  } finally {
    await this.db.execute(sql.raw('RESET search_path'));
  }
}

async findAll(): Promise<T[]> {
  return this.withTenantSchema(() =>
    this.db
      .select()
      .from(this.table)
      .where(isNull(this.table.deleted_at))
  );
}
```

**Recommended**: Option 2 - Cleaner code, auto-reset search_path

### Generic Type Constraints

Ensure type safety dengan proper constraints:

```typescript
export interface SoftDeletable {
  deleted_at: Date | null;
  deleted_by: number | null;
}

export interface Auditable {
  created_at: Date;
  updated_at: Date;
  created_by: number | null;
  updated_by: number | null;
}

export type RepositoryEntity = SoftDeletable & Auditable & { id: number };

export abstract class BaseRepository<T extends RepositoryEntity> {
  // Implementation
}
```

### Error Handling

Add proper error handling:

```typescript
async findById(id: number): Promise<T | null> {
  try {
    return await this.withTenantSchema(async () => {
      const results = await this.db
        .select()
        .from(this.table)
        .where(and(eq(this.table.id, id), isNull(this.table.deleted_at)))
        .limit(1);

      return results[0] || null;
    });
  } catch (error) {
    this.logger.error(`Failed to find record by ID ${id}:`, error);
    throw error;
  }
}
```

### Pagination Support

Add pagination helper:

```typescript
interface PaginationOptions {
  page: number;
  pageSize: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async findAllPaginated(
  filters?: any,
  options?: PaginationOptions,
): Promise<PaginatedResult<T>> {
  const { page = 1, pageSize = 10 } = options || {};
  const offset = (page - 1) * pageSize;

  return this.withTenantSchema(async () => {
    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(this.table)
      .where(isNull(this.table.deleted_at));

    // Get paginated data
    const data = await this.db
      .select()
      .from(this.table)
      .where(isNull(this.table.deleted_at))
      .limit(pageSize)
      .offset(offset);

    return {
      data,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  });
}
```

---

## Security Notes

1. **Hard Delete Protection**: Hard delete should be restricted atau require special permission
2. **Audit Trail**: Always track who performed the action (userId required)
3. **Tenant Isolation**: Ensure search_path is always set correctly
4. **SQL Injection**: Use parameterized queries, never string concatenation
5. **Restore Validation**: Consider adding restore validation (e.g., only recent deletes)

---

## Documentation References

- AI-RULES.md Section 5.7 - Soft delete mandatory
- TECHNICAL-ARCHITECTURE.md Section 4 - Multi-tenancy
- ERD-DATABASE.md - Database schema reference

---

## Next Task

Setelah task ini selesai, WEEK 3-4 COMPLETE! Lanjut ke:
**Week 5-7: Authentication & Authorization** - Implement JWT authentication

---

## Output Expected

Setelah task selesai:
1. BaseRepository abstract class implemented
2. IRepository interface defined
3. 9 core methods working (findAll, findById, create, update, softDelete, restore, hardDelete, findDeleted, count)
4. Tenant-aware queries dengan automatic schema switching
5. Audit fields auto-populated
6. Type-safe generic implementation
7. Clean code dengan transaction wrapper
8. Error handling implemented
9. Type-check passing
10. Lint passing
11. Ready to use dalam semua repositories

**Benefits**:
- Reduce code duplication (DRY principle)
- Consistent soft delete behavior
- Automatic audit trail
- Tenant isolation guaranteed
- Type-safe operations
- Easy to extend dengan custom methods

