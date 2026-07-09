# Platform CMS

![Backend CI](https://github.com/kripikindomart/platform-cms/actions/workflows/backend-ci.yml/badge.svg)
![Frontend CI](https://github.com/kripikindomart/platform-cms/actions/workflows/frontend-ci.yml/badge.svg)

Multi-tenant enterprise CMS platform built with Next.js 15 and NestJS 10.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Setup environment:
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   ```

3. Start development server:
   ```bash
   npm run start:dev
   ```

Backend will run on http://localhost:3000

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Setup environment:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

Frontend will run on http://localhost:3001

## 📚 Documentation

Complete documentation available in [`docs/`](./docs/) folder:

- [PROJECT-BRIEF.md](./docs/PROJECT-BRIEF.md) - Project foundation
- [TECHNICAL-ARCHITECTURE.md](./docs/TECHNICAL-ARCHITECTURE.md) - System architecture
- [TASK-PLAN.md](./docs/TASK-PLAN.md) - Development roadmap
- [AI-RULES.md](./docs/AI-RULES.md) - Coding standards and guidelines
- [ERD-DATABASE.md](./docs/ERD-DATABASE.md) - Database schema
- [API-CONTRACT.md](./docs/API-CONTRACT.md) - API specification

## 📊 Development Progress

**Current Phase**: Week 1-2 - Project Setup & Infrastructure (83% complete)

Completed:
- ✅ Task 1.1: Backend Project Setup
- ✅ Task 1.2: Frontend Project Setup
- ✅ Task 1.3: Database Connection
- ✅ Task 1.4: Redis Connection
- ✅ Task 1.5: Environment Configuration
- 🔄 Task 1.6: Git & CI/CD Setup (in progress)

See [AI-PROGRESS-LOG.md](./docs/AI-PROGRESS-LOG.md) for detailed progress tracking.

## 🏗️ Tech Stack

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript 5.6 (strict mode)
- **Database**: PostgreSQL 15 with Drizzle ORM
- **Cache**: Redis 7
- **Validation**: Zod
- **Testing**: Vitest

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui
- **Testing**: Jest + React Testing Library

## ✨ Features

- ✅ **Multi-Tenancy** - Schema-based isolation (PostgreSQL)
- ✅ **Type-Safe** - TypeScript strict mode + Zod validation
- ✅ **Environment Configuration** - Multi-environment support with validation
- ✅ **Caching** - Redis integration for performance
- ✅ **Health Checks** - Monitor database and Redis connections
- ✅ **CI/CD** - Automated testing and deployment
- 🔜 **Soft Delete** - Audit trail for all operations
- 🔜 **RBAC** - Role-based access control
- 🔜 **Authentication** - JWT-based auth system

## 📁 Project Structure

```
platform-cms/
├── backend/                 # NestJS backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── core/           # Core services (cache, etc)
│   │   ├── database/       # Database setup
│   │   ├── health/         # Health check module
│   │   └── modules/        # Feature modules
│   ├── test/               # Tests
│   └── package.json
├── frontend/                # Next.js 15 frontend
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities
│   └── package.json
├── docs/                    # Documentation
│   ├── PROJECT-BRIEF.md    # Project overview
│   ├── TECHNICAL-ARCHITECTURE.md
│   ├── TASK-PLAN.md       # Development roadmap
│   └── AI-RULES.md        # Coding standards
└── .github/
    └── workflows/          # CI/CD workflows
```

## 🧪 Available Scripts

### Backend
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run format` - Format code
- `npm run type-check` - TypeScript type checking

## 🏥 Health Check

Backend health check endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-01-08T10:00:00.000Z"
}
```

## 🤖 CI/CD

GitHub Actions workflows run automatically on push and pull requests:

- **Backend CI**: Runs lint, type-check, and tests with PostgreSQL and Redis services
- **Frontend CI**: Runs lint, type-check, and build

View workflow runs in the [Actions tab](https://github.com/kripikindomart/platform-cms/actions).

## 🎯 Development Phases

### ✅ Phase 1: Project Setup (In Progress - Week 1-2)
- [x] Backend NestJS project
- [x] Frontend Next.js project
- [x] PostgreSQL database connection
- [x] Redis cache connection
- [x] Environment configuration
- [ ] CI/CD with GitHub Actions

### ⏳ Phase 2: Database & Multi-Tenancy (Week 3-4)
- Global schema (tenants, modules, permissions)
- Tenant schema template
- Multi-tenancy middleware
- Migration system

### ⏳ Phase 3: Authentication & Authorization (Week 5-7)
- User authentication
- Role-based access control (RBAC)
- JWT tokens
- Session management

### 🔜 Phase 4+: Feature Development
- Content management
- Media library
- API endpoints
- Admin dashboard

## 🤝 Contributing

1. Read [AI-RULES.md](./docs/AI-RULES.md) for coding guidelines
2. Follow naming conventions (kebab-case files, PascalCase classes, camelCase variables)
3. Use TypeScript strict mode (no `any` type)
4. Write tests for new features
5. Update documentation

## 📝 Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation update
refactor: code refactoring
test: add tests
chore: maintenance
ci: CI/CD changes
```

## 🔐 Security

- Environment variable validation with Zod
- SQL injection prevention (parameterized queries)
- Input sanitization
- Rate limiting (configured)
- Secrets management (.env files not committed)

## 📧 Contact

**Repository**: [github.com/kripikindomart/platform-cms](https://github.com/kripikindomart/platform-cms)  
**Issues**: [GitHub Issues](https://github.com/kripikindomart/platform-cms/issues)

## 📄 License

Proprietary - All Rights Reserved

---

**⭐ Star this repo if you find it useful!**
