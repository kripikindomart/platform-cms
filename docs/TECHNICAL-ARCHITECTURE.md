# TECHNICAL ARCHITECTURE
# Platform CMS - Core Framework

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: Technical Architecture Specification  
**Reference**: PROJECT-BRIEF.md, PRD.md, ERD-DATABASE.md

---

## Pendahuluan

Dokumen ini menjelaskan arsitektur teknis Platform CMS secara detail, termasuk system architecture, component design, technology stack, dan deployment strategy.

**Tujuan**: Memberikan blueprint lengkap untuk implementasi teknis agar development team memiliki pemahaman yang sama tentang struktur sistem.

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture (C4 Model - Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet / Users                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Load Balancer (Nginx)                       │
│                    SSL Termination, Routing                      │
└─────────────────┬───────────────────────────┬───────────────────┘
                  │                           │
                  ▼                           ▼
┌─────────────────────────────┐   ┌──────────────────────────────┐
│   Frontend Application      │   │   Backend API Application    │
│   (Next.js 15)              │   │   (NestJS 10)                │
│   - Server Components       │   │   - REST API                 │
│   - Client Components       │   │   - JWT Authentication       │
│   - Static Assets           │   │   - Multi-tenancy Logic      │
└─────────────┬───────────────┘   └────────────┬─────────────────┘
              │                                 │
              │                                 ▼
              │                   ┌─────────────────────────────┐
              │                   │   Redis Cache               │
              │                   │   - Session Storage         │
              │                   │   - Rate Limiting           │
              │                   │   - Query Cache             │
              │                   └─────────────┬───────────────┘
              │                                 │
              └─────────────────────────────────┼─────────────────┐
                                                │                 │
                                                ▼                 ▼
                              ┌──────────────────────┐  ┌────────────────┐
                              │  PostgreSQL Database │  │  File Storage  │
                              │  - Schema: public    │  │  (Local/S3)    │
                              │  - Schema: tenant_*  │  │  - Avatars     │
                              │  - Multi-tenancy     │  │  - Documents   │
                              └──────────────────────┘  └────────────────┘
```

### 1.2 Container Architecture (C4 Model - Level 2)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                         │
├─────────────────────────────────────────────────────────────────┤
│  App Router (/app)                                              │
│  ├── (auth) Layout Group                                        │
│  │   └── Login, Register, Forgot Password                       │
│  ├── (private) Layout Group                                     │
│  │   ├── portal/ (Dashboard)                                    │
│  │   ├── mgmt-users/ (User Management)                          │
│  │   ├── mgmt-roles/ (Role Management)                          │
│  │   ├── mgmt-tenants/ (Tenant Management - Super Admin)       │
│  │   ├── data-master/ (Master Data)                             │
│  │   └── sys-settings/ (Settings)                               │
│  │                                                               │
│  Components                                                      │
│  ├── ui/ (shadcn/ui components)                                │
│  ├── layout/ (Header, Sidebar, Footer)                         │
│  ├── forms/ (Reusable forms)                                   │
│  └── tables/ (Data tables)                                     │
│                                                                  │
│  State Management                                                │
│  ├── Zustand (Global state: auth, user)                        │
│  └── TanStack Query (Server state: API calls)                  │
└─────────────────────────────────────────────────────────────────┘
                                 ▼
                        HTTPS / REST API
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS 10)                           │
├─────────────────────────────────────────────────────────────────┤
│  Middleware Layer                                                │
│  ├── Tenant Middleware (Extract tenant, switch schema)          │
│  ├── Authentication Guard (JWT verification)                    │
│  ├── Permission Guard (RBAC/CASL check)                        │
│  ├── Sanitization Middleware (XSS prevention)                  │
│  └── Logging Middleware (Request/response logging)             │
│                                                                  │
│  Modules                                                         │
│  ├── AuthModule (Login, register, JWT)                         │
│  ├── UsersModule (User CRUD)                                   │
│  ├── RolesModule (Role CRUD)                                   │
│  ├── TenantsModule (Tenant management)                         │
│  ├── AuditLogModule (Audit trail)                              │
│  └── ... (Other modules)                                        │
│                                                                  │
│  Each Module Contains                                            │
│  ├── Controller (HTTP endpoints)                                │
│  ├── Service (Business logic)                                   │
│  ├── Repository (Database operations)                           │
│  ├── Entity (Drizzle schema)                                   │
│  └── DTO (Validation schemas with Zod)                         │
│                                                                  │
│  Common Layer                                                    │
│  ├── Decorators (@Permissions, @CurrentUser)                   │
│  ├── Guards (JWT, Permission, Module)                          │
│  ├── Interceptors (Transform response, logging)                │
│  ├── Pipes (Validation, transformation)                        │
│  └── Filters (Exception handling)                              │
└─────────────────────────────────────────────────────────────────┘
                                 ▼
┌──────────────────┬──────────────────┬───────────────────────────┐
│   PostgreSQL     │      Redis       │      File Storage         │
│   (Multi-tenant) │   (Cache/Session)│      (Local/Cloud)        │
└──────────────────┴──────────────────┴───────────────────────────┘
```

---

## 2. Technology Stack Detail

### 2.1 Backend Technology Stack

```yaml
Framework:
  - NestJS: 10.x
  - TypeScript: 5.x (strict mode)
  
ORM & Database:
  - Drizzle ORM: Latest
  - PostgreSQL: 15+
  - pg (PostgreSQL client): Latest
  
Validation & Transformation:
  - Zod: Latest (schema validation)
  - class-transformer: Latest
  - class-validator: Latest
  
Authentication & Authorization:
  - @nestjs/jwt: Latest
  - passport: Latest
  - passport-jwt: Latest
  - @casl/ability: Latest (RBAC)
  - bcrypt: Latest (password hashing)
  
Caching & Session:
  - Redis: 7+
  - ioredis: Latest (Redis client)
  
Security:
  - helmet: Latest (security headers)
  - @nestjs/throttler: Latest (rate limiting)
  - sanitize-html: Latest (XSS prevention)
  
Logging & Monitoring:
  - winston: Latest (logging)
  - @nestjs/config: Latest (configuration)
  
Testing:
  - vitest: Latest (unit testing)
  - @nestjs/testing: Latest
  
API Documentation:
  - @nestjs/swagger: Latest
  - swagger-ui-express: Latest
```

### 2.2 Frontend Technology Stack

```yaml
Framework:
  - Next.js: 15.x (App Router)
  - React: 19.x
  - TypeScript: 5.x (strict mode)
  
UI Components:
  - shadcn/ui: Latest (Radix UI + Tailwind)
  - @radix-ui/react-*: Latest
  - lucide-react: Latest (icons)
  
Styling:
  - Tailwind CSS: 3.x
  - tailwindcss-animate: Latest
  - class-variance-authority: Latest
  
Forms & Validation:
  - react-hook-form: 7.x
  - @hookform/resolvers: Latest
  - zod: Latest
  
State Management:
  - zustand: 4.x (global state)
  - @tanstack/react-query: 5.x (server state)
  
HTTP Client:
  - axios: Latest
  
Date & Time:
  - date-fns: Latest
  
Testing:
  - vitest: Latest
  - @testing-library/react: Latest
  - @testing-library/jest-dom: Latest
  - playwright: Latest (E2E)
  
Development Tools:
  - ESLint: Latest
  - Prettier: Latest
  - TypeScript ESLint: Latest
```

### 2.3 Development Tools

```yaml
Package Manager:
  - npm: 10.x (NOT yarn or pnpm)
  
Runtime:
  - Node.js: 20 LTS
  
Version Control:
  - Git: Latest
  
IDE:
  - VS Code: Latest
  - Extensions:
    - ESLint
    - Prettier
    - TypeScript
    - Tailwind CSS IntelliSense
  
Database Tools:
  - DBeaver / pgAdmin: Database management
  - Drizzle Kit: Migration management
  
API Testing:
  - Postman / Insomnia
  - Swagger UI (built-in)
  
Containers (Production only):
  - Docker: Latest
  - Docker Compose: Latest
```

---

## 3. Project Structure Detail

### 3.1 Backend Project Structure

```  `
backend/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── modules/                         # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── password-reset.dto.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── local-auth.guard.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── auth.controller.spec.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts        # Drizzle schema
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   ├── user-response.dto.ts
│   │   │   │   └── user-query.dto.ts
│   │   │   └── users.service.spec.ts
│   │   │
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── tenants/
│   │   ├── audit-logs/
│   │   ├── categories/
│   │   ├── tags/
│   │   └── modules/
│   │
│   ├── common/                          # Shared code
│   │   ├── decorators/
│   │   │   ├── permissions.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── tenant.decorator.ts
│   │   ├── guards/
│   │   │   ├── permission.guard.ts
│   │   │   ├── tenant.guard.ts
│   │   │   └── module.guard.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts
│   │   │   └── zod-validation.pipe.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── middleware/
│   │   │   ├── tenant.middleware.ts
│   │   │   ├── sanitization.middleware.ts
│   │   │   └── logging.middleware.ts
│   │   ├── interfaces/
│   │   ├── types/
│   │   ├── constants/
│   │   └── utils/
│   │       ├── hash.util.ts
│   │       ├── slug.util.ts
│   │       └── sanitize.util.ts
│   │
│   ├── config/                          # Configuration
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   │
│   ├── database/                        # Database layer
│   │   ├── drizzle.provider.ts
│   │   ├── tenant.provider.ts
│   │   ├── migrations/
│   │   │   ├── 20240108000001_create_tenants.ts
│   │   │   ├── 20240108000002_create_users.ts
│   │   │   └── ...
│   │   └── schema/
│   │       ├── public/                  # Global schema
│   │       │   ├── tenants.schema.ts
│   │       │   ├── modules.schema.ts
│   │       │   └── index.ts
│   │       └── tenant/                  # Tenant schema
│   │           ├── users.schema.ts
│   │           ├── roles.schema.ts
│   │           ├── permissions.schema.ts
│   │           ├── audit-logs.schema.ts
│   │           └── index.ts
│   │
│   └── core/                            # Core services
│       ├── audit/
│       │   ├── audit.service.ts
│       │   └── audit.module.ts
│       ├── cache/
│       │   ├── redis.service.ts
│       │   └── cache.module.ts
│       └── casl/
│           ├── casl-ability.factory.ts
│           └── casl.module.ts
│
├── test/                                # E2E tests
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   └── users.e2e-spec.ts
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── drizzle.config.ts                    # Drizzle configuration
├── nest-cli.json
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### 3.2 Frontend Project Structure

```
frontend/
├── app/
│   ├── (auth)/                          # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── [token]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (private)/                       # Private layout group
│   │   ├── portal/                      # Dashboard
│   │   │   └── page.tsx
│   │   │
│   │   ├── mgmt-users/                  # User management
│   │   │   ├── page.tsx                 # List
│   │   │   ├── new/
│   │   │   │   └── page.tsx             # Create
│   │   │   └── [id]/
│   │   │       ├── page.tsx             # Detail
│   │   │       └── modify/
│   │   │           └── page.tsx         # Edit
│   │   │
│   │   ├── mgmt-roles/                  # Role management
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── modify/
│   │   │           └── page.tsx
│   │   │
│   │   ├── mgmt-tenants/                # Tenant management (Super Admin)
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── modify/
│   │   │           └── page.tsx
│   │   │
│   │   ├── data-master/                 # Master data
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   └── tags/
│   │   │       └── page.tsx
│   │   │
│   │   ├── sys-audit/                   # Audit logs
│   │   │   └── page.tsx
│   │   │
│   │   ├── sys-settings/                # Settings
│   │   │   └── page.tsx
│   │   │
│   │   ├── profile/                     # User profile
│   │   │   ├── page.tsx
│   │   │   └── modify/
│   │   │       └── page.tsx
│   │   │
│   │   └── layout.tsx
│   │
│   ├── layout.tsx                       # Root layout
│   ├── globals.css
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/                              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── checkbox.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── ... (other shadcn components)
│   │
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   ├── breadcrumbs.tsx
│   │   └── page-header.tsx
│   │
│   ├── forms/
│   │   ├── user-form.tsx
│   │   ├── role-form.tsx
│   │   ├── tenant-form.tsx
│   │   └── form-field.tsx
│   │
│   ├── tables/
│   │   ├── data-table.tsx
│   │   ├── user-table.tsx
│   │   ├── role-table.tsx
│   │   └── pagination.tsx
│   │
│   ├── modals/
│   │   ├── confirmation-modal.tsx
│   │   ├── manage-roles-modal.tsx
│   │   └── manage-permissions-modal.tsx
│   │
│   └── common/
│       ├── loading-skeleton.tsx
│       ├── empty-state.tsx
│       ├── error-state.tsx
│       └── avatar.tsx
│
├── lib/
│   ├── api.ts                           # API client (axios)
│   ├── utils.ts                         # Utility functions
│   ├── cn.ts                            # Class name utility
│   └── validations/
│       ├── user.validations.ts          # Zod schemas
│       ├── role.validations.ts
│       └── auth.validations.ts
│
├── hooks/
│   ├── use-auth.ts                      # Auth hooks
│   ├── use-users.ts                     # User hooks
│   ├── use-roles.ts                     # Role hooks
│   ├── use-tenants.ts                   # Tenant hooks
│   ├── use-toast.ts                     # Toast notifications
│   └── use-permission.ts                # Permission check hook
│
├── stores/
│   ├── auth.store.ts                    # Zustand store
│   ├── user.store.ts
│   └── theme.store.ts
│
├── types/
│   ├── user.types.ts
│   ├── role.types.ts
│   ├── tenant.types.ts
│   └── api.types.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── .env.local.example
├── .eslintrc.json
├── .prettierrc
├── components.json                      # shadcn/ui config
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 4. Multi-Tenancy Architecture

### 4.1 Schema-Based Isolation

Platform CMS menggunakan **schema-based multi-tenancy** dengan PostgreSQL untuk isolasi data yang kuat.

**Konsep**:
- Setiap tenant memiliki schema terpisah dalam satu database
- Schema global (`public`) untuk data shared
- Schema tenant (`tenant_xxx`) untuk data isolated

**Keuntungan**:
- ✅ **Strong Isolation**: Data tenant benar-benar terpisah di level schema
- ✅ **Security**: Tidak mungkin cross-tenant data leak
- ✅ **Backup/Restore**: Bisa per-tenant (schema level)
- ✅ **Migration**: Bisa parallel untuk semua tenant
- ✅ **Performance**: Index terpisah per tenant, query lebih cepat

**Kerugian & Mitigasi**:
- ❌ Schema proliferation (banyak schema) → Mitigasi: PostgreSQL handle 1000+ schema dengan baik
- ❌ Migration complexity → Mitigasi: Automated migration runner untuk semua tenant

---

### 4.2 Tenant Context Flow

```
1. Request masuk dengan JWT token
   ↓
2. Tenant Middleware extract tenant ID dari JWT
   ↓
3. Set tenant context (schema name)
   ↓
4. Repository layer switch schema
   ↓
5. Query executed di schema tenant
   ↓
6. Response returned
```

**Implementation**:

```typescript
// Tenant Middleware
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractToken(req);
    
    if (token) {
      const decoded = this.jwtService.verify(token);
      const tenant = await this.tenantsService.findById(decoded.tenantId);
      
      if (!tenant || !tenant.isActive) {
        throw new ForbiddenException('TENANT_INACTIVE');
      }
      
      // Set tenant context
      req['tenant'] = {
        id: tenant.id,
        schemaName: tenant.schemaName,
        config: tenant.config,
      };
    }
    
    next();
  }
}

