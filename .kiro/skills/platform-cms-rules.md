# Platform CMS Development Rules & Guidelines
**AI Skill for Kiro - Platform CMS Project**

---

## CRITICAL RULE: NO EMOJI ANYWHERE

**ABSOLUTE PROHIBITION**:
- NO EMOJI in application code (comments, strings, variables)
- NO EMOJI in GitHub issues (title, body, comments)
- NO EMOJI in commit messages
- NO EMOJI in documentation
- NO EMOJI in API responses
- NO EMOJI in database data

**EXCEPTION**:
- CLI output ONLY (console.log for user feedback)

**REASON**: Emoji causes encoding issues and appears as question marks (�) in some environments.

**USE INSTEAD**:
- [OK], [DONE], [SUCCESS] instead of checkmarks
- [FAIL], [ERROR], [WARNING] instead of X marks
- [INFO], [NOTE], [TIP] instead of info icons
- Plain text bullets: -, *, +

---

## PURPOSE

Skill ini memastikan AI assistant (Kiro) mengikuti aturan development yang konsisten untuk Platform CMS, termasuk:
1. GitHub issue creation workflow
2. Backend coding rules (NestJS + Drizzle ORM)
3. Frontend coding rules (Next.js + shadcn/ui)
4. Testing & verification requirements
5. Git commit & documentation standards

---

## PART 1: GITHUB ISSUE CREATION RULES

### Rule 1.1: Issue WAJIB Dibuat SEBELUM Coding

**WORKFLOW**:
```
1. READ documentation → understand requirement
2. CREATE GitHub issue → describe what to build
3. GET approval/confirmation (if needed)
4. START coding
5. TEST functionality completely
6. CLOSE issue with detailed checklist completion
```

**NEVER**:
- [X] Code first, create issue later
- [X] Create issue without reading existing templates
- [X] Close issue without verifying functionality

### Rule 1.2: Issue Template Structure (MANDATORY)

**Every issue MUST have these sections**:

```markdown
## Task [Number]: [Title]

**Sprint**: [Week X-Y] - [Sprint Name]
**Priority**: P0/P1/P2
**Estimated Time**: X hours
**Dependencies**: [Task A, Task B] or None
**Status**: [PENDING] BELUM DIMULAI / [IN PROGRESS] / [COMPLETE]

---

## Objective

[Clear 2-3 sentence description of WHAT to build and WHY]

---

## Goals

[3-5 bullet points of specific goals]

---

## Deliverables

### 1. [Component/Feature Name]
**File**: `path/to/file.ts`

**What to build**:
- [ ] Item 1
- [ ] Item 2

**Code example** (if applicable):
```typescript
// Show expected structure
```

### 2. [Next Component]
...

---

## Acceptance Criteria

**Template Updates** (if applicable):
- [ ] Criterion 1
- [ ] Criterion 2

**Code Generation**:
- [ ] Generated files correct
- [ ] Type-check passes
- [ ] Lint passes

**Database** (if applicable):
- [ ] Migration generated
- [ ] Foreign keys working

**Testing**:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing complete

---

## Testing Checklist

### Test 1: [Test Name]
```bash
# Command to run test
```

**Expected Result**: [What should happen]

### Test 2: [Test Name]
```bash
# Command
```

**Expected Result**: [What should happen]

---

## Files to Create/Modify

### 1. `path/to/file.ts`
**Changes**: [What changes to make]
**Lines to modify**: ~XX-YY

### 2. `path/to/file2.ts`
**Changes**: [What changes to make]

---

## Common Pitfalls

### 1. [Pitfall Name]
[X] **Wrong**: [Bad example]
[OK] **Correct**: [Good example]

### 2. [Pitfall Name]
**Problem**: [Description]
**Solution**: [How to avoid]

---

## Documentation References

- [Document Name] Section X.Y - [What to find there]
- [External Link] - [Description]

---

## Success Criteria

**DONE when**:
- [ ] All deliverables complete
- [ ] All tests pass
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Documentation updated
- [ ] Git commit created
- [ ] Code reviewed (if team project)

---

## Notes for Implementation

**Time Estimate Breakdown**:
- Part A: Xh
- Part B: Yh
- Testing: Zh

**Testing Priority**:
1. Test most common case FIRST
2. Test edge cases SECOND

**What NOT to implement** (defer to later):
- [X] Feature X - Phase N
- [X] Feature Y - Different task

---

**Created**: YYYY-MM-DD
**Sprint**: Week X-Y
**Phase**: [Phase Name]
**Related Issues**: #XX, #YY
```

