# BUGFIX: Current User Protection di Tenant Detail Page

## Masalah

User MASIH BISA klik switch untuk menonaktifkan akun sendiri di halaman detail tenant (tab Users), meskipun sudah ada implementasi protection dengan `isCurrentUser()`.

**Symptom**:
- Switch toggle TIDAK disabled untuk current user
- Label "(You)" TIDAK muncul
- Checkbox TIDAK disabled untuk current user
- User bisa nonaktifkan akun sendiri (BERBAHAYA!)

## Root Cause

**Tiga masalah yang saling terkait:**

### 1. API Client Kirim Tenant Header ke `/users/me`
Frontend API client mengirim tenant header untuk semua request, termasuk `/users/me`:

```typescript
// [X] SEBELUM (SALAH)
const skipTenant = endpoint.includes('/auth/') || endpoint.includes('/users/my-tenants');

// [OK] SESUDAH (BENAR)
const skipTenant = endpoint.includes('/auth/') || 
                  endpoint.includes('/users/my-tenants') ||
                  endpoint.includes('/users/me');
```

### 2. JwtAuthGuard Butuh Tenant Context untuk Load Roles
Backend `JwtAuthGuard` selalu call `findByIdWithRoles()` yang butuh tenant context:

```typescript
// [X] SEBELUM (SALAH)
// Always load roles - needs tenant context
const user = await this.usersService.findByIdWithRoles(payload.sub);

// [OK] SESUDAH (BENAR)
// Skip role loading for /users/me endpoints
if (skipRoleLoading) {
  user = await this.usersService.findById(payload.sub); // No tenant needed
} else {
  user = await this.usersService.findByIdWithRoles(payload.sub); // Needs tenant
}
```

### 3. Type Mismatch: user.id STRING vs currentUserId NUMBER
Frontend comparison gagal karena type mismatch:

```typescript
// [X] SEBELUM (SALAH)
const isCurrentUser = (user: any) => {
  return user.id === currentUserId; // '10' === 10 → false
};

// [OK] SESUDAH (BENAR)
const isCurrentUser = (user: any) => {
  const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
  return userId === currentUserId; // 10 === 10 → true
};
```

**Kenapa ini masalah?**
1. Backend `TenantGuard` skip validation untuk `/users/me` → tenant context TIDAK di-set
2. Backend `JwtAuthGuard` tetap call `findByIdWithRoles()` → butuh tenant context → ERROR
3. Frontend API request gagal dengan 401 Unauthorized
4. Frontend fallback ke JWT decode → berhasil extract user ID as NUMBER
5. Tapi `user.id` dari API response adalah STRING
6. Comparison `'10' === 10` → `false`
7. `isCurrentUser()` return `false`
8. Protection TIDAK jalan

## File yang Diubah

### 1. `frontend/lib/api/client.ts`

**GET method** - Skip tenant header untuk `/users/me`:
```typescript
async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
  const url = this.buildURL(endpoint, config?.params);
  
  // Skip tenant header for auth endpoints and user profile
  const skipTenant = endpoint.includes('/auth/') || 
                    endpoint.includes('/users/my-tenants') ||
                    endpoint.includes('/users/me');
  
  const response = await fetch(url, {
    method: 'GET',
    headers: this.getHeaders(config?.headers, skipTenant),
    credentials: 'include',
    ...config,
  });

  return this.handleResponse<T>(response);
}
```

**PUT method** - Skip tenant header untuk `/users/me/preferences`:
```typescript
async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
  const url = this.buildURL(endpoint, config?.params);
  
  // Skip tenant header for user preferences
  const skipTenant = endpoint.includes('/users/me');
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: this.getHeaders(config?.headers, skipTenant),
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
    ...config,
  });

  return this.handleResponse<T>(response);
}
```

### 2. `backend/src/modules/auth/guards/jwt-auth.guard.ts`

**Skip role loading** untuk endpoints yang tidak butuh tenant context:

```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  // ... JWT verification code ...

  // Check if this is a tenant-free endpoint
  const skipRoleLoading = this.shouldSkipRoleLoading(request);

  let user: any;

  if (skipRoleLoading) {
    // For /users/me and /users/me/preferences - load basic user info only
    // No tenant context needed, no roles needed
    user = await this.usersService.findById(payload.sub);
  } else {
    // For all other endpoints - load full user with roles for CASL
    // Tenant context must be set by TenantGuard before this
    user = await this.usersService.findByIdWithRoles(payload.sub);
  }

  // ... rest of code ...
}

/**
 * Check if we should skip role loading for this endpoint
 */
private shouldSkipRoleLoading(request: Request): boolean {
  const skipRoutes = [
    '/api/users/me',
    '/api/users/me/preferences',
    '/users/me',
    '/users/me/preferences',
  ];

  return skipRoutes.some(route => 
    request.url === route || 
    request.path === route ||
    request.url.startsWith(route) || 
    request.path.startsWith(route)
  );
}
```

### 3. `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx`

**Enhanced debug logging** dan **type-safe comparison**:

```typescript
// Helper: Check if this is the currently logged-in user
const isCurrentUser = (user: any) => {
  if (!currentUserId) {
    console.log('[TENANT DETAIL] WARNING: currentUserId is null, protection DISABLED');
    return false;
  }
  
  // Convert both to numbers for comparison (handle string vs number)
  const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
  const isCurrent = userId === currentUserId;
  
  console.log('[TENANT DETAIL] Checking user:', {
    userId: user.id,
    userIdParsed: userId,
    userEmail: user.email,
    currentUserId: currentUserId,
    isCurrent: isCurrent
  });
  
  return isCurrent;
};
```

