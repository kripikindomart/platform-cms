# Klarifikasi Kebutuhan Project

Dokumen ini merangkum klarifikasi penting yang telah diberikan untuk project platform-cms.

## Context Aplikasi

### Use Case Nyata: Kemendagri PTSP Monitoring
**Skala**: Nasional (Indonesia)
- 34 Provinsi
- 514+ Kabupaten/Kota
- Ratusan hingga ribuan PTSP daerah
- Monitoring terpusat oleh Kemendagri

**Karakteristik:**
- Data pemerintahan (high security)
- Compliance dengan regulasi Indonesia
- Multi-tenancy (setiap daerah = tenant)
- Tidak serentak login, tapi ratusan concurrent users
- Reporting dan agregasi data ke pusat
- High availability requirement (99.9%+)

**PENTING**: Aplikasi Kemendagri adalah **contoh implementasi** setelah CORE platform selesai.

## Technology Stack Decision

### Backend: ✅ NestJS 10+
**Alasan pemilihan:**
- Enterprise-grade framework
- Built-in CLI generator (cocok untuk builder requirement)
- Modular architecture (scalable ke microservices)
- Multi-tenancy support native
- Production-proven untuk government scale
- Dependency Injection dan testing utilities
- OpenAPI/Swagger integration

**Bukan Next.js API Routes karena:**
- Scalability issues untuk 500+ tenants
- Complex multi-tenancy implementation
- Less separation of concerns
- Harder untuk microservices migration

### Frontend: ✅ Next.js 15
**Tetap Next.js karena:**
- Full-stack capability (SSR + SPA)
- App Router untuk better performance
- Edge caching untuk distribusi nasional
- SEO-friendly (publikasi data publik)
- Ecosystem mature (shadcn/ui, Tailwind)

### Database: ✅ PostgreSQL 15+
**Multi-tenancy Pattern**: Schema-based isolation
```
tenant_kemendagri_pusat
tenant_ptsp_dki_jakarta
tenant_ptsp_kab_bandung
...
```

**Keuntungan:**
- Data isolation per tenant
- Security: tenant tidak bisa akses data lain
- Backup per tenant possible
- Compliance dengan regulasi pemerintah

### ORM: ✅ Drizzle ORM
**Bukan Prisma karena:**
- Lightweight dan lebih cepat
- TypeScript-first dengan better type inference
- SQL-like query builder (AI-friendly)
- Zero runtime overhead
- Better untuk custom migrations
- Native multi-database support

## Development Environment

### Current Setup: Windows
- **OS**: Windows 11
- **Docker**: TIDAK digunakan untuk development
  - Docker hanya untuk production deployment
  - Development native di Windows
- **Database**: PostgreSQL (Windows native atau WSL2)
- **Redis**: Memurai (Windows) atau WSL2
- **Node.js**: Via nvm-windows
- **Package Manager**: pnpm

### Production Deployment
- Docker + Kubernetes (untuk scale nasional)
- Hybrid: On-premise + Cloud backup
- Load balancing dan high availability

## Project Structure Decision

### Separated Backend & Frontend
```
platform-cms/
├── backend/          # NestJS application
├── frontend/         # Next.js application
├── cli/              # CLI Builder tool
├── shared/           # Shared types & schemas
├── docs/             # Documentation
└── docker/           # Production configs
```

**Alasan separation:**
- Clear separation of concerns
- Independent scaling
- Better for team collaboration
- Microservices-ready architecture
- Easier maintenance

## Critical Requirements

### 1. Soft Delete (MANDATORY)
**Rule**: Semua data TIDAK boleh dihapus permanent
```typescript
// Setiap entity harus punya:
deleted_at: timestamp
deleted_by: user_id
```

**Alasan:**
- Data pemerintah sangat krusial
- Audit trail lengkap
- Restore capability
- Forensic investigation
- Compliance requirement