### Rule 1.3: Issue Title Format

**Format**: `[TASK X.Y.Z] Short Description - What It Does`

**Examples**:
- [GOOD] `[TASK 5.3.1] CLI Metadata Database Schema`
- [GOOD] `[Phase 2.1] Foreign Key Column Generation`
- [BAD] `Fix bug` (too vague)
- [BAD] `Update code` (not specific)

### Rule 1.4: Issue Labels (if labels exist)

Use consistent labels:
- `task` - Regular development task
- `bug` - Bug fix
- `enhancement` - Feature enhancement
- `cli` - CLI-related work
- `backend` - Backend work
- `frontend` - Frontend work
- `database` - Database changes
- `week-X-Y` - Sprint identifier
- `phase-X` - Phase identifier

### Rule 1.5: Closing Issues - VERIFICATION REQUIRED

**BEFORE closing issue, AI MUST**:

1. **Read issue acceptance criteria**
2. **Verify each checkbox** - actually check functionality, don't assume
3. **Run tests mentioned in issue**
4. **Check type-check, lint, build**
5. **Write closing comment with**:
   - ✅ All checkboxes marked
   - Test results (copy-paste actual output)
   - File locations created/modified
   - Git commit hash
   - Actual time vs estimated time

**Closing Comment Template**:
```markdown
[COMPLETE] **TASK COMPLETE**

## Acceptance Criteria - All Checked

### [Section Name]
- [x] Criterion 1 - VERIFIED: [proof]
- [x] Criterion 2 - VERIFIED: [proof]

## Testing Results
[OK] Type-check: PASS
[OK] Lint: PASS
[OK] Build: PASS
[OK] Test 1: PASS - [describe result]
[OK] Test 2: PASS - [describe result]

## Files Created/Modified
- `path/to/file1.ts` (created)
- `path/to/file2.ts` (modified)

## Verification
**Manual Test**: Tested feature X by doing Y, result Z as expected
**API Test**: `curl ...` returned correct response

**Git Commit**: abc1234
**Time**: X hours (Y% faster/slower than estimated Z hours)
```

---

## PART 2: BACKEND CODING RULES (NestJS)

### Rule 2.1: MANDATORY File Structure

```
backend/src/modules/[module-name]/
├── [module-name].module.ts          # Module definition
├── [module-name].controller.ts      # REST API endpoints
├── [module-name].service.ts         # Business logic
├── [module-name].repository.ts      # Database operations
├── dto/
│   ├── create-[name].dto.ts        # Create DTO
│   ├── update-[name].dto.ts        # Update DTO (partial)
│   ├── query-[name].dto.ts         # Query/filter DTO
│   └── [name]-response.dto.ts      # Response DTO
└── entities/
    └── [name].entity.ts            # Drizzle schema
```

### Rule 2.2: MANDATORY Code Patterns

#### Controller Pattern:
```typescript
@Controller('api/[resource]')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @Get()
  @Permissions('[resource].read.tenant')
  async findAll(@Query() query: QueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  @Permissions('[resource].create.tenant')
  async create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Permissions('[resource].update.tenant')
  async update(@Param('id') id: number, @Body() dto: UpdateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('[resource].delete.tenant')
  async delete(@Param('id') id: number) {
    return this.service.softDelete(id);
  }
}
```

#### Service Pattern:
```typescript
@Injectable()
export class ResourceService {
  constructor(
    private readonly repository: ResourceRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateDto): Promise<ResponseDto> {
    // 1. Validation
    // 2. Business logic
    const entity = await this.repository.create(dto);
    
    // 3. Audit log
    await this.auditService.log('create', 'resource', entity.id);
    
    // 4. Return DTO
    return new ResponseDto(entity);
  }
}
```

