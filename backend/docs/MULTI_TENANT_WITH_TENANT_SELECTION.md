# Multi-Tenant Architecture with Tenant Selection

## Architecture Overview

### Design Philosophy

1. **SuperAdmin** (public schema) mengelola semua tenant
2. **Tenant Users** (tenant schema) terisolasi per tenant
3. **User bisa exist di multiple tenants** dengan email sama tapi credentials berbeda
4. **Module Generator** dapat generate module ke tenant tertentu
5. **Login** harus specify tenant target

## Schema Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC SCHEMA                             │
│                 (SuperAdmin Management)                      │
├─────────────────────────────────────────────────────────────┤
│  tenants              → All tenant configurations            │
│  users                → SuperAdmin users ONLY                │
│  modules              → Available module registry            │
│  tenant_modules       → Enabled modules per tenant           │
│  module_templates     → CLI generator templates              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              TENANT_DEMO_COMPANY SCHEMA                      │
│                  (Tenant A Data)                             │
├─────────────────────────────────────────────────────────────┤
│  users                → Company A users                      │
│  roles                → Company A roles                      │
│  permissions          → Company A permissions                │
│  user_roles           → User-role mapping                    │
│  role_permissions     → Role-permission mapping              │
│  products             → Generated module (if enabled)        │
│  categories           → Generated module (if enabled)        │
│  menus                → Company A navigation                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              TENANT_COMPANY_B SCHEMA                         │
│                  (Tenant B Data)                             │
├─────────────────────────────────────────────────────────────┤
│  users                → Company B users                      │
│  roles                → Company B roles (different!)         │
│  permissions          → Company B permissions                │
│  products             → Different product catalog            │
│  orders               → Generated module (different!)        │
└─────────────────────────────────────────────────────────────┘
```

## Login Flow with Tenant Selection

### Scenario 1: SuperAdmin Login (Public Schema)

```http
POST /api/auth/login
Headers:
  X-Tenant-Slug: _superadmin  ← Special keyword for public schema

Body:
{
  "email": "superadmin@platform.com",
  "password": "SuperSecret123"
}

Backend Logic:
1. Detect _superadmin tenant slug
2. Query: SELECT * FROM public.users WHERE email = ?
3. Verify password
4. Load SuperAdmin roles from public.roles
5. Generate JWT with tenantId = 0 (special)
6. Return token
```

### Scenario 2: Tenant User Login

```http
POST /api/auth/login
Headers:
  X-Tenant-Slug: demo_company  ← Target tenant

Body:
{
  "email": "user@company.com",
  "password": "UserPass123"
}

Backend Logic:
1. Validate tenant exists: SELECT * FROM public.tenants WHERE slug = 'demo_company'
2. Get schema name: tenant_demo_company
3. Query: SELECT * FROM tenant_demo_company.users WHERE email = ?
4. Verify password
5. Load roles from tenant_demo_company.user_roles
6. Generate JWT with tenantId = tenant.id
7. Return token
```

### Scenario 3: Same Email, Multiple Tenants

```
User: john@email.com exists in:
  - tenant_demo_company (role: admin, password: Pass123)
  - tenant_company_b (role: viewer, password: DifferentPass456)
