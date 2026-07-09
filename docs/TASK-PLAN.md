# TASK PLAN - DEVELOPMENT ROADMAP
# Platform CMS - Core Framework

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: Development Task Plan  
**Reference**: PROJECT-BRIEF.md, FEATURE-LIST.md, TECHNICAL-ARCHITECTURE.md, AI-RULES.md

---

## Pendahuluan

Dokumen ini berisi task plan lengkap untuk development Platform CMS MVP (Phase 1 - 16 minggu). Task plan ini mengikuti **strategi prioritas: Core Foundation → CLI Builder → Remaining Modules** untuk mempercepat development dengan memanfaatkan AI code generation.

### Strategi Development

**Mengapa Core Foundation dulu?**
- Establish patterns yang akan digunakan semua modules
- Setup infrastructure (database, auth, multi-tenancy)
- Buat base components yang reusable

**Mengapa CLI Builder di tengah development?**
- Setelah patterns established, CLI bisa generate code konsisten
- AI dapat menggunakan CLI untuk generate remaining modules lebih cepat
- Reduce manual coding time dari 3-4 hari menjadi 30 menit per module

**Hasil akhir**: MVP complete dalam 16 minggu dengan kualitas code terjaga

---

## Timeline Overview

```
Week 1-2:   Project Setup & Infrastructure
Week 3-4:   Database & Multi-Tenancy
Week 5-7:   Authentication & Authorization
Week 8-9:   Security Layer & Audit
Week 10-11: CLI Builder Tool Development
Week 12-13: Generate Core Modules via CLI
Week 14-15: Frontend Foundation & Integration
Week 16:    Testing, Documentation, Deployment Prep
```

---

## Phase Breakdown

| Phase | Weeks | Focus | Output |
|-------|-------|-------|--------|
| **Phase 1: Foundation** | 1-4 | Project setup, database, multi-tenancy | Working database with tenant isolation |
| **Phase 2: Core Security** | 5-9 | Auth, RBAC, security, audit | Secure API with authentication |
| **Phase 3: CLI Tool** | 10-11 | Build CLI builder | Working CLI generator |
| **Phase 4: Module Generation** | 12-13 | Use CLI to generate modules | Users, Roles, Tenants modules |
| **Phase 5: Frontend** | 14-15 | UI components, pages | Working frontend |
| **Phase 6: Polish** | 16 | Testing, docs, deployment | MVP ready to ship |

---

## Week 1-2: Project Setup & Infrastructure

### Goals
- ✅ Setup project structure (backend + frontend)
- ✅ Configure development environment
- ✅ Setup database connection
- ✅ Setup Redis connection
- ✅ Basic CI/CD pipeline

---

### Task 1.1: Backend Project Setup
**Priority**: P0 - CRITICAL  
**Estimated Time**: 4 hours  
**Dependencies**: None

**Files to Create**:
```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   └── (will populate later)
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── redis.config.ts
│   └── database/
│       ├── drizzle.provider.ts
│       └── schema/
│           ├── public/
│           └── tenant/
├── test/
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**Acceptance Criteria**:
- [x] NestJS project initialized with TypeScript
- [x] ESLint + Prettier configured per AI-RULES.md
- [x] Vitest configured for testing
- [x] Environment variables setup (.env.example)
- [x] npm scripts untuk dev, build, test, lint

**Commands to Run**:
```bash
mkdir -p backend/src/{common,config,database,modules}
cd backend
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express rxjs reflect-metadata
npm install -D typescript @types/node ts-node @nestjs/cli
npx nest generate app
```

**Testing Requirements**:
- App starts without errors
- `/` endpoint returns response
- Hot reload works (npm run start:dev)

**Documentation References**:
- TECHNICAL-ARCHITECTURE.md Section 3.1 (Backend structure)
- AI-RULES.md Section 5 (Backend coding rules)

---

### Task 1.2: Frontend Project Setup
**Priority**: P0 - CRITICAL  
**Estimated Time**: 3 hours  
**Dependencies**: None

**Files to Create**:
```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/
├── lib/
│   └── utils.ts
├── public/
├── .env.local.example
├── .eslintrc.json
├── .prettierrc
├── components.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

**Acceptance Criteria**:
- [x] Next.js 15 project initialized with App Router
- [x] Tailwind CSS configured
- [x] shadcn/ui initialized
- [x] TypeScript strict mode enabled
- [x] ESLint + Prettier configured

**Commands to Run**:
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir=false
cd frontend
npx shadcn-ui@latest init
```

**Testing Requirements**:
- Dev server starts (npm run dev)
- Home page renders
- Tailwind CSS works
- shadcn/ui components can be added

**Documentation References**:
- TECHNICAL-ARCHITECTURE.md Section 3.2 (Frontend structure)
- AI-RULES.md Section 6 (Frontend coding rules)

---

### Task 1.3: Database Connection Setup
**Priority**: P0 - CRITICAL  
**Estimated Time**: 3 hours  
**Dependencies**: Task 1.1

**Files to Create/Modify**:
```
backend/
├── drizzle.config.ts
├── src/
│   ├── config/
│   │   └── database.config.ts
│   └── database/
│       ├── drizzle.provider.ts
│       └── database.module.ts
└── .env
```

**Steps**:
1. Install dependencies:
   ```bash
   npm install drizzle-orm pg drizzle-kit
   npm install -D @types/pg
   ```

2. Create database config
3. Create Drizzle provider
4. Test connection

**Acceptance Criteria**:
- [x] PostgreSQL connection established
- [x] Drizzle ORM configured
- [x] Connection pooling setup (max 20 connections)
- [x] Error handling for connection failures
- [x] Health check endpoint returns DB status

**Code Example** (database.config.ts):
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'platform_cms',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true',
  maxConnections: 20,
  idleTimeoutMillis: 30000,
}));
```

**Testing Requirements**:
- Connection test passes
- Can execute simple query (SELECT 1)
- Connection pool logs show active connections
- Health check returns { database: 'connected' }

**Documentation References**:
- TECHNICAL-ARCHITECTURE.md Section 2.1 (Backend tech stack)
- ERD-DATABASE.md (Database architecture)

---

### Task 1.4: Redis Connection Setup
**Priority**: P0 - CRITICAL  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.1

