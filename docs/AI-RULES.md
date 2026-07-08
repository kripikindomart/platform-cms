# AI RULES
# Platform CMS - Core Framework

**Document Version**: 1.0
**Last Updated**: 2024-01-08
**Status**: AI Coding Guidelines
**Reference**: All project documentation
---

## 1. Identitas Proyek

**Nama Proyek**: Platform CMS - Core Framework  
**Tujuan**: Core framework reusable untuk aplikasi enterprise  
**Phase**: MVP Phase 1 (16 minggu)  
**Repository**: git@github.com:kripikindomart/platform-cms.git  
**Email Commit**: asrulanwar16@gmail.com

**Karakteristik Proyek**:
- Multi-tenancy dengan schema-based isolation (PostgreSQL)
- Soft delete MANDATORY untuk semua data krusial
- Security-first (sanitization, validation, audit trail)
- AI-friendly development dengan CLI builder
- Bahasa Indonesia untuk dokumentasi dan UI

---

## 2. Tech Stack

### Backend
- **Framework**: NestJS 10+
- **Language**: TypeScript (strict mode)
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 15+
- **Cache/Session**: Redis 7+ (Memurai untuk Windows)
- **Validation**: Zod schemas
- **Authentication**: JWT (HTTP-only cookies)
- **Authorization**: CASL (Role-Based Access Control)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand + TanStack Query
- **Form**: React Hook Form + Zod
- **Theme**: Dark/Light mode (NO EMOJI)

### Development
- **OS**: Windows 11
- **Package Manager**: npm (BUKAN pnpm/yarn)
- **Node.js**: 20 LTS
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier
- **Git**: Conventional Commits

### Deployment (Production)
- **Container**: Docker
- **Orchestration**: Kubernetes
- **Strategy**: Hybrid (on-premise + cloud backup)

---

## 3. Cara AI Membaca Konteks

### 3.1 Sebelum Coding APAPUN

**WAJIB baca dokumen ini PERTAMA KALI**:
```
1. AI-RULES.md (dokumen ini) - Aturan kerja AI
2. PROJECT-BRIEF.md - Single source of truth
3. Dokumen spesifik sesuai task (lihat section 4)
```

### 3.2 Saat Menerima Task Baru

**Langkah WAJIB**:
1. **Baca AI-RULES.md** - Pahami aturan kerja
2. **Baca dokumen relevan** - Sesuai urutan di section 4
3. **Cek kode existing** - Jangan membuat ulang yang sudah ada
4. **Pahami pattern** - Ikuti pattern yang sudah ada
5. **Plan before code** - Jelaskan rencana sebelum execute

### 3.3 Prinsip Membaca Dokumentasi

**DO**:
- ✅ Baca dokumen secara berurutan (lihat section 4)
- ✅ Fokus pada bagian yang relevan dengan task
- ✅ Reference cross-document untuk validasi
- ✅ Catat dependencies antar dokumen
- ✅ Pahami business rules sebelum technical rules

**DON'T**:
- ❌ Skip dokumentasi dan langsung coding
- ❌ Assume pattern tanpa cek dokumentasi
- ❌ Membuat solusi yang berbeda dari dokumentasi
- ❌ Ignore business rules untuk "technical elegance"

---

## 4. Urutan Dokumen yang Wajib Dibaca Sebelum Coding

### 4.1 Foundation Documents (SELALU BACA)

**1. AI-RULES.md** (dokumen ini)
- **Kapan**: Setiap kali mulai coding session
- **Fokus**: Aturan kerja AI, larangan, format laporan

**2. PROJECT-BRIEF.md**
- **Kapan**: Setiap task baru, setiap ada perubahan scope
- **Fokus**: Tujuan proyek, tech stack, asumsi, batasan

### 4.2 Business Context (BACA untuk Business Logic)

**3. BRD.md** (Business Requirements Document)
- **Kapan**: Memahami kebutuhan bisnis
- **Fokus**: Masalah bisnis, stakeholder, success metrics

**4. PRD.md** (Product Requirements Document)
- **Kapan**: Implementasi fitur baru
- **Fokus**: User stories, requirements, prioritas

**5. BUSINESS-RULES.md**
- **Kapan**: SEBELUM implementasi business logic
- **Fokus**: Aturan bisnis (BR-001 hingga BR-095)
- **CRITICAL**: Ikuti business rules STRICTLY

### 4.3 Technical Specifications (BACA untuk Implementation)

**6. ERD-DATABASE.md**
- **Kapan**: SEBELUM create/modify database schema
- **Fokus**: Table structure, relationships, indexes
- **CRITICAL**: Multi-tenancy schema, soft delete columns

**7. API-CONTRACT.md**
- **Kapan**: SEBELUM create/modify API endpoints
- **Fokus**: Request/response format, error codes, endpoints
- **CRITICAL**: Consistent response format, error per-field

**8. FEATURE-LIST.md**
- **Kapan**: Understand fitur yang harus diimplementasi
- **Fokus**: Daftar 99 fitur, prioritas, status MVP

**9. USER-FLOW.md**
- **Kapan**: Implementasi user interaction flow
- **Fokus**: Flow diagram, user journey, states

**10. SCREEN-LIST.md**
- **Kapan**: Frontend development
- **Fokus**: Daftar screens, components, states

### 4.4 Validation & Planning (Reference)

**11. DOCUMENTATION-PLAN.md**
- **Kapan**: Memahami dependency dokumen
- **Fokus**: Roadmap dokumentasi, priorities

### 4.5 Reading Strategy per Task Type

**Task: Create New Module**
```
Read Order:
1. AI-RULES.md (this)
2. PROJECT-BRIEF.md (tech stack, patterns)
3. BUSINESS-RULES.md (business logic untuk module)
4. ERD-DATABASE.md (table structure)
5. API-CONTRACT.md (endpoint format)
6. FEATURE-LIST.md (fitur dalam module)
```

**Task: Fix Bug**
```
Read Order:
1. AI-RULES.md (this)
2. BUSINESS-RULES.md (aturan yang dilanggar?)
3. Kode existing (pahami bug)
4. API-CONTRACT.md (jika API bug)
5. ERD-DATABASE.md (jika database bug)
```

