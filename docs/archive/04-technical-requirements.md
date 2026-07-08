# Technical Requirements & Architecture

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5+
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: Zustand / TanStack Query
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Charts**: Recharts / Apache ECharts (untuk monitoring dashboard)

### Backend
- **Framework**: NestJS 10+ (Node.js + TypeScript)
- **Architecture**: Modular Monolith (Microservices-ready)
- **Language**: TypeScript 5+
- **API Style**: REST + GraphQL (untuk complex queries)
- **Database ORM**: Drizzle ORM
- **Authentication**: Passport.js + JWT
- **Authorization**: CASL (Attribute-based Access Control)
- **Validation**: class-validator + Zod
- **Documentation**: OpenAPI/Swagger
- **Queue**: Bull + Redis (async processing)

### Database
- **Primary**: PostgreSQL 15+
- **Multi-tenancy**: Schema-based isolation
- **Connection Pool**: PgBouncer / Drizzle built-in
- **Caching**: Redis 7+
- **Search**: PostgreSQL Full-Text Search (built-in)
- **Backup**: Point-in-time recovery (automated)

### Development Environment (Windows)
- **Runtime**: Node.js 20 LTS (via nvm-windows)
- **Package Manager**: npm (built-in dengan Node.js)
- **Database**: PostgreSQL 15+ (Windows native / WSL2)
- **Redis**: Redis on Windows (Memurai) / WSL2
- **Process Manager**: PM2 (development) / Windows Service (production)
- **Terminal**: PowerShell / Windows Terminal
- **Git**: Git for Windows + SSH key

### Production Infrastructure
- **Containerization**: Docker + Docker Compose (production only)
- **Orchestration**: Kubernetes (K8s) - untuk scale nasional
- **Load Balancer**: Nginx / Traefik
- **File Storage**: MinIO (self-hosted S3) / AWS S3
- **Monitoring**: Prometheus + Grafana + ELK Stack
- **Process Manager**: PM2 Cluster / K8s
- **Testing**: Vitest + Testing Library + Playwright
- **Linting**: ESLint + Prettier + Husky
- **CI/CD**: GitHub Actions

## Architecture Principles

### 1. Separation of Concerns: Frontend + Backend

**Project Structure:**
```
platform-cms/
├── backend/                      # NestJS Application
│   ├── src/
│   │   ├── core/                 # Core framework modules
│   │   │   ├── database/         # DB driver, migrations
│   │   │   ├── auth/             # Authentication module
│   │   │   ├── security/         # Sanitization, validation
│   │   │   ├── monitoring/       # Performance tracking
│   │   │   ├── tenancy/          # Multi-tenant support
│   │   │   └── common/           # Shared utilities
│   │   ├── modules/              # Business modules (generated)
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   └── [...]/
│   │   ├── shared/               # Shared DTOs, interfaces
│   │   └── main.ts
│   ├── drizzle/                  # Database schemas & migrations
│   ├── test/
│   └── package.json
│
├── frontend/                     # Next.js Application
│   ├── app/                      # App Router
│   │   ├── (auth)/               # Auth routes group
│   │   ├── (dashboard)/          # Dashboard routes
│   │   ├── api/                  # Minimal API (proxy optional)
│   │   └── layout.tsx
│   ├── components/               # UI Components (shadcn)
│   ├── lib/                      # Frontend utilities
│   ├── hooks/                    # Custom React hooks
│   └── package.json
│
├── cli/                          # CLI Builder Tool
│   ├── commands/                 # CLI commands
│   ├── templates/                # Code templates
│   │   ├── backend/              # NestJS templates
│   │   └── frontend/             # Next.js templates
│   ├── generators/               # Code generators
│   └── package.json
│
├── shared/                       # Shared types & schemas
│   ├── types/                    # TypeScript definitions
│   └── schemas/                  # Zod validation schemas
│
├── docs/                         # Documentation
└── docker/                       # Docker configs (production)
```