**Files to Create/Modify**:
```
backend/src/
├── config/
│   └── redis.config.ts
└── core/
    └── cache/
        ├── redis.service.ts
        ├── redis.module.ts
        └── redis.provider.ts
```

**Steps**:
1. Install dependencies:
   ```bash
   npm install ioredis
   npm install -D @types/ioredis
   ```

2. Create Redis config
3. Create Redis service
4. Test connection

**Acceptance Criteria**:
- [x] Redis connection established
- [x] Redis service injectable via DI
- [x] Basic operations work (get, set, delete)
- [x] TTL support configured
- [x] Health check includes Redis status

**Code Example** (redis.service.ts):
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
      db: this.configService.get('redis.db'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  getClient(): Redis {
    return this.client;
  }
}
```

**Testing Requirements**:
- Can set/get key-value pairs
- TTL expires correctly
- Connection survives disconnect/reconnect
- Health check returns Redis status

**Documentation References**:
- TECHNICAL-ARCHITECTURE.md Section 2.1 (Redis for caching)

---

### Task 1.5: Environment Configuration
**Priority**: P1 - HIGH  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.1, 1.3, 1.4

**Files to Create**:
```
backend/
├── .env
├── .env.example
├── .env.test
└── src/config/
    ├── app.config.ts
    └── index.ts
```

**Environment Variables**:
```bash
# Application
NODE_ENV=development
APP_PORT=3000
APP_NAME=Platform CMS
APP_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=platform_cms
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

**Acceptance Criteria**:
- [x] @nestjs/config installed and configured
- [x] Environment validation schema (Zod)
- [x] Config service injectable
- [x] Separate configs for dev/test/prod
- [x] Secrets not committed to git

**Testing Requirements**:
- App fails to start with missing required env vars
- Config values accessible via ConfigService
- Different environments load different configs

**Documentation References**:
- AI-RULES.md (Environment best practices)

---

### Task 1.6: Git & CI/CD Setup
**Priority**: P1 - HIGH  
**Estimated Time**: 3 hours  
**Dependencies**: Task 1.1, 1.2

**Files to Create**:
```
.github/
└── workflows/
    ├── backend-ci.yml
    └── frontend-ci.yml
.gitignore
README.md
```

**Git Setup**:
```bash
git init
git add .
git commit -m "Initial commit: Project setup"
git branch -M main
```

**GitHub Actions CI** (backend-ci.yml):
```yaml
name: Backend CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: platform_cms_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        working-directory: backend
        run: npm ci
      
      - name: Lint
        working-directory: backend
        run: npm run lint
      
      - name: Type check
        working-directory: backend
        run: npm run type-check
      
      - name: Run tests
        working-directory: backend
        run: npm run test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: platform_cms_test
          DB_USER: postgres
          DB_PASSWORD: postgres
          REDIS_HOST: localhost
          REDIS_PORT: 6379
```

**Acceptance Criteria**:
- [x] Repository initialized
- [x] .gitignore configured (node_modules, .env, dist/)
- [x] GitHub Actions CI pipeline runs on push/PR
- [x] CI runs lint, type-check, tests
- [x] README.md with setup instructions

**Testing Requirements**:
- Push to main triggers CI
- CI passes with green checks
- Failed tests block PR merge

---

### Week 1-2 Summary

**Deliverables**:
- ✅ Backend NestJS project setup
- ✅ Frontend Next.js project setup
- ✅ PostgreSQL connection working
- ✅ Redis connection working
- ✅ Environment configuration
- ✅ CI/CD pipeline running

**Next Week**: Database schema creation and multi-tenancy implementation

---

## Week 3-4: Database & Multi-Tenancy

### Goals
- ✅ Create database schemas (public + tenant template)
- ✅ Implement multi-tenancy middleware
- ✅ Tenant provisioning flow
- ✅ Migration system
- ✅ Soft delete pattern

---

### Task 2.1: Create Global Schema (public)
**Priority**: P0 - CRITICAL  
**Estimated Time**: 4 hours  
**Dependencies**: Task 1.3

**Files to Create**:
```
backend/src/database/schema/public/
├── tenants.schema.ts
├── modules.schema.ts
├── module-permissions.schema.ts
├── system-settings.schema.ts
└── index.ts
```

**Schema to Create**:
1. **tenants** table
2. **modules** table
3. **module_permissions** table
4. **system_settings** table

**Code Example** (tenants.schema.ts):
```typescript
import { pgTable, bigserial, varchar, timestamp, boolean, bigint, text } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }).unique(),
  schema_name: varchar('schema_name', { length: 100 }).notNull().unique(),
  subscription_tier: varchar('subscription_tier', { length: 50 }).notNull().default('free'),
  subscription_expires_at: timestamp('subscription_expires_at', { withTimezone: true }),
  config: text('config'), // JSONB stored as text
  is_active: boolean('is_active').notNull().default(true),
  
  // Audit fields
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
  
  // Soft delete
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
```

**Acceptance Criteria**:
- [x] All 4 global tables created
- [x] Proper indexes on slug, domain, is_active
- [x] Soft delete columns present
- [x] Drizzle types exported
- [x] Migration file generated

**Testing Requirements**:
- Can insert tenant record
- Unique constraints work (slug, domain)
- Timestamps auto-populated
- Soft delete works (deleted_at not null)

**Documentation References**:
- ERD-DATABASE.md Section 1 (Global schema tables)
- AI-RULES.md Section 7.2 (Drizzle ORM pattern)

---

### Task 2.2: Create Tenant Schema Template
**Priority**: P0 - CRITICAL  
**Estimated Time**: 6 hours  
**Dependencies**: Task 2.1

**Files to Create**:
```
backend/src/database/schema/tenant/
├── users.schema.ts
├── roles.schema.ts
├── permissions.schema.ts
├── user-roles.schema.ts
├── role-permissions.schema.ts
├── tenant-modules.schema.ts
├── sessions.schema.ts
├── audit-logs.schema.ts
├── password-resets.schema.ts
├── categories.schema.ts
├── tags.schema.ts
└── index.ts
```

**Schema to Create** (11 tables):
1. users
2. roles
3. permissions
4. user_roles (junction)
5. role_permissions (junction)
6. tenant_modules
7. sessions
8. audit_logs
9. password_resets
10. categories
11. tags

