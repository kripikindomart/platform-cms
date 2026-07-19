# Testing Organization Selection Flow

## ✅ Backend Status

### Database
- ✅ Menus tables created in `tenant_demo_company` schema
- ✅ 12 tables total in tenant schema (includes menus & menu_items)
- ✅ Only 1 active tenant: `demo_company`
- ✅ Orphaned tenants deleted (demo, tenant_1, tenant_2)

### API Endpoints
- ✅ `POST /api/auth/login` - Returns JWT token
- ✅ `GET /api/users/my-tenants` - Returns user's accessible tenants (NO tenant header required)
- ✅ `GET /api/menuses/for-user` - Returns menus for user (requires tenant header)

### Test Commands

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo_company" \
  -d '{"email":"admin@platform.com","password":"Admin123456"}'

# 2. Get my tenants (NO X-Tenant-Slug header!)
TOKEN="<your_token_here>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users/my-tenants

# Expected response:
{
  "user_id": "7",
  "user_email": "admin@platform.com",
  "tenants": [
    {
      "id": "7",
      "slug": "demo_company",
      "name": "Demo Company",
      "logo_url": null,
      "is_active": true,
      "role_name": "superadmin",
      "role_display_name": "Super Administrator",
      "user_role_assigned_at": "2026-07-16 18:37:22.937738+07"
    }
  ],
  "default_tenant": "demo_company"
}

# 3. Get menus (WITH X-Tenant-Slug header!)
curl -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Slug: demo_company" \
  http://localhost:3000/api/menuses/for-user
```

## 🎯 Frontend Flow

### Expected User Journey
1. User visits `/login`
2. User enters credentials
3. **NEW**: After login → redirect to `/organizations`
4. **NEW**: User sees list of organizations they have access to
5. **NEW**: User clicks on organization card
6. **NEW**: Redirect to `/org/{tenant_slug}/dashboard` or `/org/{tenant_slug}/portal`
7. Frontend automatically sets `X-Tenant-Slug` header from URL

### URL Structure
- Old: `/portal` → `/dashboard` → `/roles`
- **New**: `/org/demo_company/portal` → `/org/demo_company/dashboard` → `/org/demo_company/roles`

### Frontend Implementation
- ✅ `use-tenant.ts` hook extracts tenant from URL
- ✅ API client automatically adds `X-Tenant-Slug` header
- ✅ Organizations page lists tenants with role badges
- ✅ Auto-redirect if user has only 1 tenant
- ✅ Portal page shows module cards

## 🔧 Implementation Details

### Backend Changes
1. **UsersController** - Added `getMyTenants()` endpoint
   - Manual JWT verification (no tenant context)
   - Decorated with `@Public()` decorator
2. **TenantGuard** - Skip validation for `/users/my-tenants`
   - Checks route path before tenant extraction
   - Returns true immediately if skipped
3. **UsersService** - Added `getUserTenants(userId)`
   - Queries all active tenants from public schema
   - Checks user_roles in each tenant schema
   - Returns tenant list with user's role per tenant

### Frontend Changes
1. **Login redirect** - Changed from `/portal` to `/organizations`
2. **New routes** - `/org/[tenant]/dashboard`, `/org/[tenant]/portal`
3. **useTenant() hook** - Extracts tenant slug from URL
4. **Organizations page** - Lists tenants with role info

## 🚀 Next Steps

1. ✅ Test frontend by visiting http://localhost:3001/login
2. ✅ Verify redirect to /organizations
3. ✅ Check tenant list loads correctly
4. ✅ Click on "Demo Company" card
5. ✅ Verify portal loads without errors
6. Create seed data for menus (optional)
7. Test dashboard widgets load correctly

## 📝 Notes

- Single tenant auto-redirects after 1 second
- Tenant selection saved to cookie + localStorage
- Backend needs both endpoints: with/without tenant context
- Frontend prefixes all routes with `/org/{tenant}/`
