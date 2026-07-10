# Task 3.1: Authentication Module Setup

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 6 jam  
**Dependencies**: Task 2.2, 2.4  
**Status**: Belum Dimulai

---

## Tujuan Task

Implement complete authentication system dengan JWT, user registration, login, logout, dan password management.

---

## Yang Akan Dikerjakan

### 1. Install Dependencies

```bash
cd backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcrypt
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt
```

### 2. Struktur File

File yang akan dibuat:

```
backend/src/modules/auth/
├── auth.module.ts              (baru) - Auth module
├── auth.controller.ts          (baru) - Auth endpoints
├── auth.service.ts             (baru) - Auth business logic
├── dto/
│   ├── register.dto.ts         (baru) - Registration DTO
│   ├── login.dto.ts            (baru) - Login DTO
│   ├── change-password.dto.ts  (baru) - Change password DTO
│   └── auth-response.dto.ts    (baru) - Response DTOs
├── guards/
│   ├── jwt-auth.guard.ts       (baru) - JWT guard
│   └── local-auth.guard.ts     (baru) - Local auth guard
├── strategies/
│   ├── jwt.strategy.ts         (baru) - JWT strategy
│   └── local.strategy.ts       (baru) - Local strategy
└── auth.service.spec.ts        (baru) - Unit tests

backend/src/modules/users/
├── users.module.ts             (baru) - Users module
├── users.service.ts            (baru) - Users business logic
├── users.repository.ts         (baru) - Users repository (extends BaseRepository)
└── dto/
    └── create-user.dto.ts      (baru) - Create user DTO

backend/src/common/decorators/
└── current-user.decorator.ts   (baru) - Current user decorator
```

### 3. Authentication Features

**Registration**:
- Email validation (unique, format)
- Password strength validation (min 8 chars, uppercase, lowercase, number)
- Hash password dengan bcrypt (cost factor 12)
- Create user record
- Auto-assign default role (user)
- Return success message

**Login**:
- Email + password authentication
- Verify user is_active
- Password verification dengan bcrypt
- Generate JWT token (24h expiry)
- Create session in Redis
- Update last_login_at, last_login_ip
- Audit log
- Return access_token + user info

**Logout**:
- Invalidate JWT token (blacklist in Redis)
- Delete session from Redis
- Audit log
- Return success message

**Change Password**:
- Verify old password
- Hash new password
- Update password_hash
- Update password_changed_at
- Audit log
- Return success message

### 4. JWT Configuration

**JWT Payload**:
```typescript
{
  sub: number;        // User ID
  email: string;      // User email
  tenantId: number;   // Tenant ID (untuk multi-tenancy)
  iat: number;        // Issued at
  exp: number;        // Expiration
}
```

**JWT Secret**: From environment variable `JWT_SECRET`  
**JWT Expiry**: 24 hours (86400 seconds)  
**Algorithm**: HS256

### 5. Session Management

**Session Storage**: Redis  
**Session Key Pattern**: `session:{userId}:{timestamp}`  
**Session TTL**: 24 hours  
**Session Data**:
```typescript
{
  userId: number;
  token: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}
```

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

### Dependencies
- [ ] Dependencies installed (@nestjs/jwt, @nestjs/passport, passport, passport-jwt, bcrypt)

### Modules & Services
- [ ] AuthModule created dan configured
- [ ] AuthService implemented dengan 4 methods (register, login, logout, changePassword)
- [ ] AuthController dengan 4 endpoints (POST /register, POST /login, POST /logout, PATCH /change-password)
- [ ] UsersModule created
- [ ] UsersService implemented
- [ ] UsersRepository extends BaseRepository

### DTOs
- [ ] RegisterDto dengan Zod validation
- [ ] LoginDto dengan Zod validation
- [ ] ChangePasswordDto dengan Zod validation
- [ ] AuthResponseDto created

### Guards & Strategies
- [ ] JwtStrategy implemented
- [ ] JwtAuthGuard created
- [ ] LocalStrategy implemented (optional)
- [ ] LocalAuthGuard created (optional)

### Decorators
- [ ] CurrentUser decorator implemented

### Security
- [ ] Password hashed dengan bcrypt (cost 12)
- [ ] JWT token generation working
- [ ] JWT token verification working
- [ ] Session stored in Redis
- [ ] Session expires after 24h

### Testing
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Unit tests untuk AuthService (recommended)
- [ ] Can register new user
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Can logout successfully
- [ ] Can change password

