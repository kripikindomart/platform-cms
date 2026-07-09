# Task 1.6: Git & CI/CD Setup

**Prioritas**: P1 - HIGH  
**Estimasi Waktu**: 3 jam  
**Dependencies**: Task 1.1, 1.2  
**Status**: Belum Dimulai

---

## Tujuan Task

Setup GitHub Actions untuk automated testing dan CI/CD pipeline. Pastikan setiap push dan pull request menjalankan lint, type-check, dan tests secara otomatis untuk backend dan frontend.

---

## Yang Akan Dikerjakan

### 1. Struktur File

File yang akan dibuat:

```
.github/
└── workflows/
    ├── backend-ci.yml     (baru, CI untuk backend)
    └── frontend-ci.yml    (baru, CI untuk frontend)
README.md                  (update dengan setup instructions)
.gitignore                 (verify sudah lengkap)
```

### 2. Backend CI Workflow

**.github/workflows/backend-ci.yml**:

```yaml
name: Backend CI

on:
  push:
    branches: [ main, master, develop ]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    branches: [ main, master, develop ]
    paths:
      - 'backend/**'

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
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
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
          NODE_ENV: test
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: platform_cms_test
          DB_USER: postgres
          DB_PASSWORD: postgres
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test-secret-key-minimum-32-characters-long-for-testing-purposes
          SESSION_SECRET: test-session-secret-minimum-32-characters-long-for-testing
```

### 3. Frontend CI Workflow

**.github/workflows/frontend-ci.yml**:

```yaml
name: Frontend CI

on:
  push:
    branches: [ main, master, develop ]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci.yml'
  pull_request:
    branches: [ main, master, develop ]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: frontend
        run: npm ci
      
      - name: Lint
        working-directory: frontend
        run: npm run lint
      
      - name: Type check
        working-directory: frontend
        run: npm run type-check
      
      - name: Build
        working-directory: frontend
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3000
```

### 4. Update README.md

Buat atau update README.md dengan setup instructions lengkap:

```markdown
# Platform CMS

Multi-tenant enterprise CMS platform built with Next.js 15 and NestJS 10.

## Project Structure

```
platform-cms/
├── backend/          # NestJS backend API
├── frontend/         # Next.js 15 frontend
└── docs/            # Documentation
```

## Tech Stack

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript 5.6
- **Database**: PostgreSQL 15 with Drizzle ORM
- **Cache**: Redis 7
- **Testing**: Vitest
- **Validation**: Zod

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui
- **Testing**: Jest + React Testing Library

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

## Quick Start

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

## Available Scripts

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

## CI/CD

GitHub Actions workflows run automatically on push and pull requests:

- **Backend CI**: Runs lint, type-check, and tests with PostgreSQL and Redis services
- **Frontend CI**: Runs lint, type-check, and build

## Documentation

See [docs/](./docs/) folder for detailed documentation:

- [PROJECT-BRIEF.md](./docs/PROJECT-BRIEF.md) - Project overview
- [TECHNICAL-ARCHITECTURE.md](./docs/TECHNICAL-ARCHITECTURE.md) - Architecture details
- [TASK-PLAN.md](./docs/TASK-PLAN.md) - Development roadmap
- [AI-RULES.md](./docs/AI-RULES.md) - Coding standards

## Health Check

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

## License

Proprietary - All Rights Reserved
```

### 5. Verify .gitignore

Pastikan .gitignore lengkap (sudah ada, hanya verify):

```gitignore
# Dependencies
node_modules/

# Build output
dist/
.next/
out/
build/

# Environment
.env
.env.local
.env.*.local
!.env.example
!.env.test
!.env.production

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/

# Temp
.tmp/
```

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] File backend-ci.yml sudah dibuat
- [ ] File frontend-ci.yml sudah dibuat
- [ ] README.md sudah dibuat/updated dengan setup instructions
- [ ] .gitignore verified (sudah lengkap)
- [ ] Push ke GitHub trigger CI workflows
- [ ] Backend CI runs: lint, type-check, tests (dengan PostgreSQL dan Redis services)
- [ ] Frontend CI runs: lint, type-check, build
- [ ] CI badge added to README (optional)
- [ ] All CI checks pass (green)