**Code Example** (users.schema.ts):
```typescript
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
  last_login_ip: varchar('last_login_ip', { length: 45 }),
  must_change_password: boolean('must_change_password').notNull().default(false),
  password_changed_at: timestamp('password_changed_at', { withTimezone: true }),
  
  // Audit fields (MANDATORY)
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
  
  // Soft delete (MANDATORY)
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

**Acceptance Criteria**:
- [x] All 11 tenant tables defined
- [x] Foreign keys properly set
- [x] Indexes on frequently queried fields
- [x] Soft delete columns where needed
- [x] Audit columns on all major tables

**Testing Requirements**:
- Schema can be created in new schema
- Foreign keys work correctly
- Indexes improve query performance
- Types exported correctly

**Documentation References**:
- ERD-DATABASE.md Section 2 (Tenant schema tables)
- AI-RULES.md Section 7.5-7.6 (Soft delete & audit columns)

---


### Task 2.3: Migration System Implementation
**Priority**: P0 - CRITICAL  
**Estimated Time**: 5 hours  
**Dependencies**: Task 2.1, 2.2

**Files to Create**:
```
backend/src/database/
├── migrations/
│   ├── 00000001_create_global_schema.ts
│   ├── 00000002_create_tenant_template.ts
│   └── runner.ts
└── migration.service.ts
```

**Migration Runner Features**:
- Run migrations for global schema
- Run migrations for all tenant schemas
- Rollback support
- Migration status tracking

**Code Example** (migration.service.ts):
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

@Injectable()
export class MigrationService {
  private pool: Pool;

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      host: this.configService.get('database.host'),
      port: this.configService.get('database.port'),
      database: this.configService.get('database.database'),
      user: this.configService.get('database.username'),
      password: this.configService.get('database.password'),
    });
  }

  async runGlobalMigrations(): Promise<void> {
    const db = drizzle(this.pool, { schema: 'public' });
    await migrate(db, { migrationsFolder: './migrations/global' });
  }

  async runTenantMigrations(schemaName: string): Promise<void> {
    const db = drizzle(this.pool, { schema: schemaName });
    await migrate(db, { migrationsFolder: './migrations/tenant' });
  }

  async runForAllTenants(): Promise<void> {
    const db = drizzle(this.pool);
    const tenants = await db.query.tenants.findMany({
      where: eq(tenants.is_active, true),
    });

    for (const tenant of tenants) {
      await this.runTenantMigrations(tenant.schema_name);
    }
  }
}
```

**Acceptance Criteria**:
- [x] Migration system configured
- [x] Can run global migrations
- [x] Can run tenant migrations
- [x] Migration history tracked
- [x] Rollback functionality works

**Testing Requirements**:
- Run migrations successfully
- Re-run is idempotent (no errors)
- Rollback restores previous state
- Migration status command works

**Documentation References**:
- AI-RULES.md Section 7.3 (Migration rules)

---

### Task 2.4: Tenant Middleware Implementation
**Priority**: P0 - CRITICAL  
**Estimated Time**: 4 hours  
**Dependencies**: Task 2.1, 2.2

**Files to Create**:
```
backend/src/common/middleware/
├── tenant.middleware.ts
└── tenant-context.service.ts

backend/src/common/decorators/
└── current-tenant.decorator.ts
```

**Middleware Flow**:
1. Extract tenant from JWT token
2. Validate tenant exists and is active
3. Set tenant context (schema name)
4. Continue request

**Code Example** (tenant.middleware.ts):
```typescript
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TenantContextService } from './tenant-context.service';
import { TenantsService } from '@/modules/tenants/tenants.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private tenantContextService: TenantContextService,
    private tenantsService: TenantsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractToken(req);

    if (!token) {
      throw new ForbiddenException({
        code: 'MISSING_TOKEN',
        message: 'Token tidak ditemukan',
      });
    }

    try {
      const decoded = this.jwtService.verify(token);
      const tenantId = decoded.tenantId;

      if (!tenantId) {
        throw new ForbiddenException({
          code: 'MISSING_TENANT',
          message: 'Tenant ID tidak ditemukan dalam token',
        });
      }

      const tenant = await this.tenantsService.findById(tenantId);

      if (!tenant || !tenant.is_active) {
        throw new ForbiddenException({
          code: 'TENANT_INACTIVE',
          message: 'Tenant tidak aktif atau tidak ditemukan',
        });
      }

      // Set tenant context for this request
      this.tenantContextService.setTenant({
        id: tenant.id,
        name: tenant.name,
        schemaName: tenant.schema_name,
        config: tenant.config,
      });

      // Store in request for easy access
      req['tenant'] = this.tenantContextService.getTenant();

      next();
    } catch (error) {
      throw new ForbiddenException({
        code: 'INVALID_TOKEN',
        message: 'Token tidak valid',
      });
    }
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
```

**Code Example** (tenant-context.service.ts):
```typescript
import { Injectable, Scope } from '@nestjs/common';

export interface TenantContext {
  id: number;
  name: string;
  schemaName: string;
  config?: any;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenant: TenantContext;

  setTenant(tenant: TenantContext): void {
    this.tenant = tenant;
  }

  getTenant(): TenantContext {
    if (!this.tenant) {
      throw new Error('Tenant context not set');
    }
    return this.tenant;
  }

  getSchemaName(): string {
    return this.getTenant().schemaName;
  }

  getTenantId(): number {
    return this.getTenant().id;
  }
}
```

**Acceptance Criteria**:
- [x] Middleware extracts tenant from JWT
- [x] Validates tenant is active
- [x] Sets tenant context per request
- [x] Decorator @CurrentTenant() works
- [x] Error handling for invalid/missing tenant

**Testing Requirements**:
- Request with valid token sets tenant context
- Request with invalid tenant returns 403
- Request with inactive tenant returns 403
- Tenant context isolated per request

**Documentation References**:
- TECHNICAL-ARCHITECTURE.md Section 4.2 (Tenant context flow)
- AI-RULES.md Section 5.8 (Tenant isolation mandatory)

---

### Task 2.5: Tenant Provisioning Service
**Priority**: P0 - CRITICAL  
**Estimated Time**: 6 hours  
**Dependencies**: Task 2.1, 2.2, 2.3

