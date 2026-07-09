# TESTING STRATEGY
# Platform CMS - Core Framework

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: Testing Strategy Specification  
**Reference**: PROJECT-BRIEF.md, TECHNICAL-ARCHITECTURE.md, AI-RULES.md

---

## Pendahuluan

Dokumen ini menjelaskan **strategi testing** lengkap untuk Platform CMS, mencakup unit testing, integration testing, E2E testing, dan performance testing. Testing adalah bagian MANDATORY dari development workflow.

**Tujuan Testing**:
- ✅ Ensure code quality dan reliability
- ✅ Prevent regressions
- ✅ Document behavior (tests as documentation)
- ✅ Enable confident refactoring
- ✅ Reduce production bugs

**Testing Philosophy**:
- **Test early, test often** - Write tests WHILE coding, not after
- **Test coverage ≠ Quality** - Meaningful tests > high coverage
- **Test behavior, not implementation** - Focus on what, not how
- **Automate everything** - Manual testing should be minimal

---

## 1. Test Pyramid Strategy

```
              ┌─────────────────┐
              │   E2E Tests     │  10% (Critical paths only)
              │   (Playwright)  │  Slow, expensive, brittle
              └─────────────────┘
         ┌─────────────────────────┐
         │  Integration Tests      │  30% (API + Database)
         │  (Vitest + Supertest)   │  Medium speed, moderate cost
         └─────────────────────────┘
    ┌────────────────────────────────────┐
    │        Unit Tests                  │  60% (Functions + Logic)
    │        (Vitest)                    │  Fast, cheap, stable
    └────────────────────────────────────┘
```

**Rasio Ideal**:
- **Unit Tests**: 60% (focus on business logic, utilities, services)
- **Integration Tests**: 30% (focus on API endpoints, database operations)
- **E2E Tests**: 10% (focus on critical user flows only)

**Alasan**:
- Unit tests: Cepat, murah, easy to maintain
- Integration tests: Balance antara coverage dan speed
- E2E tests: Mahal, lambat, flaky → gunakan minimal untuk critical paths

---

## 2. Testing Tools & Framework

### 2.1 Backend Testing Stack

```yaml
Framework:
  - Vitest: Latest (unit + integration tests)
    Why: Fast, TypeScript native, modern API
  
  - Supertest: Latest (HTTP testing)
    Why: Simple API testing, works with NestJS
  
  - @nestjs/testing: Latest (NestJS test utilities)
    Why: Built-in mocking, module testing

Mocking:
  - vitest (built-in mocks)
  - @faker-js/faker: Latest (fake data generation)

Coverage:
  - c8: Latest (code coverage via Vitest)
    Target: 80%+ overall, 90%+ for critical modules
```

### 2.2 Frontend Testing Stack

```yaml
Framework:
  - Vitest: Latest (unit + integration tests)
  - @testing-library/react: Latest (React component testing)
  - @testing-library/jest-dom: Latest (DOM matchers)
  - @testing-library/user-event: Latest (user interaction simulation)

E2E Testing:
  - Playwright: Latest
    Why: Multi-browser, reliable, modern API

Mocking:
  - MSW (Mock Service Worker): Latest
    Why: Intercept network requests, realistic mocks
```

### 2.3 Shared Testing Libraries

```yaml
Data Generation:
  - @faker-js/faker: Latest
  - Zod: Latest (schema validation in tests)

Assertions:
  - Vitest built-in assertions
  - @testing-library/jest-dom (DOM assertions)

Utilities:
  - date-fns: Latest (date manipulation in tests)
```

---

## 3. Unit Testing Strategy

### 3.1 What to Unit Test

**✅ DO Test**:
- Business logic (services, utilities)
- Data transformations
- Validation logic (Zod schemas)
- Pure functions
- Edge cases & error handling
- Complex conditions

**❌ DON'T Test**:
- Third-party libraries
- Framework internals
- Simple getters/setters
- Configuration files
- Constants

### 3.2 Unit Test Structure