#### Repository Pattern:
```typescript
@Injectable()
export class ResourceRepository {
  constructor(
    @Inject('DRIZZLE') private readonly db: DrizzleDB,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(): Promise<Entity[]> {
    const schema = this.tenantContext.getSchemaName();
    return this.db
      .select()
      .from(schema.entities)
      .where(isNull(schema.entities.deleted_at)) // MANDATORY: soft delete filter
      .where(eq(schema.entities.tenant_id, this.tenantContext.getTenantId())); // MANDATORY: tenant filter
  }

  async create(dto: CreateDto): Promise<Entity> {
    const schema = this.tenantContext.getSchemaName();
    const [entity] = await this.db
      .insert(schema.entities)
      .values({
        ...dto,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();
    return entity;
  }

  async softDelete(id: number, deletedBy: number): Promise<void> {
    const schema = this.tenantContext.getSchemaName();
    await this.db
      .update(schema.entities)
      .set({
        deleted_at: new Date(),
        deleted_by: deletedBy,
      })
      .where(eq(schema.entities.id, id));
  }
}
```

### Rule 2.3: MANDATORY Entity Structure (Drizzle)

```typescript
import { pgTable, bigserial, varchar, timestamp, boolean, bigint } from 'drizzle-orm/pg-core';

export const entities = pgTable('table_name', {
  // Primary key
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  // Business fields
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }),
  is_active: boolean('is_active').notNull().default(true),
  
  // MANDATORY: Audit fields
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
  
  // MANDATORY: Soft delete
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
});

export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;
```

### Rule 2.4: Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| File | kebab-case | `user-management.service.ts` |
| Class | PascalCase | `UserManagementService` |
| Method | camelCase | `findUserById()` |
| Variable | camelCase | `userId` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| DB Column | snake_case | `created_at` |
| Interface | PascalCase + I | `IUserRepository` |

### Rule 2.5: Error Messages (BAHASA INDONESIA)

```typescript
// [OK] CORRECT - Indonesian
throw new NotFoundException({
  code: 'USER_NOT_FOUND',
  message: 'User tidak ditemukan',
});

// [X] WRONG - English
throw new NotFoundException('User not found');
```

---

## PART 3: FRONTEND CODING RULES (Next.js)

### Rule 3.1: File Structure (Security-First Paths)

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (private)/
│   ├── portal/page.tsx              # Dashboard (NOT /dashboard)
│   ├── mgmt-users/                  # NOT /users
│   ├── mgmt-roles/                  # NOT /roles
│   ├── sys-audit/                   # NOT /audit
│   └── sys-settings/                # NOT /settings
```

**WHY**: Security through obscurity - harder to guess paths

### Rule 3.2: Component Pattern

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Types
interface ComponentProps {
  prop1: string;
  onAction?: () => void;
}

// 2. Schema (share with backend)
const formSchema = z.object({
  field: z.string().min(1, 'Field wajib diisi'),
});

type FormData = z.infer<typeof formSchema>;

// 3. Component
export function MyComponent({ prop1, onAction }: ComponentProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await apiCall(data);
      toast.success('Berhasil');
      onAction?.();
    } catch (error) {
      toast.error('Gagal');
    } finally {
      setLoading(false);
    }
  };
  
  return <div>Component content</div>;
}
```

### Rule 3.3: State Management Rules

**Local State**: `useState` for component-only state
**Global State**: Zustand for auth, theme, etc
**Server State**: TanStack Query for API data

```typescript
// Zustand store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// TanStack Query
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
}
```

### Rule 3.4: MANDATORY: Loading & Error States

```typescript
function DataComponent() {
  const { data, isLoading, isError, error } = useQuery(...);
  
  if (isLoading) return <Skeleton />; // MANDATORY
  if (isError) return <ErrorState error={error} />; // MANDATORY
  if (!data || data.length === 0) return <EmptyState />; // MANDATORY
  
  return <DataTable data={data} />;
}
```

---

## PART 4: TESTING & VERIFICATION RULES

### Rule 4.1: Before Committing Code

AI MUST run these checks:

```bash
# 1. Type check
cd backend && npm run type-check
cd frontend && npm run type-check

# 2. Lint
cd backend && npm run lint
cd frontend && npm run lint

# 3. Build
cd backend && npm run build
cd frontend && npm run build

# 4. Tests (if exist)
cd backend && npm run test
cd frontend && npm run test
```

**ALL MUST PASS** before committing.

### Rule 4.2: Manual Functionality Testing

