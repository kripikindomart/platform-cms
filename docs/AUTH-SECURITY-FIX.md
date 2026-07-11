# Authentication & Authorization Security Fix

## Issues Identified

### 1. JWT Strategy Registration Issue
**Problem**: JWT Strategy tidak ter-register dengan benar, menyebabkan "Unknown authentication strategy 'jwt'" error
**Impact**: CRITICAL - Semua protected endpoints tidak bisa diakses
**Root Cause**: 
- PassportModule registered tapi strategy mungkin tidak ter-inject dengan benar
- Global guard tidak di-setup

### 2. Tenant Context dalam Auth Flow
**Problem**: Login endpoint butuh tenant context tapi belum di-set sebelum query database
**Impact**: HIGH - Login gagal karena tenant context not set
**Status**: FIXED (manually set tenant context di auth.controller)
**TODO**: Implement tenant detection dari subdomain/header

### 3. Audit Log FK Constraint Issue
**Problem**: Audit logs FK constraint reference public.users padahal users ada di tenant schema
**Impact**: MEDIUM - Audit logging gagal
**Status**: TEMPORARILY DISABLED
**TODO**: Fix FK constraint atau separate audit logs per tenant

### 4. Permission System Integration
**Problem**: Generated modules tidak integrate dengan CASL permission system
**Impact**: HIGH - Authorization tidak enforce
**Current**: Manual @CheckPolicies() decorator per endpoint
**TODO**: Auto-generate permission checks di template

### 5. Module Registration per Tenant
**Problem**: Tidak ada mekanisme enable/disable module per tenant
**Impact**: HIGH - Semua tenant dapat akses semua module
**TODO**: Implement tenant_modules table dan middleware check

### 6. Database Schema Mismatch
**Problem**: Manual SQL seed tidak match dengan TypeScript schema (missing columns)
**Impact**: MEDIUM - Runtime errors saat CRUD operations
**Status**: FIXED manually (added is_active, description columns)
**TODO**: Use proper migration system instead of manual SQL

## Implementation Plan

### Phase 1: Fix Core Authentication (CRITICAL)
1. Setup Global JWT Auth Guard
2. Verify JWT Strategy registration
3. Test protected endpoints
4. Document proper auth flow

### Phase 2: Module-Level Authorization
1. Create permission auto-generation in CLI generator
2. Update controller template with @CheckPolicies() decorator
3. Create permission seeder per module
4. Test CRUD with permissions

### Phase 3: Tenant Module Management
1. Create tenant_modules table
2. Create module registration service
3. Add module availability middleware
4. Update CLI to register/unregister modules per tenant

### Phase 4: Security Hardening
1. Fix audit log FK constraints
2. Implement proper tenant detection (subdomain/header)
3. Add rate limiting per tenant
4. Add API key authentication option
5. Security audit & penetration testing

## Priority Order
1. Global JWT Auth Guard setup (TODAY)
2. Permission integration in generator (TODAY)
3. Tenant module management (NEXT)
4. Security hardening (NEXT WEEK)

## Files to Modify

### Core Auth
- `backend/src/app.module.ts` - Add global JWT guard
- `backend/src/modules/auth/auth.module.ts` - Verify strategy export
- `backend/src/main.ts` - Add security middleware

### CLI Generator
- `cli/src/generators/crud.generator.ts` - Add permission generation
- `cli/templates/backend/module/controller.hbs` - Add @CheckPolicies()
- `cli/src/utils/permission-helper.ts` - NEW - Permission utility

### Tenant Module Management
- `backend/src/database/schema/public/tenant-modules.schema.ts` - NEW
- `backend/src/modules/tenant-modules/` - NEW module
- `backend/src/common/middleware/module-availability.middleware.ts` - NEW

### Documentation
- `docs/AUTHENTICATION-GUIDE.md` - Complete auth guide
- `docs/AUTHORIZATION-GUIDE.md` - Permission & CASL guide
- `docs/TENANT-MANAGEMENT-GUIDE.md` - Multi-tenancy guide
