# PROJECT BRIEF

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: Foundation Document - Reference untuk AI Coding  

---

## 1. Nama Proyek (Sementara)

**Platform CMS** (Platform Content Management System Starter)

*Catatan: Nama ini bersifat sementara dan menggambarkan fungsi sebagai platform starter/foundation untuk aplikasi enterprise.*

---

## 2. Deskripsi Singkat Aplikasi

Platform CMS adalah **core framework/starter template** yang dirancang untuk mempercepat pembangunan aplikasi enterprise-grade dengan fokus pada:

- **Multi-tenancy**: Mendukung multiple clients/tenants dalam satu platform
- **Security-first**: Sanitization, validation, audit trail, dan soft delete
- **AI-Friendly Development**: CLI builder untuk generate module otomatis
- **Scalability**: Siap untuk deployment skala nasional (ratusan tenant, ribuan users)
- **Government-Ready**: Compliance dengan regulasi pemerintah Indonesia

Platform ini bukan aplikasi final, melainkan **foundation reusable** yang akan digunakan untuk membangun aplikasi spesifik (contoh use case: Monitoring PTSP Kemendagri untuk 34 provinsi dan 514+ kabupaten/kota).

---

## 3. Latar Belakang Masalah

### Masalah Utama
1. **Setup Berulang**: Setiap proyek enterprise baru membutuhkan setup infrastructure yang sama berulang kali
2. **Inkonsistensi Arsitektur**: Tidak ada standar arsitektur yang konsisten antar proyek
3. **Manual Development**: Pembuatan CRUD dan module dilakukan manual, memakan waktu
4. **Security Gaps**: Setiap proyek rentan terhadap celah keamanan yang sama
5. **Kesulitan AI Integration**: Model AI (terutama yang murah) kesulitan memahami context aplikasi kompleks
6. **Scalability Issues**: Arsitektur tidak siap untuk scale nasional/enterprise
7. **Data Loss Risk**: Tidak ada pattern standard untuk data protection (soft delete)

### Dampak
- Time-to-market yang lama (3-6 bulan untuk setup)
- Biaya development tinggi
- Inkonsistensi kualitas kode
- Risiko keamanan berulang
- Kesulitan maintenance dan scaling
- Junior developer kesulitan contribute
- AI models tidak efektif untuk code generation

---

## 4. Tujuan Aplikasi

### Tujuan Utama
1. **Mempercepat Development**: Reduce time-to-market dari 3-6 bulan menjadi 2-4 minggu
2. **Standardisasi Arsitektur**: Sediakan enterprise-grade architecture pattern yang proven
3. **Otomasi Development**: CLI builder untuk generate CRUD dan module otomatis
4. **Security by Default**: Built-in security layer (sanitization, validation, audit)
5. **Multi-tenancy Native**: Schema-based isolation untuk ratusan tenant
6. **AI-Friendly**: Structure dan pattern yang mudah dipahami AI untuk code generation
7. **Data Protection**: Soft delete mandatory untuk semua data krusial
8. **Scalability**: Siap untuk deployment skala nasional (10,000+ concurrent users)

### Success Metrics
- Setup new project: <10 menit
- Generate full CRUD module: <2 menit via CLI
- API response time: <200ms average
- Security vulnerabilities: Zero critical issues
- Test coverage: 80%+ untuk core modules
- Concurrent users: 1,000+ (Phase 1), 10,000+ (Phase 3)
- Developer onboarding: <1 hari untuk junior developer

---

## 5. Target Pengguna

### Primary Users (Platform Developers)

#### 1. Senior Full-Stack Engineer
- **Peran**: Membangun core framework, arsitektur, dan security layer
- **Kebutuhan**: Modular architecture, scalability, best practices
- **Pain Points**: Setup berulang, inkonsistensi standards

#### 2. Junior Developer
- **Peran**: Menggunakan CLI builder untuk generate module dan CRUD
- **Kebutuhan**: Template yang clear, documentation lengkap, error messages jelas
- **Pain Points**: Learning curve, best practices implementation

