# AI CODING RULES
# Platform CMS - Core Framework

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: AI Development Guidelines  
**Target**: AI Models (GPT, Claude, dll) dan Developer Tools

---

## CRITICAL: Read This First

**AI, sebelum menulis SATU BARIS KODE pun, kamu WAJIB**:

1. ✅ Baca dokumen yang WAJIB (lihat section Urutan Dokumen)
2. ✅ Pahami tech stack yang digunakan
3. ✅ Check existing code terlebih dahulu
4. ✅ Jangan assume, SELALU cek dokumentasi

**LARANGAN MUTLAK**:

❌ **JANGAN pernah rewrite dari awal tanpa alasan kuat**  
❌ **JANGAN mengubah tech stack yang sudah ditentukan**  
❌ **JANGAN menambah dependencies baru tanpa approval**  
❌ **JANGAN ignore dokumentasi yang sudah ada**  
❌ **JANGAN membuat fitur baru di luar scope MVP**

---

## 1. Identitas Proyek

### 1.1 Nama Proyek

**Platform CMS** (Platform Content Management System Starter)

### 1.2 Deskripsi Singkat

Core framework/starter template untuk aplikasi enterprise-grade dengan fokus:
- Multi-tenancy (schema-based)
- Security-first (sanitization, validation, audit)
- AI-friendly development (CLI builder)
- Scalability (siap skala nasional)

### 1.3 Tujuan Utama

Mempercepat pembangunan aplikasi enterprise dari 3-6 bulan menjadi 2-4 minggu dengan kualitas dan keamanan terjamin.

### 1.4 Target Deployment

- **Development**: Windows 11, localhost
- **Production**: Linux (Docker + Kubernetes)
- **Scale**: 500+ tenants, 10,000+ concurrent users (target Phase 3)

### 1.5 MVP Timeline

**Phase 1**: 16 minggu (MVP Core Platform)  
**Phase 2**: 6 bulan (Enhancements)  
**Phase 3**: Use case implementation (Kemendagri PTSP)

---

## 2. Tech Stack (IMMUTABLE)

### 2.1 Backend Stack

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Framework | NestJS | 10+ | Tidak boleh diganti |
| Language | TypeScript | 5+ | Strict mode enforced |
| ORM | Drizzle ORM | Latest | Tidak boleh Prisma/TypeORM |
| Database | PostgreSQL | 15+ | Multi-tenancy schema-based |
| Cache | Redis | 7+ | Session & caching |
| Validation | Zod | Latest | Frontend & backend |
| Testing | Vitest | Latest | Unit & integration tests |

### 2.2 Frontend Stack

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Framework | Next.js | 15 | App Router (bukan Pages Router) |
| Language | TypeScript | 5+ | Strict mode enforced |
| UI Library | shadcn/ui | Latest | Radix UI + Tailwind |
| Styling | Tailwind CSS | 3+ | No inline styles |
| Forms | React Hook Form | 7+ | + Zod validation |
| State (Global) | Zustand | 4+ | Simple global state |
| State (Server) | TanStack Query | 5+ | Server state management |
| Testing | Vitest + Testing Library | Latest | Component & E2E tests |

### 2.3 Development Tools

| Tool | Purpose | Version |
|------|---------|---------|
| Package Manager | npm | 10+ (BUKAN yarn/pnpm) |
| Node.js | Runtime | 20 LTS |
| Git | Version control | Latest |
| VS Code | IDE | Latest |
| ESLint | Linting | Latest |
| Prettier | Formatting | Latest |

### 2.4 Larangan Tech Stack

❌ **DILARANG menggunakan**:
- Prisma ORM (gunakan Drizzle)
- TypeORM (gunakan Drizzle)
- Pages Router Next.js (gunakan App Router)
- Redux/MobX (gunakan Zustand)
- Emotion/Styled Components (gunakan Tailwind)
- Class-based React components (gunakan Functional)
- Docker untuk development (hanya untuk production)

---

## 3. Cara AI Membaca Konteks

### 3.1 Prinsip Context Loading

**AI WAJIB mengikuti urutan ini**:

1. **Baca Dokumentasi Terlebih Dahulu** (SEBELUM lihat code)
   - Pahami requirements dari docs/
   - Pahami business rules
   - Pahami validation rules
   - Pahami API contract

2. **Baca Existing Code** (SETELAH pahami docs)
   - Check apakah fitur sudah ada
   - Check pattern yang sudah digunakan
   - Check naming conventions yang dipakai

3. **Plan Before Code** (SEBELUM menulis)
   - List file apa saja yang perlu dibuat/diubah
   - Confirm dengan user jika tidak yakin
   - Explain approach-nya

4. **Incremental Development** (JANGAN all-at-once)
   - Buat per file, bukan langsung semua
   - Test setiap file sebelum lanjut
   - Commit frequently

### 3.2 Context Priority

**Priority tinggi ke rendah**:

1. **BUSINESS-RULES.md** - Logika bisnis WAJIB diikuti
2. **VALIDATION-RULES.md** - Validasi WAJIB sesuai spek
3. **API-CONTRACT.md** - Format request/response WAJIB konsisten
4. **ERD-DATABASE.md** - Schema database WAJIB sesuai
5. **Existing Code** - Pattern yang sudah ada WAJIB diikuti
6. **PRD.md, FEATURE-LIST.md** - Scope fitur
7. **USER-FLOW.md, SCREEN-LIST.md** - UX flow

### 3.3 Ketika Dokumentasi Tidak Jelas

**Jika menemukan ketidakjelasan**:

1. ❓ ASK USER - Jangan assume, tanya dulu
2. 📝 Document decision - Catat keputusan yang diambil
3. 🔍 Check existing pattern - Lihat code similar yang sudah ada
4. ⚠️ Flag ambiguity - Beri warning jika ada risiko

---

## 4. Urutan Dokumen yang WAJIB Dibaca Sebelum Coding

### 4.1 WAJIB Dibaca (Prioritas P0)

**Baca dalam urutan ini SEBELUM menulis kode**:

| No | Dokumen | Apa yang Dicari | Kapan Dibaca |
|----|---------|-----------------|--------------|
| 1 | PROJECT-BRIEF.md | Identitas proyek, tech stack, scope MVP | SELALU pertama kali |
| 2 | BUSINESS-RULES.md | Aturan bisnis, workflow, permissions | SEBELUM implement logic |
| 3 | VALIDATION-RULES.md | Aturan validasi per field, error messages | SEBELUM buat form/API |
| 4 | API-CONTRACT.md | Endpoint spec, request/response format | SEBELUM buat API |
| 5 | ERD-DATABASE.md | Database schema, relationships, constraints | SEBELUM buat entity/migration |
| 6 | **Existing Code** | Pattern, naming, structure yang sudah ada | SEBELUM buat file baru |