// Tenant Provider (Injectable)
@Injectable()
export class TenantContext {
  private tenant: Tenant;
  
  setTenant(tenant: Tenant) {
    this.tenant = tenant;
  }
  
  getTenant(): Tenant {
    if (!this.tenant) {
      throw new Error('Tenant context not set');
    }
    return this.tenant;
  }
  
  getSchemaName(): string {
    return this.getTenant().schemaName;
  }
}

// Repository with tenant-aware queries
@Injectable()
export class UsersRepository {
  constructor(
    @Inject('DRIZZLE') private readonly db: DrizzleDB,
    private readonly tenantContext: TenantContext,
  ) {}
  
  async findAll(): Promise<User[]> {
    const schemaName = this.tenantContext.getSchemaName();
    
    // Dynamic schema switching
    return this.db
      .withSchema(schemaName)
      .select()
      .from(users)
      .where(isNull(users.deleted_at));
  }
}
```

---

### 4.3 Tenant Provisioning Flow

**Saat tenant baru dibuat**:

```
1. Create tenant record di public.tenants
   ↓
2. Generate schema name (tenant_{slug})
   ↓
3. CREATE SCHEMA tenant_{slug}
   ↓
4. Run migrations untuk tenant schema
   ↓
5. Seed default data (roles, permissions)
   ↓