```

Login to Tenant A:
```http
POST /api/auth/login
Headers: X-Tenant-Slug: demo_company
Body: {"email":"john@email.com","password":"Pass123"}
→ Success, loads roles from tenant_demo_company
```

Login to Tenant B:
```http
POST /api/auth/login
Headers: X-Tenant-Slug: company_b
Body: {"email":"john@email.com","password":"DifferentPass456"}
→ Success, loads roles from tenant_company_b
```

## Backend Implementation

### Update Auth Service

```typescript
// auth.service.ts
async login(dto: LoginDto, ipAddress: string, userAgent: string, tenantSlug: string): Promise<LoginResponseDto> {
  let user: User | null = null;
  let tenantId: number;
  let schemaName: string;

  // Check if SuperAdmin login
  if (tenantSlug === '_superadmin') {
    // Query public.users
    user = await this.db.query.users.findFirst({
      where: eq(publicSchema.users.email, dto.email)
    });
    tenantId = 0;
    schemaName = 'public';
  } else {
    // Query tenant-specific users
    const tenant = await this.tenantsService.findBySlug(tenantSlug);
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    tenantId = tenant.id;
    schemaName = `tenant_${tenantSlug}`;

    // Set tenant context
    this.tenantContext.setTenant({
      id: tenant.id,
      slug: tenant.slug,
      schemaName: schemaName,
      name: tenant.name,
    });

    // Query tenant schema users
    user = await this.usersService.findByEmail(dto.email);
  }

  if (!user) {
    throw new UnauthorizedException({
      code: 'INVALID_CREDENTIALS',
      message: 'Email atau password salah',
    });
  }

  // Verify password
  const isValid = await compare(dto.password, user.password_hash);
  if (!isValid) {
    throw new UnauthorizedException({
      code: 'INVALID_CREDENTIALS',
      message: 'Email atau password salah',
    });
  }

  // Generate JWT
  const token = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    tenantId: tenantId,
    schema: schemaName,
  });

  return {
    access_token: token,
    user: user,
  };
}
```

### Update Auth Controller

```typescript
// auth.controller.ts
@Post('login')
@Public()
async login(
  @Body() dto: LoginDto,
  @Headers('x-tenant-slug') tenantSlug: string,
  @Ip() ipAddress: string,
  @Headers('user-agent') userAgent: string,
) {
  if (!tenantSlug) {
    throw new BadRequestException({
      code: 'TENANT_REQUIRED',
      message: 'Header X-Tenant-Slug required. Use "_superadmin" for admin login.',
    });
  }

  return this.authService.login(dto, ipAddress, userAgent, tenantSlug);
}
```

### Update Users Repository

```typescript
// users.repository.ts
@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @Inject('DRIZZLE') protected readonly db: NodePgDatabase<any>,
    protected readonly tenantContext: TenantContextService,
  ) {
    super(db, users, tenantContext);
  }

  /**
   * Find user by email in PUBLIC schema (SuperAdmin)
   */
  async findInPublic(email: string): Promise<User | null> {
    const results = await this.db
      .select()
      .from(publicSchema.users)
      .where(eq(publicSchema.users.email, email))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find user by email in TENANT schema
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.withTenantSchema(async () => {
      const results = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.email, email))
        .limit(1);

      return results[0] || null;
    });
  }
}
```

## Frontend Implementation

### Tenant Selection UI

```typescript
// app/(auth)/login/page.tsx
export default function LoginPage() {
  const [tenant, setTenant] = useState('demo_company');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const tenantOptions = [
    { value: '_superadmin', label: 'SuperAdmin Portal' },
    { value: 'demo_company', label: 'Demo Company' },
    { value: 'company_b', label: 'Company B' },
  ];

  const handleLogin = async () => {
    const response = await authService.login({
      email,
      password,
      tenant, // Pass tenant slug
    });
  };

  return (
    <form onSubmit={handleLogin}>
      <Select value={tenant} onChange={setTenant}>
        {tenantOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>

      <Input type="email" value={email} onChange={setEmail} />
      <Input type="password" value={password} onChange={setPassword} />
      
      <Button type="submit">Login to {tenant}</Button>
    </form>
  );
}
```

### Auth Service Update

```typescript
// auth.service.ts
export const authService = {
  async login(credentials: { email: string; password: string; tenant: string }) {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      { email: credentials.email, password: credentials.password },
      { 
        headers: { 
          'X-Tenant-Slug': credentials.tenant 
        } 
      }
    );

    // Save token and tenant
    if (response.access_token) {
      document.cookie = `token=${response.access_token}; path=/`;
      document.cookie = `tenant=${credentials.tenant}; path=/`;
    }

    return response;
  },
};
```

## CLI Generator with Tenant Selection

### Generate Module for Specific Tenant

```bash
# Generate 'orders' module for tenant 'demo_company'
npm run generate:module orders --tenant demo_company

# This will:
# 1. Read module template
# 2. Generate NestJS module code
# 3. Create migration for tenant_demo_company.orders table
# 4. Register in public.modules
# 5. Enable in public.tenant_modules
```

### CLI Implementation

```typescript
// scripts/generate-module-cli.ts
async function generateModule(moduleName: string, tenantSlug: string) {
  // 1. Validate tenant exists
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });

  if (!tenant) {
    throw new Error(`Tenant ${tenantSlug} not found`);
  }

  const schemaName = `tenant_${tenantSlug}`;

  // 2. Generate Drizzle schema
  const schemaCode = generateDrizzleSchema(moduleName, schemaName);
  fs.writeFileSync(
    `src/database/schema/tenant/${moduleName}.schema.ts`,
    schemaCode
  );

  // 3. Generate migration
  const migrationSQL = `
    CREATE TABLE IF NOT EXISTS "${schemaName}".${moduleName} (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // 4. Generate NestJS module, service, controller
  generateNestJSModule(moduleName, tenantSlug);

  // 5. Register module
  await db.insert(publicSchema.modules).values({
    name: moduleName,
    schema_name: moduleName,
    created_at: new Date(),
  });

  // 6. Enable for tenant
  await db.insert(publicSchema.tenantModules).values({
    tenant_id: tenant.id,
    module_id: moduleId,
    is_enabled: true,
  });

  console.log(`✅ Module ${moduleName} generated for tenant ${tenantSlug}`);
}
```