---

## Cara Testing

### 1. Test Local Workflow Syntax

Validate workflow files:
```bash
# Install act (optional, untuk test workflows locally)
# https://github.com/nektos/act
```

### 2. Push to GitHub

```bash
git add .github/workflows/
git commit -m "ci: setup github actions for backend and frontend"
git push origin master
```

### 3. Verify on GitHub

1. Go to repository on GitHub
2. Click "Actions" tab
3. Should see workflows running:
   - Backend CI
   - Frontend CI
4. Wait for completion (green checkmarks)

### 4. Test Pull Request

1. Create new branch:
   ```bash
   git checkout -b test-ci
   ```

2. Make a small change in backend or frontend

3. Push and create PR:
   ```bash
   git push origin test-ci
   ```

4. Verify CI runs on PR

### 5. Test Path Filters

- Push change only to backend → only backend CI runs
- Push change only to frontend → only frontend CI runs
- Push change to both → both CIs run

### 6. Test Failure Scenario

Introduce lint error:
```typescript
// backend/src/main.ts
const x:number=5; // Bad spacing
```

Push and verify CI fails with clear error message.

---

## Troubleshooting

**Problem**: CI tidak running setelah push  
**Solution**: 
- Check workflow file syntax (YAML indentation)
- Verify workflow file location (.github/workflows/)
- Check path filters match changed files

**Problem**: PostgreSQL service tidak ready  
**Solution**: 
- Increase health check timeout
- Add wait step sebelum run tests

**Problem**: Tests fail di CI tapi pass locally  
**Solution**: 
- Check environment variables di CI
- Verify service ports match (5432, 6379)
- Check timezone differences

**Problem**: npm ci fails  
**Solution**: 
- Verify package-lock.json committed
- Check Node.js version matches

**Problem**: Cache tidak working  
**Solution**: 
- Verify cache-dependency-path correct
- Clear GitHub Actions cache (Settings → Actions → Caches)

---

## Output Expected

Setelah task selesai:
1. GitHub Actions workflows configured dan running
2. Every push triggers CI checks
3. All checks passing (lint, type-check, tests, build)
4. README.md with clear setup instructions
5. CI badges on README (optional)
6. Failed tests block PR merge
7. Path filters prevent unnecessary CI runs

---

## Best Practices

1. **Fast Feedback**: CI should complete in < 5 minutes
2. **Fail Fast**: Run lint/type-check before tests
3. **Clear Errors**: CI logs should be easy to debug
4. **Path Filters**: Only run relevant workflows
5. **Cache Dependencies**: Use npm cache untuk speed
6. **Service Health**: Wait for services ready before tests
7. **Environment Parity**: CI env matches production

---

## Security Notes

**GitHub Actions:**
- Don't commit secrets to workflow files
- Use GitHub Secrets untuk sensitive data
- Review third-party actions before use
- Pin action versions (v4, not @latest)

**Future Enhancements** (Not in this task):
- CD untuk deploy ke staging/production
- Code coverage reporting
- Performance testing
- Security scanning (Snyk, Dependabot)
- Docker image building

---

## Documentation References

- TASK-PLAN.md Task 1.6
- GitHub Actions documentation
- NestJS testing documentation
- Next.js CI/CD best practices

---

## Next Task

Setelah task ini selesai, Week 1-2 complete! Lanjut ke:
**Week 3-4: Database & Multi-Tenancy** - Create database schemas

---

## Notes

- Workflow files harus di branch yang sama (master/main)
- GitHub Actions free untuk public repos
- Private repos: 2000 minutes/month free
- Cache expires after 7 days tanpa access
- Workflows dapat disabled/enabled via GitHub UI