**Files to Create**:
```
backend/src/modules/tenants/
├── tenants.module.ts
├── tenants.controller.ts
├── tenants.service.ts
├── tenants.repository.ts
├── dto/
│   ├── create-tenant.dto.ts
│   ├── tenant-response.dto.ts
│   └── provision-tenant.dto.ts
└── tenants.service.spec.ts
```

**Tenant Provisioning Flow**:
1. Create tenant record in public schema
2. Generate schema name (tenant_{slug})
3. CREATE SCHEMA in PostgreSQL
4. Run tenant migrations
5. Seed default data (roles, permissions)
6. Create tenant admin user
7. Return tenant + admin credentials

**Code Example** (tenants.service.ts):
```typescript
import { Injectable, ConflictException } from '@nestjs/common';
import { TenantsRepository } from './tenants.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { MigrationService } from '@/database/migration.service';
import { SeedService } from '@/database/seed.service';
import { UsersService } from '@/modules/users/users.service';
import { randomBytes } from 'crypto';

@Injectable()
export class TenantsService {
  constructor(
    private tenantsRepository: TenantsRepository,
    private migrationService: MigrationService,
    private seedService: SeedService,
    private usersService: UsersService,
  ) {}

  async createTenant(dto: CreateTenantDto) {
    // 1. Generate slug
    const slug = this.generateSlug(dto.name);
    const schemaName = `tenant_${slug}`;

    // 2. Check if tenant already exists
    const existingTenant = await this.tenantsRepository.findBySlug(slug);
    if (existingTenant) {
      throw new ConflictException({
        code: 'TENANT_EXISTS',
        message: 'Tenant dengan slug ini sudah ada',
      });
    }

    // 3. Create tenant record
    const tenant = await this.tenantsRepository.create({
      name: dto.name,
      slug,
      schema_name: schemaName,
      subscription_tier: dto.subscriptionTier || 'free',
      is_active: true,
    });

    try {
      // 4. Create schema in PostgreSQL
      await this.tenantsRepository.createSchema(schemaName);

      // 5. Run migrations for tenant schema
      await this.migrationService.runTenantMigrations(schemaName);

      // 6. Seed default data
      await this.seedService.seedTenantDefaults(schemaName);

      // 7. Create admin user
      const tempPassword = this.generatePassword();
      const admin = await this.usersService.createInTenant(schemaName, {
        email: dto.adminEmail,
        name: dto.adminName,
        password: tempPassword,
        is_active: true,
        is_verified: true,
      });

      // 8. Assign admin role
      await this.usersService.assignRole(admin.id, 'admin', schemaName);

      return {
        tenant,
        admin: {
          id: admin.id,
          email: admin.email,
          temporaryPassword: tempPassword,
        },
      };
    } catch (error) {
      // Rollback: delete tenant record if schema creation fails
      await this.tenantsRepository.delete(tenant.id);
      throw error;
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generatePassword(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    const randomBuffer = randomBytes(length);

    for (let i = 0; i < length; i++) {
      password += chars[randomBuffer[i] % chars.length];
    }

    return password;
  }
}
```

**Acceptance Criteria**:
- [x] Can create new tenant
- [x] Schema created in PostgreSQL
- [x] Migrations run successfully
- [x] Default data seeded
- [x] Admin user created
- [x] Rollback on failure
- [x] Duplicate tenant slug prevented

**Testing Requirements**:
- Create tenant successfully
- Tenant has own schema
- Admin can login
- Cannot create tenant with duplicate slug
- Failed provisioning rolls back

**Documentation References**:
- TECHNICAL-ARCHITECTURE.md Section 4.3 (Tenant provisioning flow)
- ERD-DATABASE.md Section 1.1 (Tenants table)

---

### Task 2.6: Base Repository with Soft Delete
**Priority**: P0 - CRITICAL  
**Estimated Time**: 4 hours  
**Dependencies**: Task 2.2, 2.4

**Files to Create**:
```
backend/src/common/database/
├── base.repository.ts
└── repository.interface.ts
```

**Base Repository Features**:
- Auto soft delete on delete()
- Auto filter deleted records on find()
- Restore functionality
- Tenant-aware queries

**Code Example** (base.repository.ts):
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { eq, isNull, and } from 'drizzle-orm';
import { TenantContextService } from '@/common/middleware/tenant-context.service';