**File Naming Convention**:
```
src/modules/users/users.service.ts
src/modules/users/users.service.spec.ts  ← Test file
```

**Test Structure** (AAA Pattern):

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<UsersRepository>;
  
  beforeEach(() => {
    // Arrange - Setup
    repository = createMockRepository();
    service = new UsersService(repository);
  });
  
  describe('create', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const dto = { email: 'test@example.com', name: 'Test User' };
      const expectedUser = { id: 1, ...dto };
      
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(expectedUser);
      
      // Act
      const result = await service.create(dto);
      
      // Assert
      expect(result).toEqual(expectedUser);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });
    
    it('should throw error if email already exists', async () => {
      // Arrange
      const dto = { email: 'existing@example.com', name: 'Test' };
      repository.findByEmail.mockResolvedValue({ id: 1 } as any);
      
      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow('Email sudah terdaftar');
    });
  });
});
```

### 3.3 Unit Test Best Practices

**1. Test Naming** - Descriptive test names

```typescript
// Bad ❌
it('test create', () => {});

// Good ✅
it('should create a user successfully with valid data', () => {});
it('should throw ConflictException if email already exists', () => {});
it('should hash password before saving', () => {});
```

**2. One Assertion per Test** (when possible)

```typescript
// Bad ❌ - Multiple unrelated assertions
it('should create user', async () => {
  const user = await service.create(dto);
  expect(user.id).toBeDefined();
  expect(user.email).toBe('test@example.com');
  expect(repository.create).toHaveBeenCalled();
  expect(auditService.log).toHaveBeenCalled(); // Too many!
});

// Good ✅ - Split into focused tests
it('should return user with generated ID', async () => {
  const user = await service.create(dto);
  expect(user.id).toBeDefined();
});

it('should save user with correct email', async () => {
  const user = await service.create(dto);
  expect(user.email).toBe('test@example.com');
});

it('should log user creation to audit', async () => {
  await service.create(dto);
  expect(auditService.log).toHaveBeenCalledWith('create', 'users', expect.any(Number));
});
```

**3. Use Test Fixtures** - DRY principle

```typescript
// fixtures/user.fixture.ts
export const createUserDto = (): CreateUserDto => ({
  email: faker.internet.email(),
  name: faker.person.fullName(),
  password: 'Password123!',
  roleIds: [1],
});

export const userEntity = (overrides?: Partial<User>): User => ({
  id: faker.number.int({ min: 1, max: 1000 }),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  isActive: true,
  createdAt: new Date(),
  ...overrides,
});

// In test
import { createUserDto, userEntity } from '../fixtures/user.fixture';

it('should create user', async () => {
  const dto = createUserDto();
  const expected = userEntity({ email: dto.email });
  
  repository.create.mockResolvedValue(expected);
  const result = await service.create(dto);
  
  expect(result).toEqual(expected);
});
```

**4. Mock External Dependencies**

```typescript
// Bad ❌ - Real database calls
it('should create user', async () => {
  const user = await service.create(dto); // Hits real DB!
});

// Good ✅ - Mock repository
beforeEach(() => {
  repository = {
    create: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
  } as any;
});