### 4. `frontend/app/(private)/org/[tenant]/portal/users/components/users-table.tsx`

**Type-safe comparison** untuk konsistensi:

```typescript
// Helper: Check if this is the currently logged-in user
const isCurrentUser = (user: User) => {
  if (!currentUserId) return false;
  
  // Convert both to numbers for comparison (handle string vs number)
  const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
  return userId === currentUserId;
};
```

## Testing Steps

### 1. Restart Frontend & Backend
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Login ke Aplikasi
- Buka http://localhost:3000
- Login dengan user yang valid
- Catat email user yang login (contoh: admin@example.com)

### 3. Test Protection di Tenant Detail
1. **Navigasi ke Tenants list**: http://localhost:3000/org/{tenant}/portal/tenants
2. **Klik detail tenant** yang current user adalah member
3. **Klik tab "Users"**
4. **Cari current user** (email yang sama dengan login)

**Expected Result**:
- [OK] Checkbox di sebelah kiri user DISABLED (tidak bisa di-check)
- [OK] Switch toggle DISABLED (tidak bisa di-klik)
- [OK] Label "(You)" muncul di sebelah status
- [OK] "Select All" checkbox TIDAK include current user
- [OK] Bulk action "Nonaktifkan" TIDAK include current user

### 4. Verifikasi Console Logs

**Buka Browser DevTools Console**, harusnya muncul log seperti ini:

```
[TENANT DETAIL] Fetching current user from API...
[TENANT DETAIL] Current user fetched from API: {id: 1, email: "admin@example.com", name: "Admin", ...}
[TENANT DETAIL] Setting currentUserId to: 1
```

**Saat render tabel users**, sekarang harusnya show parsed ID:
```
[TENANT DETAIL] Checking user: {userId: "10", userIdParsed: 10, userEmail: "admin@example.com", currentUserId: 10, isCurrent: true}
[TENANT DETAIL] Checking user: {userId: "11", userIdParsed: 11, userEmail: "other@example.com", currentUserId: 10, isCurrent: false}
```

**Kalau masih gagal** (API call error):
```
[TENANT DETAIL] API call failed: {message: "...", status: 401, ...}
[TENANT DETAIL] Trying JWT fallback...
[TENANT DETAIL] Current user ID from JWT token: 1
```

## Rollback Plan

Kalau ada masalah, rollback dengan:

```bash
git checkout HEAD -- frontend/lib/api/client.ts
git checkout HEAD -- frontend/app/\(private\)/org/\[tenant\]/portal/tenants/\[id\]/page.tsx
```

## Related Files

**Backend** (DIUBAH):
- `backend/src/modules/auth/guards/jwt-auth.guard.ts` - Skip role loading untuk `/users/me`
- `backend/src/modules/users/users.controller.ts` - Endpoint `/users/me` sudah ada (tidak diubah)
- `backend/src/common/guards/tenant.guard.ts` - Skip routes sudah include `/users/me` (tidak diubah)

**Frontend** (DIUBAH):
- `frontend/lib/api/client.ts` - Skip tenant header untuk `/users/me`
- `frontend/app/(private)/org/[tenant]/portal/tenants/[id]/page.tsx` - Enhanced logging + type-safe comparison
- `frontend/app/(private)/org/[tenant]/portal/users/components/users-table.tsx` - Type-safe comparison

**Supporting Files** (TIDAK DIUBAH):
- `frontend/lib/utils/jwt.ts` - JWT helper untuk fallback
- `frontend/lib/api/services/auth.service.ts` - `me()` function sudah benar

## Success Criteria

- [OK] `GET /api/users/me` berhasil dipanggil TANPA tenant header
- [OK] `currentUserId` ter-set dengan benar di state
- [OK] `isCurrentUser()` return `true` untuk current user
- [OK] Switch toggle DISABLED untuk current user
- [OK] Checkbox DISABLED untuk current user
- [OK] Label "(You)" muncul untuk current user
- [OK] "Select All" tidak include current user
- [OK] Bulk action tidak include current user

## Notes

1. **JWT Fallback**: Kalau API call gagal (401, expired token), akan fallback decode JWT token client-side untuk extract user ID. Ini CUKUP untuk protection, tapi user harus login ulang untuk API calls lainnya.

2. **Debug Logs**: Console logs ditambahkan untuk troubleshooting. Bisa dihapus nanti kalau sudah stabil.

3. **Consistency**: Pattern yang sama sudah diterapkan di:
   - `frontend/app/(private)/org/[tenant]/portal/users/components/users-table.tsx` (Users page)
   - `frontend/app/(private)/org/[tenant]/portal/tenants/page.tsx` (Tenants list - current tenant protection)

---

**Fixed**: 2026-07-19  
**Issue**: Current user protection tidak jalan karena:
1. Frontend API client kirim tenant header ke `/users/me`
2. Backend JwtAuthGuard selalu load roles (butuh tenant context)
3. Frontend type mismatch: `user.id` STRING vs `currentUserId` NUMBER  
**Solution**: 
1. Frontend: Skip tenant header untuk `/users/me`
2. Backend: Skip role loading untuk `/users/me` (use `findById` instead of `findByIdWithRoles`)
3. Frontend: Parse `user.id` to number before comparison