### 2. Clean Architecture Layers (Backend - NestJS)

**Modular Architecture:**
- **Presentation Layer**: Controllers (REST/GraphQL endpoints)
- **Application Layer**: Services (business logic)
- **Domain Layer**: Entities, DTOs, Interfaces
- **Infrastructure Layer**: Database, cache, external services
- **Core Layer**: Framework utilities (auth, security, monitoring)

**Module Pattern (NestJS):**
```typescript
@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService]
})
export class UsersModule {}
```

### 3. Multi-tenancy Architecture

**Schema-based Isolation (PostgreSQL):**
```typescript
// Tenant middleware untuk set search_path
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.extractTenantFromToken(req);
    req['tenantSchema'] = `tenant_${tenantId}`;
    next();
  }
}

// Setiap request automatic switch ke schema tenant
// tenant_kemendagri_pusat
// tenant_ptsp_dki_jakarta
// tenant_ptsp_kab_bandung
```

**Keuntungan:**
- Data isolation per tenant
- Security: tenant tidak bisa akses data tenant lain
- Backup per tenant
- Compliance dengan regulasi pemerintah

### 4. Database Driver Abstraction

**Drizzle ORM dengan Multi-Database Support:**
```typescript
// Database configuration
interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'sqlite';
  host: string;
  port: number;
  database: string;
  schema?: string; // untuk multi-tenancy
}

// Drizzle instance dengan driver abstraction
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';

class DatabaseService {
  private db: any;
  
  async connect(config: DatabaseConfig) {
    switch(config.type) {
      case 'postgresql':
        this.db = drizzle(pgPool);
        break;
      case 'mysql':
        this.db = drizzleMysql(mysqlPool);
        break;
    }
  }
}
```

### 5. Soft Delete Pattern (Critical Data Protection)

**IMPORTANT**: Semua data krusial menggunakan **soft delete**, tidak ada hard delete.

```typescript
// Base entity dengan soft delete
export const baseColumns = {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: bigint('created_by', { mode: 'number' }),
  updatedBy: bigint('updated_by', { mode: 'number' }),
  deletedAt: timestamp('deleted_at'), // Soft delete
  deletedBy: bigint('deleted_by', { mode: 'number' })
};

// Query dengan filter soft delete otomatis
export class BaseRepository<T> {
  async findAll() {
    return this.db
      .select()
      .from(this.table)
      .where(isNull(this.table.deletedAt)); // Exclude deleted
  }
  
  async softDelete(id: number, userId: number) {
    return this.db
      .update(this.table)
      .set({ 
        deletedAt: new Date(), 
        deletedBy: userId 
      })
      .where(eq(this.table.id, id));
  }
  
  async restore(id: number) {
    return this.db
      .update(this.table)
      .set({ 
        deletedAt: null, 
        deletedBy: null 
      })
      .where(eq(this.table.id, id));
  }
}
```

**Keuntungan Soft Delete:**
- ✅ Data tidak hilang permanent
- ✅ Audit trail lengkap
- ✅ Dapat di-restore jika kesalahan
- ✅ Compliance dengan regulasi pemerintah
- ✅ Forensic capability

### 6. Security First Approach
- Input sanitization pada setiap layer
- Output encoding untuk XSS prevention
- Parameterized queries untuk SQL injection prevention
- Rate limiting per endpoint dan user
- Security headers untuk semua responses
- Audit logging untuk security events

## Performance Requirements

### Response Time
- **API Endpoints**: < 200ms average
- **Database Queries**: < 100ms average
- **File Uploads**: < 5s untuk 10MB
- **Page Load**: < 2s first load, < 1s subsequent

### Throughput
- **Concurrent Users**: 1,000+ (Phase 1), 10,000+ (Phase 3)
- **Requests per Second**: 100+ (Phase 1), 1,000+ (Phase 3)
- **Database Connections**: Pool of 20-100 connections