**Task: Add New Endpoint**
```
Read Order:
1. AI-RULES.md (this)
2. API-CONTRACT.md (format standard)
3. BUSINESS-RULES.md (aturan business logic)
4. ERD-DATABASE.md (data yang diakses)
5. Kode existing (pattern yang ada)
```

**Task: Frontend Screen**
```
Read Order:
1. AI-RULES.md (this)
2. SCREEN-LIST.md (screen requirements)
3. USER-FLOW.md (user journey)
4. API-CONTRACT.md (data source)
5. Component library existing
```

---

## 5. Aturan Coding Backend

### 5.1 Struktur File NestJS

**Module Structure** (WAJIB ikuti):
```
src/
├── modules/
│   └── {module-name}/
│       ├── {module-name}.module.ts
│       ├── {module-name}.controller.ts
│       ├── {module-name}.service.ts
│       ├── {module-name}.repository.ts
│       ├── entities/
│       │   └── {entity-name}.entity.ts
│       ├── dto/
│       │   ├── create-{entity}.dto.ts
│       │   ├── update-{entity}.dto.ts
│       │   └── {entity}-response.dto.ts
│       └── tests/
│           ├── {module-name}.controller.spec.ts
│           └── {module-name}.service.spec.ts
```

### 5.2 Naming Conventions Backend

**Files**:
- Module: `user-management.module.ts`
- Controller: `user-management.controller.ts`
- Service: `user-management.service.ts`
- Entity: `user.entity.ts`
- DTO: `create-user.dto.ts`
- Test: `user-management.service.spec.ts`

**Classes**:
- Module: `UserManagementModule`
- Controller: `UserManagementController`
- Service: `UserManagementService`
- Entity: `UserEntity`
- DTO: `CreateUserDto`

**Variables/Functions**:
- camelCase: `getUserById`, `isActive`, `createdAt`

**Constants**:
- UPPER_SNAKE_CASE: `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE`

### 5.3 Soft Delete WAJIB

**SETIAP entity HARUS punya**:
```typescript
@Entity()
export class UserEntity {
  // ... other fields
  
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
  
  @Column({ name: 'deleted_by', type: 'bigint', nullable: true })
  deletedBy: number | null;
}
```

**Repository HARUS**:
- Default query: `WHERE deleted_at IS NULL`
- Delete method: Set `deleted_at = NOW()`, `deleted_by = currentUserId`
- Restore method: Set `deleted_at = NULL`, `deleted_by = NULL`

### 5.4 Multi-Tenancy WAJIB

**Setiap request HARUS**:
```typescript
// 1. Extract tenant dari JWT
const tenantId = req.user.tenantId;

// 2. Set schema context
await this.db.execute(`SET search_path TO tenant_${tenantId}`);

// 3. Semua queries otomatis ke tenant schema
```

**JANGAN**:
- ❌ Hard-code tenant ID
- ❌ Query cross-tenant tanpa explicit check
- ❌ Skip tenant validation

### 5.5 Error Handling

**WAJIB gunakan format ini**:
```typescript
throw new HttpException(
  {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validasi gagal',
      errors: [
        { field: 'email', message: 'Email tidak valid' }
      ]
    }
  },
  HttpStatus.BAD_REQUEST
);
```

**Error codes** (lihat API-CONTRACT.md):
- `VALIDATION_ERROR` (400)
- `AUTHENTICATION_REQUIRED` (401)
- `PERMISSION_DENIED` (403)
- `RESOURCE_NOT_FOUND` (404)
- `DUPLICATE_RESOURCE` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

### 5.6 Validation dengan Zod

**DTO WAJIB pakai Zod**:
```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
```

**Validation Pipe**:
```typescript
@Post()
async create(@Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto) {
  // ...
}
```

### 5.7 Audit Logging

**Setiap CRUD operation WAJIB log**:
```typescript
await this.auditLog.create({
  userId: currentUser.id,
  tenantId: currentUser.tenantId,
  action: 'create',
  resource: 'users',
  resourceId: newUser.id,
  newValues: newUser,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

### 5.8 Permission Check

**WAJIB check permission sebelum action**:
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('users.create.tenant')
@Post()
async create(...) {
  // ...
}
```

### 5.9 JANGAN Membuat dari Awal

**SEBELUM membuat file baru**:
1. ✅ Cek apakah module sudah ada
2. ✅ Cek apakah entity sudah ada
3. ✅ Cek apakah endpoint sudah ada
4. ✅ Reuse existing pattern dan code

**Jika sudah ada**:
- ✅ Update/extend yang ada
- ✅ JANGAN buat duplikat
- ✅ JANGAN overwrite tanpa backup

---

## 6. Aturan Coding Frontend

### 6.1 Struktur File Next.js

**App Router Structure** (WAJIB ikuti):
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (portal)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (redirect ke /portal/workspace)
│   │   ├── workspace/ (dashboard)
│   │   │   └── page.tsx
│   │   ├── mgmt/ (management)
│   │   │   ├── accounts/ (users)
│   │   │   │   ├── page.tsx (list)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx (detail)
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── access/ (roles)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── orgs/ (tenants - Super Admin only)
│   │   │       ├── page.tsx
│   │   │       ├── new/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── config/ (settings)
│   │   │   ├── general/
│   │   │   │   └── page.tsx
│   │   │   ├── security/
│   │   │   │   └── page.tsx
│   │   │   └── modules/
│   │   │       └── page.tsx
│   │   ├── data/ (master data)
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   └── tags/
│   │   │       └── page.tsx
│   │   ├── activity/ (audit logs)
│   │   │   └── page.tsx
│   │   └── profile/ (user profile)
│   │       ├── page.tsx
│   │       └── edit/
│   │           └── page.tsx
│   └── api/
│       └── [...routes]/ (jika perlu)
├── components/
│   ├── ui/ (shadcn/ui components)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── accounts/ (users)
│   │   ├── AccountTable.tsx
│   │   ├── AccountForm.tsx
│   │   └── AccountCard.tsx
│   ├── access/ (roles)
│   │   ├── AccessTable.tsx
│   │   └── AccessForm.tsx
│   └── orgs/ (tenants)
│       ├── OrgTable.tsx
│       └── OrgForm.tsx
├── lib/
│   ├── api.ts (API client)
│   ├── utils.ts
│   └── validations.ts
└── store/
    ├── auth.ts (Zustand)
    └── user.ts