it('should create user', async () => {
  repository.create.mockResolvedValue(expectedUser);
  const result = await service.create(dto);
  expect(result).toEqual(expectedUser);
});
```

---

## 4. Integration Testing Strategy

### 4.1 What to Integration Test

**✅ DO Test**:
- API endpoints (request → response)
- Database operations (CRUD)
- Authentication & authorization
- Validation (request body, query params)
- Error handling & status codes
- Multi-tenancy isolation
- Soft delete behavior

**❌ DON'T Test**:
- UI rendering (that's E2E)
- External API calls (mock them)

### 4.2 Integration Test Structure

**File Naming Convention**:
```
test/users.e2e-spec.ts  ← E2E test (actually integration)
```

**Test Structure**:

```typescript
describe('Users API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let tenantId: number;
  
  beforeAll(async () => {
    // Setup test app
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
    
    // Setup test tenant & user
    const { token, tenant } = await setupTestTenant(app);
    authToken = token;
    tenantId = tenant.id;
  });
  
  afterAll(async () => {
    await cleanupTestData(tenantId);
    await app.close();
  });
  
  describe('POST /api/v1/users', () => {
    it('should create user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'newuser@example.com',
          password: 'Password123!',
          name: 'New User',
          roleIds: [2],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toBe('newuser@example.com');
          expect(res.body.data.password).toBeUndefined(); // Password hidden
        });
    });
    
    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ email: 'test@example.com' })
        .expect(401);
    });
    
    it('should return 400 with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' })
        .expect(400)
        .expect((res) => {
          expect(res.body.error.code).toBe('VALIDATION_ERROR');
          expect(res.body.error.errors).toContainEqual({
            field: 'email',
            message: expect.any(String),
          });
        });
    });
  });
  
  describe('GET /api/v1/users', () => {
    it('should return paginated users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users?page=1&perPage=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta.pagination).toBeDefined();
        });
    });
  });
});
```

### 4.3 Integration Test Best Practices

**1. Use Test Database**

```typescript
// test/setup.ts
beforeAll(async () => {
  // Use separate test database
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  
  // Run migrations
  await runMigrations();
});

afterAll(async () => {
  // Cleanup
  await dropAllTables();
});
```

**2. Isolate Tests** - Each test should be independent

```typescript
// Bad ❌ - Tests depend on each other
describe('Users API', () => {
  let userId: number;
  
  it('should create user', async () => {
    const res = await createUser();
    userId = res.body.data.id; // Shared state!
  });
  
  it('should get user', async () => {
    await getUser(userId); // Depends on previous test!
  });
});

// Good ✅ - Tests are independent
describe('Users API', () => {
  let userId: number;
  
  beforeEach(async () => {
    // Create fresh user for each test
    const user = await createTestUser();
    userId = user.id;
  });
  
  afterEach(async () => {
    // Cleanup
    await deleteTestUser(userId);
  });
  
  it('should get user', async () => {
    await getUser(userId); // Independent!
  });
});
```

**3. Test Multi-Tenancy Isolation**

```typescript
it('should not return users from other tenants', async () => {
  // Create user in tenant A
  const tenant1 = await createTestTenant();
  const user1 = await createTestUser(tenant1.id);
  
  // Login as tenant B
  const tenant2 = await createTestTenant();
  const token2 = await loginAsTenant(tenant2.id);
  
  // Should NOT see user1
  const res = await request(app.getHttpServer())
    .get('/api/v1/users')
    .set('Authorization', `Bearer ${token2}`)
    .expect(200);
  
  const userIds = res.body.data.map((u: any) => u.id);
  expect(userIds).not.toContain(user1.id);
});
```

**4. Test Soft Delete**

```typescript
it('should soft delete user (not hard delete)', async () => {
  const user = await createTestUser();
  
  // Delete user
  await request(app.getHttpServer())
    .delete(`/api/v1/users/${user.id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  
  // Check database - user still exists but marked deleted
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .execute();
  
  expect(dbUser[0]).toBeDefined();
  expect(dbUser[0].deleted_at).not.toBeNull();
});
```

---

## 5. E2E Testing Strategy

### 5.1 What to E2E Test

**✅ DO Test (Critical Paths Only)**:
- User authentication flow (login, logout)
- User registration flow
- Create user → Assign role → Login
- Critical business workflows
- Cross-page navigation
- Form submission with validation errors

**❌ DON'T Test**:
- Every possible path (too expensive)
- Unit-level logic (that's unit tests)
- Every edge case (use integration tests)

### 5.2 Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Mobile (optional, for responsive testing)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5.3 E2E Test Structure

**File Naming Convention**:
```
tests/e2e/auth/login.spec.ts
tests/e2e/users/create-user.spec.ts
```

**Test Structure**:

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });
  
  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill login form
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/portal');
    
    // Verify dashboard loaded
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify user info displayed
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Admin');
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    // Should stay on login page
    await expect(page).toHaveURL(/.*login/);
    
    // Should show error message
    await expect(page.locator('.error-message')).toContainText('Email atau password salah');
  });
  
  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Check validation errors
    await expect(page.locator('[name="email"] + .error')).toContainText('Email harus diisi');
    await expect(page.locator('[name="password"] + .error')).toContainText('Password harus diisi');
  });
});
```

### 5.4 E2E Test Best Practices

**1. Use Page Object Model** - Reusable page components

```typescript
// tests/e2e/pages/login.page.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/login');
  }
  
  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
  
  async getErrorMessage() {
    return this.page.locator('.error-message').textContent();
  }
}