6. Create tenant admin user
   ↓
7. Setup tenant modules
   ↓
8. Return tenant + admin credentials
```

**Implementation**:

```typescript
@Injectable()
export class TenantsService {
  async createTenant(dto: CreateTenantDto): Promise<TenantWithAdmin> {
    // 1. Create tenant record
    const slug = this.generateSlug(dto.name);
    const schemaName = `tenant_${slug}`;
    
    const tenant = await this.tenantsRepository.create({
      name: dto.name,
      slug,
      schemaName,
      subscriptionTier: dto.subscriptionTier,
      isActive: true,
    });
    
    // 2. Create schema
    await this.db.execute(sql`CREATE SCHEMA ${sql.identifier(schemaName)}`);
    
    // 3. Run migrations
    await this.migrationService.runForTenant(schemaName);
    
    // 4. Seed default data
    await this.seedService.seedTenant(schemaName);
    
    // 5. Create admin user
    const tempPassword = this.generatePassword();
    const admin = await this.usersService.createInTenant(schemaName, {
      email: dto.adminEmail,
      name: dto.adminName,
      password: tempPassword,
      roleIds: [SUPER_ADMIN_ROLE_ID],
    });
    
    // 6. Setup modules
    await this.modulesService.enableCoreModules(schemaName);
    
    return {
      tenant,
      admin: {
        ...admin,
        temporaryPassword: tempPassword,
      },
    };
  }
}
```

---

### 4.4 Cross-Schema References

**Aturan**:
- ✅ Tenant schema **BOLEH** reference `public` schema (module_id → public.modules)
- ❌ Public schema **TIDAK BOLEH** reference tenant schema
- ❌ Tenant schema **TIDAK BOLEH** reference tenant schema lain

**Example**:

```sql
-- Good ✅ - Tenant reference global
CREATE TABLE tenant_001.tenant_modules (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES public.modules(id),
  is_enabled BOOLEAN NOT NULL DEFAULT true
);

-- Bad ❌ - Global reference tenant (TIDAK MUNGKIN)
CREATE TABLE public.modules (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES tenant_001.users(id) -- ❌ TIDAK BOLEH
);
```

---

### 4.5 Schema Switching Performance

**Concern**: Apakah schema switching lambat?

**Answer**: TIDAK, karena:
- PostgreSQL schema switching sangat cepat (hanya pointer reference)
- Connection pooling tetap efisien
- Query plan cache per schema

**Benchmark** (PostgreSQL 15, single query):
- Same schema query: ~0.5ms
- Different schema query: ~0.6ms
- Overhead: ~0.1ms (negligible)

**Best Practice**:
- Set `search_path` di awal connection: `SET search_path TO tenant_xxx, public;`
- Use connection pooling per tenant (optional, untuk scale besar)

---

## 5. Security Architecture

### 5.1 Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /auth/login
       │    { email, password }
       ▼
┌─────────────────────────────────────┐
│   Backend: AuthController           │
│   - Validate input (Zod)            │
│   - Sanitize input (XSS prevention) │
└──────┬──────────────────────────────┘
       │ 2. Check credentials
       ▼
┌─────────────────────────────────────┐
│   AuthService                       │
│   - Find user by email              │
│   - Verify password (bcrypt)        │
│   - Check user.isActive             │
│   - Check tenant.isActive           │
└──────┬──────────────────────────────┘
       │ 3. Generate JWT
       ▼
┌─────────────────────────────────────┐
│   JWT Token Generation              │
│   - Payload: userId, tenantId,      │
│     roles, permissions              │
│   - Sign with secret                │
│   - Set expiry (24h)                │
└──────┬──────────────────────────────┘
       │ 4. Create session
       ▼
┌─────────────────────────────────────┐
│   Session Storage                   │
│   - Redis (primary)                 │
│   - PostgreSQL (backup)             │
│   - Track: IP, user agent, activity │
└──────┬──────────────────────────────┘
       │ 5. Response
       ▼
┌─────────────────────────────────────┐
│   Return to Client                  │
│   - JWT token                       │
│   - User data + roles + permissions │
│   - Set HTTP-only cookie            │
└─────────────────────────────────────┘
```

**JWT Token Structure**:

```json
{
  "userId": 123,
  "email": "john@example.com",
  "tenantId": 5,
  "roles": ["admin", "operator"],
  "permissions": ["users.read.tenant", "users.create.tenant"],
  "iat": 1704700800,
  "exp": 1704787200
}
```

**Security Measures**:
- ✅ Password hashed dengan bcrypt (cost factor: 12)
- ✅ JWT signed dengan HS256 (production: RS256)
- ✅ HTTP-only cookies untuk token storage
- ✅ Secure flag (HTTPS only)
- ✅ SameSite=Strict (CSRF protection)
- ✅ Rate limiting pada login endpoint (5 attempts / 15 min)
- ✅ Account lockout setelah 5 failed attempts
- ✅ Audit log untuk setiap login attempt

---

### 5.2 Authorization Flow (RBAC + CASL)

```
┌─────────────┐
│   Request   │
│   + JWT     │
└──────┬──────┘
       │ 1. Extract token
       ▼
┌─────────────────────────────────────┐
│   JWT Guard                         │
│   - Verify token signature          │
│   - Check expiry                    │
│   - Decode payload                  │
└──────┬──────────────────────────────┘
       │ 2. Load user + permissions
       ▼
┌─────────────────────────────────────┐
│   Tenant Guard                      │
│   - Extract tenantId from JWT       │
│   - Set tenant context              │
│   - Switch schema                   │
└──────┬──────────────────────────────┘
       │ 3. Check permission
       ▼
┌─────────────────────────────────────┐
│   Permission Guard (CASL)           │
│   - Check @Permissions decorator    │
│   - Build ability from user perms   │
│   - Verify: can(action, resource)   │
└──────┬──────────────────────────────┘
       │ 4a. Allowed → Execute handler
       │ 4b. Denied → 403 Forbidden
       ▼
┌─────────────────────────────────────┐
│   Controller Handler                │
│   - Execute business logic          │
│   - Return response                 │
└─────────────────────────────────────┘
```

**CASL Ability Factory**:

```typescript
@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );
    
    // Build abilities from user permissions
    user.permissions.forEach((perm) => {
      const { resource, action, scope } = perm;
      
      if (scope === 'all') {
        can(action, resource);
      } else if (scope === 'tenant') {
        can(action, resource, { tenantId: user.tenantId });
      } else if (scope === 'own') {
        can(action, resource, { userId: user.id });
      }
    });
    
    return build();
  }
}
```

**Permission Check Decorator**:

```typescript
// Usage in controller
@Get(':id')
@Permissions('users.read.tenant')
async findOne(@Param('id') id: number) {
  return this.usersService.findOne(id);
}

// Guard implementation
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    
    if (!requiredPermissions) {
      return true; // No permission required
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ability = this.abilityFactory.createForUser(user);
    
    return requiredPermissions.every((permission) => {
      const [action, resource] = permission.split('.');
      return ability.can(action, resource);
    });
  }
}
```

---

### 5.3 Input Sanitization & Validation

**Validation Flow**:

```
Request Input
   ↓
1. Zod Schema Validation (Type + Format)
   ↓
2. Sanitization Middleware (XSS Prevention)
   ↓
3. Business Rules Validation (Service Layer)
   ↓
4. Database Constraints (Final Safety Net)
```

**Implementation**:

```typescript
// 1. Zod validation in DTO
export const CreateUserDtoSchema = z.object({
  email: z.string().email('Format email tidak valid').toLowerCase(),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password harus mengandung huruf besar, kecil, dan angka'),
  name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(255, 'Nama maksimal 255 karakter')
    .trim(),
});

// 2. Sanitization middleware
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitize(req.body);
    }
    next();
  }
  
  private sanitize(obj: any): any {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj, {
        allowedTags: [], // Strip ALL HTML tags
        allowedAttributes: {},
      });
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = this.sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  }
}

// 3. Business rules validation (service layer)
async create(dto: CreateUserDto): Promise<User> {
  // Check email uniqueness
  const exists = await this.usersRepository.findByEmail(dto.email);
  if (exists) {
    throw new ConflictException({
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Email sudah terdaftar',
    });
  }
  
  // Check role validity
  const roles = await this.rolesRepository.findByIds(dto.roleIds);
  if (roles.length !== dto.roleIds.length) {
    throw new BadRequestException({
      code: 'INVALID_ROLES',
      message: 'Role tidak valid',
    });
  }
  
  // Proceed with creation
  return this.usersRepository.create(dto);
}
```

