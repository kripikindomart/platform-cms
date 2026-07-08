# Platform CMS - Core Framework

**Enterprise-grade starter template untuk aplikasi multi-tenancy dengan focus pada security, scalability, dan AI-friendly development.**

---

## 🚀 Quick Start

```bash
# Clone repository
git clone git@github.com:kripikindomart/platform-cms.git
cd platform-cms

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## 📚 Documentation

Semua dokumentasi tersedia di folder **[`docs/`](./docs/)**.

**Quick Links**:
- 📖 [Documentation Index](./docs/README.md) - Daftar lengkap semua dokumentasi
- ⭐ [PROJECT-BRIEF.md](./docs/PROJECT-BRIEF.md) - **START HERE** - Foundation document
- 🤖 [AI-RULES.md](./docs/AI-RULES.md) - AI coding guidelines (WAJIB untuk AI)
- 🗄️ [ERD-DATABASE.md](./docs/ERD-DATABASE.md) - Database schema
- 🔌 [API-CONTRACT.md](./docs/API-CONTRACT.md) - API specification

## 🏗️ Tech Stack

### Backend
- **Framework**: NestJS 10+
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 15+
- **ORM**: Drizzle ORM
- **Cache**: Redis 7+
- **Auth**: JWT + CASL (RBAC)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod

## ✨ Key Features

- ✅ **Multi-Tenancy** - Schema-based isolation (PostgreSQL)
- ✅ **Soft Delete** - Mandatory untuk semua data krusial
- ✅ **Audit Trail** - Complete audit logging
- ✅ **RBAC** - Role-based access control dengan CASL
- ✅ **Security First** - Input sanitization, XSS prevention, rate limiting
- ✅ **AI-Friendly** - CLI builder untuk code generation
- ✅ **Type-Safe** - TypeScript strict mode + Zod validation
- ✅ **Responsive** - Mobile-first design
- ✅ **Dark Mode** - Theme switching support

## 📁 Project Structure

```
platform-cms/
├── docs/                    # 📚 All documentation
│   ├── PROJECT-BRIEF.md     # Foundation document
│   ├── AI-RULES.md          # AI coding guidelines
│   ├── ERD-DATABASE.md      # Database schema
│   ├── API-CONTRACT.md      # API specification
│   └── ...                  # Other docs
├── src/                     # Source code (future)
│   ├── backend/             # NestJS backend
│   └── frontend/            # Next.js frontend
└── README.md                # This file
```

## 🎯 Development Phases

### ✅ Phase 0: Documentation (Current)
- [x] Project Brief
- [x] Business Requirements (BRD)
- [x] Product Requirements (PRD)
- [x] Database Design (ERD)
- [x] API Contract
- [x] Business Rules
- [x] AI Rules

### ⏳ Phase 1: MVP Development (16 weeks)
- Week 1-2: Setup & Authentication
- Week 3-5: Core Features (Multi-tenancy, Users, Roles)
- Week 6-8: Extended Features
- Week 9-11: Master Data & Settings
- Week 12-14: CLI Builder
- Week 15: Frontend Foundation
- Week 16: Polish & Documentation

### 🔜 Phase 2: Enhancement
- Email notifications
- Advanced caching
- Background jobs
- Real-time features

### 🔜 Phase 3: Use Case Implementation
- Kemendagri PTSP specific features

## 🤝 Contributing

1. Read [AI-RULES.md](./docs/AI-RULES.md) untuk AI coding guidelines
2. Read [PROJECT-BRIEF.md](./docs/PROJECT-BRIEF.md) untuk context
3. Follow naming conventions dan patterns
4. Write tests (min 80% coverage)
5. Update documentation

## 📝 Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation update
refactor: code refactoring
test: add tests
chore: maintenance
```

## 🔐 Security

- All inputs are sanitized
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- Rate limiting per tenant/endpoint
- JWT authentication with HTTP-only cookies
- RBAC with CASL for authorization
- Audit logging untuk compliance

## 📊 Status

**Current Phase**: Documentation Complete ✅  
**Next Phase**: Week 1 - Critical Technical Docs  
**Last Updated**: 2024-01-08

## 📧 Contact

**Repository**: [github.com/kripikindomart/platform-cms](https://github.com/kripikindomart/platform-cms)  
**Email**: asrulanwar16@gmail.com

---

**⭐ Star this repo if you find it useful!**
