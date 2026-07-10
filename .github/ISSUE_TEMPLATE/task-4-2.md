# Task 4.2: Audit Logging System

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 6 jam  
**Dependencies**: Task 2.2 (Tenant Schema)  
**Status**: Belum Dimulai

---

## Tujuan Task

Implement comprehensive audit logging system untuk track semua CRUD operations dan authentication events. System ini penting untuk compliance, security audit, dan debugging.

---

## Yang Akan Dikerjakan

### 1. Struktur File

File yang akan dibuat:

```
backend/src/core/audit/
├── audit.module.ts              (baru) - Audit module
├── audit.service.ts             (baru) - Audit business logic
├── audit.repository.ts          (baru) - Audit repository
├── audit.interceptor.ts         (baru) - Auto-logging interceptor
└── dto/
    ├── create-audit-log.dto.ts  (baru) - Create audit DTO
    └── query-audit-log.dto.ts   (baru) - Query audit DTO
```

### 2. Audit System Features

**Audit Logging Capabilities**:
- Log semua CRUD operations (create, read, update, delete)
- Log authentication events (login, logout, register, password change)
- Log permission changes (role assignments, permission grants)
- Store before/after values (old_values, new_values as JSON)
- Capture request context (user_id, ip_address, user_agent)
- Tenant-scoped logging (setiap tenant punya audit logs sendiri)

**Audit Log Structure**:
```typescript
{
  id: number;
  user_id: number | null;
  action: string;           // 'create', 'update', 'delete', 'login', etc
  resource: string;         // 'users', 'roles', 'posts', etc
  resource_id: number | null;
  description: string;      // Human-readable description
  old_values: JSON;         // Before values (for updates/deletes)
  new_values: JSON;         // After values (for creates/updates)
  ip_address: string;
  user_agent: string;
  created_at: Date;
}
```

**Actions**:
- `create` - Resource created
- `update` - Resource updated
- `delete` - Resource soft deleted
- `restore` - Resource restored
- `hard_delete` - Resource permanently deleted
- `login` - User logged in
- `logout` - User logged out
- `register` - New user registered
- `password_change` - Password changed
- `permission_grant` - Permission granted
- `permission_revoke` - Permission revoked
- `role_assign` - Role assigned to user
- `role_remove` - Role removed from user

### 3. Implementation Strategy

**Automatic Logging** (via Interceptor):
- Intercept all controller methods
- Auto-log CRUD operations
- Extract before/after values
- Capture request metadata

**Manual Logging** (via Service):
- For complex operations
- For authentication events
- For permission changes
- For custom actions

**Query Capabilities**:
- Filter by user
- Filter by resource
- Filter by action
- Filter by date range
- Pagination support
- Export to CSV (optional)

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

### Audit Module
- [ ] AuditModule created
- [ ] AuditService implemented
- [ ] AuditRepository implemented (tenant-scoped)
- [ ] AuditInterceptor created (optional)

### Audit Service Methods
- [ ] log() - Create audit log entry
- [ ] findAll() - Query audit logs dengan filters
- [ ] findByUser() - Get user's audit trail
- [ ] findByResource() - Get resource's audit trail
- [ ] findByAction() - Get logs by action type
- [ ] count() - Count audit logs

### Integration
- [ ] Integrated dengan AuthService (login, logout, register, password change)
- [ ] Can manually log from any service
- [ ] IP address dan user agent captured
- [ ] Before/after values stored as JSON
- [ ] Tenant isolation working

### DTOs
- [ ] CreateAuditLogDto dengan validation
- [ ] QueryAuditLogDto dengan filters (user_id, resource, action, date range)

### Testing
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Can create audit log
- [ ] Can query audit logs
- [ ] Audit logs are tenant-scoped

---

## Cara Testing

### 1. Type Check & Lint

```bash
cd backend
npm run type-check
npm run lint
```

Expected: No errors

### 2. Test Manual Logging

Create test script `backend/src/scripts/test-audit.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuditService } from '../core/audit/audit.service';
import { TenantContextService } from '../common/context/tenant-context.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const auditService = app.get(AuditService);
  const tenantContext = app.get(TenantContextService);
  
  // Set tenant context
  tenantContext.setTenant({
    id: 1,
    schemaName: 'tenant_demo_company',
    slug: 'demo_company',
    name: 'Demo Company',
  });
  
  // Create audit log
  await auditService.log({
    user_id: 1,
    action: 'test',
    resource: 'test',
    resource_id: 1,
    description: 'Test audit log',
    old_values: JSON.stringify({ name: 'Old Name' }),
    new_values: JSON.stringify({ name: 'New Name' }),
    ip_address: '127.0.0.1',
    user_agent: 'Test Agent',
  });
  
  console.log('✅ Audit log created');
  
  // Query audit logs
  const logs = await auditService.findAll({ limit: 10 });
  console.log('✅ Found', logs.length, 'audit logs');
  console.log(logs);
  
  await app.close();
}

bootstrap();
```

Run test:
```bash
npm run test:audit
```

Expected: Audit log created and retrieved

### 3. Test Integration dengan Auth