---

### 5.4 Rate Limiting

**Strategy**: Throttle by IP + User ID untuk prevent abuse

**Implementation**:

```typescript
// Global rate limiting
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 60 seconds
      limit: 100, // 100 requests per minute
    }),
  ],
})
export class AppModule {}

// Per-endpoint rate limiting
@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle(5, 900) // 5 attempts per 15 minutes
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  
  @Post('register')
  @Throttle(3, 3600) // 3 registrations per hour
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
```

**Redis Storage untuk Rate Limit**:
- Key: `rate-limit:{ip}:{endpoint}`
- TTL: Sesuai window (900s untuk login)
- Increment on each request
- Reset setelah TTL expire

---

### 5.5 Security Headers

**Helmet.js Configuration**:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny', // Prevent clickjacking
  },
  noSniff: true, // Prevent MIME sniffing
  xssFilter: true, // XSS protection
}));
```

**CORS Configuration**:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3001', // Frontend dev
    'https://app.platform-cms.com', // Production
  ],
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

### 5.6 Audit Logging

**What to Audit**:
- ✅ Authentication events (login, logout, failed attempts)
- ✅ Authorization failures (permission denied)
- ✅ CRUD operations on critical resources (users, roles, tenants)
- ✅ Configuration changes (settings, modules)
- ✅ Data exports (sensitive data)

**Audit Log Structure**:

```typescript
interface AuditLog {
  id: number;
  userId: number | null; // null for system actions
  tenantId: number;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';
  resource: string; // 'users', 'roles', etc
  resourceId: number | null;
  description: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

**Implementation**:

```typescript
@Injectable()
export class AuditService {
  async log(params: CreateAuditLogDto): Promise<void> {
    await this.auditLogsRepository.create({
      ...params,
      createdAt: new Date(),
    });
    
    // Critical actions → Send to external SIEM (future)
    if (this.isCriticalAction(params.action, params.resource)) {
      await this.notifySecurityTeam(params);
    }
  }
  
  private isCriticalAction(action: string, resource: string): boolean {
    const criticalResources = ['users', 'roles', 'tenants', 'permissions'];
    const criticalActions = ['delete', 'update'];
    
    return criticalResources.includes(resource) && 
           criticalActions.includes(action);
  }
}
```

---

## 6. Data Flow & Request Lifecycle

### 6.1 Complete Request Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. CLIENT REQUEST                                                    │
│    GET /api/v1/users?page=1&perPage=10                              │
│    Authorization: Bearer eyJhbGci...                                 │
└────────────┬─────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 2. LOAD BALANCER / NGINX                                             │
│    - SSL Termination                                                 │
│    - Request routing                                                 │
│    - Static file serving (optional)                                  │
└────────────┬─────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 3. NESTJS MIDDLEWARE PIPELINE                                        │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ a. Logging Middleware                                        │ │
│    │    - Log request (method, path, IP, user agent)             │ │
│    └──────────────┬───────────────────────────────────────────────┘ │
│                   ▼                                                  │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ b. Sanitization Middleware                                   │ │
│    │    - Remove HTML tags from input                            │ │
│    │    - Escape special characters                              │ │
│    └──────────────┬───────────────────────────────────────────────┘ │
│                   ▼                                                  │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ c. Tenant Middleware                                         │ │
│    │    - Extract JWT token                                       │ │
│    │    - Decode & verify token                                   │ │
│    │    - Extract tenantId                                        │ │
│    │    - Load tenant from cache/DB                               │ │
│    │    - Set tenant context                                      │ │
│    └──────────────┬───────────────────────────────────────────────┘ │
└────────────────────┼───────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 4. GUARDS                                                            │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ a. JWT Auth Guard                                            │ │
│    │    - Verify JWT signature                                    │ │
│    │    - Check expiry                                            │ │
│    │    - Load user from cache/DB                                 │ │
│    │    - Attach user to request                                  │ │
│    └──────────────┬───────────────────────────────────────────────┘ │
│                   ▼                                                  │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ b. Throttle Guard (Rate Limiting)                            │ │
│    │    - Check rate limit from Redis                             │ │
│    │    - Increment counter                                       │ │
│    │    - Throw 429 if exceeded                                   │ │
│    └──────────────┬───────────────────────────────────────────────┘ │
│                   ▼                                                  │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ c. Permission Guard (RBAC)                                   │ │
│    │    - Check @Permissions decorator                            │ │
│    │    - Build CASL ability                                      │ │
│    │    - Verify permission                                       │ │
│    │    - Throw 403 if denied                                     │ │
│    └──────────────┬───────────────────────────────────────────────┘ │
└────────────────────┼───────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 5. PIPES (Validation & Transformation)                               │
│    - Validate query params (Zod schema)                             │
│    - Transform types (string → number)                              │
│    - Throw 400 if validation fails                                  │
└────────────┬─────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 6. CONTROLLER HANDLER                                                │
│    @Get()                                                            │
│    @Permissions('users.read.tenant')                                 │
│    async findAll(@Query() query: FindAllUsersDto) {                 │
│      return this.usersService.findAll(query);                       │
│    }                                                                 │
└────────────┬─────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 7. SERVICE LAYER (Business Logic)                                   │
│    - Parse query parameters                                          │
│    - Build filters, sort, pagination                                 │
│    - Call repository                                                 │
│    - Transform to DTO                                                │
└────────────┬─────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 8. REPOSITORY LAYER (Data Access)                                   │
│    - Get tenant schema from context                                  │
│    - Build Drizzle query                                             │
│    - Add tenant filter (tenantId)                                    │
│    - Add soft delete filter (deleted_at IS NULL)                    │
│    - Execute query against tenant schema                             │
└────────────┬─────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 9. DATABASE LAYER                                                    │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ a. Check Query Cache (Redis)                                 │ │
│    │    - Key: query:users:tenant_123:page_1                      │ │
│    │    - Hit → Return cached result                              │ │
│    │    - Miss → Continue to DB                                   │ │
│    └──────────────┬───────────────────────────────────────────────┘ │
│                   ▼                                                  │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ b. PostgreSQL Query                                          │ │
│    │    SET search_path TO tenant_acme_corp, public;              │ │
│    │    SELECT * FROM users                                       │ │
│    │    WHERE deleted_at IS NULL                                  │ │
│    │    ORDER BY created_at DESC                                  │ │
│    │    LIMIT 10 OFFSET 0;                                        │ │
│    └──────────────┬───────────────────────────────────────────────┘ │
│                   ▼                                                  │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ c. Cache Result (Redis)                                      │ │
│    │    - Store query result                                      │ │
│    │    - TTL: 5 minutes                                          │ │
│    └──────────────────────────────────────────────────────────────┘ │
└────────────┬─────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 10. INTERCEPTORS (Response Transformation)                          │
│     - Transform response to standard format                          │
│     - Add meta (requestId, timestamp, pagination)                   │
│     - Log response time                                              │
└────────────┬─────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 11. RESPONSE TO CLIENT                                               │
│     {                                                                │
│       "success": true,                                               │
│       "data": [...],                                                 │
│       "meta": {                                                      │
│         "pagination": { page: 1, total: 50, ... },                  │
│         "requestId": "req_123",                                      │
│         "timestamp": "2024-01-08T10:00:00.000Z"                     │
│       }                                                              │
│     }                                                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Write Operation Flow (Create User)

```
Request: POST /api/v1/users
Body: { email, password, name, roleIds }
   ↓
[Middleware & Guards - same as read flow]
   ↓
Controller Handler
   ↓
Service Layer
   ├─→ Validate business rules
   │   - Check email uniqueness
   │   - Validate roleIds exist
   │   - Check subscription limits
   ├─→ Hash password (bcrypt)
   └─→ Call repository
       ↓
Repository Layer
   ├─→ Start transaction
   ├─→ Insert user record
   ├─→ Insert user_roles records
   ├─→ Commit transaction
   └─→ Return user
       ↓
Service Layer
   ├─→ Transform to DTO (remove password_hash)
   ├─→ Invalidate cache (users list)
   ├─→ Create audit log
   └─→ Send welcome email (async)
       ↓
Response: 201 Created
{
  "success": true,
  "data": { id, email, name, roles, ... },
  "meta": { message: "User berhasil dibuat" }
}
```

---

### 6.3 Caching Strategy

**Cache Layers**:

1. **Application Cache (Redis)**
   - User sessions
   - Query results (list endpoints)
   - Permission cache per user
   - Rate limiting counters

2. **Database Query Cache**
   - PostgreSQL internal query cache
   - Prepared statements

**Cache Keys Convention**:

```
Format: {type}:{resource}:{tenant}:{identifier}

Examples:
- session:user_123:tenant_5
- query:users:tenant_5:page_1_limit_10
- permissions:user_123:tenant_5
- rate-limit:192.168.1.1:auth/login
```

**Cache Invalidation Strategy**:

```typescript
@Injectable()
export class CacheService {
  async invalidateUserCache(tenantId: number, userId?: number) {
    const pattern = userId
      ? `*:users:tenant_${tenantId}:*` // Specific user
      : `*:users:tenant_${tenantId}:*`; // All users in tenant
    
    await this.redis.del(pattern);
  }
  
  async invalidateOnWrite(resource: string, tenantId: number) {
    // Invalidate list queries
    await this.redis.del(`query:${resource}:tenant_${tenantId}:*`);
    
    // Invalidate permissions if role/permission changed
    if (['roles', 'permissions', 'user_roles'].includes(resource)) {
      await this.redis.del(`permissions:*:tenant_${tenantId}`);
    }
  }
}
```

**TTL Strategy**:

| Data Type | TTL | Reason |
|-----------|-----|--------|
| User sessions | 24 hours | Configurable, match JWT expiry |
| Query results (list) | 5 minutes | Balance freshness & performance |
| Permissions cache | 15 minutes | Security-sensitive, refresh often |
| Static data (modules) | 1 hour | Rarely changes |
| Rate limit counters | 15 minutes | Match throttle window |

---

### 6.4 Error Flow

```
Error Occurs (e.g., user not found)
   ↓
Service throws NotFoundException
   ↓
Exception Filter catches
   ↓
Transform to standard error format:
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User tidak ditemukan",
    "errors": []
  },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
   ↓
Log error (if 500)
   ↓
Response with appropriate HTTP status (404)
```

---

### 6.5 Async Operations (Background Jobs)

**Use Cases**:
- Send emails (welcome, password reset)
- Generate reports
- Data exports
- Cleanup expired sessions/tokens

**Implementation** (using Bull Queue + Redis):

```typescript
// Producer (service)
@Injectable()
export class UsersService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
  ) {}
  
  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.usersRepository.create(dto);
    
    // Queue email job (non-blocking)
    await this.emailQueue.add('welcome-email', {
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    
    return user;
  }
}

// Consumer (processor)
@Processor('email')
export class EmailProcessor {
  @Process('welcome-email')
  async sendWelcomeEmail(job: Job) {
    const { email, name } = job.data;
    
    await this.emailService.send({
      to: email,
      subject: 'Selamat Datang di Platform CMS',
      template: 'welcome',
      context: { name },
    });
  }
}
```

---

## 7. Deployment Architecture

### 7.1 Development Environment

**Local Development (Windows 11)**:

```
Developer Machine
├── Backend (NestJS)
│   ├── Runtime: Node.js 20 LTS
│   ├── Package Manager: npm 10+
│   ├── Port: 3000
│   └── Hot reload: nest start --watch
│
├── Frontend (Next.js)
│   ├── Runtime: Node.js 20 LTS
│   ├── Port: 3001
│   └── Dev server: npm run dev
│
├── PostgreSQL 15
│   ├── Port: 5432
│   ├── Install: Native Windows or WSL2
│   └── GUI: pgAdmin / DBeaver
│
└── Redis 7
    ├── Port: 6379
    └── Install: WSL2 or Windows port
```

**Environment Variables (.env.local)**:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/platform_cms
DATABASE_SCHEMA=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=24h

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001

# Email (development: Mailtrap)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
```

**Development Workflow**:

```bash
# 1. Clone repository
git clone <repo-url>
cd platform-cms

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Setup database
cd backend
npm run db:migrate
npm run db:seed

# 4. Start backend
npm run start:dev

# 5. Start frontend (new terminal)
cd frontend
npm run dev

# Access:
# - Frontend: http://localhost:3001
# - Backend API: http://localhost:3000/api/v1
# - Swagger: http://localhost:3000/api/docs
```

---

### 7.2 Production Environment (Kubernetes)

**High-Level Architecture**:

```
                        ┌─────────────────────┐
                        │   Internet Users    │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │   CloudFlare CDN    │
                        │   - DNS             │
                        │   - DDoS Protection │
                        │   - SSL/TLS         │
                        └──────────┬──────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               Ingress Controller (Nginx)                    │ │
│  │               - SSL Termination                             │ │
│  │               - Load Balancing                              │ │
│  │               - Rate Limiting                               │ │
│  └────────────┬───────────────────────────┬───────────────────┘ │
│               │                           │                      │
│               ▼                           ▼                      │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐ │
│  │  Frontend Service       │  │  Backend Service             │ │
│  │  (Next.js)              │  │  (NestJS)                    │ │
│  │                         │  │                              │ │
│  │  ┌─────┐  ┌─────┐      │  │  ┌─────┐  ┌─────┐  ┌─────┐ │ │
│  │  │ Pod │  │ Pod │      │  │  │ Pod │  │ Pod │  │ Pod │ │ │
│  │  └─────┘  └─────┘      │  │  └─────┘  └─────┘  └─────┘ │ │
│  │  Replicas: 2           │  │  Replicas: 3                │ │
│  └─────────────────────────┘  └────────────┬─────────────────┘ │
│                                             │                   │
│                              ┌──────────────┴────────────────┐ │
│                              │                               │ │
│               ┌──────────────▼──────────┐  ┌────────────────▼─┐ │
│               │  PostgreSQL Cluster     │  │  Redis Cluster   │ │
│               │  - Master (write)       │  │  - Master        │ │
│               │  - Replica (read)       │  │  - Replica       │ │
│               │  - Backup (daily)       │  │  - Sentinel      │ │
│               └─────────────────────────┘  └──────────────────┘ │
│                                                                  │
│               ┌──────────────────────────────────────────────┐  │
│               │  Persistent Storage                          │  │
│               │  - Database volumes                          │  │
│               │  - File uploads (S3-compatible)             │  │
│               └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