### Resource Usage
- **Memory**: < 512MB base usage
- **CPU**: < 50% under normal load
- **Disk Space**: Efficient storage dengan cleanup routines
- **Network**: Optimized payload sizes

## Security Requirements

### Authentication & Authorization
- JWT dengan expiration dan refresh tokens
- Multi-factor authentication support
- Role-based access control (RBAC)
- Permission-based authorization
- Session management dengan security

### Input Validation
- Client-side validation untuk UX
- Server-side validation untuk security
- Sanitization untuk semua user inputs
- File type dan size validation
- XSS dan injection prevention

### Data Protection
- Encryption at rest untuk sensitive data
- Encryption in transit (HTTPS only)
- Password hashing dengan salt (bcrypt)
- Secure file upload dengan scanning
- PII data handling compliance

### Security Headers
```typescript
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'same-origin'
};
```

## Error Handling Standards

### Error Categories
- **Validation Errors**: User input errors
- **Authorization Errors**: Access denied
- **Business Logic Errors**: Domain rule violations
- **System Errors**: Infrastructure failures
- **External Service Errors**: Third-party failures

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    timestamp: string;
    requestId: string;
  };
}
```

### Logging Standards
```typescript
interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  context: Record<string, any>;
  stack?: string;
}
```

## API Design Standards

### REST Conventions
- **GET**: Retrieve resources
- **POST**: Create resources
- **PUT**: Update entire resource
- **PATCH**: Partial update
- **DELETE**: Remove resource

### Response Format
```typescript
// Success Response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}

// Pagination
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### Endpoint Naming
- **Collections**: `/api/v1/users`
- **Individual**: `/api/v1/users/:id`
- **Nested Resources**: `/api/v1/users/:userId/posts`
- **Actions**: `/api/v1/users/:id/activate`

## Database Design Principles

### Table Naming Conventions
- Singular nouns (user, not users)
- Snake_case for multi-word names
- Consistent prefix untuk system tables

### Field Standards
```sql
-- Standard fields untuk semua tables (dengan soft delete)
id BIGSERIAL PRIMARY KEY,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
created_by BIGINT REFERENCES users(id),
updated_by BIGINT REFERENCES users(id),
deleted_at TIMESTAMP WITH TIME ZONE,        -- Soft delete
deleted_by BIGINT REFERENCES users(id)      -- Who deleted
```

**Soft Delete Policy:**
- ✅ Semua DELETE operations harus menggunakan soft delete
- ✅ Hard delete hanya untuk cleanup otomatis (setelah retention period)
- ✅ UI harus provide "restore" functionality
- ✅ Admin dapat melihat deleted records dengan filter khusus

### Indexing Strategy
- Primary key pada id fields
- Unique index untuk email, username
- Composite index untuk query patterns
- Foreign key constraints dengan indexes

## Testing Requirements

### Test Coverage
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: Critical paths
- **E2E Tests**: User workflows
- **Performance Tests**: Load testing
- **Security Tests**: Vulnerability scanning

### Test Types
```typescript
// Unit Test Example
describe('UserService', () => {
  it('should create user with valid data', async () => {
    const userData = { email: 'test@test.com', password: 'password123' };
    const user = await userService.create(userData);
    expect(user.email).toBe(userData.email);
  });
});

// Integration Test Example
describe('POST /api/users', () => {
  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@test.com', password: 'password123' })
      .expect(201);
    
    expect(response.body.success).toBe(true);
  });
});
```

## Monitoring & Observability

### Metrics Collection
- Response times per endpoint
- Error rates per service
- Database query performance
- Memory dan CPU usage
- Active user sessions

### Alerting
- Response time > 500ms
- Error rate > 5%
- Database connection issues
- Memory usage > 80%
- Security events

### Logging Strategy
- Structured JSON logging
- Request ID tracking
- User action audit trail
- Performance metrics
- Security event logging

---
*Technical requirements akan diupdate seiring dengan evolusi platform*