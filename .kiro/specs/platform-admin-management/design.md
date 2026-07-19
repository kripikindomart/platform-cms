ti# Design Document

## Overview

The Platform Admin Management system enables super administrators to manage all tenants, users, and platform-wide settings through a dedicated `platform_admin` tenant. This design maintains tenant isolation while providing cross-tenant visibility and management capabilities.

## Architecture Decisions

### 1. Platform Admin Tenant Approach

**Decision**: Create a dedicated platform admin tenant with random 26-character alphanumeric slug (like Supabase org IDs).

**Rationale**:
- Maintains consistency with existing multi-tenant architecture
- Reuses existing RBAC system (roles/permissions)
- Provides strong isolation for platform administration data
- Simplifies authentication and session management
- Enables comprehensive audit logging within tenant schema
- **Security through obscurity**: Random 26-char slug (e.g., `zemnrnevfvomrwrbhbyvabcdef`) makes platform admin portal nearly impossible to discover
- Internal `is_platform_admin` flag provides programmatic identification

**Implementation**:
- Platform admin tenant slug: Random 26-character alphanumeric (e.g., `kxmwnvpqrsjthzabcdefghijkl`)
- Schema name: `tenant_kxmwnvpqrsjthzabcdefghijkl` (follows standard pattern)
- Public-facing URL: `/org/kxmwnvpqrsjthzabcdefghijkl/portal`
- Internal flag: `is_platform_admin = true` in public.tenants table
- Generation: `nanoid(26)` or similar cryptographically secure random generator

### 2. Cross-Tenant Access Model

**Decision**: Implement special `SuperAdmin_Role` with cross-tenant permissions via middleware extension.

**Rationale**:
- Preserves schema-per-tenant isolation principle
- Explicit permission checks before any cross-tenant operation
- Centralized authorization logic in middleware
- Rate limiting prevents resource exhaustion
- Search_path validation ensures no SQL injection

## Database Schema Design

### Platform Admin Tenant Schema

**Note**: Schema name uses random 26-character slug like Supabase org IDs. Example: `tenant_kxmwnvpqrsjthzabcdefghijkl`

```sql
-- Generate random slug for platform admin tenant
-- Format: 26 random lowercase alphanumeric chars (like Supabase)
-- Example: kxmwnvpqrsjthzabcdefghijkl
-- URL: /org/kxmwnvpqrsjthzabcdefghijkl/portal

CREATE SCHEMA IF NOT EXISTS "tenant_kxmwnvpqrsjthzabcdefghijkl";

-- Roles table (extends existing tenant pattern)
-- Replace with actual random 26-char slug
CREATE TABLE tenant_kxmwnvpqrsjthzabcdefghijkl.roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Permissions table with cross-tenant flag
CREATE TABLE tenant_kxmwnvpqrsjthzabcdefghijkl.permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  resource VARCHAR(100) NOT NULL,  -- 'tenant', 'user', 'settings'
  action VARCHAR(50) NOT NULL,      -- 'create', 'read', 'update', 'delete'
  is_cross_tenant BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Role-Permission mapping
CREATE TABLE tenant_kxmwnvpqrsjthzabcdefghijkl.role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES tenant_kxmwnvpqrsjthzabcdefghijkl.roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES tenant_kxmwnvpqrsjthzabcdefghijkl.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- User-Role mapping (references public.users)
CREATE TABLE tenant_kxmwnvpqrsjthzabcdefghijkl.user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES tenant_kxmwnvpqrsjthzabcdefghijkl.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Audit logs for platform operations
CREATE TABLE tenant_kxmwnvpqrsjthzabcdefghijkl.audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id),
  tenant_id INTEGER REFERENCES public.tenants(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id INTEGER,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  is_platform_audit BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON tenant_kxmwnvpqrsjthzabcdefghijkl.audit_logs(user_id);
CREATE INDEX idx_audit_logs_tenant_id ON tenant_kxmwnvpqrsjthzabcdefghijkl.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON tenant_kxmwnvpqrsjthzabcdefghijkl.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON tenant_kxmwnvpqrsjthzabcdefghijkl.audit_logs(action);

-- Tenant health status tracking
CREATE TABLE tenant_kxmwnvpqrsjthzabcdefghijkl.tenant_health (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  status VARCHAR(50) NOT NULL,  -- 'healthy', 'unhealthy', 'degraded'
  last_check_at TIMESTAMP,
  consecutive_failures INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenant_health_tenant_id ON tenant_kxmwnvpqrsjthzabcdefghijkl.tenant_health(tenant_id);
CREATE INDEX idx_tenant_health_status ON tenant_kxmwnvpqrsjthzabcdefghijkl.tenant_health(status);
```