#### 3. AI Models (GPT, Claude, dll)
- **Peran**: Generate code via CLI, understand context, automate development
- **Kebutuhan**: Consistent patterns, type-safe code, clear structure
- **Pain Points**: Complex context, inconsistent naming, unclear patterns

### Secondary Users (End Application)

#### 4. System Administrator
- **Peran**: Manajemen multi-tenant, monitoring, configuration
- **Kebutuhan**: Dashboard monitoring, tenant management, audit logs

#### 5. End Users
- **Peran**: Pengguna aplikasi yang dibangun (contoh: PTSP daerah)
- **Kebutuhan**: Interface clean, responsive, no emoji, error messages jelas

---

## 6. Role Awal

### Phase 1 (CORE Platform)
Roles yang akan diimplementasi di core framework:

1. **Super Admin**
   - Permissions: Manajemen tenant, system configuration, monitoring global
   - Access Level: All features, all tenants

2. **Tenant Admin**
   - Permissions: Manajemen users dalam tenant, configuration tenant, monitoring tenant
   - Access Level: Full access dalam tenant sendiri saja

3. **User (Regular)**
   - Permissions: CRUD operations sesuai module yang di-assign
   - Access Level: Limited berdasarkan permissions

4. **Guest (Optional)**
   - Permissions: Read-only untuk public data
   - Access Level: Very limited

### Future Roles (Application-Specific)
Role spesifik akan ditambahkan sesuai kebutuhan aplikasi yang dibangun (contoh: untuk Kemendagri PTSP: Operator Daerah, Verifikator, Kepala Dinas, dll)

---

## 7. Modul Utama

### Core Framework Modules (Must Have)

#### A. Authentication & Authorization
- User registration & login (JWT-based)
- Password management (reset, change)
- Role-based access control (RBAC)
- Permission management (CASL)
- Multi-factor authentication (Phase 2)
- Session management dengan Redis

#### B. Multi-Tenancy Management
- Tenant CRUD operations
- Schema-based isolation (PostgreSQL)
- Automatic schema switching via middleware
- Tenant configuration management
- Cross-tenant data isolation

#### C. Security Layer
- Input sanitization (XSS prevention)
- Output encoding
- SQL injection protection (parameterized queries)
- File upload validation & scanning
- Rate limiting (per tenant, per endpoint)
- Security headers (Helmet.js)
- CORS configuration

#### D. Data Management (Soft Delete)
- Base repository dengan soft delete
- Soft delete untuk semua entities
- Restore functionality
- Audit trail (created_by, updated_by, deleted_by)
- Cascade soft delete untuk relationships

#### E. Error Handling & Logging
- Centralized exception handling
- Structured logging (Winston)
- Request/response logging
- Performance monitoring
- Error categorization
- Detailed error messages (per-field, Indonesian)

#### F. CLI Builder Tool
- Module generator (NestJS controller, service, repository, DTO)
- CRUD generator dengan soft delete
- Frontend generator (Next.js page, components)
- Migration generator
- Test generator
- Documentation generator

#### G. Database Layer
- Drizzle ORM integration
- Multi-database support (PostgreSQL, MySQL)
- Migration management
- Connection pooling
- Query builder
- Transaction support

#### H. API Layer
- RESTful API standards
- OpenAPI/Swagger documentation
- Consistent response format
- Pagination support
- Filtering & sorting
- GraphQL (Phase 2)

#### I. Frontend Foundation
- Next.js 15 dengan App Router
- shadcn/ui component library
- Theme management (dark/light mode)
- Form management (React Hook Form + Zod)
- State management (Zustand / TanStack Query)
- Responsive design (mobile-first)

#### J. Monitoring & Performance
- Health check endpoints
- Performance metrics collection
- Request ID tracking
- Database query monitoring
- Memory & CPU usage tracking
- Alert system (Phase 2)

---

## 8. Alur Besar Aplikasi