// In test
test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('admin@example.com', 'admin123');
  
  await expect(page).toHaveURL('**/portal');
});
```

**2. Use data-testid** - Stable selectors

```tsx
// Component
<button data-testid="submit-button" type="submit">
  Login
</button>

// Test
await page.click('[data-testid="submit-button"]');
```

**3. Wait for Network Requests**

```typescript
test('should submit form', async ({ page }) => {
  // Wait for API call
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/v1/users') && response.status() === 201
  );
  
  await page.click('[data-testid="submit-button"]');
  
  const response = await responsePromise;
  const data = await response.json();
  
  expect(data.success).toBe(true);
});
```

**4. Setup & Teardown**

```typescript
// tests/e2e/setup/global-setup.ts
export default async function globalSetup() {
  // Setup test database
  await runMigrations();
  
  // Seed test data
  await seedTestData();
}

// tests/e2e/setup/global-teardown.ts
export default async function globalTeardown() {
  // Cleanup
  await cleanupTestData();
}
```

---

## 6. Test Coverage Requirements

### 6.1 Coverage Targets

| Component | Unit Test | Integration Test | E2E Test | Total Target |
|-----------|-----------|------------------|----------|--------------|
| Services (Business Logic) | 90%+ | - | - | 90%+ |
| Repositories (Data Access) | 80%+ | 90%+ | - | 85%+ |
| Controllers (API Endpoints) | 70%+ | 90%+ | - | 80%+ |
| Utilities | 95%+ | - | - | 95%+ |
| Guards & Middlewares | 85%+ | 90%+ | - | 85%+ |
| Frontend Components | 75%+ | - | Critical paths | 75%+ |
| Frontend Hooks | 85%+ | - | - | 85%+ |
| **Overall** | - | - | - | **80%+** |

### 6.2 Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.e2e-spec.ts',
        '**/*.config.ts',
        '**/main.ts',
      ],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
});
```

### 6.3 What NOT to Count in Coverage

- Configuration files (*.config.ts)
- Main entry points (main.ts)
- Type definitions (*.types.ts)
- Constants (*.constants.ts)
- Test files themselves

---

## 7. Testing Workflow

### 7.1 Development Workflow

```
1. Write failing test (TDD)
   ↓
2. Write minimal code to pass test
   ↓
3. Refactor
   ↓
4. Run tests locally
   ↓
5. Commit (with tests)
   ↓
6. CI runs all tests
   ↓
7. Merge if all pass
```

### 7.2 Test Commands

```bash
# Backend
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test users.service.spec.ts

# Run E2E tests
npm run test:e2e

# Frontend
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### 7.3 Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.ts": [
      "npm run lint:fix",
      "npm run test:affected" // Only test affected files
    ]
  }
}
```

---

## 8. CI/CD Testing Pipeline