### public Schema Extensions

```sql
-- Add columns to existing public.tenants table
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT false;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS health_status VARCHAR(50) DEFAULT 'healthy';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Platform settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  value_type VARCHAR(50) NOT NULL,  -- 'string', 'number', 'boolean', 'json'
  scope VARCHAR(50) NOT NULL,        -- 'platform', 'tenant'
  tenant_id INTEGER REFERENCES public.tenants(id),
  description TEXT,
  is_deprecated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_settings_scope ON public.system_settings(scope);
CREATE INDEX idx_system_settings_tenant_id ON public.system_settings(tenant_id);

-- Settings history for audit trail
CREATE TABLE IF NOT EXISTS public.system_settings_history (
  id SERIAL PRIMARY KEY,
  setting_id INTEGER REFERENCES public.system_settings(id),
  key VARCHAR(255) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by INTEGER REFERENCES public.users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_settings_history_setting_id ON public.system_settings_history(setting_id);
CREATE INDEX idx_settings_history_changed_at ON public.system_settings_history(changed_at);
```

## Backend Architecture

### Module Structure

```
src/
├── modules/
│   ├── platform-admin/
│   │   ├── platform-admin.module.ts
│   │   ├── controllers/
│   │   │   ├── tenants.controller.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── settings.controller.ts
│   │   │   ├── statistics.controller.ts
│   │   │   └── audit.controller.ts
│   │   ├── services/
│   │   │   ├── tenants.service.ts
│   │   │   ├── user-assignment.service.ts
│   │   │   ├── platform-settings.service.ts
│   │   │   ├── statistics.service.ts
│   │   │   ├── health-check.service.ts
│   │   │   └── audit.service.ts
│   │   ├── repositories/
│   │   │   ├── platform-admin-roles.repository.ts
│   │   │   ├── platform-admin-audit.repository.ts
│   │   │   └── tenant-health.repository.ts
│   │   ├── guards/
│   │   │   ├── super-admin.guard.ts
│   │   │   └── cross-tenant-rate-limit.guard.ts
│   │   ├── decorators/
│   │   │   ├── require-super-admin.decorator.ts
│   │   │   └── cross-tenant-operation.decorator.ts
│   │   ├── dto/
│   │   │   ├── create-tenant.dto.ts
│   │   │   ├── update-tenant.dto.ts
│   │   │   ├── assign-user.dto.ts
│   │   │   └── update-setting.dto.ts
│   │   └── schedulers/
│   │       └── health-check.scheduler.ts
```

### Key Services

#### 1. TenantsService

```typescript
@Injectable()
export class TenantsService {
  constructor(
    private readonly tenantsRepository: TenantsRepository,
    private readonly db: DrizzleService,
    private readonly auditService: AuditService,
  ) {}

  async createTenant(dto: CreateTenantDto, adminUserId: number): Promise<Tenant> {
    // Validate slug pattern and uniqueness
    // Create schema in transaction
    // Initialize default tables
    // Insert default roles/permissions
    // Log to audit
    // Return tenant
  }

  async getTenantStatistics(tenantId: number): Promise<TenantStatistics> {
    // Check cache first
    // Query tenant schema with search_path
    // Calculate user count, storage, last activity
    // Cache for 5 minutes
    // Return statistics
  }

  async switchToTenant(superAdminId: number, tenantSlug: string): Promise<SwitchResult> {
    // Validate tenant exists and active
    // Create temporary user_tenant_mapping with "superadmin_switch" flag
    // Set session attribute "superadmin_origin_tenant" to platform admin slug
    // Return redirect URL
  }
}
```

#### 2. Slug Generation Utility

```typescript
import { customAlphabet } from 'nanoid';

// Generate 26-char slug like Supabase
const generateTenantSlug = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  26
);

@Injectable()
export class SlugGeneratorService {
  async generatePlatformAdminSlug(): Promise<string> {
    // Generate unique 26-character slug
    let slug: string;
    let isUnique = false;
    
    while (!isUnique) {
      slug = generateTenantSlug();
      const exists = await this.tenantsRepository.existsBySlug(slug);
      if (!exists) {
        isUnique = true;
      }
    }
    
    return slug;
  }

  async generateTenantSlug(preferredName?: string): Promise<string> {
    // For regular tenants, can use kebab-case name
    // For platform admin, always use random
    if (!preferredName) {
      return this.generatePlatformAdminSlug();
    }
    
    return this.slugifyAndEnsureUnique(preferredName);
  }
}
```