### Development Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   1. SETUP & CONFIGURATION                   │
│   - Clone platform-cms repository                           │
│   - Install dependencies (npm install)                      │
│   - Configure environment (.env)                            │
│   - Setup database (PostgreSQL)                             │
│   - Run migrations                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              2. TENANT & USER INITIALIZATION                 │
│   - Create tenant via Super Admin                           │
│   - Database schema auto-created (tenant_xxx)               │
│   - Create tenant admin user                                │
│   - Assign roles & permissions                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              3. MODULE DEVELOPMENT (via CLI)                 │
│   CLI Command:                                              │
│   $ ptsp-cli generate:module nama-module                    │
│                                                             │
│   Auto-generates:                                           │
│   Backend (NestJS):                                         │
│     - nama-module.module.ts                                 │
│     - nama-module.controller.ts                             │
│     - nama-module.service.ts                                │
│     - nama-module.repository.ts                             │
│     - nama-module.entity.ts (Drizzle schema)                │
│     - nama-module.dto.ts                                    │
│     - nama-module.spec.ts (tests)                           │
│                                                             │
│   Frontend (Next.js):                                       │
│     - app/(dashboard)/nama-module/page.tsx                  │
│     - app/(dashboard)/nama-module/[id]/page.tsx             │
│     - components/nama-module/table.tsx                      │
│     - components/nama-module/form.tsx                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                4. REQUEST PROCESSING FLOW                    │
│                                                             │
│   User Request (Frontend)                                   │
│        ↓                                                    │
│   Next.js → API Client                                      │
│        ↓                                                    │
│   NestJS Backend API                                        │
│        ↓                                                    │
│   [Middleware Stack]                                        │
│     1. Tenant Middleware (extract tenant, set schema)       │
│     2. Auth Guard (verify JWT token)                        │
│     3. Permission Guard (check RBAC/CASL)                   │
│     4. Validation Pipe (validate DTO)                       │
│     5. Sanitization (clean input)                           │
│        ↓                                                    │
│   Controller → Service → Repository                         │
│        ↓                                                    │
│   Database (PostgreSQL - tenant schema)                     │
│        ↓                                                    │
│   [Response Stack]                                          │
│     1. Sanitize output                                      │
│     2. Format response (success/error)                      │
│     3. Add metadata (pagination, requestId)                 │
│     4. Logging                                              │
│        ↓                                                    │
│   Return to Frontend                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   5. DATA OPERATIONS                         │
│                                                             │
│   CREATE: Insert dengan created_by, created_at             │
│   READ:   Filter deleted_at IS NULL (auto)                 │
│   UPDATE: Update dengan updated_by, updated_at             │
│   DELETE: Soft delete (set deleted_at, deleted_by)         │
│   RESTORE: Set deleted_at = null                            │
│                                                             │
│   Audit Trail: Semua operasi tercatat                       │
└─────────────────────────────────────────────────────────────┘
```

### User Authentication Flow

```
Login → JWT Token → Store in Cookie/LocalStorage
     ↓
Every Request includes Token
     ↓
Backend verifies Token → Extract user & tenant
     ↓
Set PostgreSQL search_path to tenant schema
     ↓
Check permissions (RBAC/CASL)
     ↓
