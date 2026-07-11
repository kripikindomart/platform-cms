---
name: Task 6.1 - Tenant Detection Middleware
about: Implement automatic tenant detection from request headers/subdomain
title: '[TASK-6.1] Tenant Detection Middleware'
labels: 'enhancement, multi-tenancy, P0-critical'
assignees: ''
---

## 📋 Task Information

**Task ID**: 6.1  
**Title**: Tenant Detection System  
**Priority**: P0 - CRITICAL  
**Estimated Time**: 3 hours  
**Status**: ✅ COMPLETE

**Implementation Note**: Implemented as **TenantGuard** instead of middleware for better control over execution order with JWT authentication.

---

## 🎯 Objective

✅ **COMPLETED** - Implemented automatic tenant detection system untuk extract tenant context dari HTTP request, load tenant data dari database, dan set ke TenantContextService.

**Implementation Approach**: TenantGuard (instead of middleware) for proper execution order control.

**Completion Date**: 2026-07-11  
**Files Implemented**:
- `backend/src/common/guards/tenant.guard.ts` (TenantGuard)
- `backend/src/app.module.ts` (Global APP_GUARD registration)
- `backend/src/modules/tenants/tenants.repository.ts` (findBySlug method)

**Test Results**: ✅ All acceptance criteria met
- Data isolation verified between tenant_1 and tenant_2
- Tenant switching working correctly
- Multi-tenancy fully functional

---

## 📝 Background

**Current State**:
- Controllers manually set tenant dengan hardcoded `tenant_1` di constructor
- Multi-tenancy tidak functional karena semua request ke tenant yang sama
- Tenant isolation tidak berfungsi
- Tidak ada automatic tenant detection

**Problems**:
```typescript
// ❌ Current: Hardcoded di setiap controller
constructor(
  private readonly categoriesService: CategoriesService,
  private readonly tenantContext: TenantContextService,
) {
  this.tenantContext.setTenant({
    id: 1,
    slug: 'tenant_1',
    name: 'Default Tenant',
    schemaName: 'tenant_1',
  });
}
```

**Desired State**:
```typescript
// ✅ After: Automatic via middleware
// Controllers tidak perlu set tenant manually
// Middleware detect dari request dan auto-set
```

---

## 🔧 Technical Requirements

### 1. Create Tenant Middleware
**File**: `backend/src/common/middleware/tenant.middleware.ts`

**Features**:
- Extract tenant identifier dari request (subdomain atau header)
- Load tenant data dari `public.tenants` table
- Validate tenant is_active = true
- Set tenant context via TenantContextService
- Handle tenant not found (404)
- Handle inactive tenant (403)

**Detection Strategy**:
1. **Priority 1**: Check `X-Tenant-Slug` custom header
2. **Priority 2**: Extract dari subdomain (e.g., `acme.platform-cms.com` → `acme`)
3. **Fallback**: Default tenant dari ENV atau error

### 2. Create Tenant Repository
**File**: `backend/src/modules/tenants/tenants.repository.ts`

**Methods**:
```typescript
async findBySlug(slug: string): Promise<Tenant | null>
async findByDomain(domain: string): Promise<Tenant | null>
async findById(id: number): Promise<Tenant | null>
```

