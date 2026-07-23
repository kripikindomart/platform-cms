---
name: Task Module Builder 1.3
about: Create Module Generator Module Structure
title: '[TASK 1.3] Create Module Generator Module Structure'
labels: ['backend', 'P0-critical', 'enhancement']
assignees: ''
---

## Task 1.3: Create Module Generator Module Structure

**Sprint**: Week 1 (Days 1-2) - Backend Foundation  
**Priority**: P0 - CRITICAL  
**Estimated Time**: 1 jam  
**Dependencies**: Task 1.2 (Entities sudah dibuat)  
**Status**: [PENDING] BELUM DIMULAI

---

## Objective

Membuat structure lengkap untuk Module Generator module dengan NestJS pattern. Ini termasuk module definition, controller skeleton, service skeleton, dan repository untuk database operations. Module ini akan menjadi foundation untuk CRUD Builder UI feature.

---

## Goals

1. Create module definition dengan dependency injection setup
2. Create controller skeleton dengan route handlers
3. Create service skeleton dengan business logic placeholder
4. Create repository untuk database operations
5. Register module di app.module.ts
6. Verify app can compile dan start

---

## Deliverables

### 1. Module Definition
**File**: `backend/src/modules/module-generator/module-generator.module.ts`

**What to build**:
- [ ] Import DatabaseModule untuk Drizzle access
- [ ] Import CaslModule untuk permissions
- [ ] Register controller
- [ ] Register service dan repository sebagai providers
- [ ] Export service untuk use di modules lain

**Code Structure**:
```typescript
import { Module } from '@nestjs/common';
import { ModuleGeneratorController } from './module-generator.controller';
import { ModuleGeneratorService } from './module-generator.service';
import { ModuleMetadataRepository } from './module-metadata.repository';
import { DatabaseModule } from '../../database/database.module';
import { CaslModule } from '../../core/casl/casl.module';

@Module({
  imports: [DatabaseModule, CaslModule],
  controllers: [ModuleGeneratorController],
  providers: [
    ModuleGeneratorService,
    ModuleMetadataRepository,
  ],
  exports: [ModuleGeneratorService, ModuleMetadataRepository],
})
export class ModuleGeneratorModule {}
```

---

### 2. Controller Skeleton
**File**: `backend/src/modules/module-generator/module-generator.controller.ts`

**What to build**:
- [ ] Setup route `/api/module-generator`
- [ ] Add JWT auth guard dan CASL guard
- [ ] Create placeholder endpoints (GET, POST, PATCH, DELETE)
- [ ] Add Swagger decorators
- [ ] Use CurrentUser decorator untuk audit

**Endpoints to create** (skeleton only):
```typescript
// GET /api/module-generator - List all generated modules
// GET /api/module-generator/:id - Get module by ID
// POST /api/module-generator - Generate new module
// PATCH /api/module-generator/:id - Update module metadata
// DELETE /api/module-generator/:id - Delete module
```

**Code Pattern**:
```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ModuleGeneratorService } from './module-generator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaslGuard } from '../../core/casl/casl.guard';
import { CheckPolicies } from '../../common/decorators/check-policies.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('module-generator')
@Controller('module-generator')
@UseGuards(JwtAuthGuard, CaslGuard)
export class ModuleGeneratorController {
  constructor(private readonly service: ModuleGeneratorService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'module_generator'))
  @ApiOperation({ summary: 'Get all generated modules' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // ... more endpoints (skeleton only)
}
```

---

### 3. Service Skeleton
**File**: `backend/src/modules/module-generator/module-generator.service.ts`

**What to build**:
- [ ] Inject ModuleMetadataRepository
- [ ] Create placeholder methods (findAll, findById, create, update, delete)
- [ ] Add JSDoc comments
- [ ] Add TODO comments untuk future implementation

**Code Pattern**:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { ModuleMetadataRepository } from './module-metadata.repository';

/**
 * Module Generator Service
 * Handles business logic untuk CRUD Builder UI
 */
@Injectable()
export class ModuleGeneratorService {
  constructor(
    private readonly repository: ModuleMetadataRepository,
  ) {}

  /**
   * Find all generated modules with pagination
   * TODO: Implement query filtering dan sorting
   */
  async findAll(query: any): Promise<any> {
    return this.repository.findAll(query);
  }

  /**
   * Find module by ID
   * TODO: Include fields dalam response
   */
  async findById(id: number): Promise<any> {
    const module = await this.repository.findById(id);
    if (!module) {
      throw new NotFoundException(`Module dengan ID ${id} tidak ditemukan`);
    }
    return module;
  }