### 8.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Run linter
        working-directory: ./backend
        run: npm run lint
      
      - name: Run unit tests
        working-directory: ./backend
        run: npm run test:cov
      
      - name: Run E2E tests
        working-directory: ./backend
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_HOST: localhost
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend

  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint
      
      - name: Run unit tests
        working-directory: ./frontend
        run: npm run test:cov
      
      - name: Install Playwright browsers
        working-directory: ./frontend
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        working-directory: ./frontend
        run: npm run test:e2e
      
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend
```

### 8.2 Pipeline Requirements

**All tests MUST pass before merge**:
- ✅ Linting (no warnings)
- ✅ Unit tests (80%+ coverage)
- ✅ Integration tests (all pass)
- ✅ E2E tests (critical paths pass)
- ✅ No security vulnerabilities (npm audit)

---

## 9. Performance Testing

### 9.1 Load Testing (K6)

```javascript
// tests/load/api-load.test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  const token = __ENV.AUTH_TOKEN;
  
  const res = http.get('https://api.platform-cms.com/api/v1/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

**Run Load Test**:

```bash
# Install k6
npm install -g k6

# Run test
k6 run tests/load/api-load.test.js

# With more VUs
k6 run --vus 500 --duration 10m tests/load/api-load.test.js
```

### 9.2 Performance Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | < 200ms | K6 load test |
| API Response Time (p99) | < 500ms | K6 load test |
| Database Query Time | < 50ms | Query logging |
| Page Load Time (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |

---

## 10. Test Data Management

### 10.1 Test Fixtures

```typescript
// test/fixtures/index.ts
import { faker } from '@faker-js/faker';

export const testFixtures = {
  user: {
    create: (overrides?: Partial<CreateUserDto>) => ({
      email: faker.internet.email(),
      password: 'Password123!',
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      roleIds: [2],
      ...overrides,
    }),
    
    entity: (overrides?: Partial<User>) => ({
      id: faker.number.int({ min: 1, max: 1000 }),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }),
  },
  
  tenant: {
    create: (overrides?: Partial<CreateTenantDto>) => ({
      name: faker.company.name(),
      subscriptionTier: 'basic',
      adminEmail: faker.internet.email(),
      adminName: faker.person.fullName(),
      ...overrides,
    }),
  },
};
```

### 10.2 Database Seeding for Tests

```typescript
// test/seed.ts
export async function seedTestData(db: DrizzleDB) {
  // Create test tenant
  const tenant = await db.insert(tenants).values({
    name: 'Test Tenant',
    slug: 'test-tenant',
    schemaName: 'tenant_test',
    subscriptionTier: 'pro',
    isActive: true,
  }).returning();
  
  // Create test users
  const users = await db.insert(usersTable).values([
    {
      email: 'admin@test.com',
      passwordHash: await hash('admin123'),
      name: 'Test Admin',
      isActive: true,
    },
    {
      email: 'user@test.com',
      passwordHash: await hash('user123'),
      name: 'Test User',
      isActive: true,
    },
  ]).returning();
  
  return { tenant: tenant[0], users };
}
```

---

## 11. Testing Best Practices Summary

### ✅ DO

1. **Write tests WHILE coding**, not after
2. **Test behavior**, not implementation
3. **Use descriptive test names** (should... when...)
4. **Keep tests simple and focused** (one concept per test)
5. **Use fixtures and factories** for test data
6. **Mock external dependencies**
7. **Test edge cases and errors**
8. **Run tests before committing**
9. **Keep tests fast** (< 1s for unit, < 10s for integration)
10. **Review test coverage** regularly

### ❌ DON'T

1. **Don't skip tests** for "simple" code
2. **Don't test implementation details**
3. **Don't share state between tests**
4. **Don't use real external services** in tests
5. **Don't hardcode test data** (use fixtures)
6. **Don't ignore flaky tests** (fix or remove)
7. **Don't aim for 100% coverage** (focus on meaningful tests)
8. **Don't test third-party code**
9. **Don't commit failing tests**
10. **Don't skip E2E tests** in CI

---

## Penutup

### Approval & Sign-off

**Prepared by**: [QA Engineer, Development Team]  
**Review by**: [Senior Engineer, Tech Lead]  
**Approved by**: [Project Manager]  

**Date**: 2024-01-08

---

### Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024-01-08 | Initial testing strategy document | Development Team |

---

### Referensi

**Internal Documents**:
- PROJECT-BRIEF.md - Project overview
- TECHNICAL-ARCHITECTURE.md - System architecture
- AI-RULES.md - Development guidelines

**External References**:
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [K6 Documentation](https://k6.io/docs/)

---

**END OF DOCUMENT**