@Injectable()
export abstract class BaseRepository<T> {
  constructor(
    @Inject('DRIZZLE') protected readonly db: any,
    protected readonly table: any,
    protected readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Find all records (excluding soft deleted)
   */
  async findAll(filters?: any): Promise<T[]> {
    const schemaName = this.tenantContext.getSchemaName();
    
    return this.db
      .withSchema(schemaName)
      .select()
      .from(this.table)
      .where(and(
        isNull(this.table.deleted_at),
        // Add additional filters here
      ));
  }

  /**
   * Find by ID (excluding soft deleted)
   */
  async findById(id: number): Promise<T | null> {
    const schemaName = this.tenantContext.getSchemaName();
    
    const results = await this.db
      .withSchema(schemaName)
      .select()
      .from(this.table)
      .where(and(
        eq(this.table.id, id),
        isNull(this.table.deleted_at),
      ))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Create new record
   */
  async create(data: Partial<T>, userId: number): Promise<T> {
    const schemaName = this.tenantContext.getSchemaName();
    
    const results = await this.db
      .withSchema(schemaName)
      .insert(this.table)
      .values({
        ...data,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return results[0];
  }

  /**
   * Update record
   */
  async update(id: number, data: Partial<T>, userId: number): Promise<T> {
    const schemaName = this.tenantContext.getSchemaName();
    
    const results = await this.db
      .withSchema(schemaName)
      .update(this.table)
      .set({
        ...data,
        updated_by: userId,
        updated_at: new Date(),
      })
      .where(and(
        eq(this.table.id, id),
        isNull(this.table.deleted_at),
      ))
      .returning();

    return results[0];
  }

  /**
   * Soft delete record
   */
  async softDelete(id: number, userId: number): Promise<void> {
    const schemaName = this.tenantContext.getSchemaName();
    
    await this.db
      .withSchema(schemaName)
      .update(this.table)
      .set({
        deleted_at: new Date(),
        deleted_by: userId,
      })
      .where(eq(this.table.id, id));
  }

  /**
   * Restore soft deleted record
   */
  async restore(id: number): Promise<void> {
    const schemaName = this.tenantContext.getSchemaName();
    
    await this.db
      .withSchema(schemaName)
      .update(this.table)
      .set({
        deleted_at: null,
        deleted_by: null,
      })
      .where(eq(this.table.id, id));
  }

  /**
   * Hard delete (use with caution!)
   */
  async hardDelete(id: number): Promise<void> {
    const schemaName = this.tenantContext.getSchemaName();
    
    await this.db
      .withSchema(schemaName)
      .delete(this.table)
      .where(eq(this.table.id, id));
  }

  /**
   * Find deleted records
   */
  async findDeleted(): Promise<T[]> {
    const schemaName = this.tenantContext.getSchemaName();
    
    return this.db
      .withSchema(schemaName)
      .select()
      .from(this.table)
      .where(isNull(this.table.deleted_at).not());
  }
}
```

**Acceptance Criteria**:
- [x] Base repository implemented
- [x] Soft delete automatic
- [x] Queries auto-filter deleted records
- [x] Restore functionality works
- [x] Tenant-aware queries
- [x] Audit fields auto-populated

**Testing Requirements**:
- Soft deleted records not in findAll()
- Can restore deleted records
- Hard delete requires explicit call
- Tenant isolation works

**Documentation References**:
- AI-RULES.md Section 5.7 (Soft delete mandatory)
- TECHNICAL-ARCHITECTURE.md Section 4 (Multi-tenancy)

---

### Week 3-4 Summary

**Deliverables**:
- ✅ Global schema (public) created with 4 tables
- ✅ Tenant schema template created with 11 tables
- ✅ Migration system working
- ✅ Tenant middleware for context switching
- ✅ Tenant provisioning service
- ✅ Base repository with soft delete
- ✅ Can create and manage multiple tenants

**Next Week**: Authentication and Authorization implementation

---

## Week 5-7: Authentication & Authorization

### Goals
- ✅ JWT authentication system
- ✅ User registration & login
- ✅ Password management
- ✅ Role-Based Access Control (RBAC)
- ✅ CASL permission system
- ✅ Session management

---

### Task 3.1: Authentication Module Setup
**Priority**: P0 - CRITICAL  
**Estimated Time**: 6 hours  
**Dependencies**: Task 2.2, 2.4

**Files to Create**:
```
backend/src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── dto/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   ├── password-reset-request.dto.ts
│   ├── password-reset-confirm.dto.ts
│   └── change-password.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── local-auth.guard.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
└── auth.service.spec.ts
```

**Dependencies to Install**:
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

**Code Example** (auth.service.ts - Login):
```typescript
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { compare, hash } from 'bcrypt';
import { RedisService } from '@/core/cache/redis.service';
import { AuditService } from '@/core/audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private auditService: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException({
        code: 'EMAIL_EXISTS',
        message: 'Email sudah terdaftar',
        errors: [{ field: 'email', message: 'Email sudah digunakan' }],
      });
    }

    // Hash password
    const passwordHash = await hash(dto.password, 12);

    // Create user
    const user = await this.usersService.create({
      email: dto.email,
      password_hash: passwordHash,
      name: dto.name,
      phone: dto.phone,
      is_active: true,
      is_verified: false, // Require email verification
    });

    // TODO: Send verification email

    // Audit log
    await this.auditService.log({
      userId: user.id,
      action: 'register',
      resource: 'auth',
      resourceId: user.id,
    });

    return {
      message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    // Find user by email
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      // Audit failed login
      await this.auditService.log({
        action: 'login_failed',
        resource: 'auth',
        description: `Failed login attempt for email: ${dto.email}`,
        ipAddress,
        userAgent,
      });

      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email atau password salah',
      });
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException({
        code: 'USER_INACTIVE',
        message: 'Akun tidak aktif. Hubungi administrator.',
      });
    }

    // Verify password
    const isPasswordValid = await compare(dto.password, user.password_hash);

    if (!isPasswordValid) {
      // Audit failed login
      await this.auditService.log({
        userId: user.id,
        action: 'login_failed',
        resource: 'auth',
        resourceId: user.id,
        description: 'Invalid password',
        ipAddress,
        userAgent,
      });

      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email atau password salah',
      });
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenant_id,
    };

    const token = this.jwtService.sign(payload);

    // Create session
    const sessionId = await this.createSession(user.id, token, ipAddress, userAgent);

    // Update last login
    await this.usersService.updateLastLogin(user.id, ipAddress);

    // Audit successful login
    await this.auditService.log({
      userId: user.id,
      action: 'login',
      resource: 'auth',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 86400, // 24 hours
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_verified: user.is_verified,
      },
    };
  }

  async logout(userId: number, token: string) {
    // Delete session from Redis
    await this.deleteSession(userId, token);

    // Audit logout
    await this.auditService.log({
      userId,
      action: 'logout',
      resource: 'auth',
      resourceId: userId,
    });

    return {
      message: 'Logout berhasil',
    };
  }

  private async createSession(
    userId: number,
    token: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<string> {
    const sessionId = `session:${userId}:${Date.now()}`;
    const sessionData = {
      userId,
      token,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
    };

    // Store in Redis with 24h TTL
    await this.redisService.set(sessionId, JSON.stringify(sessionData), 86400);

    return sessionId;
  }

  private async deleteSession(userId: number, token: string): Promise<void> {
    // Find and delete session from Redis
    const pattern = `session:${userId}:*`;
    // Implementation depends on Redis client
    // This is simplified
  }
}
```

**Acceptance Criteria**:
- [x] User can register
- [x] User can login
- [x] JWT token generated
- [x] Session stored in Redis
- [x] Password hashed with bcrypt
- [x] Audit logs for auth events
- [x] Rate limiting on login (5 attempts/15min)

**Testing Requirements**:
- Register with valid data succeeds
- Register with duplicate email fails
- Login with valid credentials succeeds
- Login with invalid credentials fails  
- Login with inactive user fails
- JWT token is valid
- Session expires after 24h

**Documentation References**:
- TECHNICAL-ARCHITECTURE.md Section 5.1 (Authentication flow)
- FEATURE-LIST.md Section 1 (Authentication features)

---

Let me continue with more tasks in the next append...


### Task 3.2: RBAC & Permission System (CASL)
**Priority**: P0 - CRITICAL  
**Estimated Time**: 8 hours  
**Dependencies**: Task 3.1

**Files to Create**:
```
backend/src/core/casl/
├── casl.module.ts
├── casl-ability.factory.ts
└── casl.guard.ts