#### 3. PlatformSettingsService

```typescript
@Injectable()
export class PlatformSettingsService {
  private settingsSchema = {
    default_tenant_quota_users: { type: 'number', min: 1, max: 10000, default: 100 },
    default_tenant_quota_storage_gb: { type: 'number', min: 1, max: 1000, default: 50 },
    auth_session_timeout_minutes: { type: 'number', min: 5, max: 1440, default: 30 },
    auth_require_email_verification: { type: 'boolean', default: true },
    feature_flags: { type: 'json', maxDepth: 10, maxSize: 100000, default: {} },
  };

  async updateSetting(key: string, value: any, userId: number): Promise<void> {
    // Validate key exists in schema
    // Validate value against schema rules
    // Store old value for history
    // Update setting
    // Create history record
    // Log to audit
  }

  async getSetting(key: string, tenantId?: number): Promise<any> {
    // Check for tenant-specific override first
    // Fall back to platform setting
    // Return default if not configured
  }
}
```

#### 4. HealthCheckScheduler

```typescript
@Injectable()
export class HealthCheckScheduler {
  constructor(
    private readonly tenantsRepository: TenantsRepository,
    private readonly tenantHealthRepository: TenantHealthRepository,
    private readonly db: DrizzleService,
  ) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async performHealthChecks() {
    const activeTenants = await this.tenantsRepository.findActive();
    
    for (const tenant of activeTenants) {
      try {
        await this.checkTenantHealth(tenant);
      } catch (error) {
        // Log error, continue with next tenant
      }
    }
  }

  private async checkTenantHealth(tenant: Tenant): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Verify schema exists
      // Execute SELECT 1 with timeout
      // Update health status to 'healthy'
      // Reset consecutive_failures
    } catch (error) {
      // Increment consecutive_failures
      // Update health status
      // Send alert if threshold reached
    }
  }
}
```

### Guards and Decorators

#### SuperAdminGuard

```typescript
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private readonly tenantsRepository: TenantsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantSlug = request.headers['x-tenant-slug'];

    // Verify tenant is platform admin by checking is_platform_admin flag
    // Don't rely on slug name for security
    const tenant = await this.tenantsRepository.findBySlug(tenantSlug);
    
    if (!tenant || !tenant.is_platform_admin) {
      throw new ForbiddenException('Access denied: Invalid tenant context');
    }

    // Verify user has SuperAdmin role in platform admin tenant schema
    const hasSuperAdminRole = await this.checkSuperAdminRole(user.id, tenant.id);
    
    if (!hasSuperAdminRole) {
      throw new ForbiddenException('Access denied: SuperAdmin role required');
    }

    return true;
  }
}
```

#### CrossTenantRateLimitGuard

```typescript
@Injectable()
export class CrossTenantRateLimitGuard implements CanActivate {
  private readonly limit = 10; // operations
  private readonly window = 60; // seconds
  private readonly requests = new Map<number, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const now = Date.now();

    // Get user's recent requests
    const userRequests = this.requests.get(userId) || [];
    
    // Filter requests within time window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.window * 1000
    );

    // Check rate limit
    if (recentRequests.length >= this.limit) {
      throw new TooManyRequestsException(
        `Rate limit exceeded: ${this.limit} operations per ${this.window} seconds`
      );
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);

    return true;
  }
}
```

## API Endpoints

### Tenant Management

```
GET    /api/platform-admin/tenants
POST   /api/platform-admin/tenants
GET    /api/platform-admin/tenants/:id
PUT    /api/platform-admin/tenants/:id
DELETE /api/platform-admin/tenants/:id
POST   /api/platform-admin/tenants/:id/disable
POST   /api/platform-admin/tenants/:id/enable
GET    /api/platform-admin/tenants/:id/statistics
POST   /api/platform-admin/tenants/:id/switch
```

### User Management

```
GET    /api/platform-admin/users
GET    /api/platform-admin/users/:id
GET    /api/platform-admin/users/:id/tenants
POST   /api/platform-admin/users/:id/assign-tenant
DELETE /api/platform-admin/users/:id/tenants/:tenantId
POST   /api/platform-admin/users/:id/designate-superadmin
DELETE /api/platform-admin/users/:id/revoke-superadmin
GET    /api/platform-admin/users/export
```