```

### 6.1.1 Route Path Security Strategy

**WAJIB gunakan path yang tidak mudah ditebak**:

**Path Mapping (Frontend → Backend)**:
```typescript
// JANGAN gunakan path yang obvious
❌ /dashboard/users → users
❌ /dashboard/roles → roles
❌ /dashboard/tenants → tenants
❌ /dashboard/audit-logs → audit-logs

// ✅ GUNAKAN path yang ter-obfuscate
✅ /portal/mgmt/accounts → users (API: /api/v1/users)
✅ /portal/mgmt/access → roles (API: /api/v1/roles)
✅ /portal/mgmt/orgs → tenants (API: /api/v1/tenants)
✅ /portal/activity → audit-logs (API: /api/v1/audit-logs)
✅ /portal/data/categories → categories (API: /api/v1/categories)
✅ /portal/config/general → settings (API: /api/v1/settings)
```

**Alasan**:
- 🔒 Security through obscurity (layer tambahan)
- 🔒 Menyulitkan attacker untuk menebak struktur
- 🔒 Menghindari automated scanning tools
- 🔒 Mengurangi exposure dari URL patterns

**Path Glossary** (Dokumentasikan mapping):
```typescript
// lib/routes.ts
export const ROUTES = {
  // Portal
  WORKSPACE: '/portal/workspace',
  
  // Management
  ACCOUNTS: '/portal/mgmt/accounts',
  ACCOUNTS_NEW: '/portal/mgmt/accounts/new',
  ACCOUNTS_DETAIL: (id: string) => `/portal/mgmt/accounts/${id}`,
  ACCOUNTS_EDIT: (id: string) => `/portal/mgmt/accounts/${id}/edit`,
  
  ACCESS: '/portal/mgmt/access',
  ACCESS_NEW: '/portal/mgmt/access/new',
  ACCESS_DETAIL: (id: string) => `/portal/mgmt/access/${id}`,
  
  ORGS: '/portal/mgmt/orgs',
  ORGS_NEW: '/portal/mgmt/orgs/new',
  ORGS_DETAIL: (id: string) => `/portal/mgmt/orgs/${id}`,
  
  // Config
  CONFIG_GENERAL: '/portal/config/general',
  CONFIG_SECURITY: '/portal/config/security',
  CONFIG_MODULES: '/portal/config/modules',
  
  // Data
  DATA_CATEGORIES: '/portal/data/categories',
  DATA_TAGS: '/portal/data/tags',
  
  // Activity
  ACTIVITY: '/portal/activity',
  
  // Profile
  PROFILE: '/portal/profile',
  PROFILE_EDIT: '/portal/profile/edit',
} as const;

// Usage
import { ROUTES } from '@/lib/routes';

<Link href={ROUTES.ACCOUNTS}>Accounts</Link>
<Link href={ROUTES.ACCOUNTS_DETAIL('123')}>Detail</Link>
```

**Alternative Path Options** (pilih salah satu):

**Option 1: Abbreviated (Current)**
```
/portal/mgmt/accounts (users)
/portal/mgmt/access (roles)
/portal/mgmt/orgs (tenants)
```

**Option 2: Code-like**
```
/portal/sys/usr (users)
/portal/sys/rbac (roles)
/portal/sys/tnts (tenants)
```

**Option 3: Generic**
```
/portal/manage/entities (users)
/portal/manage/permissions (roles)
/portal/manage/clients (tenants)
```

**Option 4: Business Terms**
```
/portal/team/members (users)
/portal/team/groups (roles)
/portal/admin/organizations (tenants)
```

**Recommendation**: Gunakan **Option 1 (Abbreviated)** - balance antara security dan usability.


### 6.2 Naming Conventions Frontend

**Files**:
- Page: `page.tsx` (App Router convention)
- Component: `UserTable.tsx` (PascalCase)
- Hook: `useAuth.ts`
- Util: `formatDate.ts`
- Store: `auth.ts`

**Components**:
- PascalCase: `UserTable`, `FormInput`, `DataCard`

**Functions/Variables**:
- camelCase: `handleSubmit`, `isLoading`, `userData`

**Constants**:
- UPPER_SNAKE_CASE: `API_BASE_URL`, `MAX_ITEMS`

### 6.3 Component Pattern

**WAJIB gunakan pattern ini**:
```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface UserTableProps {
  // Props type
}

export function UserTable({ ...props }: UserTableProps) {
  // 1. State
  const [page, setPage] = useState(1);
  
  // 2. Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page],
    queryFn: () => fetchUsers(page),
  });
  
  // 3. Handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // 4. Render conditions
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data?.length) return <EmptyState />;
  
  // 5. Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### 6.4 Form dengan React Hook Form + Zod