### 4.2 Penting Dibaca (Prioritas P1)

| No | Dokumen | Apa yang Dicari | Kapan Dibaca |
|----|---------|-----------------|--------------|
| 7 | PRD.md | Feature requirements, user stories | SEBELUM implement feature |
| 8 | FEATURE-LIST.md | List fitur MVP, prioritas | Untuk understanding scope |
| 9 | USER-FLOW.md | Alur user, happy path & error path | Untuk understanding UX |
| 10 | SCREEN-LIST.md | Daftar screens, components | SEBELUM buat UI |

### 4.3 Optional (Prioritas P2)

| No | Dokumen | Apa yang Dicari | Kapan Dibaca |
|----|---------|-----------------|--------------|
| 11 | BRD.md | Business background, goals | Untuk context bisnis |
| 12 | DOCUMENTATION-PLAN.md | Document roadmap | Untuk planning |

### 4.4 Checklist Sebelum Start Coding

**AI, kamu WAJIB bisa jawab pertanyaan ini SEBELUM coding**:

- [ ] Apakah aku sudah baca BUSINESS-RULES.md untuk modul ini?
- [ ] Apakah aku sudah baca VALIDATION-RULES.md untuk endpoint/form ini?
- [ ] Apakah aku sudah baca API-CONTRACT.md untuk format response?
- [ ] Apakah aku sudah baca ERD-DATABASE.md untuk schema entity ini?
- [ ] Apakah aku sudah check existing code untuk pattern yang sama?
- [ ] Apakah aku sudah tahu soft delete MANDATORY?
- [ ] Apakah aku sudah tahu tenant isolation WAJIB?
- [ ] Apakah aku sudah tahu error messages harus Bahasa Indonesia?

**Jika ada yang belum, STOP dan baca dulu!**

---

## 5. Aturan Coding Backend (NestJS)

### 5.1 Project Structure (WAJIB Diikuti)

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/                    # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── ...
│   │   │   ├── guards/
│   │   │   │   ├── jwt.guard.ts
│   │   │   │   └── ...
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   ├── users/                   # User management module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── users.module.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       ├── update-user.dto.ts
│   │   │       └── user-response.dto.ts
│   │   └── .../                     # Other modules
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   ├── filters/
│   │   └── utils/
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── ...
│   ├── database/
│   │   ├── drizzle.provider.ts
│   │   ├── migrations/
│   │   └── schema/
│   │       ├── public/              # Global schema
│   │       └── tenant/              # Tenant schema
│   └── main.ts
├── test/
└── drizzle.config.ts
```

### 5.2 Naming Conventions (WAJIB)

| Item | Convention | Example | Larangan |
|------|------------|---------|----------|
| File | kebab-case | `user.controller.ts` | ❌ UserController.ts, user_controller.ts |
| Class | PascalCase | `UserController` | ❌ userController, user_controller |
| Method | camelCase | `createUser()` | ❌ CreateUser(), create_user() |
| Variable | camelCase | `userId` | ❌ UserId, user_id |
| Constant | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` | ❌ maxLoginAttempts |
| Interface | PascalCase + I prefix | `IUserRepository` | ❌ UserRepository, iUserRepository |
| Type | PascalCase | `UserRole` | ❌ userRole, user_role |
| Enum | PascalCase | `UserStatus` | ❌ userStatus, USER_STATUS |
| Database Column | snake_case | `created_at` | ❌ createdAt, CreatedAt |

### 5.3 Module Pattern (WAJIB)

**Setiap module HARUS punya**:

```typescript
// 1. Module file (users.module.ts)
@Module({
  imports: [/* dependencies */],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService], // Export jika dipakai module lain
})
export class UsersModule {}

// 2. Controller (users.controller.ts)
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions('users.read.tenant')
  async findAll(@Query() query: FindAllUsersDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  @Permissions('users.create.tenant')
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}

// 3. Service (users.service.ts)
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    // Business logic here
    const user = await this.usersRepository.create(dto);
    await this.auditService.log('create', 'users', user.id);
    return new UserResponseDto(user);
  }
}

// 4. Repository (users.repository.ts)
@Injectable()
export class UsersRepository {
  constructor(
    @Inject('DRIZZLE') private readonly db: DrizzleDB,
    @Inject('TENANT_CONTEXT') private readonly tenant: TenantContext,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const schema = this.tenant.getSchema();
    return this.db.insert(schema.users).values(dto).returning();
  }

  async findAll(filters: any): Promise<User[]> {
    const schema = this.tenant.getSchema();
    return this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.deleted_at, null)) // Soft delete filter
      .where(eq(schema.users.tenant_id, this.tenant.id));
  }
}
```

### 5.4 DTO Pattern (WAJIB)

**Gunakan Zod untuk validation**:

```typescript
// dto/create-user.dto.ts
import { z } from 'zod';

export const CreateUserDtoSchema = z.object({
  email: z
    .string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter')
    .transform(val => val.toLowerCase()),
  
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password harus mengandung huruf besar, huruf kecil, dan angka'),
  
  name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(255, 'Nama maksimal 255 karakter'),
  
  phone: z
    .string()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .optional(),
  
  roleIds: z
    .array(z.number().int().positive())
    .min(1, 'Minimal pilih 1 role'),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
```

### 5.5 Response Format (WAJIB)

**Semua API HARUS return format ini**:

```typescript
// Success Response
{
  "success": true,
  "data": { /* actual data */ },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
    // + pagination jika list
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi gagal",
    "errors": [
      {
        "field": "email",
        "message": "Email tidak valid"
      }
    ]
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Gunakan Response Interceptor**:

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        meta: {
          requestId: context.switchToHttp().getRequest().id,
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
```

### 5.6 Error Handling (WAJIB)

**Gunakan built-in exceptions**:

```typescript
// Bad ❌
throw new Error('User not found');

// Good ✅
throw new NotFoundException({
  code: 'USER_NOT_FOUND',
  message: 'User tidak ditemukan',
  errors: [],
});

// With validation errors ✅
throw new BadRequestException({
  code: 'VALIDATION_ERROR',
  message: 'Validasi gagal',
  errors: [
    { field: 'email', message: 'Email tidak valid' }
  ],
});
```