For API changes:
```bash
# Test CREATE
curl -X POST http://localhost:3000/api/resource \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"field":"value"}'

# Test READ
curl http://localhost:3000/api/resource

# Test UPDATE
curl -X PATCH http://localhost:3000/api/resource/1 \
  -H "Content-Type: application/json" \
  -d '{"field":"new_value"}'

# Test DELETE
curl -X DELETE http://localhost:3000/api/resource/1
```

### Rule 4.3: Database Verification

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Verify in database
psql -U postgres -d platform_cms -c "\d table_name"
```

---

## PART 5: GIT COMMIT RULES

### Rule 5.1: Commit Message Format

```
type(scope): short description

Longer description (optional)

- Detail 1
- Detail 2

Closes #issue-number
```

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation
- `test` - Tests
- `chore` - Build/config changes

**Examples**:
```bash
git commit -m "feat(cli): Phase 2.1 - Foreign key generation

- Added foreign key references in entity template
- Auto-import related tables
- Support cascade options
- Added Handlebars helper for conditionals

Closes #21"
```

### Rule 5.2: Before Pushing

```bash
# 1. Run all checks
npm run type-check && npm run lint && npm run build

# 2. Commit with proper message
git add .
git commit -m "feat(module): description"

# 3. Push to feature branch (NOT main)
git push origin feature/task-name
```

---

## PART 6: COMMON MISTAKES TO AVOID

### Mistake 1: Skipping Soft Delete
[X] **Wrong**:
```typescript
await db.delete(users).where(eq(users.id, id));
```

[OK] **Correct**:
```typescript
await db.update(users).set({ deleted_at: new Date() }).where(eq(users.id, id));
```

### Mistake 2: Missing Tenant Filter
[X] **Wrong**:
```typescript
await db.select().from(users);
```

[OK] **Correct**:
```typescript
await db.select().from(users)
  .where(eq(users.tenant_id, tenantId))
  .where(isNull(users.deleted_at));
```

### Mistake 3: Hardcoded Strings
[X] **Wrong**:
```typescript
throw new Error('User not found');
```

[OK] **Correct**:
```typescript
throw new NotFoundException({
  code: 'USER_NOT_FOUND',
  message: 'User tidak ditemukan',
});
```

### Mistake 4: No Loading State
[X] **Wrong**:
```typescript
return <div>{data?.name}</div>;
```

[OK] **Correct**:
```typescript
if (isLoading) return <Skeleton />;
if (!data) return <EmptyState />;
return <div>{data.name}</div>;
```

---

## PART 7: DOCUMENTATION RULES

### Rule 7.1: Update Docs After Feature

After completing feature, update:
1. `docs/AI-PROGRESS-LOG.md` - Mark task complete
2. `docs/[RELEVANT-PLAN].md` - Update phase status
3. README (if user-facing change)
4. API-CONTRACT.md (if API change)

### Rule 7.2: Code Comments

```typescript
// [X] BAD - Obvious comment
// Get user by ID
async getUserById(id: number) { }

// [OK] GOOD - Explains WHY
// Use soft delete to preserve audit trail for compliance
async deleteUser(id: number) {
  await this.repository.softDelete(id);
}

// [OK] GOOD - Warns about gotcha
// Note: This runs in transaction to ensure consistency
// DO NOT add await in the middle of operations
async batchUpdate(items: Item[]) { }
```

---

## SUMMARY: AI WORKFLOW

**BEFORE CODING**:
1. [OK] Read docs (BUSINESS-RULES, VALIDATION-RULES, API-CONTRACT, ERD)
2. [OK] Create GitHub issue with proper template
3. [OK] Get confirmation if uncertain

**DURING CODING**:
1. [OK] Follow naming conventions
2. [OK] Use proper patterns (Controller -> Service -> Repository)
3. [OK] ALWAYS soft delete
4. [OK] ALWAYS tenant filter
5. [OK] ALWAYS error messages in Indonesian

**AFTER CODING**:
1. [OK] Run type-check, lint, build
2. [OK] Test manually (curl for APIs)
3. [OK] Verify database (if schema changes)
4. [OK] Update documentation
5. [OK] Close issue with complete verification

**BEFORE PUSHING**:
1. [OK] All checks pass
2. [OK] Commit message proper format
3. [OK] Push to feature branch

---

**Version**: 1.0  
**Last Updated**: 2026-07-10  
**Applies To**: All Platform CMS development tasks