**Register User**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"audit@test.com","password":"Test123!@#","name":"Audit Test"}'
```

Check audit_logs table:
```sql
SET search_path TO tenant_demo_company, public;
SELECT * FROM audit_logs WHERE action = 'register' ORDER BY created_at DESC LIMIT 1;
```

Expected: Audit log entry untuk register action

**Login User**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"audit@test.com","password":"Test123!@#"}'
```

Check audit_logs:
```sql
SELECT * FROM audit_logs WHERE action = 'login' ORDER BY created_at DESC LIMIT 1;
```

Expected: Audit log entry untuk login action

### 4. Test Query Filters

Query by user:
```bash
curl -X GET "http://localhost:3000/api/audit?user_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Query by resource:
```bash
curl -X GET "http://localhost:3000/api/audit?resource=users" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Query by action:
```bash
curl -X GET "http://localhost:3000/api/audit?action=login" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Query by date range:
```bash
curl -X GET "http://localhost:3000/api/audit?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Implementasi Notes

### Audit Service

```typescript
import { Injectable } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  /**
   * Create audit log entry
   */
  async log(dto: CreateAuditLogDto): Promise<void> {
    await this.auditRepository.create({
      user_id: dto.user_id,
      action: dto.action,
      resource: dto.resource,
      resource_id: dto.resource_id,
      description: dto.description,
      old_values: dto.old_values,
      new_values: dto.new_values,
      ip_address: dto.ip_address,
      user_agent: dto.user_agent,
      created_at: new Date(),
    });
  }

  /**
   * Query audit logs with filters
   */
  async findAll(query: QueryAuditLogDto) {
    return this.auditRepository.findAll(query);
  }

  /**
   * Get user's audit trail
   */
  async findByUser(userId: number, limit = 100) {
    return this.auditRepository.findByUser(userId, limit);
  }

  /**
   * Get resource's audit trail
   */
  async findByResource(resource: string, resourceId: number) {
    return this.auditRepository.findByResource(resource, resourceId);
  }
}
```

### Integration dengan AuthService

```typescript
// In auth.service.ts

async login(dto: LoginDto, ipAddress: string, userAgent: string) {
  // ... existing login logic ...

  // Audit log
  await this.auditService.log({
    user_id: user.id,
    action: 'login',
    resource: 'auth',
    resource_id: user.id,
    description: `User ${user.email} logged in`,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  return result;
}

async logout(userId: number, token: string) {
  // ... existing logout logic ...

  // Audit log
  await this.auditService.log({
    user_id: userId,
    action: 'logout',
    resource: 'auth',
    resource_id: userId,
    description: 'User logged out',
  });

  return { message: 'Logout berhasil' };
}
```

### Repository dengan Tenant Isolation

```typescript
@Injectable()
export class AuditRepository {
  constructor(
    @Inject('DRIZZLE') private readonly db: NodePgDatabase<typeof tenantSchema>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private async withTenantSchema<T>(callback: () => Promise<T>): Promise<T> {
    const schemaName = this.tenantContext.getSchemaName();
    await this.db.execute(`SET search_path TO ${schemaName}, public`);
    try {
      return await callback();
    } finally {
      await this.db.execute('SET search_path TO public');
    }
  }

  async create(data: NewAuditLog): Promise<void> {
    await this.withTenantSchema(async () => {
      await this.db.insert(auditLogs).values(data);
    });
  }

  async findAll(query: QueryAuditLogDto): Promise<AuditLog[]> {
    return this.withTenantSchema(async () => {
      let queryBuilder = this.db.select().from(auditLogs);

      if (query.user_id) {
        queryBuilder = queryBuilder.where(eq(auditLogs.user_id, query.user_id));
      }
      if (query.resource) {
        queryBuilder = queryBuilder.where(eq(auditLogs.resource, query.resource));
      }
      if (query.action) {
        queryBuilder = queryBuilder.where(eq(auditLogs.action, query.action));
      }

      return queryBuilder
        .orderBy(desc(auditLogs.created_at))
        .limit(query.limit || 100);
    });
  }
}
```

---

## Security Notes

1. **Immutable Logs**: Audit logs should NEVER be deleted atau modified (no update/delete operations)
2. **Sensitive Data**: Don't log passwords atau sensitive PII in old_values/new_values
3. **Access Control**: Only admins should view audit logs
4. **Retention**: Consider log retention policy (e.g., keep for 1 year)
5. **Performance**: Audit logging is async (don't block main operations)

---

## Documentation References

- ERD-DATABASE.md Section 2.8 - Audit logs table schema
- FEATURE-LIST.md Section 7 - Audit log module requirements
- TECHNICAL-ARCHITECTURE.md Section 5.4 - Audit system design

---

## Next Task

Setelah task ini selesai:
- **Week 8-9 Complete!**
- Lanjut ke **Week 10-11: CLI Builder Tool Development**

---

## Output Expected

Setelah task selesai:
1. AuditModule fully implemented
2. Audit logs created untuk semua auth events
3. Can query audit logs dengan filters
4. Before/after values stored
5. IP address dan user agent captured
6. Tenant isolation working
7. Type-check passing
8. Lint passing

**Audit Trail Available For**:
- ✅ User registration
- ✅ User login
- ✅ User logout
- ✅ Password changes
- ✅ Role assignments (future)
- ✅ Permission grants (future)
- ✅ CRUD operations (via interceptor - optional)