### 2. Multi-Tenancy (CORE Feature)
**Pattern**: Schema-based isolation
- Setiap tenant punya schema sendiri
- Automatic schema switching via middleware
- Data isolation guarantee
- Per-tenant backup possible

### 3. Security First
- Input sanitization di setiap layer
- Output encoding (XSS prevention)
- SQL injection protection (parameterized queries)
- Rate limiting per tenant dan endpoint
- Audit logging semua actions
- Encryption at rest dan in transit

### 4. AI & Junior Developer Friendly
- Consistent code structure
- Clear naming conventions
- Comprehensive documentation (Indonesian)
- CLI generator untuk automate repetitive tasks
- Type-safe development (TypeScript)

## Development Focus & Phases

### ✅ Phase 1: CORE Platform (Current Focus)
**Durasi**: 12-16 minggu
**Goal**: Build reusable framework/starter

**Deliverables:**
1. NestJS backend framework dengan modular architecture
2. Next.js frontend dengan shadcn/ui
3. Multi-tenancy support (schema-based)
4. Authentication & Authorization
5. Security layer (sanitization, validation)
6. Soft delete implementation
7. CLI Builder tool
8. Complete documentation

**Focus**: Reusable components, NOT app-specific features

### 🔄 Phase 2: Enhanced Core
**Durasi**: 8-12 minggu
- UI Builder (visual module creator)
- Advanced security (MFA, OAuth)
- Performance optimization
- Background jobs system
- Advanced monitoring

### 🚀 Phase 3: Kemendagri Implementation
**Durasi**: 16-20 minggu
- PTSP monitoring features
- Reporting & analytics
- Document management
- Workflow automation
- Mobile-responsive interface
- Government compliance verification

**IMPORTANT**: Phase 3 HANYA dimulai setelah Phase 1 selesai dan tested.

## Issue Management Rules

### Format Issue (Bahasa Indonesia)
Issues harus:
1. ✅ **Sangat sangat detail** - Junior programmer harus paham
2. ✅ **Mudah dipahami AI murah** - Clear dan structured
3. ✅ **Acceptance criteria jelas** - Definition of done
4. ✅ **Testing checklist** - What to test
5. ✅ **Documentation requirement** - What to document

### Workflow
1. Buat issue sebelum development
2. Development di branch terpisah
3. Commit incremental dengan clear messages
4. Testing fungsionalitas
5. Update documentation
6. Comment di issue dengan results
7. PR untuk review (jika perlu)
8. Merge setelah approved
9. Close issue dengan summary

## Assumptions Finalized

Berdasarkan klarifikasi, asumsi berikut telah **confirmed**:

- ✅ Backend: NestJS (bukan Next.js monolith)
- ✅ Frontend: Next.js 15
- ✅ Database: PostgreSQL dengan schema-based multi-tenancy
- ✅ ORM: Drizzle ORM
- ✅ Development: Windows native (no Docker)
- ✅ Soft delete: Mandatory untuk semua data
- ✅ Scale: 500+ tenants, 10,000+ concurrent users (target)
- ✅ Security: Government-grade requirements
- ✅ Focus: CORE platform first, use case later
- ✅ Deployment: Hybrid (on-premise + cloud backup)

## Next Steps

1. ✅ **Setup Development Environment**
   - Install Node.js 20 LTS via nvm-windows
   - Install pnpm
   - Setup PostgreSQL 15+
   - Setup Redis
   - Configure Git

2. ✅ **Initialize Projects**
   - NestJS backend boilerplate
   - Next.js frontend boilerplate
   - CLI tool structure
   - Shared types package

3. ✅ **Create Detailed Issues**
   - Issue untuk setiap module di Phase 1
   - Sangat detail dengan acceptance criteria
   - Bahasa Indonesia yang jelas

4. ✅ **Start Development**
   - Mulai dengan database layer
   - Lalu authentication
   - Lalu security layer
   - Step by step sesuai roadmap

---

**Last Updated**: {{ current_date }}
**Status**: Klarifikasi selesai, siap mulai development Phase 1