### 5.7 Soft Delete (MANDATORY)

**SEMUA delete operation HARUS soft delete**:

```typescript
// Bad ❌ - Hard delete
async delete(id: number): Promise<void> {
  await this.db.delete(users).where(eq(users.id, id));
}

// Good ✅ - Soft delete
async delete(id: number, deletedBy: number): Promise<void> {
  const schema = this.tenant.getSchema();
  await this.db
    .update(schema.users)
    .set({
      deleted_at: new Date(),
      deleted_by: deletedBy,
    })
    .where(eq(schema.users.id, id));
  
  // Invalidate sessions
  await this.sessionService.invalidateUserSessions(id);
  
  // Audit log
  await this.auditService.log('delete', 'users', id);
}

// Restore function
async restore(id: number): Promise<void> {
  const schema = this.tenant.getSchema();
  await this.db
    .update(schema.users)
    .set({
      deleted_at: null,
      deleted_by: null,
    })
    .where(eq(schema.users.id, id));
  
  await this.auditService.log('restore', 'users', id);
}
```

### 5.8 Tenant Isolation (MANDATORY)

**SEMUA query HARUS tenant-aware**:

```typescript
// Bad ❌ - No tenant filter
async findAll(): Promise<User[]> {
  return this.db.select().from(users);
}

// Good ✅ - With tenant filter
async findAll(): Promise<User[]> {
  const schema = this.tenant.getSchema(); // Get tenant schema
  return this.db
    .select()
    .from(schema.users)
    .where(eq(schema.users.tenant_id, this.tenant.id))
    .where(isNull(schema.users.deleted_at)); // Soft delete filter
}
```

### 5.9 Security (MANDATORY)

**Input Sanitization**:

```typescript
// Use middleware untuk sanitize semua input
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitize(req.body);
    }
    if (req.query) {
      req.query = this.sanitize(req.query);
    }
    next();
  }

  private sanitize(obj: any): any {
    // Remove HTML tags, escape special chars
    // Implementation here
  }
}
```

**Permission Check**:

```typescript
// Use decorator untuk check permission
@Permissions('users.create.tenant')
async create(@Body() dto: CreateUserDto) {
  // Permission sudah di-check oleh guard
}
```

### 5.10 Audit Logging (MANDATORY untuk Critical Operations)

**Audit ALL critical operations**:

```typescript
await this.auditService.log({
  userId: currentUser.id,
  tenantId: this.tenant.id,
  action: 'create', // create, update, delete, login, logout
  resource: 'users',
  resourceId: user.id,
  oldValues: null, // For update operations
  newValues: user, // For create/update operations
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

---

## 6. Aturan Coding Frontend (Next.js)

### 6.1 Project Structure (WAJIB Diikuti)

**PENTING**: Struktur path TIDAK boleh mudah ditebak untuk security

```
frontend/
├── app/
│   ├── (auth)/                      # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (private)/                   # Private layout group (BUKAN dashboard)
│   │   ├── portal/                  # Main dashboard (BUKAN /dashboard)
│   │   │   └── page.tsx
│   │   ├── mgmt-users/              # User management (BUKAN /users)
│   │   │   ├── page.tsx             # List
│   │   │   ├── new/                 # Create (BUKAN /create)
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # Detail
│   │   │       └── modify/          # Edit (BUKAN /edit)
│   │   │           └── page.tsx
│   │   ├── mgmt-roles/              # Role management (BUKAN /roles)
│   │   │   └── ...
│   │   ├── mgmt-tenants/            # Tenant management (BUKAN /tenants)
│   │   │   └── ...
│   │   ├── data-master/             # Master data (BUKAN /master-data)
│   │   │   ├── categories/
│   │   │   └── tags/
│   │   ├── sys-audit/               # Audit logs (BUKAN /audit-logs)
│   │   │   └── page.tsx
│   │   ├── sys-settings/            # Settings (BUKAN /settings)
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx                   # Root layout
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── forms/
│   │   ├── user-form.tsx
│   │   └── ...
│   └── tables/
│       ├── user-table.tsx
│       └── ...
├── lib/
│   ├── api.ts                       # API client
│   ├── utils.ts                     # Utilities
│   └── validations.ts               # Zod schemas
├── hooks/
│   ├── use-auth.ts
│   ├── use-users.ts
│   └── ...
├── stores/
│   ├── auth.store.ts                # Zustand stores
│   └── ...
├── types/
│   ├── user.types.ts
│   └── ...
└── public/
```

### 6.2 Naming Conventions (WAJIB)

| Item | Convention | Example | Larangan |
|------|------------|---------|----------|
| File/Folder | kebab-case | `user-form.tsx` | ❌ UserForm.tsx, user_form.tsx |
| Component | PascalCase | `UserForm` | ❌ userForm, user_form |
| Hook | camelCase + use prefix | `useUsers` | ❌ UseUsers, users |
| Variable | camelCase | `userId` | ❌ UserId, user_id |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL` | ❌ apiBaseUrl |
| Type/Interface | PascalCase | `User`, `UserFormProps` | ❌ user, userFormProps |

### 6.3 Component Pattern (WAJIB)

**Functional Components Only**:

```typescript
// Bad ❌ - Class component
class UserForm extends React.Component {
  render() { /* ... */ }
}

// Good ✅ - Functional component
export function UserForm({ userId }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  
  // Component logic here
  
  return (
    <form>{/* ... */}</form>
  );
}
```

**Component Structure**:

```typescript
'use client'; // If using client components

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Types
interface UserFormProps {
  userId?: number;
  onSuccess?: () => void;
}

// 2. Validation schema
const userFormSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
});

type UserFormData = z.infer<typeof userFormSchema>;

// 3. Component
export function UserForm({ userId, onSuccess }: UserFormProps) {
  // 3.1 Hooks
  const [loading, setLoading] = useState(false);
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
  });
  
  // 3.2 Handlers
  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      // API call
      await createUser(data);
      toast.success('User berhasil dibuat');
      onSuccess?.();
    } catch (error) {
      toast.error('Gagal membuat user');
    } finally {
      setLoading(false);
    }
  };
  
  // 3.3 Render
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 6.4 State Management (WAJIB)

**Use Zustand untuk Global State**:

```typescript
// stores/auth.store.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

**Use TanStack Query untuk Server State**:

```typescript
// hooks/use-users.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### 6.5 Form Handling (WAJIB)

**Use React Hook Form + Zod**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<UserFormData>({
  resolver: zodResolver(userFormSchema),
  defaultValues: {
    email: '',
    name: '',
  },
});

// Render with error handling
<Input
  {...form.register('email')}
  error={form.formState.errors.email?.message}
/>
```

### 6.6 API Client (WAJIB)

**Consistent API calls**:

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data.data, // Return data only
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      logout();
    }
    throw error.response?.data?.error || error;
  }
);

export default api;
```

### 6.7 Error Handling (WAJIB)

**Show user-friendly errors**:

```typescript
try {
  await createUser(data);
  toast.success('User berhasil dibuat');
} catch (error: any) {
  // Per-field errors
  if (error.code === 'VALIDATION_ERROR') {
    error.errors?.forEach((err: any) => {
      form.setError(err.field, { message: err.message });
    });
  } else {
    // General error
    toast.error(error.message || 'Terjadi kesalahan');
  }
}
```

### 6.8 Loading States (WAJIB)

**Always show loading states**:

```typescript
function UserList() {
  const { data, isLoading, isError, error } = useUsers();
  
  if (isLoading) {
    return <TableSkeleton />;
  }
  
  if (isError) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }
  
  if (data.length === 0) {
    return <EmptyState message="Belum ada user" />;
  }
  
  return <DataTable data={data} />;
}
```

### 6.9 Styling (WAJIB)

**Use Tailwind CSS Only**:

```typescript
// Bad ❌ - Inline styles
<div style={{ color: 'red' }}>Text</div>

// Bad ❌ - CSS modules
<div className={styles.container}>Text</div>

// Good ✅ - Tailwind classes
<div className="text-red-500 font-bold">Text</div>

// Good ✅ - Conditional classes with cn()
<div className={cn(
  "px-4 py-2",
  isActive && "bg-blue-500 text-white"
)}>
  Text
</div>
```

### 6.10 Accessibility (WAJIB)

**Follow accessibility best practices**:

```typescript
// Good ✅ - Proper labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Good ✅ - ARIA labels
<button aria-label="Delete user">
  <TrashIcon />
</button>

// Good ✅ - Keyboard navigation
<div role="button" tabIndex={0} onKeyDown={handleKeyDown}>
  Clickable div
</div>
```

---

## 7. Aturan Database/Migration

### 7.1 Schema Structure (MANDATORY)

**WAJIB mengikuti multi-tenancy schema-based**:

```
PostgreSQL Database: platform_cms
│
├── Schema: public (Global tables)
│   ├── tenants
│   ├── modules
│   ├── module_permissions
│   └── system_settings
│
└── Schema: tenant_xxx (Per tenant)
    ├── users
    ├── roles
    ├── permissions
    ├── user_roles
    ├── role_permissions
    ├── tenant_modules
    ├── sessions
    ├── audit_logs
    └── ... (application tables)
```

### 7.2 Drizzle ORM Pattern (WAJIB)

**Entity Definition**:

```typescript
// database/schema/tenant/users.schema.ts
import { pgTable, bigserial, varchar, timestamp, boolean, bigint } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  avatar_url: varchar('avatar_url', { length: 500 }),
  is_active: boolean('is_active').notNull().default(true),
  is_verified: boolean('is_verified').notNull().default(false),
  last_login_at: timestamp('last_login_at', { withTimezone: true }),
  
  // Audit fields (MANDATORY)
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
  
  // Soft delete fields (MANDATORY)
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
});
```

### 7.3 Migration Rules (WAJIB)

**Migration File Naming**:

```
Format: YYYYMMDDHHMMSS_description.ts
Example: 20240108100000_create_users_table.ts
```

**Migration Content**:

```typescript
// migrations/20240108100000_create_users_table.ts
import { sql } from 'drizzle-orm';
import { DrizzleDB } from '../drizzle.provider';