## Tenant Management (SuperAdmin)

### List All Tenants

```http
GET /api/superadmin/tenants
Headers:
  Authorization: Bearer <superadmin_token>
  X-Tenant-Slug: _superadmin

Response:
[
  {
    "id": 1,
    "name": "Demo Company",
    "slug": "demo_company",
    "schema_name": "tenant_demo_company",
    "is_active": true,
    "users_count": 15,
    "modules_enabled": ["users", "products", "categories"]
  },
  {
    "id": 2,
    "name": "Company B",
    "slug": "company_b",
    "schema_name": "tenant_company_b",
    "is_active": true,
    "users_count": 8,
    "modules_enabled": ["users", "orders", "invoices"]
  }
]
```

### Create New Tenant

```http
POST /api/superadmin/tenants
Headers:
  Authorization: Bearer <superadmin_token>
  X-Tenant-Slug: _superadmin

Body:
{
  "name": "New Company",
  "slug": "new_company",
  "admin_email": "admin@newcompany.com",
  "admin_password": "TempPass123"
}

Backend:
1. Create entry in public.tenants
2. Create schema: tenant_new_company
3. Run base migrations (users, roles, permissions tables)
4. Create default admin user in tenant_new_company.users
5. Assign default role
6. Return tenant + admin credentials
```

## Security Considerations

### Tenant Isolation

1. **Schema-level**: PostgreSQL ensures `tenant_a` cannot query `tenant_b`
2. **Application-level**: Middleware validates user access to tenant
3. **JWT validation**: Token must contain correct tenantId
4. **Search path**: Always reset after queries to prevent leakage

### Cross-Tenant Prevention

```typescript
// WRONG: Direct schema access
const products = await db.select().from(tenant_other_company.products);

// RIGHT: Context-based access
const products = await this.withTenantSchema(() => 
  db.select().from(this.table)
);
```

### SuperAdmin Privileges

SuperAdmin can:
- ✅ Create/delete tenants
- ✅ View tenant statistics
- ✅ Enable/disable modules per tenant
- ✅ Backup/restore tenant data
- ❌ Cannot directly access tenant user credentials
- ❌ Cannot impersonate tenant users (audit required)

## Migration Strategy

### Phase 1: Fix Current State

1. Keep existing public.users (for SuperAdmin)
2. Ensure backend checks tenant slug to decide schema
3. Update auth service with tenant selection logic

### Phase 2: Tenant Selection UI

1. Add tenant dropdown in login page
2. Fetch available tenants from backend
3. Save selected tenant in cookie/localStorage

### Phase 3: Module Generator

1. Create CLI tool for module generation
2. Template system for common patterns
3. Auto-register modules in public.modules

### Phase 4: Tenant Admin Portal

1. SuperAdmin dashboard showing all tenants
2. Per-tenant module management UI
3. Tenant creation wizard
4. Usage analytics per tenant

## Example Workflow

### Creating New Client

1. **SuperAdmin** creates tenant via portal
   ```http
   POST /api/superadmin/tenants
   Body: { name: "Client Corp", slug: "client_corp" }
   ```

2. **System** provisions:
   - Creates `tenant_client_corp` schema
   - Runs base migrations
   - Creates default admin user
   - Enables core modules

3. **SuperAdmin** enables additional modules:
   ```http
   POST /api/superadmin/tenants/3/modules
   Body: { modules: ["products", "orders", "invoices"] }
   ```

4. **System** generates modules:
   - Runs CLI generator for each module
   - Creates tables in `tenant_client_corp`
   - Registers routes in NestJS

5. **Client admin** logs in:
   ```http
   POST /api/auth/login
   Headers: X-Tenant-Slug: client_corp
   Body: { email: "admin@clientcorp.com", password: "temp" }
   ```

6. **Client users** created by client admin
   - All stored in `tenant_client_corp.users`
   - Isolated from other tenants

## Best Practices

1. **Always specify tenant** in X-Tenant-Slug header
2. **Never hardcode schema names** in queries
3. **Use withTenantSchema()** for all tenant queries
4. **Validate tenant access** before setting context
5. **Log all cross-tenant operations** for audit
6. **Test with multiple tenants** to ensure isolation
7. **Document module dependencies** for generator
8. **Version module templates** for backwards compatibility

## Troubleshooting

### "Tenant not found" error
- Check X-Tenant-Slug header is sent
- Verify tenant exists in public.tenants
- Ensure tenant is_active = true

### User found in wrong schema
- Check auth service logic for tenant slug detection
- Verify tenant context is set before user query
- Use logging to trace which schema is queried

### Module not available in tenant
- Check public.tenant_modules for enabled modules
- Verify module is registered in public.modules
- Run module generator if missing