### 3. Apply Middleware Globally
**File**: `backend/src/app.module.ts`

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/register', method: RequestMethod.POST },
        { path: 'api/health', method: RequestMethod.GET },
        { path: 'api-docs', method: RequestMethod.ALL },
        { path: 'api-docs/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
```

### 4. Remove Hardcoded Tenant dari Controllers
**Files to Update**:
- `backend/src/modules/categories/categories.controller.ts`
- `backend/src/modules/tags/tags.controller.ts`
- `backend/src/modules/products/products.controller.ts`

**Change**:
```typescript
// ❌ Remove this from constructor
this.tenantContext.setTenant({ ... });

// ✅ Controller sekarang clean
constructor(private readonly service: SomeService) {}
```

---

## 📁 Files to Create/Modify

### New Files
```
backend/src/common/middleware/
├── tenant.middleware.ts          # Main middleware
└── tenant.middleware.spec.ts     # Unit tests

backend/src/modules/tenants/
└── tenants.repository.ts         # New file (if not exists)
```

### Modified Files
```
backend/src/app.module.ts
backend/src/common/common.module.ts
backend/src/modules/tenants/tenants.module.ts
backend/src/modules/categories/categories.controller.ts
backend/src/modules/tags/tags.controller.ts
backend/src/modules/products/products.controller.ts
```

---

## 🧪 Acceptance Criteria

### Functional Requirements
- [x] ✅ Guard detects tenant dari `X-Tenant-Slug` header
- [x] ✅ Guard detects tenant dari subdomain (with BASE_DOMAIN config)
- [x] ✅ Guard loads tenant data dari database (public.tenants)
- [x] ✅ Guard validates tenant is active
- [x] ✅ Guard sets TenantContextService automatically
- [x] ✅ Controllers tidak perlu manual set tenant
- [x] ✅ Public routes (login, register) work dengan @Public() decorator
- [x] ✅ Swagger docs accessible

### Error Handling
- [x] ✅ Return 404 jika tenant not found
- [x] ✅ Return 403 jika tenant inactive
- [x] ✅ Return 400 jika tenant header/subdomain invalid
- [x] ✅ Clear error messages dalam Bahasa Indonesia

### Performance
- [x] ✅ Tenant context REQUEST-scoped (proper isolation)
- [x] ✅ Single database query per request untuk tenant
- [x] ✅ Minimal performance impact

### Testing
- [x] ✅ Multi-tenant data isolation verified
- [x] ✅ Tenant switching tested between requests
- [x] ✅ Cross-tenant access blocked (404)

---

## 🧩 Implementation Steps

### Step 1: Create Tenant Repository (30 min)
```bash
# If tenants.repository.ts doesn't exist
touch backend/src/modules/tenants/tenants.repository.ts
```

Implement methods:
- `findBySlug(slug: string)`
- `findByDomain(domain: string)`
- Cache results dengan TTL 5 menit

### Step 2: Create Tenant Middleware (60 min)
```bash
touch backend/src/common/middleware/tenant.middleware.ts
```

Implement:
- Extract tenant identifier dari request
- Load tenant menggunakan repository
- Validate tenant status
- Set TenantContextService
- Error handling

### Step 3: Register Middleware (15 min)
Update `app.module.ts`:
- Import TenantMiddleware
- Apply globally with excludes
- Add to CommonModule providers

### Step 4: Clean Up Controllers (30 min)
Remove hardcoded tenant dari:
- Categories controller
- Tags controller
- Products controller
- Auth controller (if needed)

### Step 5: Testing (45 min)
- Test dengan header `X-Tenant-Slug: tenant_1`
- Test dengan subdomain detection
- Test error cases
- Test tenant switching
- Test public routes

---

## 📊 Database Schema

**Tenants Table** (already exists):
```sql
-- public.tenants
id BIGINT PRIMARY KEY
name VARCHAR(255) NOT NULL
slug VARCHAR(100) UNIQUE NOT NULL
domain VARCHAR(255) UNIQUE
schema_name VARCHAR(100) UNIQUE NOT NULL
subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free'
subscription_expires_at TIMESTAMP
config TEXT
is_active BOOLEAN NOT NULL DEFAULT true
created_at TIMESTAMP NOT NULL DEFAULT NOW()
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
deleted_at TIMESTAMP
```

**Sample Data**:
```sql
INSERT INTO public.tenants (name, slug, schema_name, is_active)
VALUES 
  ('Default Tenant', 'tenant_1', 'tenant_1', true),
  ('Acme Corp', 'acme', 'tenant_acme', true),
  ('Beta Inc', 'beta', 'tenant_beta', true);
```

---

## 🔗 Related Tasks

**Dependencies**:
- ✅ Task 3.1: Authentication Module (COMPLETE)
- ✅ Task 5.4: CLI Generator with Tenant Support (COMPLETE)

**Blocks**:
- Task 6.2: Tenant Module Management System
- Task 6.3: Audit Log Per-Tenant Fix

**Related Issues**:
- #XX - Multi-tenancy architecture
- #XX - Schema isolation strategy

---

## 📚 References

**Documentation**:
- [NestJS Middleware](https://docs.nestjs.com/middleware)
- [Multi-tenancy Best Practices](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
- `docs/TECHNICAL-ARCHITECTURE.md` - Multi-tenancy section
- `docs/SESSION-SUMMARY-AUTH-PERMISSIONS.md` - Known issues

**Code References**:
- `backend/src/common/context/tenant-context.service.ts`
- `backend/src/common/interfaces/tenant.interface.ts`
- `backend/src/modules/tenants/tenants.service.ts`

---

## ✅ Definition of Done

- [ ] Code implemented sesuai requirements
- [ ] Unit tests written & passing
- [ ] Integration tests passing
- [ ] TypeScript compilation passing (no errors)
- [ ] Manual testing dengan Postman/curl
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Git committed dengan descriptive message
- [ ] Issue closed dengan summary

---

## 🚀 Testing Guide

### Manual Testing dengan Postman/curl

**Test 1: Header-based tenant detection**
```bash
# Should access tenant_1
curl -H "X-Tenant-Slug: tenant_1" \
     -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/categories

# Should access acme tenant
curl -H "X-Tenant-Slug: acme" \
     -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/categories
```

**Test 2: Tenant not found**
```bash
# Should return 404
curl -H "X-Tenant-Slug: nonexistent" \
     -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/categories
```

**Test 3: Inactive tenant**
```bash
# Update tenant to inactive
psql -U postgres -d platform_cms -c "UPDATE public.tenants SET is_active = false WHERE slug = 'beta';"

# Should return 403
curl -H "X-Tenant-Slug: beta" \
     -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/categories
```

**Test 4: Public routes (no tenant required)**
```bash
# Should work without tenant header
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password123"}'
```

---

## 📝 Notes

**Important Considerations**:
1. Middleware harus REQUEST-scoped untuk tenant isolation
2. TenantContextService sudah REQUEST-scoped (good!)
3. Cache tenant lookups untuk performance
4. Log tenant switch untuk debugging
5. Support both header dan subdomain untuk flexibility

**Security**:
- Validate tenant slug format (alphanumeric + dash only)
- Prevent SQL injection di tenant lookup
- Rate limit tenant lookups untuk prevent abuse

**Performance**:
- Consider Redis caching untuk tenant data
- Monitor database query performance
- Add metrics untuk tenant switching time