### Platform Settings

```
GET    /api/platform-admin/settings
GET    /api/platform-admin/settings/:key
PUT    /api/platform-admin/settings/:key
GET    /api/platform-admin/settings/:key/history
GET    /api/platform-admin/settings/schema
```

### Statistics & Monitoring

```
GET    /api/platform-admin/dashboard/statistics
GET    /api/platform-admin/dashboard/activity
GET    /api/platform-admin/tenants/:id/health
GET    /api/platform-admin/health/summary
```

### Audit Logs

```
GET    /api/platform-admin/audit-logs
GET    /api/platform-admin/audit-logs/:id
GET    /api/platform-admin/audit-logs/export
```

## Frontend Architecture

### Route Structure

**Note**: Platform admin URL uses random 26-character slug (Supabase-style)

```
/org/kxmwnvpqrsjthzabcdefghijkl/     # Random 26-char slug
├── portal/
│   ├── dashboard          # Overview statistics
│   ├── tenants            # Tenant management
│   │   ├── list
│   │   ├── create
│   │   └── [id]
│   │       ├── edit
│   │       ├── statistics
│   │       └── health
│   ├── users              # User management
│   │   ├── list
│   │   ├── search
│   │   └── [id]
│   │       ├── view
│   │       └── assign-tenants
│   ├── settings           # Platform settings
│   │   ├── general
│   │   ├── authentication
│   │   ├── quotas
│   │   └── feature-flags
│   └── audit              # Audit logs
│       ├── logs
│       └── export
```

### Key Components

#### Dashboard Component

```typescript
// app/(private)/org/[tenantSlug]/portal/dashboard/page.tsx
// For platform admin: tenantSlug = "kxmwnvpqrsjthzabcdefghijkl"
export default async function PlatformAdminDashboard() {
  const statistics = await getDashboardStatistics();
  
  return (
    <div className="p-6 space-y-6">
      <h1>Platform Overview</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Tenants" value={statistics.totalTenants} />
        <StatCard title="Active Tenants" value={statistics.activeTenants} />
        <StatCard title="Total Users" value={statistics.totalUsers} />
        <StatCard title="Storage Used" value={statistics.storageUsed} />
      </div>

      <RecentActivityTable activities={statistics.recentActivities} />
      
      <TenantHealthSummary health={statistics.tenantHealth} />
    </div>
  );
}
```

#### Tenant Management Component

```typescript
// app/(private)/org/[tenantSlug]/portal/tenants/page.tsx
// Only accessible when tenantSlug is platform admin tenant
'use client';

export function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [statistics, setStatistics] = useState<Map<number, TenantStatistics>>(new Map());

  const handleSwitchTenant = async (slug: string) => {
    const result = await apiClient.post(`/platform-admin/tenants/${slug}/switch`);
    // Hard reload to tenant context
    window.location.href = `/org/${slug}/portal`;
  };

  return (
    <div>
      <DataTable
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Slug', accessor: 'slug' },
          { header: 'Status', accessor: 'health_status' },
          { header: 'Users', render: (t) => statistics.get(t.id)?.userCount },
          { header: 'Storage', render: (t) => formatBytes(statistics.get(t.id)?.storageUsed) },
          { header: 'Actions', render: (t) => (
            <>
              <Button onClick={() => handleSwitchTenant(t.slug)}>Switch To</Button>
              <Button onClick={() => router.push(`/org/${platformAdminSlug}/portal/tenants/${t.id}`)}>
                Manage
              </Button>
            </>
          )}
        ]}
        data={tenants}
      />
    </div>
  );
}
```

## Security Considerations

### 1. Search Path Management

```typescript
// Utility to safely set and reset search_path
export class SearchPathManager {
  private static readonly TIMEOUT_MS = 100;

  static async withTenantSchema<T>(
    db: Database,
    tenantSlug: string,
    callback: () => Promise<T>
  ): Promise<T> {
    // Validate schema name
    if (!/^tenant_[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(tenantSlug)) {
      throw new Error('Invalid tenant schema name');
    }

    try {
      await db.execute(`SET search_path TO "${tenantSlug}", public`);
      const result = await callback();
      return result;
    } finally {
      // Always reset within 100ms
      await Promise.race([
        db.execute('RESET search_path'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Reset timeout')), this.TIMEOUT_MS)
        )
      ]);
    }
  }
}
```

