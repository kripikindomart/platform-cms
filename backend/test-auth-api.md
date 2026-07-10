# Authentication API Testing

## Setup

1. Start the server:
```bash
npm run start:dev
```

2. Ensure test tenant exists:
```bash
npm run auth:setup
```

---

## Test Endpoints

### 1. Register New User

**Endpoint**: `POST /api/auth/register`

**Success Case**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test123!@#",
    "name": "John Doe",
    "phone": "+6281234567890"
  }'
```

Expected Response (201):
```json
{
  "message": "Registrasi berhasil",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+6281234567890",
    "avatar_url": null,
    "is_active": true,
    "is_verified": false,
    "last_login_at": null,
    "created_at": "2026-07-10T..."
  }
}
```

**Error Cases**:

Duplicate Email:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test123!@#",
    "name": "Jane Doe"
  }'
```

Expected Response (400):
```json
{
  "code": "EMAIL_EXISTS",
  "message": "Email sudah terdaftar",
  "errors": [
    {
      "field": "email",
      "message": "Email sudah digunakan"
    }
  ]
}
```

Weak Password:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak@example.com",
    "password": "weak",
    "name": "Weak User"
  }'
```

Expected Response (400):
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password minimal 8 karakter"
    }
  ]
}
```

---

### 2. Login User

**Endpoint**: `POST /api/auth/login`

**Success Case**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test123!@#"
  }'
```

Expected Response (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+6281234567890",
    "avatar_url": null,
    "is_active": true,
    "is_verified": false,
    "last_login_at": "2026-07-10T...",
    "created_at": "2026-07-10T..."
  }
}
```

**Save the access_token for next tests!**

**Error Cases**:

Invalid Credentials:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword"
  }'
```

Expected Response (401):
```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "Email atau password salah"
}
```

User Not Found:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notfound@example.com",
    "password": "Test123!@#"
  }'
```

Expected Response (401):
```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "Email atau password salah"
}
```

---

### 3. Test Protected Route (Get Profile)

**Note**: You'll need to create a test endpoint first. For now, test with any protected route.

For demonstration, you can test JWT validation by trying to access a protected endpoint without token:

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json"
```

Expected Response (401):
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

With valid token:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

### 4. Logout User

**Endpoint**: `POST /api/auth/logout`

**Requires**: Valid JWT token

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Expected Response (200):
```json
{
  "message": "Logout berhasil"
}
```

**After logout, the token should be blacklisted**. Try using it again:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Expected: Should still work (need to add blacklist check in strategy)

---

### 5. Change Password

**Endpoint**: `PATCH /api/auth/change-password`

**Requires**: Valid JWT token

**Success Case**:
```bash
curl -X PATCH http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "old_password": "Test123!@#",
    "new_password": "NewTest456!@#"
  }'
```

Expected Response (200):
```json
{
  "message": "Password berhasil diubah"
}
```

**Error Cases**:

Wrong Old Password:
```bash
curl -X PATCH http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "old_password": "WrongPassword",
    "new_password": "NewTest456!@#"
  }'
```

Expected Response (400):
```json
{
  "code": "INVALID_OLD_PASSWORD",
  "message": "Password lama tidak valid"
}
```

Weak New Password:
```bash
curl -X PATCH http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "old_password": "Test123!@#",
    "new_password": "weak"
  }'
```

Expected Response (400):
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [...]
}
```

---

## Testing Checklist

- [ ] Register new user with valid data → Success
- [ ] Register with duplicate email → Error 400
- [ ] Register with weak password → Error 400 (validation)
- [ ] Login with valid credentials → Success + JWT token
- [ ] Login with invalid password → Error 401
- [ ] Login with non-existent email → Error 401
- [ ] Access protected route without token → Error 401
- [ ] Access protected route with valid token → Success
- [ ] Logout with valid token → Success
- [ ] Change password with valid old password → Success
- [ ] Change password with wrong old password → Error 400
- [ ] Change password with weak new password → Error 400 (validation)

---

## Notes

1. **Tenant Context**: Currently hardcoded to tenant ID 1 in controller. In production, this should come from subdomain or custom header.

2. **Token Blacklist Check**: Need to add blacklist verification in JWT strategy for complete logout functionality.

3. **Session Management**: Sessions are stored in Redis but not actively validated. Consider adding session validation in JWT strategy.

4. **Rate Limiting**: Not implemented yet. Should add rate limiting to login endpoint (5 attempts/15min).

5. **Email Verification**: Email verification flow not implemented yet (is_verified flag is set but not enforced).

---

## Production TODOs

- [ ] Add rate limiting on auth endpoints
- [ ] Implement email verification
- [ ] Add token refresh mechanism
- [ ] Implement "Remember Me" functionality
- [ ] Add 2FA support
- [ ] Implement account lockout after failed attempts
- [ ] Add password reset via email
- [ ] Implement session management UI
- [ ] Add audit logging for all auth events
- [ ] Implement IP whitelist/blacklist
- [ ] Add device tracking
- [ ] Implement suspicious activity detection