Process request
```

---

## 9. Data Utama yang Dikelola

### Core Data (Platform Level)

#### 1. Users
```typescript
{
  id: bigint,
  email: string (unique),
  password_hash: string,
  full_name: string,
  phone: string (optional),
  avatar: string (optional),
  is_active: boolean,
  tenant_id: bigint (FK),
  created_at: timestamp,
  updated_at: timestamp,
  created_by: bigint,
  updated_by: bigint,
  deleted_at: timestamp,  // Soft delete
  deleted_by: bigint
}
```

#### 2. Tenants
```typescript
{
  id: bigint,
  name: string (unique),
  slug: string (unique),
  domain: string (optional, unique),
  schema_name: string (tenant_xxx),
  config: jsonb,
  is_active: boolean,
  subscription_tier: string,
  subscription_expires_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp,
  deleted_at: timestamp,
  deleted_by: bigint
}
```

#### 3. Roles
```typescript
{
  id: bigint,
  name: string,
  slug: string,
  description: string,
  is_system_role: boolean,
  tenant_id: bigint (FK, nullable untuk system roles),
  created_at: timestamp,
  updated_at: timestamp,
  deleted_at: timestamp,
  deleted_by: bigint
}
```

#### 4. Permissions
```typescript
{
  id: bigint,
  resource: string,  // 'users', 'posts', etc
  action: string,    // 'create', 'read', 'update', 'delete'
  scope: string,     // 'own', 'tenant', 'all'
  description: string,
  created_at: timestamp
}
```

#### 5. Role_Permissions (Junction)
```typescript
{
  role_id: bigint (FK),
  permission_id: bigint (FK),
  created_at: timestamp
}
```

#### 6. User_Roles (Junction)
```typescript
{
  user_id: bigint (FK),
  role_id: bigint (FK),
  created_at: timestamp,
  created_by: bigint
}
```

#### 7. Sessions
```typescript
{
  id: string (UUID),
  user_id: bigint (FK),
  token_hash: string,
  ip_address: string,
  user_agent: string,
  expires_at: timestamp,
  created_at: timestamp
}
```

#### 8. Audit_Logs
```typescript
{
  id: bigint,
  user_id: bigint (FK),
  tenant_id: bigint (FK),
  action: string,  // 'create', 'update', 'delete', 'login', etc
  resource: string,
  resource_id: bigint,
  changes: jsonb,  // Before/after values
  ip_address: string,
  user_agent: string,
  created_at: timestamp
}
```

### Application-Specific Data
Data spesifik aplikasi akan ditambahkan di tenant schema masing-masing sesuai kebutuhan (contoh: untuk Kemendagri PTSP: data perizinan, dokumen, workflow, dll)

---

## 10. Batasan MVP Tahap Pertama

### ✅ Yang AKAN Dikerjakan (Phase 1 - 16 minggu)

#### Week 1-2: Project Setup
- NestJS backend boilerplate
- Next.js frontend boilerplate
- Development environment setup
- Git workflow & CI/CD pipeline

#### Week 3-5: Database & Multi-tenancy
- Drizzle ORM integration
- PostgreSQL schema-based multi-tenancy
- Tenant management module
- Migration system
- Soft delete implementation

#### Week 6-8: Authentication & Authorization
- JWT authentication
- User management CRUD
- Role management CRUD
- Permission system (CASL)
- Session management (Redis)

#### Week 9-10: Security Layer
- Input sanitization middleware
- XSS & SQL injection prevention
- File upload validation
- Rate limiting
- Security headers
- Audit logging

#### Week 11: Error Handling & Logging
- Centralized exception handling
- Structured logging (Winston)
- Error response standardization
- Request/response logging
- Performance monitoring hooks

#### Week 12-14: CLI Builder Tool
- CLI framework setup (Commander.js)
- Module generator (backend + frontend)
- CRUD generator dengan soft delete
- Migration generator
- Test generator
- Template library

#### Week 15: Frontend Foundation
- shadcn/ui integration
- Layout components (Header, Sidebar, Footer)
- Form components (Input, Select, Textarea, etc)
- Table component dengan pagination
- Theme system (dark/light mode)
- Responsive design

#### Week 16: Documentation
- OpenAPI/Swagger setup
- API documentation
- Code documentation (TSDoc)
- Developer guides
- CLI usage documentation
- Deployment guide

### ❌ Yang TIDAK Dikerjakan di MVP (Phase 2+)

#### Phase 2 (Setelah MVP)
- UI Builder visual (drag-and-drop)
- Multi-factor authentication (MFA)
- OAuth integration (Google, Microsoft)
- Advanced caching (Redis multi-layer)
- Background jobs (Bull queue)
- Email notifications
- SMS notifications
- Push notifications
- Advanced monitoring dashboard
- Real-time features (WebSocket)
- GraphQL API

#### Phase 3 (Use Case Implementation)
- Kemendagri PTSP specific features
- Complex reporting & analytics
- Document management system
- Workflow automation
- Mobile app (React Native)
- Advanced data visualization
- Export to PDF/Excel
- Advanced search (Elasticsearch)

---

## 11. Fitur yang Belum Dikerjakan di MVP

### Security Advanced
- [ ] Penetration testing automation
- [ ] Vulnerability scanning integration
- [ ] SIEM integration
- [ ] Advanced threat detection
- [ ] Compliance reporting (ISO, SOC2)

### Performance & Scalability
- [ ] Horizontal scaling (load balancer)
- [ ] Database replication (master-slave)
- [ ] CDN integration untuk static assets
- [ ] Advanced query optimization
- [ ] Caching strategy optimization
- [ ] Database sharding

### Developer Experience
- [ ] Visual UI Builder
- [ ] GraphQL playground
- [ ] API testing dashboard
- [ ] Performance profiler
- [ ] Code generator via web interface

### Operations
- [ ] Automated backup schedule
- [ ] Disaster recovery procedures
- [ ] Auto-scaling configuration
- [ ] Health check automation
- [ ] Log aggregation (ELK stack)
- [ ] APM (Application Performance Monitoring)

### Integration
- [ ] Third-party API integrations
- [ ] Payment gateway
- [ ] Cloud storage (S3, GCS)
- [ ] Email service provider
- [ ] SMS gateway
- [ ] Push notification service

---

## 12. Asumsi Awal

### Technical Assumptions

1. **Development Environment**
   - OS: Windows 11
   - Node.js: 20 LTS
   - Package Manager: npm
   - Database: PostgreSQL 15+
   - Redis: Memurai (Windows) / WSL2
   - Docker: Production only (NOT for development)

2. **Architecture**
   - Backend: NestJS 10+ (Modular Monolith)
   - Frontend: Next.js 15 (App Router)
   - ORM: Drizzle ORM
   - Multi-tenancy: Schema-based (PostgreSQL)
   - Authentication: JWT
   - State Management: Zustand / TanStack Query

3. **Deployment**
   - Production: Docker + Kubernetes
   - Strategy: Hybrid (on-premise + cloud backup)
   - Database: Managed PostgreSQL
   - Scaling: Horizontal scaling ready

4. **Performance Targets**
   - API response: <200ms average
   - Concurrent users: 1,000+ (Phase 1)
   - Database connections: 20-100 pool
   - Uptime: 99.9%

5. **Security**
   - Soft delete: MANDATORY untuk semua data
   - Input sanitization: Semua endpoints
   - Rate limiting: Per tenant dan endpoint
   - Audit logging: Semua critical operations
   - Encryption: At rest dan in transit

### Business Assumptions

1. **Project Scope**
   - Focus: CORE platform dulu (Phase 1)
   - Use case: Kemendagri PTSP adalah implementasi nanti (Phase 3)
   - Timeline: 16 minggu untuk MVP
   - Team: Small team (1-3 developers)

2. **Users**
   - Target: Government agencies, enterprise clients
   - Scale: 500+ tenants, 10,000+ concurrent users (target)
   - Language: Bahasa Indonesia
   - Support: Documentation dan training materials

3. **Compliance**
   - Regulations: Indonesia government regulations
   - Data protection: High security requirement
   - Audit: Complete audit trail required
   - Backup: Daily automated backups

---

## 13. Hal yang Masih Perlu Diputuskan

### Critical Decisions (Harus Segera)

#### 1. Hosting & Infrastructure ⚠️
- [ ] **On-premise vs Cloud vs Hybrid?**
  - On-premise: Full control, compliance
  - Cloud (AWS Jakarta, GCP Jakarta): Scalability, managed services
  - Hybrid: Primary on-premise + backup cloud
  - **Rekomendasi**: Hybrid untuk flexibility

#### 2. Database Strategy
- [ ] **Single PostgreSQL vs Cluster?**
  - Single: Simple, sufficient untuk MVP
  - Cluster: High availability, read replicas
  - **Rekomendasi**: Single untuk MVP, cluster untuk Phase 2

#### 3. Redis Configuration
- [ ] **Standalone vs Cluster?**
  - Standalone: Simple, sufficient untuk MVP
  - Cluster: High availability, scalability
  - **Rekomendasi**: Standalone untuk MVP

### Important Decisions (Bisa Ditunda)

#### 4. Email Service Provider
- [ ] SendGrid, AWS SES, Mailgun, SMTP server sendiri?
- **Impact**: Email notifications, password reset
- **Timeline**: Phase 2

#### 5. File Storage
- [ ] MinIO (self-hosted), AWS S3, local filesystem?
- **Impact**: File upload, document management
- **Timeline**: Phase 2

#### 6. Monitoring Tools
- [ ] Prometheus + Grafana vs Datadog vs New Relic?
- **Impact**: Performance monitoring, alerting
- **Timeline**: Phase 2

#### 7. CI/CD Pipeline
- [ ] GitHub Actions, GitLab CI, Jenkins?
- **Impact**: Deployment automation
- **Timeline**: Week 2 (basic), enhance Phase 2

#### 8. Testing Strategy
- [ ] Unit test coverage requirement: 80%? 90%?
- [ ] E2E testing scope: Critical paths only?
- [ ] Performance testing: Load testing frequency?
- **Timeline**: Define di Week 1

### Nice to Have (Low Priority)

#### 9. Internationalization (i18n)
- [ ] Multi-language support atau Bahasa Indonesia only?
- **Timeline**: Phase 3

#### 10. Mobile App
- [ ] React Native, Flutter, atau web responsive only?
- **Timeline**: Phase 3

#### 11. Reporting Engine
- [ ] Built custom vs use library (jasper, crystal)?
- **Timeline**: Phase 3

---

## 14. Rekomendasi Urutan Dokumen Berikutnya

Setelah PROJECT-BRIEF.md ini approved, dokumen berikutnya harus dibuat dalam urutan:

### Prioritas 1 (Week 1) - IMMEDIATE

#### 1. TECHNICAL-ARCHITECTURE.md
**Tujuan**: Detail arsitektur teknis sistem
**Konten**:
- System architecture diagram (C4 model)
- Component interaction flow
- Database architecture (multi-tenancy schema design)
- API gateway design
- Security architecture
- Deployment architecture
- Technology stack details dengan alasan pemilihan

**Dependency**: Needed untuk start development

---

#### 2. DATABASE-DESIGN.md
**Tujuan**: Design database schema lengkap
**Konten**:
- ERD (Entity Relationship Diagram)
- Table specifications (columns, types, constraints)
- Index strategy
- Migration strategy
- Multi-tenancy schema design
- Soft delete implementation details
- Data retention policies

**Dependency**: Needed untuk database setup (Week 3)

---

#### 3. API-STANDARDS.md
**Tujuan**: Standarisasi API design
**Konten**:
- REST API conventions
- Request/Response format standards
- Error response structure
- Pagination format
- Authentication header format
- Versioning strategy (/api/v1/...)
- OpenAPI specification template
- Example endpoints

**Dependency**: Needed untuk backend development (Week 3)

---

### Prioritas 2 (Week 2-3) - EARLY DEVELOPMENT

#### 4. SECURITY-GUIDELINES.md
**Tujuan**: Security implementation guidelines
**Konten**:
- Input validation standards
- Sanitization procedures
- Authentication implementation
- Authorization patterns (RBAC/CASL)
- Soft delete procedures
- Audit logging requirements
- Security testing checklist
- Incident response procedures

**Dependency**: Needed untuk security layer (Week 9)

---

#### 5. CLI-BUILDER-SPEC.md
**Tujuan**: Spesifikasi CLI builder tool
**Konten**:
- CLI commands structure
- Generator algorithms
- Template system design
- Code generation patterns
- Naming conventions
- Testing strategy
- Usage examples

**Dependency**: Needed untuk CLI development (Week 12)

---

### Prioritas 3 (Week 4-8) - MID DEVELOPMENT

#### 6. FRONTEND-DESIGN-SYSTEM.md
**Tujuan**: Frontend design standards
**Konten**:
- Component library specifications
- Design tokens (colors, typography, spacing)
- Layout patterns
- Form patterns
- Table patterns
- Responsive design guidelines
- Accessibility requirements
- Theme system

**Dependency**: Needed untuk frontend development (Week 15)

---

#### 7. TESTING-STRATEGY.md
**Tujuan**: Testing standards dan procedures
**Konten**:
- Unit testing requirements
- Integration testing scope
- E2E testing scenarios
- Performance testing procedures
- Security testing checklist
- Test coverage requirements
- CI/CD testing pipeline

**Dependency**: Needed throughout development

---

### Prioritas 4 (Week 12+) - LATE DEVELOPMENT

#### 8. DEPLOYMENT-GUIDE.md
**Tujuan**: Deployment procedures
**Konten**:
- Environment setup (dev, staging, production)
- Docker configuration
- Kubernetes configuration
- Database migration procedures
- Backup procedures
- Rollback procedures
- Monitoring setup

**Dependency**: Needed untuk deployment (Week 16+)

---

#### 9. DEVELOPER-HANDBOOK.md
**Tujuan**: Onboarding dan development guide
**Konten**:
- Getting started guide
- Development workflow
- Coding standards
- Git workflow
- Issue management
- PR guidelines
- Troubleshooting guide

**Dependency**: Needed untuk team onboarding

---

### Prioritas 5 (Phase 2+) - POST MVP

#### 10. USER-DOCUMENTATION.md
**Tujuan**: End-user documentation
**Konten**:
- User guides
- Admin guides
- FAQ
- Video tutorials
- Troubleshooting

**Dependency**: After UI complete

---

#### 11. KEMENDAGRI-REQUIREMENTS.md (Phase 3)
**Tujuan**: Kemendagri PTSP specific requirements
**Konten**:
- PTSP workflow specification
- Kemendagri specific features
- Reporting requirements
- Compliance requirements
- Integration requirements

**Dependency**: After CORE platform complete

---

### Summary Urutan

```
Week 1:
├─ PROJECT-BRIEF.md (✅ This document)
├─ TECHNICAL-ARCHITECTURE.md (⚠️ CRITICAL)
├─ DATABASE-DESIGN.md (⚠️ CRITICAL)
└─ API-STANDARDS.md (⚠️ CRITICAL)