export async function up(db: DrizzleDB): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      -- ... other fields
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
  `);
}

export async function down(db: DrizzleDB): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS users;`);
}
```

### 7.4 Column Naming (MANDATORY)

| Type | Convention | Example | Larangan |
|------|------------|---------|----------|
| Primary Key | id (bigserial) | `id` | ❌ user_id, userId |
| Foreign Key | table_id | `user_id`, `role_id` | ❌ userId, roleId |
| Timestamp | snake_case + _at | `created_at`, `deleted_at` | ❌ createdAt, created |
| Boolean | is_ prefix | `is_active`, `is_verified` | ❌ active, verified |
| String | snake_case | `full_name`, `email` | ❌ fullName, Email |

### 7.5 Soft Delete Columns (MANDATORY untuk semua entity krusial)

**WAJIB ada di setiap table**:

```sql
deleted_at TIMESTAMP WITH TIME ZONE,
deleted_by BIGINT REFERENCES users(id) ON DELETE SET NULL
```

**Index untuk performance**:

```sql
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
```

### 7.6 Audit Columns (MANDATORY)

**WAJIB ada di setiap table**:

```sql
created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL
```

### 7.7 Larangan Database

❌ **JANGAN pernah**:
- Hard delete data krusial
- Skip soft delete columns
- Skip audit columns
- Gunakan varchar tanpa length limit
- Gunakan serial (gunakan bigserial)
- Buat table tanpa primary key
- Buat foreign key tanpa index
- Gunakan raw SQL tanpa parameterized query

---

## 8. Aturan API Response

### 8.1 Success Response (MANDATORY Format)

**Semua API WAJIB return format ini**:

```json
{
  "success": true,
  "data": {
    /* actual data */
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Untuk List dengan Pagination**:

```json
{
  "success": true,
  "data": [
    /* array of items */
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "requestId": "req_abc123",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

### 8.2 Error Response (MANDATORY Format)

**Format Error Response**:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Pesan error dalam Bahasa Indonesia",
    "errors": [
      {
        "field": "email",
        "message": "Email tidak valid"
      }
    ]
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

### 8.3 HTTP Status Codes (MANDATORY)

| Status | Usage | Example |
|--------|-------|---------|
| 200 | Success GET, PUT, PATCH | Data retrieved/updated |
| 201 | Success POST | Data created |
| 204 | Success DELETE | Data deleted |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate/conflict |
| 422 | Unprocessable Entity | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### 8.4 Error Codes (WAJIB dari VALIDATION-RULES.md)

**Gunakan error codes yang sudah didefinisikan**:

- `VALIDATION_ERROR` - Validation failed
- `AUTHENTICATION_REQUIRED` - No token
- `INVALID_TOKEN` - Invalid/expired token
- `INVALID_CREDENTIALS` - Login failed
- `PERMISSION_DENIED` - No permission
- `RESOURCE_NOT_FOUND` - Not found
- `DUPLICATE_RESOURCE` - Already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

### 8.5 Pesan Error (MANDATORY Bahasa Indonesia)

**SEMUA error message WAJIB dalam Bahasa Indonesia**:

```typescript
// Bad ❌ - English
throw new BadRequestException('Email is required');

// Good ✅ - Bahasa Indonesia
throw new BadRequestException({
  code: 'VALIDATION_ERROR',
  message: 'Validasi gagal',
  errors: [
    { field: 'email', message: 'Email wajib diisi' }
  ]
});
```

---

## 9. Aturan Validasi

### 9.1 Validation Layer (MANDATORY 2 Layer)

**1. Frontend Validation (Real-time UX)**:

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi'),
});
```

**2. Backend Validation (Security & Data Integrity)**:

```typescript
import { z } from 'zod';

export const CreateUserDtoSchema = z.object({
  email: z
    .string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter')
    .transform(val => val.toLowerCase()),
  // ... other fields
});
```

### 9.2 Validation Messages (MANDATORY Bahasa Indonesia)

**WAJIB ikuti format dari VALIDATION-RULES.md**:

```typescript
// Template: {Field} {requirement} {constraint}

// Examples:
'Email wajib diisi'
'Password minimal 8 karakter'
'Nama maksimal 255 karakter'
'Format email tidak valid'
'Email sudah terdaftar'
```

### 9.3 Per-Field Errors (MANDATORY)

**Error HARUS per-field, BUKAN bundled**:

```typescript
// Bad ❌ - Bundled error
throw new BadRequestException('Email dan password tidak valid');

// Good ✅ - Per-field errors
throw new BadRequestException({
  code: 'VALIDATION_ERROR',
  message: 'Validasi gagal',
  errors: [
    { field: 'email', message: 'Format email tidak valid' },
    { field: 'password', message: 'Password minimal 8 karakter' }
  ]
});
```

### 9.4 Validation Priority (WAJIB Urutan Ini)

1. Required fields
2. Data type dan format
3. Length/size constraints
4. Business rules
5. Uniqueness
6. Foreign key constraints

### 9.5 Custom Validators (Business Rules)

**Untuk business rule validation**:

```typescript
// Unique email validator
async validateUniqueEmail(email: string, tenantId: number): Promise<void> {
  const exists = await this.userRepo.findByEmail(email, tenantId);
  if (exists) {
    throw new ConflictException({
      code: 'DUPLICATE_VALUE',
      message: 'Email sudah terdaftar',
      errors: [{ field: 'email', message: 'Email sudah terdaftar' }]
    });
  }
}
```

---

## 10. Aturan Security

### 10.1 Input Sanitization (MANDATORY)

**SEMUA input WAJIB di-sanitize**:

```typescript
// Middleware untuk auto-sanitize
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }
    // Sanitize query
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }
    next();
  }

  private sanitizeObject(obj: any): any {
    // Strip HTML tags
    // Escape special characters
    // Remove XSS patterns
    return sanitized;
  }
}
```

### 10.2 Authentication (MANDATORY)

**JWT Token Pattern**:

```typescript
// Token structure
{
  userId: number,
  email: string,
  tenantId: number,
  roles: string[],
  iat: number,
  exp: number
}

// Token storage
// Backend: HTTP-only cookie (secure, sameSite: strict)
// Frontend: Tidak perlu simpan di localStorage (gunakan cookie)
```

### 10.3 Authorization (MANDATORY)

**Permission Check Pattern**:

```typescript
// Use decorator
@Permissions('users.create.tenant')
async create(@Body() dto: CreateUserDto) {
  // Permission checked by guard
}

// Permission format: {resource}.{action}.{scope}
// Examples:
// - users.create.tenant (create user dalam tenant)
// - users.read.own (read own data)
// - users.update.all (update all users - Super Admin)
```

### 10.4 Rate Limiting (MANDATORY)

**Rate limits**:

```typescript
// Per tenant: 1000 requests/minute
// Per user: 100 requests/minute
// Login endpoint: 5 attempts/15 minutes
// API general: 60 requests/minute per user
```

### 10.5 SQL Injection Prevention (MANDATORY)

**WAJIB gunakan parameterized queries**:

```typescript
// Bad ❌ - String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// Good ✅ - Drizzle ORM (auto-parameterized)
await db
  .select()
  .from(users)
  .where(eq(users.email, email));
```

### 10.6 XSS Prevention (MANDATORY)

**Input sanitization + Output encoding**:

```typescript
// Input: Strip HTML tags
const sanitized = stripHtml(input);

// Output: Auto-escaped by framework (React, NestJS)
// Never use dangerouslySetInnerHTML without sanitization
```

### 10.7 Password Security (MANDATORY)

**Password rules**:

```typescript
// Hashing: bcrypt with cost 10-12
const hash = await bcrypt.hash(password, 10);

// Validation:
// - Min 8 characters
// - Must contain: uppercase, lowercase, number
// - Cannot be same as email
// - Cannot reuse old passwords (Phase 2)
```

### 10.8 Audit Logging Security Events (MANDATORY)

**Log ALL security events**:

```typescript
await this.auditService.log({
  action: 'login_failed',
  resource: 'auth',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  details: { email, reason: 'invalid_credentials' }
});
```

---

## 11. Aturan Role & Permission

### 11.1 Role Hierarchy (WAJIB)

**Role hierarchy (tinggi ke rendah)**:

1. **Super Admin** - Full access semua tenants
2. **Tenant Admin** - Full access dalam tenant sendiri
3. **User** - Limited access based on permissions
4. **Guest** - Read-only access (optional)

### 11.2 Permission Format (MANDATORY)

**Format**: `{resource}.{action}.{scope}`

**Examples**:

```typescript
'users.create.tenant'  // Create user dalam tenant
'users.read.own'       // Read own data
'users.read.tenant'    // Read all users dalam tenant
'users.read.all'       // Read all users (Super Admin)
'users.update.own'     // Update own profile
'users.update.tenant'  // Update users dalam tenant
'users.delete.tenant'  // Delete users dalam tenant
```

### 11.3 Permission Scopes (MANDATORY)

| Scope | Access Level | Example |
|-------|--------------|---------|
| `own` | Own data only | View/edit own profile |
| `tenant` | Tenant data | Manage users dalam tenant |
| `all` | All tenants | Super Admin access |

### 11.4 Permission Check Implementation (MANDATORY)

**Backend**:

```typescript
@Permissions('users.create.tenant')
@UseGuards(JwtAuthGuard, PermissionGuard)
async create(@Body() dto: CreateUserDto) {
  // Guards already checked permission
}
```

**Frontend**:

```typescript
// Hide UI elements without permission
{hasPermission('users.create.tenant') && (
  <Button onClick={handleCreate}>Tambah User</Button>
)}
```

### 11.5 System Roles (IMMUTABLE)

**System roles TIDAK BOLEH dihapus**:

- `super_admin` - Super Administrator
- `admin` - Tenant Administrator  
- `operator` - Regular User

**Custom roles boleh dibuat per tenant**

### 11.6 Role Assignment Rules (MANDATORY)

- User WAJIB punya minimal 1 role
- User bisa punya multiple roles
- Permission = UNION dari semua roles
- Changes langsung berlaku (invalidate cache/session)

---

## 12. Aturan Update Dokumentasi

### 12.1 Kapan Update Dokumentasi (MANDATORY)

**WAJIB update dokumentasi jika**:

1. ✅ Menambah endpoint baru → Update API-CONTRACT.md
2. ✅ Menambah validation rule → Update VALIDATION-RULES.md
3. ✅ Menambah business rule → Update BUSINESS-RULES.md
4. ✅ Menambah table/column → Update ERD-DATABASE.md
5. ✅ Menambah screen/component → Update SCREEN-LIST.md
6. ✅ Mengubah user flow → Update USER-FLOW.md
7. ✅ Menambah feature → Update FEATURE-LIST.md

### 12.2 Format Update Dokumentasi

**Tambahkan di section yang sesuai**:

```markdown
## X. Nama Section (Updated: 2024-01-XX)

### X.X New Feature

**Added**: 2024-01-XX by AI

[Content here...]

**Changes**:
- Added: New endpoint GET /api/v1/...
- Modified: Updated validation for ...
- Deprecated: Old endpoint will be removed in Phase 2
```

### 12.3 Change Log (WAJIB)

**Update change log di akhir dokumen**:

```markdown
## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.1 | 2024-01-10 | Added new endpoint | AI |
| 1.0 | 2024-01-08 | Initial document | Team |
```

---

## 13. LARANGAN untuk AI

### 13.1 JANGAN PERNAH (Critical)

❌ **Rewrite dari awal tanpa alasan kuat**
- Jangan rebuild module yang sudah ada
- Jangan refactor besar-besaran
- Jangan change structure existing code

❌ **Mengubah tech stack yang ditentukan**
- Jangan ganti Drizzle ORM ke Prisma/TypeORM
- Jangan ganti Next.js ke framework lain
- Jangan ganti Zustand ke Redux
- Jangan tambah dependencies baru tanpa approval

❌ **Ignore dokumentasi**
- Jangan skip baca BUSINESS-RULES.md
- Jangan skip baca VALIDATION-RULES.md
- Jangan skip baca API-CONTRACT.md
- Jangan assume tanpa cek docs

❌ **Hard delete data**
- Jangan delete permanent data krusial
- Jangan skip soft delete implementation
- Jangan skip deleted_at columns

❌ **Skip tenant isolation**
- Jangan query tanpa tenant filter
- Jangan skip tenant context check
- Jangan allow cross-tenant access

❌ **Skip validation**
- Jangan skip input validation
- Jangan skip sanitization
- Jangan skip permission check

❌ **English error messages**
- Jangan gunakan pesan error dalam English
- Jangan skip Bahasa Indonesia
- Jangan mix English-Indonesian

❌ **Menambah fitur di luar scope MVP**
- Jangan implement Phase 2 features di Phase 1
- Jangan tambah fitur yang tidak diminta
- Jangan over-engineer

### 13.2 SELALU LAKUKAN (Mandatory)

✅ **Check existing code first**
- Baca code yang sudah ada
- Follow existing pattern
- Maintain consistency

✅ **Follow documentation**
- Read docs BEFORE coding
- Follow business rules strictly
- Follow validation rules exactly

✅ **Ask if unclear**
- Don't assume
- Confirm dengan user
- Document decision

✅ **Test your code**
- Write tests untuk new code
- Run tests sebelum commit
- Fix failing tests

✅ **Incremental changes**
- Small commits
- One feature at a time
- Easy to review

✅ **Security first**
- Sanitize input
- Validate everything
- Check permissions
- Audit logging

✅ **Multi-tenancy aware**
- Always tenant filter
- Schema switching
- Data isolation

✅ **Soft delete everything**
- Never hard delete
- Always audit trail
- Restore functionality

---

## 14. Format Laporan Setelah Coding

### 14.1 Template Laporan (WAJIB Gunakan)

**Setelah selesai coding, AI WAJIB buat laporan dengan format ini**:

```markdown
# Laporan Coding - [Nama Fitur/Task]

**Tanggal**: YYYY-MM-DD HH:MM
**Dikerjakan oleh**: AI Assistant
**Durasi**: X jam/menit
**Status**: ✅ Selesai / ⚠️ Partial / ❌ Blocked

---

## 1. Task yang Dikerjakan

**Deskripsi**:
[Jelaskan task apa yang dikerjakan]

**Scope**:
- [x] Item 1 yang selesai
- [x] Item 2 yang selesai
- [ ] Item 3 yang belum (jika ada)

---

## 2. File yang Dibuat/Diubah

### File Baru (Created):
- `backend/src/modules/users/users.controller.ts` - User controller dengan 5 endpoints
- `backend/src/modules/users/users.service.ts` - Business logic untuk user management
- `backend/src/modules/users/users.repository.ts` - Database operations
- `backend/src/modules/users/dto/create-user.dto.ts` - DTO untuk create user
- `frontend/app/(private)/mgmt-users/page.tsx` - User list page

### File Diubah (Modified):
- `backend/src/app.module.ts` - Added UsersModule import
- `backend/src/database/schema/tenant/index.ts` - Export users schema
- `docs/API-CONTRACT.md` - Added user management endpoints
- `docs/VALIDATION-RULES.md` - Added user validation rules

### File Dihapus (Deleted):
- (None)

**Total**: 5 created, 4 modified, 0 deleted

---

## 3. Dokumentasi yang Diupdate

- [x] API-CONTRACT.md - Section 8: User Management Endpoints
- [x] VALIDATION-RULES.md - Section 2: User Validation Rules
- [ ] ERD-DATABASE.md - (No changes needed)
- [ ] BUSINESS-RULES.md - (No changes needed)

---

## 4. Testing Status

### Unit Tests:
- [x] `users.service.spec.ts` - 8 tests, all passing
- [x] `users.repository.spec.ts` - 5 tests, all passing

### Integration Tests:
- [x] `users.controller.spec.ts` - 10 tests, all passing

### Manual Testing:
- [x] Create user - ✅ Working
- [x] List users - ✅ Working
- [x] Update user - ✅ Working
- [x] Delete user (soft) - ✅ Working
- [x] Restore user - ✅ Working

**Coverage**: 85% (target: 80%+)

---

## 5. Checklist Compliance

### Business Rules:
- [x] Soft delete implemented (BR-004)
- [x] Tenant isolation enforced (BR-001)
- [x] Audit logging implemented (BR-007)
- [x] Permission check implemented (BR-020)
- [x] Role assignment validated (BR-020)

### Validation Rules:
- [x] Email validation (VR-2.1)
- [x] Password strength (VR-2.1)
- [x] Per-field errors (VR-11.2)
- [x] Bahasa Indonesia messages (VR-11.2)

### Security:
- [x] Input sanitization
- [x] Permission guards
- [x] Rate limiting
- [x] XSS prevention
- [x] SQL injection prevention

### API Contract:
- [x] Response format consistent
- [x] HTTP status codes correct
- [x] Error codes from standard list
- [x] Pagination format correct

---

## 6. Known Issues / Limitations

### Issues:
1. (None saat ini)

### Limitations:
1. Email notification belum actual (Phase 1 log only) - As per design
2. MFA belum implemented - Planned for Phase 2

### Technical Debt:
1. (None)

---

## 7. Next Steps

**Immediate**:
- [ ] Review code dengan team
- [ ] Merge ke development branch
- [ ] Update project board

**Future**:
- [ ] Implement role management (next task)
- [ ] Add export functionality (Phase 2)
- [ ] Add email notifications (Phase 2)

---

## 8. Dependencies

**Added**:
- (None - used existing dependencies)

**Updated**:
- (None)

**Removed**:
- (None)

---

## 9. Breaking Changes

**None** - All changes backward compatible

---

## 10. Notes for Team

**Important**:
- User routes menggunakan path `/mgmt-users` bukan `/users` untuk security
- Soft delete WAJIB digunakan, hard delete hanya untuk Super Admin
- Email verification placeholder di Phase 1, actual di Phase 2

**Questions for Product Owner**:
- (None saat ini)

---

**Prepared by**: AI Assistant
**Ready for**: Code Review ✅
```

---

### 14.2 Kapan Buat Laporan (MANDATORY)

**AI WAJIB buat laporan setelah**:

1. ✅ Selesai implement 1 complete feature
2. ✅ Selesai coding session (>2 jam)
3. ✅ Sebelum switch ke task berbeda
4. ✅ Ketika ada blocking issue
5. ✅ Setelah major refactoring
6. ✅ Sebelum commit ke git

---

### 14.3 Where to Save Laporan

**Simpan laporan di**:

```
docs/progress/
├── 2024-01-08_user-management.md
├── 2024-01-09_role-management.md
└── ...
```

**Naming**: `YYYY-MM-DD_feature-name.md`

---

## 15. Format Update AI_PROGRESS-LOG.md

### 15.1 Progress Log Structure

**File**: `docs/AI-PROGRESS-LOG.md`

```markdown
# AI Progress Log
# Platform CMS Development

**Last Updated**: YYYY-MM-DD HH:MM

---

## Summary Progress

| Phase | Status | Progress | Estimated |
|-------|--------|----------|-----------|
| Phase 1 - MVP | 🟡 In Progress | 35% | Week 6 of 16 |
| Phase 2 - Enhancements | ⏸️ Not Started | 0% | TBD |
| Phase 3 - Use Case | ⏸️ Not Started | 0% | TBD |

---

## Current Sprint (Week 6)

**Sprint Goal**: Complete User & Role Management

**Progress**: 3 of 5 tasks completed (60%)

| Task | Status | Assignee | Notes |
|------|--------|----------|-------|
| User CRUD Backend | ✅ Done | AI | 2024-01-08 |
| User CRUD Frontend | ✅ Done | AI | 2024-01-08 |
| Role CRUD Backend | ✅ Done | AI | 2024-01-09 |
| Role CRUD Frontend | 🔄 In Progress | AI | Started 2024-01-09 |
| Permission Management | 📋 Todo | - | Planned 2024-01-10 |

---

## Completed This Week

### 2024-01-09 (Wednesday)
- ✅ Implemented Role Management Backend
  - Created role.controller.ts, role.service.ts, role.repository.ts
  - Added role validation rules
  - Implemented soft delete
  - 100% test coverage
  - **Files**: 8 created, 3 modified
  - **Report**: docs/progress/2024-01-09_role-management.md

### 2024-01-08 (Tuesday)
- ✅ Implemented User Management Full Stack
  - Backend: controller, service, repository
  - Frontend: list, create, edit, detail pages
  - Tests: 23 tests, all passing
  - **Files**: 12 created, 5 modified
  - **Report**: docs/progress/2024-01-08_user-management.md

---

## Module Completion Status

### Backend Modules

| Module | Progress | Status | Tests | Last Update |
|--------|----------|--------|-------|-------------|
| Authentication | 100% | ✅ Complete | 18/18 ✅ | 2024-01-05 |
| User Management | 100% | ✅ Complete | 23/23 ✅ | 2024-01-08 |
| Role Management | 100% | ✅ Complete | 15/15 ✅ | 2024-01-09 |
| Permission Management | 0% | 📋 Todo | 0/0 | - |
| Tenant Management | 0% | 📋 Todo | 0/0 | - |
| Audit Log | 0% | 📋 Todo | 0/0 | - |

**Overall Backend**: 30% complete (3 of 10 modules)

### Frontend Pages

| Page | Progress | Status | Components | Last Update |
|------|----------|--------|------------|-------------|
| Login | 100% | ✅ Complete | 3 | 2024-01-05 |
| Dashboard | 100% | ✅ Complete | 5 | 2024-01-06 |
| User List | 100% | ✅ Complete | 8 | 2024-01-08 |
| User Create/Edit | 100% | ✅ Complete | 6 | 2024-01-08 |
| Role List | 80% | 🔄 In Progress | 5 | 2024-01-09 |
| Role Create/Edit | 0% | 📋 Todo | 0 | - |

**Overall Frontend**: 25% complete (15 of 60 pages)

---

## Issues & Blockers

### Current Blockers:
1. (None)

### Resolved This Week:
1. ✅ Database schema multi-tenancy - Implemented schema switching (2024-01-08)
2. ✅ Soft delete cascade - Implemented cascade logic (2024-01-08)

---

## Documentation Updates

| Document | Last Updated | Status |
|----------|--------------|--------|
| API-CONTRACT.md | 2024-01-09 | ✅ Up to date |
| VALIDATION-RULES.md | 2024-01-09 | ✅ Up to date |
| BUSINESS-RULES.md | 2024-01-05 | ✅ Up to date |
| ERD-DATABASE.md | 2024-01-08 | ✅ Up to date |
| USER-FLOW.md | 2024-01-05 | ✅ Up to date |
| SCREEN-LIST.md | 2024-01-08 | ✅ Up to date |

---

## Technical Metrics

### Code Quality:
- Test Coverage: 85% (target: 80%+) ✅
- ESLint Errors: 0 ✅
- TypeScript Errors: 0 ✅
- Security Vulnerabilities: 0 critical ✅

### Performance:
- API Response Time: <150ms avg ✅ (target: <200ms)
- Build Time: 45s (acceptable)
- Bundle Size: 850KB (needs optimization)

---

## Next Week Plan (Week 7)

**Goals**:
1. Complete Permission Management
2. Start Tenant Management
3. Implement Audit Log basic

**Tasks**:
- [ ] Permission CRUD Backend
- [ ] Permission CRUD Frontend
- [ ] Tenant CRUD Backend (50%)
- [ ] Audit Log viewing (read-only)

**Estimated Completion**: 4 tasks, ~20-25 hours

---

## Change Log

| Date | Changes | Author |
|------|---------|--------|
| 2024-01-09 | Added Role Management completion | AI |
| 2024-01-08 | Added User Management completion | AI |
| 2024-01-05 | Initial progress log | AI |

---

**Status Legend**:
- ✅ Complete
- 🔄 In Progress
- 📋 Todo
- ⏸️ On Hold
- ❌ Blocked
- ⚠️ Issues
```

---

### 15.2 Update Progress Log (MANDATORY)

**AI WAJIB update progress log setiap**:

1. ✅ Selesai 1 task
2. ✅ Setiap akhir hari (daily update)
3. ✅ Setiap blocking issue muncul
4. ✅ Setiap major milestone tercapai
5. ✅ Setiap documentation update

---

### 15.3 Progress Calculation

**Formula**:

```
Module Progress = (Completed Tasks / Total Tasks) × 100%

Overall Progress = (Completed Modules / Total Modules) × 100%
```

**Status**:
- ✅ Complete: 100% done, tested, documented
- 🔄 In Progress: Started, 1-99% done
- 📋 Todo: Not started, 0% done
- ⏸️ On Hold: Postponed/waiting
- ❌ Blocked: Cannot proceed
- ⚠️ Issues: Has problems

---

## Summary: AI Development Workflow

**Sebelum Coding**:

1. 📖 Read documentation (BUSINESS-RULES, VALIDATION-RULES, API-CONTRACT, ERD)
2. 🔍 Check existing code dan patterns
3. 📝 Plan approach (list files, confirm dengan user)
4. ✅ Checklist: Apakah semua docs sudah dibaca?

**Saat Coding**:

1. 🎯 Follow existing patterns strictly
2. ✅ Implement soft delete mandatory
3. ✅ Implement tenant isolation mandatory
4. ✅ Validate everything (frontend + backend)
5. ✅ Sanitize all inputs
6. ✅ Check permissions
7. ✅ Audit log critical operations
8. ✅ Bahasa Indonesia error messages
9. ✅ Write tests (80%+ coverage)
10. 📝 Incremental commits

**Setelah Coding**:

1. 🧪 Run tests (all must pass)
2. 📝 Update dokumentasi (API, validation, dll)
3. 📊 Buat laporan coding (format template)
4. 📈 Update progress log
5. 💾 Commit dengan clear message
6. ✅ Ready for review

**Prinsip Utama**:

1. **Documentation First** - Baca docs sebelum coding
2. **Pattern Consistency** - Follow existing patterns
3. **Security First** - Sanitize, validate, audit
4. **Multi-Tenancy Aware** - Always tenant isolation
5. **Soft Delete Always** - Never hard delete
6. **Bahasa Indonesia** - All user-facing messages
7. **Test Everything** - 80%+ coverage
8. **Incremental Work** - Small commits
9. **Never Assume** - Ask if unclear
10. **Report Everything** - Document progress

---

## Approval & Review

| Role | Status | Date |
|------|--------|------|
| Technical Lead | ⏳ Pending Review | - |
| Product Owner | ⏳ Pending Review | - |
| AI Assistant | ✅ Ready | 2024-01-08 |

---

## Final Notes untuk AI

**Ingat selalu**:

1. 🚫 **JANGAN** rewrite dari awal
2. 🚫 **JANGAN** ignore dokumentasi
3. 🚫 **JANGAN** hard delete data
4. 🚫 **JANGAN** skip tenant isolation
5. 🚫 **JANGAN** skip validation
6. 🚫 **JANGAN** English error messages
7. 🚫 **JANGAN** tambah fitur out of scope

8. ✅ **SELALU** baca docs dulu
9. ✅ **SELALU** follow existing patterns
10. ✅ **SELALU** soft delete
11. ✅ **SELALU** tenant aware
12. ✅ **SELALU** validate dan sanitize
13. ✅ **SELALU** Bahasa Indonesia
14. ✅ **SELALU** test your code
15. ✅ **SELALU** update docs
16. ✅ **SELALU** report progress

**Jika ragu, ASK!**

---

**Document Version**: 1.0  
**Status**: ✅ Complete - Ready for Use  
**Last Updated**: 2024-01-08  
**Next Review**: After Phase 1 completion

---

*Dokumen ini adalah panduan WAJIB untuk AI dalam development Platform CMS. Ikuti SEMUA aturan tanpa exception.*