                ┌──────────────────────────────────────────────┐
                │  Monitoring & Logging                        │
                │  - Prometheus (metrics)                      │
                │  - Grafana (visualization)                   │
                │  - ELK Stack (logs)                          │
                └──────────────────────────────────────────────┘
```

---

### 7.3 Docker Configuration

**Backend Dockerfile**:

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/main.js"]
```

**Frontend Dockerfile**:

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
```

**Docker Compose (Local Testing)**:

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    container_name: platform-cms-db
    environment:
      POSTGRES_DB: platform_cms
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: platform-cms-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: platform-cms-backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/platform_cms
      REDIS_HOST: redis
      REDIS_PORT: 6379
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: platform-cms-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000/api/v1
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

### 7.4 Kubernetes Manifests

**Backend Deployment**:

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: platform-cms-backend
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: platform-cms-backend
  template:
    metadata:
      labels:
        app: platform-cms-backend
    spec:
      containers:
      - name: backend
        image: registry.example.com/platform-cms-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        - name: REDIS_HOST
          value: redis-service
        - name: NODE_ENV
          value: production
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: production
spec:
  selector:
    app: platform-cms-backend
  ports:
  - protocol: TCP
    port: 3000
    targetPort: 3000
  type: ClusterIP
```

**Frontend Deployment**:

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: platform-cms-frontend
  namespace: production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: platform-cms-frontend
  template:
    metadata:
      labels:
        app: platform-cms-frontend
    spec:
      containers:
      - name: frontend
        image: registry.example.com/platform-cms-frontend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NEXT_PUBLIC_API_URL
          value: https://api.platform-cms.com/api/v1
        - name: NODE_ENV
          value: production
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: production
spec:
  selector:
    app: platform-cms-frontend
  ports:
  - protocol: TCP
    port: 3001
    targetPort: 3001
  type: ClusterIP
```

**Ingress Configuration**:

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: platform-cms-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - platform-cms.com
    - api.platform-cms.com
    secretName: platform-cms-tls
  rules:
  - host: platform-cms.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3001
  - host: api.platform-cms.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 3000
```

---

### 7.5 Database Deployment

**PostgreSQL StatefulSet**:

```yaml
# k8s/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: production
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: platform_cms
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 100Gi
```

---

### 7.6 CI/CD Pipeline

**GitHub Actions Workflow**:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies (Backend)
        working-directory: ./backend
        run: npm ci
      