backend/src/common/decorators/
├── permissions.decorator.ts
└── current-user.decorator.ts

backend/src/modules/permissions/
├── permissions.module.ts
├── permissions.service.ts
└── permissions.repository.ts

backend/src/modules/roles/
├── roles.module.ts
├── roles.controller.ts
├── roles.service.ts
├── roles.repository.ts
└── dto/
    ├── create-role.dto.ts
    ├── update-role.dto.ts
    └── assign-permissions.dto.ts
```

**Dependencies to Install**:
```bash
npm install @casl/ability
```

**Acceptance Criteria**:
- [x] CASL ability factory implemented
- [x] Permission guard works
- [x] @Permissions() decorator functional
- [x] Roles CRUD complete
- [x] Can assign permissions to roles
- [x] Can assign roles to users
- [x] Permission check in every protected route

**Documentation References**:
- TECHNICAL-ARCHITECTURE.md Section 5.2 (Authorization flow)
- FEATURE-LIST.md Section 3 (Role and Permission module)

---

## Week 8-9: Security Layer & Audit

### Goals
- ✅ Input sanitization middleware
- ✅ Rate limiting
- ✅ Audit logging system
- ✅ Security headers
- ✅ CORS configuration

---

### Task 4.1: Security Middleware
**Priority**: P0 - CRITICAL  
**Estimated Time**: 5 hours  

**Files to Create**:
```
backend/src/common/middleware/
├── sanitization.middleware.ts
├── rate-limit.middleware.ts
└── security-headers.middleware.ts

backend/src/common/pipes/
└── zod-validation.pipe.ts
```

**Dependencies**:
```bash
npm install helmet @nestjs/throttler sanitize-html
```

**Acceptance Criteria**:
- [x] Input sanitization on all requests
- [x] Rate limiting per tenant
- [x] Security headers (helmet)
- [x] CORS properly configured
- [x] Zod validation pipe

**Documentation References**:
- SECURITY-GUIDELINES.md
- TECHNICAL-ARCHITECTURE.md Section 5.3

---

### Task 4.2: Audit Logging System
**Priority**: P0 - CRITICAL  
**Estimated Time**: 6 hours  

**Files to Create**:
```
backend/src/core/audit/
├── audit.module.ts
├── audit.service.ts
├── audit.repository.ts
└── dto/
    └── create-audit-log.dto.ts
```

**Acceptance Criteria**:
- [x] Audit log on all CRUD operations
- [x] Audit log on authentication events
- [x] Store before/after values
- [x] IP address and user agent captured
- [x] Can query audit logs

**Documentation References**:
- ERD-DATABASE.md Section 2.8 (Audit logs table)
- FEATURE-LIST.md Section 7 (Audit log module)

---

## Week 10-11: CLI Builder Tool Development

### Goals
- ✅ Build CLI framework
- ✅ Module generator
- ✅ CRUD generator  
- ✅ Migration generator
- ✅ Component generator
- ✅ Template system

---

### Task 5.1: CLI Framework Setup
**Priority**: P1 - HIGH  
**Estimated Time**: 4 hours  
**Dependencies**: None (separate project)

**Files to Create**:
```
@platform-cms/cli/
├── src/
│   ├── cli.ts
│   ├── commands/
│   │   ├── new.command.ts
│   │   ├── generate.command.ts
│   │   ├── migrate.command.ts
│   │   └── validate.command.ts
│   ├── generators/
│   │   ├── base.generator.ts
│   │   ├── module.generator.ts
│   │   ├── crud.generator.ts
│   │   └── component.generator.ts
│   └── utils/
├── templates/
│   ├── backend/
│   └── frontend/
├── package.json
└── tsconfig.json
```

**Dependencies**:
```bash
npm install commander handlebars chalk inquirer ora prettier fs-extra
npm install -D @types/node typescript
```

**Acceptance Criteria**:
- [x] CLI executable (cms command)
- [x] Help system works
- [x] Template engine configured
- [x] File writer utilities

**Documentation References**:
- CLI-BUILDER-SPEC.md Section 1-2

---

### Task 5.2: Module Generator
**Priority**: P1 - HIGH  
**Estimated Time**: 8 hours  
**Dependencies**: Task 5.1

**Command**: `cms generate module <name>`

**What it generates**:
- Module file
- Controller
- Service
- Repository
- Entity (Drizzle schema)
- DTOs (create, update, response)
- Tests

**Acceptance Criteria**:
- [x] Generate complete module structure
- [x] Follow project conventions
- [x] Include soft delete
- [x] Include audit logging
- [x] Include tenant isolation
- [x] Prettier formatting applied

**Documentation References**:
- CLI-BUILDER-SPEC.md Section 2.2
- AI-RULES.md Section 5 (Backend rules)

---

### Task 5.3: CRUD Generator
**Priority**: P1 - HIGH  
**Estimated Time**: 6 hours  
**Dependencies**: Task 5.2

**Command**: `cms generate crud <name> --fields="name:string,price:number"`

**What it generates**:
- Complete module (via module generator)
- Full CRUD endpoints
- Pagination support
- Filtering & sorting
- Frontend pages (list, create, edit)
- Tests

**Acceptance Criteria**:
- [x] Generate full CRUD
- [x] Field types mapped correctly
- [x] Validation rules applied
- [x] API documentation (Swagger)

**Documentation References**:
- CLI-BUILDER-SPEC.md Section 2.3

---

### Task 5.4: Frontend Component Generator
**Priority**: P1 - HIGH  
**Estimated Time**: 4 hours  
**Dependencies**: Task 5.1

**Command**: `cms generate component <name> --type=form`

**What it generates**:
- React component
- TypeScript types
- Tailwind styling
- Test file

**Acceptance Criteria**:
- [x] Generate component
- [x] Follow naming conventions
- [x] Include prop types
- [x] Prettier formatting

**Documentation References**:
- CLI-BUILDER-SPEC.md Section 2.6
- AI-RULES.md Section 6 (Frontend rules)

---

### Task 5.5: CLI Testing & Documentation
**Priority**: P1 - HIGH  
**Estimated Time**: 4 hours  
**Dependencies**: Task 5.2, 5.3, 5.4

**Deliverables**:
- Unit tests for generators
- Integration tests for CLI
- Usage documentation
- Template documentation

**Acceptance Criteria**:
- [x] All generators have tests
- [x] CLI documented with examples
- [x] Templates documented
- [x] Published to npm (or local registry)

---

## Week 12-13: Generate Core Modules via CLI

### Goals
- ✅ Use CLI to generate remaining modules
- ✅ Customize generated code
- ✅ Test generated modules
- ✅ Document generated modules

**Strategy**: Generate, then customize. CLI provides 80% of code, manual work is 20%.

---

### Task 6.1: Generate Users Module
**Priority**: P0 - CRITICAL  
**Estimated Time**: 4 hours  
**Dependencies**: Task 5.2, 5.3

**Command**:
```bash
cms generate crud users \
  --fields="email:email,password_hash:string,name:string,phone:string,avatar_url:url,is_active:boolean,is_verified:boolean" \
  --tenant \
  --soft-delete \
  --auth