  // TODO: Implement create, update, delete methods
}
```

---

### 4. Repository
**File**: `backend/src/modules/module-generator/module-metadata.repository.ts`

**What to build**:
- [ ] Inject Drizzle database
- [ ] Inject TenantContextService
- [ ] Implement CRUD methods untuk generated_modules table
- [ ] Support soft delete filtering
- [ ] Support tenant isolation

**Code Pattern**:
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and, isNull, desc } from 'drizzle-orm';
import { TenantContextService } from '../../core/tenant-context/tenant-context.service';
import { generatedModules, type GeneratedModule } from './entities/generated-module.entity';

/**
 * Repository untuk Module Generator Metadata
 * Handles database operations untuk generated_modules table
 */
@Injectable()
export class ModuleMetadataRepository {
  constructor(
    @Inject('DRIZZLE') private readonly db: NodePgDatabase<any>,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Find all modules dengan pagination dan filtering
   * Tenant-isolated dan soft delete aware
   */
  async findAll(query: any): Promise<{
    data: GeneratedModule[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50 } = query;
    const offset = (page - 1) * limit;
    const tenantId = this.tenantContext.getTenantId();

    // Get schema for current tenant
    const schema = this.getTenantSchema();

    // Build WHERE conditions
    const conditions = [
      eq(schema.generatedModules.tenantId, tenantId),
      isNull(schema.generatedModules.deletedAt), // Soft delete filter
    ];

    const whereClause = and(...conditions);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.generatedModules)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    // Get data with pagination
    const data = await this.db
      .select()
      .from(schema.generatedModules)
      .where(whereClause)
      .orderBy(desc(schema.generatedModules.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find module by ID
   */
  async findById(id: number): Promise<GeneratedModule | null> {
    const tenantId = this.tenantContext.getTenantId();
    const schema = this.getTenantSchema();

    const results = await this.db
      .select()
      .from(schema.generatedModules)
      .where(
        and(
          eq(schema.generatedModules.id, id),
          eq(schema.generatedModules.tenantId, tenantId),
          isNull(schema.generatedModules.deletedAt),
        ),
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   * Get tenant schema
   */
  private getTenantSchema() {
    const schemaName = this.tenantContext.getSchemaName();
    return {
      generatedModules,
      // Will add generatedModuleFields later
    };
  }
}
```

---

### 5. Register Module di App
**File**: `backend/src/app.module.ts`

**What to do**:
- [ ] Import ModuleGeneratorModule
- [ ] Add ke imports array

**Code Change**:
```typescript
// Add import
import { ModuleGeneratorModule } from './modules/module-generator/module-generator.module';

@Module({
  imports: [
    // ... existing imports
    ModuleGeneratorModule, // Add this
  ],
  // ...
})
```

---

## Acceptance Criteria

### Module Structure
- [ ] Directory `backend/src/modules/module-generator/` exists
- [ ] File `module-generator.module.ts` created
- [ ] File `module-generator.controller.ts` created
- [ ] File `module-generator.service.ts` created
- [ ] File `module-metadata.repository.ts` created
- [ ] Files follow naming convention (kebab-case)

### Module Registration
- [ ] Module imported di app.module.ts
- [ ] Dependency injection configured correctly
- [ ] DatabaseModule imported
- [ ] CaslModule imported

### Code Quality
- [ ] TypeScript type-check passes
- [ ] ESLint passes
- [ ] Swagger decorators present
- [ ] JSDoc comments present

### Application Startup
- [ ] App compiles without errors
- [ ] App starts successfully: `npm run start:dev`
- [ ] No runtime errors during startup
- [ ] Swagger docs include new endpoints

---

## Testing Checklist

### Test 1: Create Directory Structure
```bash
cd backend/src/modules
mkdir -p module-generator
ls -la module-generator/
```

**Expected Result**: Directory created

---

### Test 2: Type-Check Passes
```bash
cd backend
npm run type-check
```

**Expected Result**: No TypeScript errors

---

### Test 3: Lint Passes
```bash
cd backend
npm run lint
```

**Expected Result**: No linting errors

---

### Test 4: App Starts Successfully
```bash
cd backend
npm run start:dev
```

**Expected Result**: 
- App starts without errors
- Log shows "Application is running on: http://localhost:3000"
- No dependency injection errors

---

### Test 5: Swagger Documentation
```bash
# Open browser
http://localhost:3000/api
```