**WAJIB gunakan pattern ini**:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Email tidak valid'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserForm() {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: '', name: '' },
  });
  
  const onSubmit = async (data: UserFormData) => {
    // Submit logic
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 6.5 State Management

**Zustand untuk Global State**:
```typescript
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

**TanStack Query untuk Server State**:
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Query
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

// Mutation
const { mutate } = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

### 6.6 Error Handling Frontend

**WAJIB handle 4 states**:
1. **Loading**: Show skeleton/spinner
2. **Empty**: Show empty state dengan illustration
3. **Error**: Show error message dengan retry button
4. **Success**: Show data

```typescript
if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorState error={error} onRetry={refetch} />;
if (!data?.length) return <EmptyState message="Belum ada data" />;

return <DataDisplay data={data} />;
```

### 6.7 UI Rules

**WAJIB**:
- ✅ Responsive design (mobile-first)
- ✅ Dark/Light mode support
- ✅ NO EMOJI dalam UI
- ✅ Error messages dalam Bahasa Indonesia
- ✅ Loading states untuk setiap async operation
- ✅ Accessibility (semantic HTML, ARIA labels)

**JANGAN**:
- ❌ Hard-code text (gunakan constants atau i18n)
- ❌ Inline styles (gunakan Tailwind classes)
- ❌ Skip loading states
- ❌ Gunakan emoji dalam UI

---

## 7. Aturan Database/Migration

### 7.1 Schema Naming

**Table Names** (snake_case, lowercase):
```
✅ users
✅ user_roles
✅ role_permissions
✅ audit_logs
✅ password_resets

❌ Users (PascalCase)
❌ userRoles (camelCase)
❌ USERS (uppercase)
```

**Column Names** (snake_case):
```
✅ created_at
✅ deleted_by
✅ is_active
✅ subscription_tier

❌ createdAt (camelCase)
❌ DeletedBy (PascalCase)
```

### 7.2 Migration Files

**Naming Convention**:
```
{timestamp}_{action}_{table}.sql
```

**Contoh**:
```
20240108100000_create_users_table.sql
20240108100001_add_deleted_at_to_users.sql
20240108100002_create_index_users_email.sql
```

**Migration Template**:
```sql
-- Migration: Create users table
-- Created: 2024-01-08
-- Author: AI/Developer Name

-- UP
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    deleted_by BIGINT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- DOWN
DROP TABLE IF EXISTS users CASCADE;
```

### 7.3 Soft Delete Columns (MANDATORY)

**SETIAP table WAJIB punya**:
```sql
deleted_at TIMESTAMP WITH TIME ZONE NULL,
deleted_by BIGINT NULL,
```

**Index untuk soft delete**:
```sql
CREATE INDEX idx_{table}_deleted_at ON {table}(deleted_at) WHERE deleted_at IS NULL;
```

### 7.4 Audit Columns (MANDATORY)

**SETIAP table WAJIB punya**:
```sql
created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
created_by BIGINT NULL,
updated_by BIGINT NULL,
```

### 7.5 Foreign Keys

**WAJIB specify ON DELETE behavior**:
```sql
-- Cascade: Delete related records
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- Set NULL: Keep record, null FK
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL

-- Restrict: Block deletion
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT
```

### 7.6 Indexes

**WAJIB create index untuk**:
- Primary keys (otomatis)
- Foreign keys
- Columns yang sering di-filter (WHERE)
- Columns yang sering di-sort (ORDER BY)
- Columns untuk search

**Contoh**:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 7.7 JANGAN Modify Existing Tables

**WAJIB**:
- ✅ Buat migration baru untuk perubahan
- ✅ Backup data sebelum migration
- ✅ Test migration di development dulu
- ✅ Reversible migration (UP dan DOWN)

**JANGAN**:
- ❌ Edit migration file yang sudah dijalankan
- ❌ Drop table tanpa backup
- ❌ Rename table/column tanpa migration
- ❌ Remove column yang masih digunakan

---

## 8. Aturan API Response

### 8.1 Success Response Format (WAJIB)

**Single Resource**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**List with Pagination**:
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

### 8.2 Error Response Format (WAJIB)

**Validation Error (per-field)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi gagal",
    "errors": [
      { "field": "email", "message": "Email tidak valid" },
      { "field": "password", "message": "Password minimal 8 karakter" }
    ]
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**General Error**:
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Anda tidak memiliki akses untuk melakukan operasi ini",
    "errors": []
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

### 8.3 HTTP Status Codes

**WAJIB gunakan status code yang tepat**:
- `200` OK - Successful GET, PUT, PATCH
- `201` Created - Successful POST
- `204` No Content - Successful DELETE
- `400` Bad Request - Validation error
- `401` Unauthorized - Missing/invalid token
- `403` Forbidden - Permission denied
- `404` Not Found - Resource not found
- `409` Conflict - Duplicate/conflict
- `429` Too Many Requests - Rate limit
- `500` Internal Server Error - Server error

### 8.4 Error Codes (Lihat API-CONTRACT.md)

**WAJIB gunakan error codes standar**:
- `VALIDATION_ERROR`
- `AUTHENTICATION_REQUIRED`
- `INVALID_TOKEN`
- `INVALID_CREDENTIALS`
- `PERMISSION_DENIED`
- `RESOURCE_NOT_FOUND`
- `DUPLICATE_RESOURCE`
- `CONFLICT_STATE`
- `RATE_LIMIT_EXCEEDED`
- `INTERNAL_ERROR`
- `MODULE_DISABLED`
- `TENANT_INACTIVE`
- `USER_INACTIVE`

### 8.5 Response Field Naming

**WAJIB camelCase di JSON response**:
```json
{
  "userId": 1,
  "createdAt": "2024-01-08T10:00:00.000Z",
  "isActive": true
}
```

**JANGAN snake_case di response**:
```json
{
  "user_id": 1,        // ❌ SALAH
  "created_at": "...", // ❌ SALAH
  "is_active": true    // ❌ SALAH
}
```

### 8.6 Pagination Parameters

**Query Parameters**:
```
?page=1&perPage=10
```

**Default Values**:
- `page`: 1
- `perPage`: 10
- `max perPage`: 100

### 8.7 Filter, Sort, Search

**Filter**:
```
?filter[status]=active&filter[role]=admin
```

**Sort**:
```
?sort=name:asc,createdAt:desc
```

**Search**:
```
?search=keyword
```

**Include Relations**:
```
?include=roles,permissions
```

---

## 9. Aturan Validasi

### 9.1 Validation dengan Zod (WAJIB)

**Backend DTO**:
```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string()
    .email('Email tidak valid')
    .min(1, 'Email wajib diisi'),
  
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  
  name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(255, 'Nama maksimal 255 karakter'),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Nomor telepon tidak valid')
    .optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
```

**Frontend Form**:
```typescript
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<CreateUserDto>({
  resolver: zodResolver(createUserSchema),
  mode: 'onChange', // Real-time validation
});
```

### 9.2 Error Messages (Bahasa Indonesia)

**WAJIB gunakan Bahasa Indonesia**:
```typescript
✅ 'Email tidak valid'
✅ 'Password minimal 8 karakter'
✅ 'Nama wajib diisi'
✅ 'Data tidak ditemukan'

❌ 'Invalid email' (English)
❌ 'Password must be at least 8 characters' (English)
```

### 9.3 Validation Rules (Lihat BUSINESS-RULES.md)

**Email**:
- Required
- Valid email format
- Unique dalam tenant
- Case-insensitive (convert ke lowercase)

**Password**:
- Required
- Min 8 characters
- Must contain: uppercase, lowercase, number
- Cannot be same as email

**Name**:
- Required
- Min 2 characters
- Max 255 characters

**Phone**:
- Optional
- Valid phone format (international)

### 9.4 Validation Location

**WAJIB validate di 2 tempat**:
1. **Frontend** - Real-time feedback untuk UX
2. **Backend** - Security dan data integrity

**JANGAN**:
- ❌ Hanya validate di frontend (insecure)
- ❌ Skip validation sama sekali

---

## 10. Aturan Security

### 10.1 Input Sanitization (MANDATORY)

**SETIAP input WAJIB di-sanitize**:
```typescript
import { sanitize } from 'class-sanitizer';

// Automatic sanitization
@Post()
async create(@Body() dto: CreateUserDto) {
  // DTO sudah di-sanitize oleh middleware
}
```

**JANGAN**:
- ❌ Trust user input
- ❌ Execute raw SQL dengan user input
- ❌ Render HTML dari user tanpa sanitize

### 10.2 Authentication (JWT)

**Token Storage**:
- ✅ HTTP-only cookie (recommended)
- ✅ Authorization header: `Bearer {token}`

**Token Structure**:
```typescript
{
  userId: 1,
  email: "john@example.com",
  tenantId: 1,
  roles: ["admin"],
  iat: 1704700800,
  exp: 1704787200
}
```

**Token Expiry**:
- Access Token: 24 hours
- Refresh Token: 30 days (Phase 2)

### 10.3 Authorization (RBAC dengan CASL)

**WAJIB check permission**:
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('users.create.tenant')
@Post()
async create(...) {
  // Only users dengan permission 'users.create.tenant'
}
```

**Permission Format**:
```
{resource}.{action}.{scope}

Examples:
- users.create.tenant
- users.read.own
- users.update.all
- roles.delete.tenant
```

### 10.4 SQL Injection Prevention

**WAJIB gunakan parameterized queries**:
```typescript
// ✅ BENAR - Parameterized query (Drizzle)
const user = await db.select()
  .from(users)
  .where(eq(users.email, email));

// ❌ SALAH - Raw SQL dengan user input
const user = await db.execute(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

### 10.5 XSS Prevention

**Output Encoding**:
- Frontend: React otomatis escape
- Backend: Sanitize output jika render HTML

**CSP (Content Security Policy)**:
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
```

### 10.6 Rate Limiting

**WAJIB implement rate limiting**:
```typescript
// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit per IP
}));

// Per-endpoint rate limit
@Throttle(5, 60) // 5 requests per 60 seconds
@Post('login')
async login(...) {
  // ...
}
```

### 10.7 Password Security

**Hashing**:
```typescript
import * as bcrypt from 'bcrypt';

// Hash password
const passwordHash = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, passwordHash);
```

**Rules**:
- WAJIB hash dengan bcrypt (cost factor: 10-12)
- JANGAN store plain text password
- JANGAN log password
- JANGAN return password dalam response

### 10.8 Audit Logging (MANDATORY)

**WAJIB log**:
- Login/logout
- CRUD operations
- Permission changes
- Configuration changes
- Sensitive data access

**Log Structure**:
```typescript
{
  userId: 1,
  tenantId: 1,
  action: 'create',
  resource: 'users',
  resourceId: 2,
  oldValues: null,
  newValues: { /* data */ },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  createdAt: '2024-01-08T10:00:00.000Z'
}
```

---

## 11. Aturan Role Permission

### 11.1 Role Hierarchy

**System Roles** (TIDAK BOLEH dihapus):
1. **Super Admin** - Full access, all tenants
2. **Tenant Admin** - Full access, own tenant only
3. **User** - Limited access, based on permissions
4. **Guest** - Read-only (optional)

### 11.2 Permission Format

**Format**: `{resource}.{action}.{scope}`

**Actions**:
- `create` - Create new resource
- `read` - Read resource
- `update` - Update resource
- `delete` - Delete resource (soft delete)
- `export` - Export data
- `import` - Import data
- `approve` - Approve (Phase 2)
- `reject` - Reject (Phase 2)

**Scopes**:
- `own` - Own data only
- `tenant` - All data in tenant
- `all` - All data across tenants (Super Admin only)

### 11.3 Permission Check Implementation

**Controller**:
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('users.create.tenant')
@Post()
async create(@CurrentUser() user: User, @Body() dto: CreateUserDto) {
  // User dengan permission 'users.create.tenant' dapat create
}
```

**Service (Additional check)**:
```typescript
async createUser(currentUser: User, dto: CreateUserDto) {
  // Additional business logic check
  if (!this.casl.can(currentUser, 'create', 'users')) {
    throw new ForbiddenException('PERMISSION_DENIED');
  }
  
  // Create logic
}
```

### 11.4 Permission Matrix

**Lihat API-CONTRACT.md** untuk permission matrix lengkap per endpoint.

**Contoh**:
- `GET /users` → `users.read.tenant`
- `POST /users` → `users.create.tenant`
- `PUT /users/:id` → `users.update.tenant` or `users.update.own`
- `DELETE /users/:id` → `users.delete.tenant`

### 11.5 Module Permission Check

**WAJIB check module enabled**:
```typescript
@UseGuards(JwtAuthGuard, ModuleGuard)
@Controller('products') // products module
export class ProductsController {
  // Automatic check: apakah module 'products' enabled untuk tenant?
}
```

**Error jika module disabled**:
```json
{
  "success": false,
  "error": {
    "code": "MODULE_DISABLED",
    "message": "Module ini tidak tersedia untuk tenant Anda"
  }
}
```

---

## 12. Aturan Update Dokumentasi

### 12.1 Kapan Update Dokumentasi

**WAJIB update jika**:
- ✅ Menambah endpoint baru → Update API-CONTRACT.md
- ✅ Menambah table baru → Update ERD-DATABASE.md
- ✅ Menambah business rule → Update BUSINESS-RULES.md
- ✅ Menambah fitur baru → Update FEATURE-LIST.md
- ✅ Mengubah user flow → Update USER-FLOW.md
- ✅ Menambah screen baru → Update SCREEN-LIST.md

### 12.2 Format Update Dokumentasi

**Jangan**:
- ❌ Overwrite seluruh dokumen
- ❌ Hapus informasi existing
- ❌ Mengubah struktur dokumen yang sudah ada

**Lakukan**:
- ✅ Append section baru
- ✅ Update section yang relevan saja
- ✅ Tambahkan komentar perubahan
- ✅ Update version dan last updated date

### 12.3 Update API-CONTRACT.md

**Jika menambah endpoint baru**:
```markdown
### X.X New Endpoint Name

**Endpoint**: `POST /api/v1/resource`

**Permission**: `resource.create.tenant`

**Request Body**:
```json
{ ... }
```

**Success Response** (201):
```json
{ ... }
```
```

### 12.4 Update ERD-DATABASE.md

**Jika menambah table baru**:
```markdown
### X.X Table: new_table_name

**Fungsi**: Description

**Kolom**:
| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|------------|
| ... | ... | ... | ... |

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: ...

**Indexes**:
- `idx_...` ON (...)

**Soft Delete**: ✅ Yes / ❌ No
```

### 12.5 Update BUSINESS-RULES.md

**Jika menambah business rule**:
```markdown
**BR-XXX: Rule Name**
- Rule description
- Conditions
- Constraints
```

### 12.6 Commit Message untuk Dokumentasi

**Format**:
```
docs: update {DOCUMENT_NAME} - {change description}

- Added new endpoint POST /api/v1/resource
- Updated table schema for users
- Added business rule BR-096
```

---

## 13. Larangan untuk AI

### 13.1 JANGAN Membuat Ulang dari Awal

**DILARANG KERAS**:
- ❌ Overwrite file existing tanpa backup
- ❌ Hapus kode existing dan buat baru
- ❌ Ignore pattern yang sudah ada
- ❌ Membuat struktur folder berbeda
- ❌ Menggunakan library berbeda tanpa alasan kuat
- ❌ Menggunakan path/route yang obvious dan mudah ditebak

**WAJIB**:
- ✅ Cek file/kode existing SEBELUM membuat
- ✅ Extend/update kode existing
- ✅ Follow pattern yang sudah ada
- ✅ Reuse components/functions yang ada
- ✅ Gunakan path yang ter-obfuscate (lihat section 6.1.1)
- ✅ Tanya jika tidak yakin

### 13.2 JANGAN Membuat Fitur di Luar Scope

**DILARANG**:
- ❌ Membuat fitur yang tidak ada di FEATURE-LIST.md
- ❌ Membuat endpoint yang tidak ada di API-CONTRACT.md
- ❌ Membuat table yang tidak ada di ERD-DATABASE.md
- ❌ Menambah dependency tanpa persetujuan
- ❌ Mengubah tech stack tanpa persetujuan

**WAJIB**:
- ✅ Ikuti dokumentasi STRICTLY
- ✅ Tanya jika ada kebutuhan di luar scope
- ✅ Propose changes dengan alasan kuat

### 13.3 JANGAN Skip Validation dan Security

**DILARANG**:
- ❌ Skip input validation
- ❌ Skip permission check
- ❌ Skip soft delete
- ❌ Skip audit logging
- ❌ Skip error handling
- ❌ Hard-code sensitive data (API keys, passwords)

**WAJIB**:
- ✅ Validate di frontend DAN backend
- ✅ Check permission setiap endpoint
- ✅ Implement soft delete untuk semua data krusial
- ✅ Log semua critical operations
- ✅ Handle error dengan proper message
- ✅ Use environment variables untuk sensitive data

### 13.4 JANGAN Membuat Kode yang Tidak Konsisten

**DILARANG**:
- ❌ Gunakan naming convention berbeda
- ❌ Gunakan response format berbeda
- ❌ Gunakan error handling berbeda
- ❌ Gunakan validation pattern berbeda

**WAJIB**:
- ✅ Follow naming conventions (section 5.2, 6.2)
- ✅ Follow response format (section 8)
- ✅ Follow error handling pattern (section 5.5)
- ✅ Follow validation pattern (section 9)

### 13.5 JANGAN Hardcode atau Assume

**DILARANG**:
- ❌ Hardcode tenant ID
- ❌ Hardcode user ID
- ❌ Hardcode API URLs
- ❌ Hardcode configuration values
- ❌ Assume data exists (cek dulu)

**WAJIB**:
- ✅ Ambil tenant ID dari JWT token
- ✅ Ambil user ID dari current user context
- ✅ Gunakan environment variables
- ✅ Gunakan configuration files
- ✅ Validate data existence sebelum use

### 13.6 JANGAN Ignore Business Rules

**DILARANG**:
- ❌ Skip business rule validation
- ❌ Implement feature berbeda dari business rules
- ❌ Mengubah business logic tanpa approval

**WAJIB**:
- ✅ Baca BUSINESS-RULES.md sebelum coding
- ✅ Follow semua business rules (BR-001 hingga BR-095)
- ✅ Tanya jika business rule tidak jelas
- ✅ Propose business rule baru jika diperlukan

### 13.7 JANGAN Gunakan Emoji dalam UI

**DILARANG**:
- ❌ Emoji dalam button text
- ❌ Emoji dalam error messages
- ❌ Emoji dalam form labels
- ❌ Emoji dalam table headers

**BOLEH** (CLI/Terminal only):
- ✅ Emoji dalam CLI output
- ✅ Emoji dalam commit messages
- ✅ Emoji dalam developer logs

### 13.8 JANGAN Skip Testing

**DILARANG**:
- ❌ Deploy tanpa testing
- ❌ Skip unit tests
- ❌ Skip integration tests untuk critical features
- ❌ Assume code works tanpa testing

**WAJIB**:
- ✅ Tulis unit tests untuk services
- ✅ Tulis integration tests untuk controllers
- ✅ Test happy path DAN edge cases
- ✅ Test error scenarios
- ✅ Achieve 80%+ code coverage

---

## 14. Format Laporan Setelah Coding

### 14.1 Laporan WAJIB Setiap Selesai Task

**Template Laporan**:

```markdown
## Task Completion Report

**Task**: [Nama task, e.g., "Create User Management Module"]
**Date**: [YYYY-MM-DD]
**AI Model**: [Model name and version]

### 1. Task Summary
- **Description**: [Deskripsi singkat task]
- **Status**: ✅ Completed / ⚠️ Partially Completed / ❌ Failed
- **Duration**: [Estimasi waktu yang dibutuhkan]

### 2. Files Created
- `src/modules/users/users.module.ts` - User module definition
- `src/modules/users/users.controller.ts` - User API endpoints
- `src/modules/users/users.service.ts` - User business logic
- `src/modules/users/users.repository.ts` - User data access
- `src/modules/users/entities/user.entity.ts` - User entity
- `src/modules/users/dto/create-user.dto.ts` - Create user DTO
- `src/modules/users/dto/update-user.dto.ts` - Update user DTO
- `src/modules/users/tests/users.service.spec.ts` - Unit tests

### 3. Files Modified
- `src/app.module.ts` - Added UserModule import
- `src/database/migrations/xxx_create_users_table.sql` - User table migration

### 4. Files Deleted
- None

### 5. Implementation Details

#### 5.1 Backend
- ✅ Implemented soft delete (deleted_at, deleted_by)
- ✅ Implemented audit columns (created_at, updated_at, created_by, updated_by)
- ✅ Implemented permission checks (users.create.tenant, users.read.tenant, etc.)
- ✅ Implemented validation with Zod schemas
- ✅ Implemented error handling with consistent format
- ✅ Implemented pagination (page, perPage)
- ✅ Implemented filtering (filter[isActive], filter[role])
- ✅ Implemented sorting (sort=name:asc)
- ✅ Implemented search (search=keyword)

#### 5.2 Frontend
- ✅ Implemented UserTable component with pagination
- ✅ Implemented UserForm with React Hook Form + Zod
- ✅ Implemented loading, empty, error states
- ✅ Implemented responsive design (mobile-first)
- ✅ Implemented dark/light mode support
- ❌ No emoji in UI

#### 5.3 Database
- ✅ Created users table with soft delete columns
- ✅ Created indexes (email, deleted_at, created_at)
- ✅ Created foreign keys with proper ON DELETE behavior
- ✅ Migration tested (UP and DOWN)

### 6. Testing
- ✅ Unit tests written (10 tests, 85% coverage)
- ✅ Integration tests written (5 tests)
- ✅ Manual testing performed
- ✅ All tests passed

### 7. Documentation Updated
- ✅ API-CONTRACT.md - Added 8 new endpoints
- ✅ ERD-DATABASE.md - Added users table schema
- ⚠️ BUSINESS-RULES.md - No changes needed
- ⚠️ FEATURE-LIST.md - No changes needed

### 8. Known Issues / Limitations
- None

### 9. Next Steps / Recommendations
- Implement email verification flow (Phase 2)
- Add avatar upload functionality
- Add bulk operations (bulk delete, bulk activate)

### 10. Business Rules Followed
- BR-004: Soft delete mandatory ✅
- BR-007: Audit logging ✅
- BR-009: Login rules ✅
- BR-025: Create user rules ✅
- BR-026: Update user rules ✅
- BR-027: Delete user rules ✅

### 11. API Endpoints Created
| Method | Endpoint | Permission | Status |
|--------|----------|------------|--------|
| GET | /api/v1/users | users.read.tenant | ✅ |
| GET | /api/v1/users/:id | users.read.own or users.read.tenant | ✅ |
| POST | /api/v1/users | users.create.tenant | ✅ |
| PUT | /api/v1/users/:id | users.update.own or users.update.tenant | ✅ |
| DELETE | /api/v1/users/:id | users.delete.tenant | ✅ |
| POST | /api/v1/users/:id/restore | users.delete.tenant | ✅ |
| PATCH | /api/v1/users/:id/status | users.update.tenant | ✅ |
| POST | /api/v1/users/:id/roles | users.update.tenant | ✅ |

### 12. Verification Checklist
- [x] Kode follows naming conventions
- [x] Kode follows project structure
- [x] Soft delete implemented
- [x] Audit logging implemented
- [x] Permission checks implemented
- [x] Validation implemented (frontend & backend)
- [x] Error handling implemented
- [x] Tests written and passed
- [x] Documentation updated
- [x] No hardcoded values
- [x] No emoji in UI
- [x] Bahasa Indonesia untuk error messages
```

### 14.2 Commit dan Push

**Setelah laporan dibuat**:
```bash
git add .
git commit -m "feat: implement user management module

- Add UserModule with CRUD operations
- Add soft delete and audit logging
- Add permission checks
- Add validation with Zod
- Add unit and integration tests
- Update API-CONTRACT.md and ERD-DATABASE.md

Refs: FEATURE-LIST.md #2.1-2.9" --author="Asrul Anwar <asrulanwar16@gmail.com>"

git push origin master
```

---

## 15. Format Update AI_PROGRESS-LOG.md

### 15.1 Struktur AI_PROGRESS-LOG.md

**File**: `AI_PROGRESS-LOG.md` (di root project)

**Template**:
```markdown
# AI PROGRESS LOG
# Platform CMS - Core Framework

**Document Version**: 1.0
**Last Updated**: [Date]
**Purpose**: Track AI coding progress and decisions

---

## Log Entry Format

### [YYYY-MM-DD HH:MM] - [Task Name]

**AI Model**: [Model name]
**Duration**: [Duration]
**Status**: ✅ Completed / ⚠️ In Progress / ❌ Failed

#### What Was Done
- [List of accomplishments]

#### Files Changed
- Created: [files]
- Modified: [files]
- Deleted: [files]

#### Decisions Made
- [Key decisions and rationale]

#### Issues Encountered
- [Problems and how they were resolved]

#### Next Steps
- [What needs to be done next]

---

## Progress Logs

### [2024-01-08 10:00] - Create User Management Module

**AI Model**: Claude 3.5 Sonnet
**Duration**: 2 hours
**Status**: ✅ Completed

#### What Was Done
- Created UserModule with full CRUD operations
- Implemented soft delete pattern
- Implemented permission checks with CASL
- Created 8 API endpoints
- Added validation with Zod
- Wrote 15 unit tests (85% coverage)
- Updated API-CONTRACT.md and ERD-DATABASE.md

#### Files Changed
- Created:
  - `src/modules/users/users.module.ts`
  - `src/modules/users/users.controller.ts`
  - `src/modules/users/users.service.ts`
  - `src/modules/users/users.repository.ts`
  - `src/modules/users/entities/user.entity.ts`
  - `src/modules/users/dto/create-user.dto.ts`
  - `src/modules/users/dto/update-user.dto.ts`
  - `src/modules/users/tests/users.service.spec.ts`
- Modified:
  - `src/app.module.ts`
  - `docs/API-CONTRACT.md`
  - `docs/ERD-DATABASE.md`

#### Decisions Made
- Used Zod for validation instead of class-validator (better type inference)
- Implemented soft delete dengan deleted_at dan deleted_by columns
- Permission scope: tenant (users dalam tenant sendiri)
- Pagination default: 10 items per page, max 100

#### Issues Encountered
- Issue: Email validation tidak case-insensitive
  - Solution: Convert email ke lowercase sebelum save
- Issue: Circular dependency antara UserModule dan AuditModule
  - Solution: Use forwardRef() untuk resolve circular dependency

#### Next Steps
- Implement Role Management Module
- Implement Permission Management Module
- Add email verification flow
- Add avatar upload functionality

---

### [2024-01-08 14:00] - Create Role Management Module

**AI Model**: Claude 3.5 Sonnet
**Duration**: 1.5 hours
**Status**: ✅ Completed

#### What Was Done
- Created RoleModule with CRUD operations
- Implemented system roles protection (cannot delete)
- Implemented assign permissions to role
- Created 6 API endpoints
- Added validation and permission checks
- Wrote 12 unit tests (82% coverage)
- Updated API-CONTRACT.md

#### Files Changed
- Created:
  - `src/modules/roles/roles.module.ts`
  - `src/modules/roles/roles.controller.ts`
  - `src/modules/roles/roles.service.ts`
  - `src/modules/roles/roles.repository.ts`
  - `src/modules/roles/entities/role.entity.ts`
  - `src/modules/roles/dto/create-role.dto.ts`
  - `src/modules/roles/dto/update-role.dto.ts`
  - `src/modules/roles/tests/roles.service.spec.ts`
- Modified:
  - `src/app.module.ts`
  - `docs/API-CONTRACT.md`

#### Decisions Made
- System roles (is_system = true) tidak bisa dihapus
- Custom roles bisa dibuat per tenant
- Role name harus unique dalam tenant
- Assign permissions pakai array of permission IDs

#### Issues Encountered
- Issue: Validation gagal saat update system role name
  - Solution: Check is_system flag, skip name validation untuk system roles
- Issue: Delete role masih bisa meskipun ada users
  - Solution: Check user_roles count sebelum delete

#### Next Steps
- Connect UserModule dengan RoleModule (assign roles)
- Implement Permission Management Module
- Add role hierarchy (Phase 2)

---

## Summary Statistics

**Total Modules Completed**: 2
**Total Files Created**: 16
**Total Files Modified**: 3
**Total Tests Written**: 27
**Average Test Coverage**: 83.5%
**Total API Endpoints**: 14
**Total Duration**: 3.5 hours

**Modules Status**:
- ✅ User Management - Completed
- ✅ Role Management - Completed
- ⚠️ Permission Management - In Progress
- ⏳ Tenant Management - Not Started
- ⏳ Audit Log - Not Started

---

## Lessons Learned

1. **Always read BUSINESS-RULES.md first** - Prevented incorrect implementation
2. **Soft delete is mandatory** - All tables need deleted_at and deleted_by
3. **Permission check at multiple layers** - Controller guard + service logic
4. **Validation di frontend DAN backend** - Security requirement
5. **Use Zod for type-safe validation** - Better DX than class-validator

---

## Issues to Watch

1. **Circular dependencies** - Use forwardRef() carefully
2. **Email case sensitivity** - Always convert to lowercase
3. **System roles protection** - Multiple checks needed
4. **Multi-tenancy isolation** - Test thoroughly

---

```

### 15.2 Update Log Setiap Selesai Task

**WAJIB**:
1. ✅ Append new log entry dengan timestamp
2. ✅ Update summary statistics
3. ✅ Update modules status
4. ✅ Add lessons learned (jika ada)
5. ✅ Add issues to watch (jika ada)

**JANGAN**:
- ❌ Overwrite existing logs
- ❌ Delete old entries
- ❌ Skip logging

---

## Penutup

**INGAT**:
1. **BACA dokumentasi SEBELUM coding**
2. **CEK kode existing SEBELUM membuat baru**
3. **FOLLOW pattern yang sudah ada**
4. **JANGAN skip validation, security, dan testing**
5. **UPDATE dokumentasi setelah coding**
6. **COMMIT dengan message yang jelas**
7. **LOG progress ke AI_PROGRESS-LOG.md**

**Jika ragu, TANYA dahulu sebelum execute.**

---

**Status**: ✅ Complete - AI Rules Specification  
**Next Action**: Follow aturan ini STRICTLY dalam setiap coding task  
**Version**: 1.0  
**Last Updated**: 2024-01-08

---

*Dokumen ini adalah panduan kerja AI untuk Platform CMS development. Ikuti aturan ini untuk memastikan kode berkualitas tinggi, konsisten, dan sesuai dengan dokumentasi.*