```

**Manual Customizations**:
- Add password hashing logic
- Add email uniqueness check
- Add role assignment endpoints
- Integrate with auth module

**Acceptance Criteria**:
- [x] Users CRUD complete
- [x] Can create/update/delete/restore users
- [x] Pagination works
- [x] Filtering by role, status works
- [x] Tests pass

**Time Saved**: 16 hours (without CLI) → 4 hours (with CLI) = **12 hours saved**

**Documentation References**:
- FEATURE-LIST.md Section 2 (User management)
- ERD-DATABASE.md Section 2.1 (Users table)

---

### Task 6.2: Generate Roles Module
**Priority**: P0 - CRITICAL  
**Estimated Time**: 3 hours  
**Dependencies**: Task 5.2, 5.3

**Command**:
```bash
cms generate crud roles \
  --fields="name:string,display_name:string,description:text,is_system:boolean,is_active:boolean" \
  --tenant \
  --soft-delete
```

**Manual Customizations**:
- Add assign permissions endpoint
- Add validation for system roles
- Prevent deletion of system roles

**Time Saved**: **10 hours**

---

### Task 6.3: Generate Tenants Module (Admin)
**Priority**: P0 - CRITICAL  
**Estimated Time**: 4 hours  
**Dependencies**: Task 5.2, 5.3

**Command**:
```bash
cms generate crud tenants \
  --fields="name:string,slug:string,domain:string,subscription_tier:string,is_active:boolean" \
  --soft-delete
```

**Note**: This builds on top of existing tenant provisioning service (Task 2.5)

**Manual Customizations**:
- Integrate with provisioning service
- Add tenant statistics
- Add enable/disable modules endpoint

**Time Saved**: **10 hours**

---

### Task 6.4: Generate Master Data Modules
**Priority**: P1 - HIGH  
**Estimated Time**: 4 hours total (2 hours each)  
**Dependencies**: Task 5.2, 5.3

**Modules to Generate**:
1. **Categories**
   ```bash
   cms generate crud categories \
     --fields="parent_id:number,name:string,slug:string,description:text,type:string,order:number" \
     --tenant \
     --soft-delete
   ```

2. **Tags**
   ```bash
   cms generate crud tags \
     --fields="name:string,slug:string,color:string,usage_count:number" \
     --tenant \
     --soft-delete
   ```

**Manual Customizations**:
- Categories: Add nested category support (recursive CTE)
- Tags: Auto-increment/decrement usage_count

**Time Saved**: **16 hours total**

---

### Week 12-13 Summary

**Total Time Saved with CLI**: ~48 hours  
**Actual Work Time**: ~15 hours  
**Efficiency Gain**: **3x faster development**

---

## Week 14-15: Frontend Foundation & Integration

### Goals
- ✅ Layout components (Header, Sidebar, Footer)
- ✅ Authentication pages (Login, Register)
- ✅ Dashboard page
- ✅ User management UI
- ✅ Role management UI
- ✅ API integration

---

### Task 7.1: Layout Components
**Priority**: P0 - CRITICAL  
**Estimated Time**: 8 hours  

**Files to Create**:
```
frontend/components/layout/
├── header.tsx
├── sidebar.tsx
├── footer.tsx
├── page-header.tsx
└── breadcrumbs.tsx