---

## Cara Testing

### 1. Type Check & Lint

```bash
cd backend
npm run type-check
npm run lint
```

Expected: No errors

### 2. Manual Testing dengan curl/httpie

**Register**:
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

Expected response:
```json
{
  "message": "Registrasi berhasil",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test123!@#"
  }'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "is_verified": false
  }
}
```

**Test Protected Route**:
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer {access_token}"
```

**Logout**:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer {access_token}"
```

**Change Password**:
```bash
curl -X PATCH http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "Test123!@#",
    "new_password": "NewTest456!@#"
  }'
```

### 3. Test Error Cases

**Duplicate Email**:
```bash
# Register same email twice
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "Test123!@#", "name": "John Doe"}'
```

Expected: 400 Bad Request dengan error "Email sudah terdaftar"

**Invalid Credentials**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "WrongPassword"}'
```

Expected: 401 Unauthorized dengan error "Email atau password salah"

**Weak Password**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "weak", "name": "Test"}'
```

Expected: 400 Bad Request dengan validation error

---

## Implementasi Notes

### Password Hashing

Use bcrypt dengan cost factor 12:

```typescript
import { hash, compare } from 'bcrypt';

// Hash password
const passwordHash = await hash(password, 12);

// Verify password
const isValid = await compare(password, passwordHash);
```

### JWT Configuration

Configure di `auth.module.ts`:

```typescript
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '24h',
        algorithm: 'HS256',
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    RedisModule,
  ],
  // ...
})
```

### JWT Strategy

Implement JWT validation:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private tenantContext: TenantContextService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    // Set tenant context
    this.tenantContext.setTenant({
      id: payload.tenantId,
      schemaName: `tenant_${payload.tenantId}`,
    });

    // Load user
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User tidak aktif');
    }

    return user;
  }
}
```

### Current User Decorator

Decorator untuk get current user di controller:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

Usage:
```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Session Management

Store session in Redis:

```typescript
// Create session
const sessionKey = `session:${userId}:${Date.now()}`;
const sessionData = {
  userId,
  token,
  ipAddress,
  userAgent,
  createdAt: new Date().toISOString(),
};
await this.redisService.set(sessionKey, JSON.stringify(sessionData), 86400);

// Check if token is blacklisted
const blacklisted = await this.redisService.get(`blacklist:${token}`);
if (blacklisted) {
  throw new UnauthorizedException('Token tidak valid');
}

// Blacklist token on logout
await this.redisService.set(`blacklist:${token}`, '1', 86400);
```

---

## Security Notes

1. **Password Storage**: NEVER store plain passwords, always hash dengan bcrypt
2. **JWT Secret**: Use strong random secret (min 32 chars), store in env
3. **Password Validation**: Enforce strong password policy
4. **Rate Limiting**: Implement rate limiting pada login endpoint (5 attempts/15min)
5. **Session Invalidation**: Implement logout dengan token blacklist
6. **Audit Logging**: Log all auth events (register, login, logout, password change)
7. **IP Tracking**: Track IP address dan user agent untuk security audit

---

## Documentation References

- TECHNICAL-ARCHITECTURE.md Section 5.1 - Authentication flow
- FEATURE-LIST.md Section 1 - Authentication features
- ERD-DATABASE.md Section 2.1 - Users table
- AI-RULES.md Section 6 - Security rules

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 3.2: RBAC & Permission System** - Implement role-based access control dengan CASL

---

## Output Expected

Setelah task selesai:
1. AuthModule fully implemented
2. UsersModule fully implemented
3. 4 auth endpoints working (register, login, logout, change-password)
4. JWT authentication working
5. Session management dengan Redis
6. Password hashing dengan bcrypt
7. Guards dan strategies implemented
8. CurrentUser decorator working
9. Type-check passing
10. Lint passing
11. Manual testing successful

**Authentication Flow**:
```
Register → Hash Password → Create User → Return Success
Login → Verify Credentials → Generate JWT → Create Session → Return Token
Protected Route → Verify JWT → Load User → Set Tenant Context → Allow Access
Logout → Blacklist Token → Delete Session → Return Success
```

**Security Features**:
- Password hashing (bcrypt cost 12)
- JWT authentication (24h expiry)
- Session management (Redis)
- Token blacklist (logout)
- Audit logging
- IP tracking
- User agent tracking