      - name: Run tests (Backend)
        working-directory: ./backend
        run: npm test
      
      - name: Install dependencies (Frontend)
        working-directory: ./frontend
        run: npm ci
      
      - name: Run tests (Frontend)
        working-directory: ./frontend
        run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v2
        with:
          registry: registry.example.com
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}
      
      - name: Build and Push Backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: registry.example.com/platform-cms-backend:${{ github.sha }}
      
      - name: Build and Push Frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: registry.example.com/platform-cms-frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/platform-cms-backend \
            backend=registry.example.com/platform-cms-backend:${{ github.sha }} \
            -n production
          
          kubectl set image deployment/platform-cms-frontend \
            frontend=registry.example.com/platform-cms-frontend:${{ github.sha }} \
            -n production
      
      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/platform-cms-backend -n production
          kubectl rollout status deployment/platform-cms-frontend -n production
```

---

### 7.7 Scaling Strategy

**Horizontal Pod Autoscaler (HPA)**:

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: platform-cms-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Database Scaling**:
- **Vertical**: Upgrade instance size (CPU, RAM)
- **Horizontal**: Read replicas untuk read-heavy queries
- **Partitioning**: Table partitioning by month (audit_logs, sessions)

**Redis Scaling**:
- **Cluster Mode**: Redis Cluster untuk distributed cache
- **Replicas**: 2-3 replicas untuk high availability

---

## 8. Scalability & Performance

### 8.1 Performance Targets

**MVP Phase 1 Targets**:

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | < 200ms | 95% of requests |
| API Response Time (p99) | < 500ms | 99% of requests |
| Page Load Time (FCP) | < 1.5s | First Contentful Paint |
| Page Load Time (LCP) | < 2.5s | Largest Contentful Paint |
| Database Query Time | < 50ms | Simple queries |
| Concurrent Users | 1,000+ | Per tenant |
| Throughput | 10,000+ req/s | Across all tenants |
| Uptime | 99.9% | ~8.76 hours downtime/year |

**Phase 3 Targets** (Scale Nasional):

| Metric | Target |
|--------|--------|
| Total Tenants | 500+ |
| Concurrent Users | 10,000+ |
| Throughput | 100,000+ req/s |
| Uptime | 99.99% |

---

### 8.2 Caching Strategy (Detailed)

**Multi-Layer Caching**:

```
┌────────────────────────────────────────────────────────────┐
│ Layer 1: Browser Cache (Client-Side)                      │
│ - Static assets (JS, CSS, images)                         │
│ - TTL: 1 year with versioning                             │
│ - Cache-Control: public, max-age=31536000, immutable      │
└────────────────────────────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│ Layer 2: CDN Cache (CloudFlare)                           │
│ - Static pages                                             │
│ - API responses (cache-control headers)                   │
│ - TTL: Varies by content type                             │
└────────────────────────────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│ Layer 3: Application Cache (Redis)                        │
│ - User sessions                                            │
│ - Query results (list endpoints)                          │
│ - Permission cache                                         │
│ - Rate limiting counters                                   │
│ - TTL: 5-15 minutes                                        │
└────────────────────────────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│ Layer 4: Database Query Cache (PostgreSQL)                │
│ - Internal query cache                                     │
│ - Prepared statements                                      │
└────────────────────────────────────────────────────────────┘
```

**Cache Warming**:

```typescript
// Warm cache on application startup
@Injectable()
export class CacheWarmingService {
  async warmCache() {
    // 1. Load frequently accessed data
    await this.loadModules();
    await this.loadSystemSettings();
    
    // 2. Load permissions templates
    await this.loadModulePermissions();
    
    console.log('Cache warming completed');
  }
  
  private async loadModules() {
    const modules = await this.modulesRepository.findAll();
    await this.redis.set(
      'cache:modules:all',
      JSON.stringify(modules),
      'EX',
      3600, // 1 hour
    );
  }
}
```

---

### 8.3 Database Optimization

**Indexing Strategy**:

```sql
-- 1. Primary key indexes (automatic)
-- Already created with PRIMARY KEY constraint

-- 2. Foreign key indexes (MANDATORY)
CREATE INDEX idx_users_tenant_id ON tenant_xxx.users(tenant_id);
CREATE INDEX idx_users_created_by ON tenant_xxx.users(created_by);

-- 3. Soft delete indexes (MANDATORY)
CREATE INDEX idx_users_deleted_at 
  ON tenant_xxx.users(deleted_at) 
  WHERE deleted_at IS NULL;

-- 4. Search indexes
CREATE INDEX idx_users_email ON tenant_xxx.users(email);
CREATE INDEX idx_users_name ON tenant_xxx.users(name);

-- 5. Composite indexes (for common queries)
CREATE INDEX idx_users_tenant_active 
  ON tenant_xxx.users(tenant_id, is_active, deleted_at);

-- 6. Full-text search indexes (optional)
CREATE INDEX idx_users_name_fts 
  ON tenant_xxx.users 
  USING GIN(to_tsvector('indonesian', name));
```

**Query Optimization**:

```typescript
// Bad ❌ - N+1 query problem
async findAllUsers() {
  const users = await this.db.select().from(users);
  
  for (const user of users) {
    user.roles = await this.db
      .select()
      .from(roles)
      .where(eq(roles.userId, user.id)); // N queries!
  }
  
  return users;
}

// Good ✅ - Single query with JOIN
async findAllUsers() {
  return this.db
    .select({
      user: users,
      roles: sql`json_agg(roles.*)`,
    })
    .from(users)
    .leftJoin(user_roles, eq(users.id, user_roles.userId))
    .leftJoin(roles, eq(user_roles.roleId, roles.id))
    .groupBy(users.id);
}
```

**Connection Pooling**:

```typescript
// Drizzle connection pool configuration
const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  
  // Pool settings
  min: 10, // Minimum connections
  max: 50, // Maximum connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Timeout if no connection available
});
```

**Pagination Best Practices**:

```typescript
// Bad ❌ - OFFSET pagination (slow for large offsets)
async findAll(page: number, perPage: number) {
  const offset = (page - 1) * perPage;
  
  return this.db
    .select()
    .from(users)
    .limit(perPage)
    .offset(offset); // Slow when page is large!
}

// Good ✅ - Cursor-based pagination (fast)
async findAll(cursor?: number, perPage: number = 10) {
  const query = this.db
    .select()
    .from(users)
    .where(cursor ? gt(users.id, cursor) : undefined)
    .orderBy(users.id)
    .limit(perPage + 1); // Fetch one extra to check hasNextPage
  
  const results = await query;
  const hasNextPage = results.length > perPage;
  const items = hasNextPage ? results.slice(0, -1) : results;
  
  return {
    items,
    nextCursor: hasNextPage ? items[items.length - 1].id : null,
    hasNextPage,
  };
}
```

---

### 8.4 Frontend Optimization

**Code Splitting**:

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Disable SSR for client-only components
});

// Route-based code splitting (automatic with Next.js App Router)
// Each route is automatically split into separate chunks
```

**Image Optimization**:

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={100}
  height={100}
  loading="lazy" // Lazy load images
  placeholder="blur" // Show blur placeholder
  blurDataURL="data:image/..." // Blur data URL
/>
```

**Static Generation (SSG)**:

```typescript
// Generate static pages at build time
export async function generateStaticParams() {
  // Pre-render common pages
  return [
    { locale: 'id' },
    { locale: 'en' },
  ];
}

// Incremental Static Regeneration (ISR)
export const revalidate = 3600; // Revalidate every hour
```

**Bundle Optimization**:

```javascript
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.log
  },
  
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Vendor chunk
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20,
        },
        // Common chunk
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    };
    
    return config;
  },
};
```

---

### 8.5 API Optimization

**Response Compression**:

```typescript
// Enable gzip compression
import * as compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (0-9)
}));
```

**Selective Field Loading**:

```typescript
// Allow clients to select fields
@Get()
async findAll(
  @Query('fields') fields?: string, // ?fields=id,name,email
) {
  const selectedFields = fields 
    ? fields.split(',')
    : ['id', 'name', 'email', 'isActive'];
  
  return this.usersRepository.findAll(selectedFields);
}