frontend/app/(private)/layout.tsx
```

**Acceptance Criteria**:
- [x] Responsive layout
- [x] Collapsible sidebar
- [x] Breadcrumbs navigation
- [x] User menu dropdown
- [x] Theme toggle (dark/light)

**Documentation References**:
- FRONTEND-DESIGN-SYSTEM.md Section 3
- SCREEN-LIST.md

---

### Task 7.2: Authentication Pages
**Priority**: P0 - CRITICAL  
**Estimated Time**: 6 hours  

**Pages to Create**:
- Login page
- Register page
- Forgot password page
- Reset password page

**Acceptance Criteria**:
- [x] Form validation with Zod
- [x] Error messages in Indonesian
- [x] Loading states
- [x] Success/error toasts
- [x] JWT token stored in cookie

---

### Task 7.3: Dashboard Page
**Priority**: P1 - HIGH  
**Estimated Time**: 6 hours  

**Features**:
- Statistics cards (users count, active sessions)
- Recent activity timeline
- Quick actions
- Charts (if needed)

**Acceptance Criteria**:
- [x] Dashboard loads data from API
- [x] Responsive grid layout
- [x] Role-based content (admin vs user)

---

### Task 7.4: User Management UI
**Priority**: P0 - CRITICAL  
**Estimated Time**: 8 hours  

**Pages**:
- User list (with DataTable)
- User create form
- User edit form
- User detail view

**Acceptance Criteria**:
- [x] Pagination works
- [x] Filtering by role, status
- [x] Sorting columns
- [x] Bulk actions (activate/deactivate)
- [x] Assign roles modal

---

### Task 7.5: Role Management UI
**Priority**: P0 - CRITICAL  
**Estimated Time**: 6 hours  

**Pages**:
- Role list
- Role create/edit form
- Assign permissions modal

**Acceptance Criteria**:
- [x] Role CRUD works
- [x] Permission checkboxes grouped by resource
- [x] Cannot delete system roles
- [x] Shows users count per role

---

## Week 16: Testing, Documentation, Deployment Prep

### Goals
- ✅ Unit tests (80%+ coverage)
- ✅ Integration tests
- ✅ E2E tests (critical paths)
- ✅ API documentation complete
- ✅ Deployment guide
- ✅ Developer handbook

---

### Task 8.1: Backend Testing
**Priority**: P0 - CRITICAL  
**Estimated Time**: 12 hours  

**Tests to Write**:
- Unit tests for services
- Integration tests for APIs
- Repository tests
- Guard & middleware tests

**Target**: 80%+ coverage

---

### Task 8.2: Frontend Testing
**Priority**: P1 - HIGH  
**Estimated Time**: 8 hours  

**Tests to Write**:
- Component tests (React Testing Library)
- Hook tests
- E2E tests (Playwright) for critical paths:
  - Login flow
  - User CRUD flow
  - Role management flow

---

### Task 8.3: API Documentation
**Priority**: P1 - HIGH  
**Estimated Time**: 4 hours  

**Deliverables**:
- Swagger/OpenAPI complete
- Request/response examples
- Authentication guide
- Error codes documentation

---

### Task 8.4: Deployment Preparation
**Priority**: P1 - HIGH  
**Estimated Time**: 6 hours  

**Files to Create**:
```
Dockerfile (backend)
Dockerfile (frontend)
docker-compose.yml
docker-compose.prod.yml
.dockerignore
scripts/
├── deploy.sh
└── migrate.sh
```

**Acceptance Criteria**:
- [x] Docker build succeeds
- [x] docker-compose up works
- [x] Environment variables documented
- [x] Migration scripts ready
- [x] Health checks configured

---

### Task 8.5: Documentation Finalization
**Priority**: P1 - HIGH  
**Estimated Time**: 4 hours  

**Documents to Complete/Update**:
- README.md (project root)
- DEPLOYMENT-GUIDE.md
- DEVELOPER-HANDBOOK.md
- API documentation
- Troubleshooting guide

---

## Summary: Complete Task Overview

### Phase Distribution

| Phase | Duration | Main Focus | Tasks | Time Saved with CLI |
|-------|----------|------------|-------|---------------------|
| **Phase 1: Foundation** | Week 1-4 | Setup & Database | 11 tasks | N/A |
| **Phase 2: Core Security** | Week 5-9 | Auth & Security | 10 tasks | N/A |
| **Phase 3: CLI Tool** | Week 10-11 | Build CLI | 5 tasks | N/A |
| **Phase 4: Module Gen** | Week 12-13 | Generate modules | 4 tasks | **~48 hours** |
| **Phase 5: Frontend** | Week 14-15 | UI & Integration | 5 tasks | Faster with CLI |
| **Phase 6: Polish** | Week 16 | Testing & Docs | 5 tasks | N/A |

**Total Tasks**: 40 detailed tasks  
**Total Duration**: 16 weeks  
**Estimated Effort**: ~400 hours without CLI → ~300 hours with CLI

---

## Critical Success Factors

### 1. Follow the Order
✅ **Do NOT skip ahead**. Core foundation must be solid before CLI.  
✅ **Do NOT build CLI before patterns are established**.

### 2. Test Early, Test Often
✅ Write tests for each module immediately after creation.  
✅ Don't accumulate technical debt.

### 3. Use CLI Effectively
✅ Generate code, then customize.  
✅ Don't manually write repetitive code.  
✅ Update CLI templates as patterns evolve.

### 4. Documentation is Code
✅ Keep AI-RULES.md updated with new patterns.  
✅ Document all manual customizations.  
✅ Update API documentation as you build.

### 5. Code Review & Quality
✅ Every generated code must be reviewed.  
✅ Follow AI-RULES.md strictly.  
✅ Run linter and type-check before commit.

---

## Next Steps (After Week 16)

### Phase 2: Enhancements (6 months)
- Multi-factor authentication (MFA)
- Email notifications system
- Advanced monitoring dashboard
- Background job queue (Bull)
- File storage integration (S3/MinIO)
- Advanced reporting
- GraphQL API (optional)

### Phase 3: Use Case Implementation
- Kemendagri PTSP specific features
- Workflow automation
- Document management
- Mobile app (React Native)

---

## Appendix: Quick Reference

### Key Commands

**Backend**:
```bash
npm run start:dev          # Start dev server
npm run test               # Run tests
npm run lint               # Lint code
npm run type-check         # TypeScript check
npm run migrate            # Run migrations
```

**Frontend**:
```bash
npm run dev                # Start dev server
npm run build              # Build for production
npm run lint               # Lint code
npm run test               # Run tests
```

**CLI Tool**:
```bash
cms generate module <name>        # Generate module
cms generate crud <name>          # Generate CRUD
cms generate component <name>     # Generate component
cms db:migrate                    # Run migrations
cms validate                      # Validate project
```

### Critical Files to Read Before Coding

1. **PROJECT-BRIEF.md** - Project overview, tech stack, scope
2. **AI-RULES.md** - Coding standards, conventions, patterns
3. **TECHNICAL-ARCHITECTURE.md** - System architecture, flow
4. **ERD-DATABASE.md** - Database schema, relationships
5. **API-CONTRACT.md** - API standards, response format

### Common Patterns

**Soft Delete**:
```typescript
deleted_at: timestamp | null
deleted_by: bigint | null
```

**Audit Fields**:
```typescript
created_at: timestamp
updated_at: timestamp
created_by: bigint
updated_by: bigint
```

**Tenant Isolation**:
```typescript
const schemaName = this.tenantContext.getSchemaName();
const results = await this.db
  .withSchema(schemaName)
  .select()
  .from(table)
  .where(isNull(table.deleted_at));
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi gagal",
    "errors": [
      { "field": "email", "message": "Email tidak valid" }
    ]
  }
}
```

---

## Status

**Document Status**: ✅ COMPLETE  
**Last Updated**: 2024-01-08  
**Ready for Development**: ✅ YES  

**Next Action**: Start Week 1 - Task 1.1 (Backend Project Setup)

---

**IMPORTANT REMINDER**:
- 🎯 Core Foundation FIRST (Week 1-9)
- 🔧 CLI Builder SECOND (Week 10-11)
- ⚡ Generate modules THIRD (Week 12-13)
- 🎨 Frontend FOURTH (Week 14-15)
- ✅ Polish LAST (Week 16)

**Happy Coding! 🚀**