### 2. Rate Limiting Strategy

- **Cross-tenant operations**: 10 operations per 60 seconds per user
- **Dashboard metrics**: 5 requests per 60 seconds per user
- **Audit log queries**: 20 requests per 60 seconds per user
- **User search**: 30 requests per 60 seconds per user

### 3. Caching Strategy

```typescript
// Cache keys and TTLs
const CACHE_CONFIG = {
  tenantStatistics: { ttl: 300, key: 'tenant_stats:{tenantId}' },
  dashboardMetrics: { ttl: 60, key: 'dashboard_metrics' },
  platformSettings: { ttl: 600, key: 'setting:{key}' },
  tenantHealth: { ttl: 300, key: 'tenant_health:{tenantId}' },
};
```

## Performance Optimization

### 1. Parallel Statistics Calculation

```typescript
async function calculateAllTenantStatistics(tenantIds: number[]): Promise<Map<number, TenantStatistics>> {
  // Process in batches of 10
  const batchSize = 10;
  const results = new Map<number, TenantStatistics>();

  for (let i = 0; i < tenantIds.length; i += batchSize) {
    const batch = tenantIds.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(id => this.calculateTenantStatistics(id))
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.set(batch[index], result.value);
      }
    });
  }

  return results;
}
```

### 2. Database Indexing

All critical queries have appropriate indexes:
- Audit logs: user_id, tenant_id, created_at, action
- System settings: scope, tenant_id
- Tenant health: tenant_id, status
- User roles: user_id, role_id

### 3. Query Timeouts

- Statistics queries: 30 seconds per tenant
- Health checks: 10 seconds per tenant
- Dashboard metrics: 5 seconds per metric
- Storage calculation: 60 seconds per tenant

## Testing Strategy

### Unit Tests

- Services: Mock repositories, test business logic
- Guards: Test authorization rules
- Validators: Test input validation

### Integration Tests

- API endpoints: Test request/response cycles
- Database operations: Test transactions and rollbacks
- Cache operations: Test TTL and invalidation

### E2E Tests

- Tenant creation workflow
- User assignment flow
- Settings update flow
- Health check scheduler
- Audit logging

## Migration Plan

### Phase 1: Database Setup (Week 1)
1. Generate random 26-char slug for platform admin tenant using nanoid
2. Create tenant_{slug} schema
3. Create platform admin tables
4. Insert SuperAdmin role and permissions
5. Add extensions to public.tenants with is_platform_admin flag

**Example initialization script:**
```typescript
// scripts/init-platform-admin.ts
import { customAlphabet } from 'nanoid';

const generateSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 26);
const platformAdminSlug = generateSlug();

console.log(`Platform Admin Slug: ${platformAdminSlug}`);
console.log(`Platform Admin URL: https://yourdomain.com/org/${platformAdminSlug}/portal`);
console.log(`IMPORTANT: Save this slug securely!`);

// Create tenant with this slug...
```

### Phase 2: Backend Implementation (Week 2-3)
1. Implement services and repositories
2. Create API endpoints
3. Implement guards and middleware
4. Add health check scheduler
5. Implement audit logging

### Phase 3: Frontend Implementation (Week 4-5)
1. Create platform admin layout
2. Implement dashboard
3. Build tenant management UI
4. Build user assignment UI
5. Build settings configuration UI
6. Build audit log viewer

### Phase 4: Testing & Deployment (Week 6)
1. Unit and integration tests
2. E2E testing
3. Performance testing
4. Security audit
5. Deploy to staging
6. Deploy to production

## Monitoring & Observability

### Metrics to Track

- Cross-tenant operation latency
- Health check success rate
- Cache hit rate
- API endpoint response times
- Rate limit violations
- Failed authentication attempts

### Alerts

- Tenant health status changes
- High rate of failed operations
- Database query timeouts
- Cache failures
- Scheduler failures

## Success Criteria

1. ✅ SuperAdmin can create/manage tenants in < 5 seconds
2. ✅ Dashboard loads with all metrics in < 10 seconds
3. ✅ Health checks complete for all tenants within 5-minute window
4. ✅ Cross-tenant operations respect rate limits
5. ✅ All platform admin actions logged to audit
6. ✅ Search_path always resets within 100ms
7. ✅ Zero data leakage between tenants
8. ✅ Cache reduces database load by > 70%