// Repository implementation
async findAll(fields: string[]) {
  const selectObject = fields.reduce((acc, field) => {
    acc[field] = users[field];
    return acc;
  }, {});
  
  return this.db.select(selectObject).from(users);
}
```

**Batch Operations**:

```typescript
// Bulk create/update
@Post('bulk')
async bulkCreate(@Body() dto: BulkCreateUsersDto) {
  return this.usersRepository.bulkCreate(dto.users);
}

// Repository implementation
async bulkCreate(users: CreateUserDto[]) {
  return this.db
    .insert(usersTable)
    .values(users)
    .returning();
}
```

---

### 8.6 Monitoring & Alerting

**Metrics to Monitor**:

```typescript
// Prometheus metrics
import { Counter, Histogram, Gauge } from 'prom-client';

// Request counter
const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Response time histogram
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
});

// Database connection pool gauge
const dbPoolSize = new Gauge({
  name: 'db_pool_size',
  help: 'Database connection pool size',
  labelNames: ['state'], // active, idle, waiting
});

// Cache hit rate
const cacheHitRate = new Counter({
  name: 'cache_hit_total',
  help: 'Cache hit count',
  labelNames: ['cache_name', 'hit'], // hit: true/false
});
```

**Alert Rules**:

```yaml
# prometheus/alerts.yml
groups:
  - name: platform-cms-alerts
    interval: 30s
    rules:
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time"
          description: "95th percentile response time is above 500ms"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate"
          description: "Error rate is above 5%"
      
      - alert: DatabaseConnectionPoolExhausted
        expr: db_pool_size{state="waiting"} > 10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool exhausted"
          description: "More than 10 connections waiting"
```

---

### 8.7 Load Testing

**K6 Load Test Script**:

```javascript
// tests/load/api-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  const token = 'your-jwt-token';
  
  // Test login
  const loginRes = http.post(
    'https://api.platform-cms.com/api/v1/auth/login',
    JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => r.json('data.token') !== undefined,
  });
  
  // Test list users
  const usersRes = http.get(
    'https://api.platform-cms.com/api/v1/users?page=1&perPage=10',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  check(usersRes, {
    'users list status is 200': (r) => r.status === 200,
    'users list response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

**Run Load Test**:

```bash
# Install k6
# Windows: choco install k6
# Linux: apt install k6

# Run test
k6 run tests/load/api-test.js

# Run with more VUs
k6 run --vus 500 --duration 10m tests/load/api-test.js
```

---

## 9. Monitoring & Logging

### 9.1 Logging Strategy

**Log Levels**:

| Level | Usage | Example |
|-------|-------|---------|
| ERROR | Critical errors, failures | Database connection failed, unhandled exceptions |
| WARN | Warnings, potential issues | High memory usage, slow queries |
| INFO | Important events | User login, tenant created, API requests |
| DEBUG | Detailed info for debugging | Query execution, cache hits/misses |
| TRACE | Very detailed trace | Function entry/exit, variable values |

**Winston Logger Configuration**:

```typescript
// src/config/logger.config.ts
import * as winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    service: 'platform-cms-backend',
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console output (development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    
    // File output (all logs)
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    
    // File output (errors only)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

// Production: Add Elasticsearch transport
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.Http({
      host: process.env.ELASTICSEARCH_HOST,
      port: parseInt(process.env.ELASTICSEARCH_PORT),
      path: '/logs',
    }),
  );
}
```

**Structured Logging**:

```typescript
// Bad ❌ - Unstructured log
logger.info(`User ${userId} logged in from ${ip}`);

// Good ✅ - Structured log
logger.info('User login', {
  userId,
  tenantId,
  ip,
  userAgent,
  timestamp: new Date().toISOString(),
  action: 'login',
  resource: 'auth',
});
```

**Request Logging Interceptor**:

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();
    
    logger.info('Incoming request', {
      method,
      url,
      ip,
      userAgent,
      tenantId: request.tenant?.id,
      userId: request.user?.id,
    });
    
    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        logger.info('Request completed', {
          method,
          url,
          responseTime,
          status: context.switchToHttp().getResponse().statusCode,
        });
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        logger.error('Request failed', {
          method,
          url,
          responseTime,
          error: error.message,
          stack: error.stack,
        });
        throw error;
      }),
    );
  }
}
```

---

### 9.2 ELK Stack Integration

**Architecture**:

```
Backend Application
   ↓ (Winston HTTP transport)
Logstash (Collect & Parse)
   ↓
Elasticsearch (Store & Index)
   ↓
Kibana (Visualize & Search)
```

**Logstash Configuration**:

```ruby
# logstash/pipeline.conf
input {
  http {
    port => 5044
    codec => json
  }
}

filter {
  # Parse timestamp
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }
  
  # Extract tenant ID
  if [tenantId] {
    mutate {
      add_field => { "tenant" => "%{tenantId}" }
    }
  }
  
  # Parse error stack traces
  if [level] == "error" {
    mutate {
      add_tag => ["error"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "platform-cms-logs-%{+YYYY.MM.dd}"
  }
}
```

**Kibana Dashboard**:
- Request rate by endpoint
- Error rate over time
- Response time percentiles (p50, p95, p99)
- Top slowest endpoints
- Errors by tenant
- User activity by tenant

---

### 9.3 Prometheus Metrics

**Custom Metrics**:

```typescript
// src/common/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, register } from 'prom-client';

@Injectable()
export class MetricsService {
  // HTTP request metrics
  private readonly httpRequestCounter: Counter;
  private readonly httpRequestDuration: Histogram;
  
  // Database metrics
  private readonly dbQueryDuration: Histogram;
  private readonly dbConnectionPool: Gauge;
  
  // Cache metrics
  private readonly cacheHitCounter: Counter;
  private readonly cacheMissCounter: Counter;
  
  // Business metrics
  private readonly tenantCounter: Gauge;
  private readonly userCounter: Gauge;
  
  constructor() {
    // HTTP metrics
    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
    });
    
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
    });
    
    // Database metrics
    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3],
    });
    
    // Cache metrics
    this.cacheHitCounter = new Counter({
      name: 'cache_hits_total',
      help: 'Total cache hits',
      labelNames: ['cache_name'],
    });
    
    this.cacheMissCounter = new Counter({
      name: 'cache_misses_total',
      help: 'Total cache misses',
      labelNames: ['cache_name'],
    });
  }
  
  // Record HTTP request
  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequestCounter.inc({ method, route, status });
    this.httpRequestDuration.observe({ method, route }, duration / 1000);
  }
  
  // Record database query
  recordDbQuery(operation: string, table: string, duration: number) {
    this.dbQueryDuration.observe({ operation, table }, duration / 1000);
  }
  
  // Record cache hit/miss
  recordCacheHit(cacheName: string) {
    this.cacheHitCounter.inc({ cache_name: cacheName });
  }
  
  recordCacheMiss(cacheName: string) {
    this.cacheMissCounter.inc({ cache_name: cacheName });
  }
  
  // Get all metrics (for /metrics endpoint)
  getMetrics() {
    return register.metrics();
  }
}
```

**Metrics Endpoint**:

```typescript
// src/metrics/metrics.controller.ts
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}
  
  @Get()
  @Public() // No auth required (internal endpoint)
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}
```

---

### 9.4 Grafana Dashboards

**Dashboard 1: System Health**

Panels:
- CPU usage (%)
- Memory usage (%)
- Disk I/O
- Network throughput
- Pod count & status

**Dashboard 2: Application Performance**

Panels:
- Request rate (req/s)
- Response time (p50, p95, p99)
- Error rate (%)
- Active users
- Cache hit rate (%)

**Dashboard 3: Database Performance**

Panels:
- Query rate (queries/s)
- Query duration (p50, p95, p99)
- Connection pool usage
- Slow query count
- Deadlock count

**Dashboard 4: Business Metrics**

Panels:
- Total tenants
- Active tenants
- Total users per tenant
- Login success/failure rate
- API usage by tenant

---

### 9.5 Error Tracking (Sentry)

**Sentry Integration**:

```typescript
// src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Capture 100% of transactions
  
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.['authorization'];
    }
    return event;
  },
});

