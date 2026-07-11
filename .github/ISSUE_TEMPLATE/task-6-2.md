---
name: Task 6.2 - Audit Log System Per-Tenant Fix
about: Fix audit log FK constraints untuk multi-tenant support
title: '[TASK-6.2] Audit Log System Per-Tenant Fix'
labels: 'bug, audit, multi-tenancy, P1-high'
assignees: ''
---

## 📋 Task Information

**Task ID**: 6.2  
**Title**: Audit Log System Per-Tenant Fix  
**Priority**: P1 - HIGH  
**Estimated Time**: 4 hours  
**Status**: 🔴 NOT STARTED

---

## 🎯 Objective

Fix audit log system untuk support multi-tenancy dengan benar. Sekarang audit logging disabled karena FK constraint error - `user_id` references `public.users` padahal seharusnya references `tenant_X.users`. Implement proper per-tenant audit logging dengan schema isolation.

---

## 📝 Background

**Current State**:
- Audit logging DISABLED di auth.service.ts
- FK constraint error: references public.users instead of tenant.users
- Audit logs tidak ter-record
- Compliance requirement tidak terpenuhi

**Error**:
```typescript
// backend/src/modules/auth/auth.service.ts (line 45)
// TODO: Fix audit log FK constraint issue
// await this.auditService.log({ ... });  // COMMENTED OUT
```

**Problem Root Cause**:
```sql
-- Current schema (WRONG):
CREATE TABLE tenant_1.audit_logs (
  user_id BIGINT REFERENCES public.users(id)  -- ❌ Wrong schema!
  ...
);

-- Should be:
CREATE TABLE tenant_1.audit_logs (
  user_id BIGINT REFERENCES tenant_1.users(id)  -- ✅ Correct
  ...
);
```

---

## 🔧 Technical Requirements

### Solution Options Analysis

#### Option A: Fix FK to Reference Tenant Schema (RECOMMENDED)
**Pros**:
- Proper referential integrity
- Follows database best practices
- Enforces data consistency

**Cons**:
- Need schema migration for each tenant
- More complex FK management

#### Option B: Remove FK Constraint
**Pros**:
- Simpler implementation
- No schema migration needed
- Faster writes

**Cons**:
- No referential integrity
- Orphaned records possible
- Not best practice

#### Option C: Composite FK with Tenant ID
**Pros**:
- Single audit_logs table in public schema
- Centralized auditing

**Cons**:
- Breaks tenant isolation
- Performance issues at scale
- Security concerns

**DECISION**: Go with **Option A** - proper FK per tenant schema

---

## 📁 Files to Create/Modify

### Modified Files
```
backend/src/database/schema/tenant/audit-logs.schema.ts
backend/src/modules/audit/audit.repository.ts
backend/src/modules/audit/audit.service.ts
backend/src/modules/auth/auth.service.ts
backend/src/core/cli-metadata/cli-metadata.service.ts
```

### Migration Files
```
backend/src/database/migrations/
└── YYYYMMDDHHMMSS_fix_audit_log_fk.sql
```

---

## 🧪 Acceptance Criteria

### Functional Requirements
- [ ] Audit logs table references correct tenant schema users
- [ ] FK constraint enforces referential integrity
- [ ] Audit logging re-enabled di auth.service.ts
- [ ] Audit logging re-enabled di cli-metadata.service.ts
- [ ] Audit logs properly recorded per tenant
- [ ] No FK constraint errors

### Data Integrity
- [ ] Cannot insert audit log dengan invalid user_id
- [ ] Cannot delete user yang punya audit logs (CASCADE atau RESTRICT)
- [ ] Audit logs isolated per tenant schema

### Performance
- [ ] Audit log writes tidak slow down operations (<50ms)
- [ ] Proper indexes on user_id, resource, action
- [ ] Batch insert support untuk multiple logs

### Testing
- [ ] Unit tests untuk audit repository
- [ ] Integration tests dengan tenant switching
- [ ] Test FK constraint enforcement
- [ ] Test audit log retrieval per tenant

---

## 🧩 Implementation Steps

### Step 1: Update Audit Log Schema (60 min)
**File**: `backend/src/database/schema/tenant/audit-logs.schema.ts`

```typescript
export const auditLogs = pgTable('audit_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // ✅ References tenant.users
  resource: varchar('resource', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  resourceId: bigint('resource_id', { mode: 'number' }),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Step 2: Generate Migration (30 min)
```bash
cd backend
npm run db:generate
```

**Manual Migration** (if needed):
```sql
-- Drop old FK if exists
ALTER TABLE tenant_1.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Add correct FK
ALTER TABLE tenant_1.audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES tenant_1.users(id) ON DELETE CASCADE;
```

### Step 3: Update Audit Repository (45 min)
**File**: `backend/src/modules/audit/audit.repository.ts`

Ensure `withTenantSchema()` is used properly:
```typescript
async log(dto: CreateAuditLogDto): Promise<AuditLog> {
  return this.withTenantSchema(async () => {
    const [log] = await this.db
      .insert(tenantSchema.auditLogs)
      .values({
        userId: dto.userId,
        resource: dto.resource,
        action: dto.action,
        // ... other fields
      })
      .returning();
    return log;
  });
}
```

### Step 4: Re-enable Audit Logging (30 min)
**Files**:
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/core/cli-metadata/cli-metadata.service.ts`