Week 2-3:
├─ SECURITY-GUIDELINES.md
└─ CLI-BUILDER-SPEC.md

Week 4-8:
├─ FRONTEND-DESIGN-SYSTEM.md
└─ TESTING-STRATEGY.md

Week 12+:
├─ DEPLOYMENT-GUIDE.md
└─ DEVELOPER-HANDBOOK.md

Phase 2+:
├─ USER-DOCUMENTATION.md
└─ KEMENDAGRI-REQUIREMENTS.md (Phase 3)
```

---

## Catatan Penting untuk AI Coding

### Context untuk AI Models

1. **Fokus CORE Framework**
   - Jangan membuat fitur spesifik Kemendagri di Phase 1
   - Buat module yang reusable untuk aplikasi manapun
   - Think "framework", not "app"

2. **Soft Delete MANDATORY**
   - Setiap entity HARUS punya deleted_at dan deleted_by
   - Semua DELETE operation = soft delete
   - Query default harus exclude deleted records

3. **Multi-Tenancy Aware**
   - Setiap request harus aware tenant context
   - Database query harus automatic switch schema
   - Isolasi data antar tenant WAJIB

4. **Security First**
   - Input sanitization di setiap endpoint
   - Validation dengan Zod/class-validator
   - Error messages jelas per-field (Indonesian)

5. **TypeScript Strict**
   - No `any` type
   - Proper type definitions
   - Leverage Drizzle ORM type inference

6. **Consistent Patterns**
   - Naming conventions: camelCase, PascalCase, snake_case (database)
   - File structure: module-based
   - Response format: { success, data, meta }

7. **Documentation**
   - TSDoc untuk functions dan classes
   - README untuk setiap module
   - API documentation dengan Swagger

8. **Testing**
   - Unit test untuk services
   - Integration test untuk controllers
   - E2E test untuk critical flows

---

## Status Document

**Status**: ✅ FINAL - Ready untuk Reference  
**Next Action**: Create TECHNICAL-ARCHITECTURE.md, DATABASE-DESIGN.md, API-STANDARDS.md  
**Decision Required**: Hosting strategy (on-premise vs cloud vs hybrid)

---

*Dokumen ini adalah single source of truth untuk Platform CMS development. Semua dokumen berikutnya harus reference ke dokumen ini.*