// Global error handler
app.useGlobalFilters(new SentryExceptionFilter());
```

**Custom Error Context**:

```typescript
try {
  await this.usersService.create(dto);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      tenant_id: this.tenant.id,
      user_id: this.currentUser.id,
    },
    contexts: {
      operation: {
        type: 'user_creation',
        data: dto,
      },
    },
  });
  throw error;
}
```

---

### 9.6 Health Checks

**Health Check Endpoint**:

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}
  
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database check
      () => this.db.pingCheck('database', { timeout: 3000 }),
      
      // Redis check
      () => this.redis.pingCheck('redis', { timeout: 3000 }),
      
      // External API check (if any)
      () => this.http.pingCheck('external-api', 'https://api.example.com/health'),
    ]);
  }
  
  @Get('live')
  @HealthCheck()
  live() {
    // Liveness probe: Is the application running?
    return { status: 'ok' };
  }
  
  @Get('ready')
  @HealthCheck()
  ready() {
    // Readiness probe: Is the application ready to serve traffic?
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

**Response Format**:

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  }
}
```

---

## 10. Development Workflow

### 10.1 Git Workflow

**Branch Strategy** (Git Flow):

```
main (production)
  │
  ├── develop (staging)
  │   │
  │   ├── feature/user-management
  │   ├── feature/role-management
  │   ├── bugfix/login-issue
  │   └── hotfix/critical-bug
  │
  └── release/v1.0.0
```

**Branch Naming Convention**:

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/user-management` |
| Bugfix | `bugfix/description` | `bugfix/login-validation` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Release | `release/version` | `release/v1.0.0` |

**Commit Message Convention** (Conventional Commits):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build process, dependencies

**Examples**:

```
feat(users): add user creation endpoint

Implemented POST /api/v1/users with validation and permission check.

Closes #123

---

fix(auth): fix JWT token expiry validation

Token expiry was not properly validated causing security issue.

BREAKING CHANGE: Token format changed, clients need to update.

---

docs(readme): update installation instructions
```

---

### 10.2 Code Review Process

**Pull Request Checklist**:

- [ ] Code follows project conventions (see AI-RULES.md)
- [ ] All tests pass (`npm test`)
- [ ] New features have tests
- [ ] Documentation updated (if needed)
- [ ] No console.log / debug code
- [ ] No hardcoded values
- [ ] Error handling implemented
- [ ] Security considerations addressed
- [ ] Performance impact considered
- [ ] Database migrations included (if schema changes)

**PR Template**:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Related Issues
Closes #123

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

**Review Guidelines**:

1. **Code Quality**:
   - Readable and maintainable
   - Follows SOLID principles
   - No code duplication

2. **Security**:
   - Input validation
   - SQL injection prevention
   - XSS prevention
   - Proper authentication/authorization

3. **Performance**:
   - No N+1 queries
   - Proper indexing
   - Efficient algorithms

4. **Testing**:
   - Adequate test coverage
   - Tests are meaningful

---

### 10.3 Testing Strategy

**Test Pyramid**:

```
        ┌─────────────┐
        │   E2E Tests │  10%
        │  (Playwright)│
        └─────────────┘
      ┌─────────────────┐
      │ Integration Tests│ 30%
      │    (Vitest)      │
      └─────────────────┘
    ┌───────────────────────┐
    │     Unit Tests        │ 60%
    │      (Vitest)         │
    └───────────────────────┘
```

**Unit Test Example**:

```typescript
// src/modules/users/users.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;
  
  beforeEach(() => {
    repository = {
      create: vi.fn(),
      findByEmail: vi.fn(),
    } as any;
    
    service = new UsersService(repository);
  });
  
  describe('create', () => {
    it('should create a user successfully', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };
      
      const expectedUser = { id: 1, ...dto };
      
      vi.spyOn(repository, 'findByEmail').mockResolvedValue(null);
      vi.spyOn(repository, 'create').mockResolvedValue(expectedUser);
      
      const result = await service.create(dto);
      
      expect(result).toEqual(expectedUser);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });
    
    it('should throw error if email already exists', async () => {
      const dto = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Test User',
      };
      
      vi.spyOn(repository, 'findByEmail').mockResolvedValue({ id: 1 } as any);
      
      await expect(service.create(dto)).rejects.toThrow('Email sudah terdaftar');
    });
  });
});
```

**Integration Test Example**:

```typescript
// test/users.e2e-spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
    
    // Login to get auth token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    
    authToken = loginRes.body.data.token;
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  describe('GET /api/v1/users', () => {
    it('should return users list', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
    
    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(401);
    });
  });
  
  describe('POST /api/v1/users', () => {
    it('should create user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'newuser@example.com',
          password: 'Password123',
          name: 'New User',
          roleIds: [2],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toBe('newuser@example.com');
        });
    });
  });
});
```

**E2E Test Example** (Playwright):

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    
    // Fill login form
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/portal');
    
    // Check dashboard loaded
    expect(await page.textContent('h1')).toContain('Dashboard');
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    // Check error message
    await expect(page.locator('.error-message')).toContainText('Email atau password salah');
  });
});
```

**Test Coverage Target**:
- Overall: 80%+
- Critical paths: 90%+
- Services: 85%+
- Controllers: 75%+

---

### 10.4 Database Migration Workflow

**Migration Lifecycle**:

```
1. Create migration file
   ↓
2. Write migration (up + down)
   ↓
3. Review migration
   ↓
4. Test migration (up)
   ↓
5. Test rollback (down)
   ↓
6. Commit migration file
   ↓
7. Deploy & run migration
   ↓
8. Verify in production
```

**Migration Commands**:

```bash
# Generate migration
npm run migration:generate -- --name create_users_table

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

**Migration Best Practices**:

1. **Always Reversible**: Write `down()` method
2. **Incremental**: One change per migration
3. **Test**: Test both up and down
4. **Backup**: Backup database before migration
5. **Zero Downtime**: Use online schema change for large tables

---

### 10.5 Release Process

**Release Checklist**:

- [ ] All features for release merged to `develop`
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped (package.json)
- [ ] Create release branch (`release/vX.X.X`)
- [ ] Deploy to staging
- [ ] QA testing on staging
- [ ] Fix critical bugs (if any)
- [ ] Merge to `main`
- [ ] Tag release (`git tag vX.X.X`)
- [ ] Deploy to production
- [ ] Monitor production
- [ ] Announce release

**Semantic Versioning**:

```
vMAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes
```

**Examples**:
- `v1.0.0` → Initial release
- `v1.1.0` → Added new feature
- `v1.1.1` → Bug fix
- `v2.0.0` → Breaking change

---

### 10.6 Documentation Updates

**Documentation Types**:

1. **API Documentation** (Swagger)
   - Auto-generated from code
   - Update decorators when adding endpoints

2. **Technical Documentation** (docs/)
   - Update when architecture changes
   - Keep in sync with code

3. **User Documentation**
   - User guides
   - Administrator guides
   - FAQ

4. **Developer Documentation**
   - README.md
   - CONTRIBUTING.md
   - Code comments

**Documentation Review**:
- Review docs in every PR
- Update docs BEFORE merging
- Keep docs versioned with code

---

## Penutup

### Approval & Sign-off

**Prepared by**: [Development Team]  
**Review by**: [Tech Lead]  
**Approved by**: [Project Manager]  

**Date**: 2024-01-08

---

### Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024-01-08 | Initial technical architecture document | Development Team |

---

### Referensi

**Internal Documents**:
- PROJECT-BRIEF.md - Project overview
- PRD.md - Product requirements
- ERD-DATABASE.md - Database design
- API-CONTRACT.md - API specifications
- BUSINESS-RULES.md - Business logic rules
- AI-RULES.md - Development guidelines

**External References**:
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

### Catatan Penting

⚠️ **PENTING**:

1. **Tech Stack Immutable**: Stack yang sudah ditentukan TIDAK BOLEH diubah tanpa approval
2. **Security First**: Semua keputusan harus prioritaskan security
3. **Multi-Tenancy Mandatory**: Semua code HARUS tenant-aware
4. **Soft Delete Mandatory**: JANGAN pernah hard delete data krusial
5. **Documentation Sync**: Dokumentasi HARUS selalu sync dengan kode

---

**END OF DOCUMENT**