**Expected Result**: 
- Swagger UI loads
- "module-generator" tag appears
- Endpoints visible (GET, POST, PATCH, DELETE)

---

### Test 6: Test API Endpoint (skeleton)
```bash
curl -X GET http://localhost:3000/api/module-generator \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result**: Empty array atau paginated response (skeleton)

---

## Files to Create/Modify

### 1. `backend/src/modules/module-generator/module-generator.module.ts`
**Changes**: Create new file
**Lines**: ~20

### 2. `backend/src/modules/module-generator/module-generator.controller.ts`
**Changes**: Create new file
**Lines**: ~80 (skeleton dengan 5 endpoints)

### 3. `backend/src/modules/module-generator/module-generator.service.ts`
**Changes**: Create new file
**Lines**: ~50 (skeleton methods)

### 4. `backend/src/modules/module-generator/module-metadata.repository.ts`
**Changes**: Create new file
**Lines**: ~120 (full implementation)

### 5. `backend/src/app.module.ts`
**Changes**: Add import dan register module
**Lines to modify**: ~2-3 lines

---

## Common Pitfalls

### 1. Missing Tenant Context Injection
[X] **Wrong**: Tidak inject TenantContextService
```typescript
constructor(@Inject('DRIZZLE') private db: NodePgDatabase) {}
```

[OK] **Correct**: Inject TenantContextService
```typescript
constructor(
  @Inject('DRIZZLE') private db: NodePgDatabase,
  private readonly tenantContext: TenantContextService,
) {}
```

---

### 2. Forgot Soft Delete Filter
[X] **Wrong**: Query tanpa filter soft delete
```typescript
await db.select().from(generatedModules);
```

[OK] **Correct**: Selalu filter deleted_at
```typescript
await db.select().from(generatedModules)
  .where(isNull(generatedModules.deletedAt));
```

---

### 3. Missing Tenant Isolation
[X] **Wrong**: Query tanpa tenant filter
```typescript
await db.select().from(generatedModules)
  .where(isNull(generatedModules.deletedAt));
```

[OK] **Correct**: Selalu filter by tenant_id
```typescript
await db.select().from(generatedModules)
  .where(and(
    eq(generatedModules.tenantId, tenantId),
    isNull(generatedModules.deletedAt)
  ));
```

---

### 4. Controller Route Path
[X] **Wrong**: Path dengan underscore
```typescript
@Controller('module_generator')
```

[OK] **Correct**: Path dengan dash
```typescript
@Controller('module-generator')
```

---

## Documentation References

- NestJS Modules: https://docs.nestjs.com/modules
- Dependency Injection: https://docs.nestjs.com/fundamentals/custom-providers
- Platform CMS Rules: `.kiro/skills/platform-cms-rules.md` - Part 2 (Backend Patterns)
- Task 1.2: Entities sudah dibuat
- Design Doc: `.kiro/specs/crud-builder-ui/design.md` - Section 3 (Backend API)

---

## Success Criteria

**DONE when**:
- [ ] All files created
- [ ] Module registered di app.module.ts
- [ ] Type-check passes
- [ ] Lint passes
- [ ] App starts successfully
- [ ] No dependency injection errors
- [ ] Swagger docs show endpoints
- [ ] Repository methods implemented
- [ ] Soft delete filtering present
- [ ] Tenant isolation present

---

## Notes for Implementation

**Time Estimate Breakdown**:
- Module definition: 10 min
- Controller skeleton: 15 min
- Service skeleton: 10 min
- Repository implementation: 20 min
- Register di app.module: 2 min
- Testing & verification: 10 min

**Implementation Order**:
1. Create module definition FIRST (with minimal imports)
2. Create repository SECOND (database layer)
3. Create service THIRD (business logic)
4. Create controller FOURTH (API layer)
5. Register di app.module LAST
6. Test startup

**Testing Strategy**:
- Type-check after each file
- Test app startup after module registration
- Use Postman/curl untuk test endpoints
- Check Swagger docs

**What NOT to implement** (defer to later):
- [X] Full CRUD logic - Task 1.4 (DTOs) dan Task 1.5 (Complete Service)
- [X] Code generation - Phase 2
- [X] Frontend UI - Phase 3
- [X] Validation rules - Task 1.4 (DTOs)

---

**Created**: 2026-07-22  
**Sprint**: Week 1, Days 1-2  
**Phase**: Phase 1 - Backend Foundation  
**Related Tasks**: Task 1.2 (Entities), Task 1.4 (DTOs), Task 1.5 (Complete Service)