```typescript
// ✅ Uncomment and test
await this.auditService.log({
  userId: user.id,
  resource: 'auth',
  action: 'login',
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
});
```

### Step 5: Apply to All Tenants (30 min)
Script untuk migrate semua tenant schemas:
```typescript
// backend/scripts/migrate-audit-fk.ts
const tenants = await db.select().from(publicSchema.tenants);
for (const tenant of tenants) {
  await db.execute(sql.raw(`
    ALTER TABLE ${tenant.schemaName}.audit_logs 
    DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
    
    ALTER TABLE ${tenant.schemaName}.audit_logs 
    ADD CONSTRAINT audit_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES ${tenant.schemaName}.users(id) 
    ON DELETE CASCADE;
  `));
}
```

### Step 6: Testing (60 min)
- Test login audit log
- Test CRUD audit logs
- Test FK constraint (try invalid user_id)
- Test tenant isolation
- Test performance

---

## 📊 Database Schema Changes

### Before (WRONG)
```sql
-- Each tenant schema
CREATE TABLE tenant_X.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id),  -- ❌ Wrong!
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  ...
);
```

### After (CORRECT)
```sql
-- Each tenant schema
CREATE TABLE tenant_X.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES tenant_X.users(id) ON DELETE CASCADE,  -- ✅ Correct!
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  resource_id BIGINT,
  old_values TEXT,
  new_values TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON tenant_X.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON tenant_X.audit_logs(resource);
CREATE INDEX idx_audit_logs_action ON tenant_X.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON tenant_X.audit_logs(created_at);
```

---

## 🔗 Related Tasks

**Dependencies**:
- ✅ Task 6.1: Tenant Detection Middleware
- ✅ Task 3.1: Authentication Module

**Related Issues**:
- Known Issue: Audit log FK constraints
- Compliance requirement: Activity logging

---

## 📚 References

**Documentation**:
- `docs/SESSION-SUMMARY-AUTH-PERMISSIONS.md` - Known Issues section
- `docs/TECHNICAL-ARCHITECTURE.md` - Audit system
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)

**Code References**:
- `backend/src/modules/audit/audit.service.ts`
- `backend/src/modules/audit/audit.repository.ts`
- `backend/src/database/schema/tenant/audit-logs.schema.ts`

---

## ✅ Definition of Done

- [ ] Schema updated dengan correct FK
- [ ] Migration generated & applied
- [ ] Audit logging re-enabled
- [ ] FK constraint working properly
- [ ] All existing tenants migrated
- [ ] Tests passing
- [ ] No FK errors in logs
- [ ] Documentation updated
- [ ] Git committed
- [ ] Issue closed

---

## 🚀 Testing Guide

### Test FK Constraint
```sql
-- Should FAIL (user doesn't exist)
INSERT INTO tenant_1.audit_logs (user_id, resource, action)
VALUES (99999, 'test', 'create');
-- ERROR: violates foreign key constraint

-- Should SUCCEED (valid user)
INSERT INTO tenant_1.audit_logs (user_id, resource, action)
VALUES (1, 'test', 'create');
-- INSERT 0 1
```

### Test Cascade Delete
```sql
-- Create test user
INSERT INTO tenant_1.users (email, password) VALUES ('test@example.com', 'hash');

-- Create audit log
INSERT INTO tenant_1.audit_logs (user_id, resource, action) 
VALUES ((SELECT id FROM tenant_1.users WHERE email = 'test@example.com'), 'test', 'create');

-- Delete user (should cascade delete audit logs)
DELETE FROM tenant_1.users WHERE email = 'test@example.com';

-- Verify audit log deleted
SELECT * FROM tenant_1.audit_logs WHERE user_id = ...;
-- Should return 0 rows
```

### Test API
```bash
# Login (should create audit log)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: tenant_1" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Check audit log
psql -U postgres -d platform_cms -c "SELECT * FROM tenant_1.audit_logs WHERE resource = 'auth' ORDER BY created_at DESC LIMIT 5;"
```

---

## 📝 Notes

**Important**:
- Backup database before migration
- Test on single tenant first
- Monitor FK constraint performance
- Consider batch operations for large audit logs

**Future Enhancements**:
- Audit log retention policy (archive old logs)
- Audit log search/filter API
- Audit log export functionality
- Real-time audit log streaming

