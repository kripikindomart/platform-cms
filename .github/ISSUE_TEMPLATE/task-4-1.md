# Task 4.1: Security Middleware

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 5 jam  
**Dependencies**: None  
**Status**: Belum Dimulai

---

## Tujuan Task

Implement security middleware untuk protect application dari common vulnerabilities: XSS, CSRF, rate limiting, dan security headers.

---

## Yang Akan Dikerjakan

### 1. Install Dependencies

```bash
cd backend
npm install helmet @nestjs/throttler class-validator class-transformer
npm install -D @types/validator
```

### 2. Struktur File

File yang akan dibuat/update:

```
backend/src/common/middleware/
└── security-headers.middleware.ts  (baru) - Security headers middleware

backend/src/common/guards/
└── throttler.guard.ts              (baru) - Custom throttler guard

backend/src/main.ts                 (update) - Apply global middleware & pipes

backend/src/app.module.ts           (update) - Register ThrottlerModule
```

### 3. Security Features

**1. Security Headers (Helmet)**:
- Content Security Policy (CSP)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- Strict-Transport-Security (HSTS)
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

**2. Rate Limiting (Throttler)**:
- Global rate limit (100 requests per 15 minutes)
- Per-route custom limits
- Per-tenant tracking (optional)
- Skip for public routes (@Public())

**3. Input Validation**:
- Global ValidationPipe (class-validator)
- Whitelist unknown properties
- Transform payloads to DTO instances
- Forbid non-whitelisted properties

**4. CORS Configuration**:
- Allow specific origins (from env)
- Allow credentials
- Expose specific headers
- Cache preflight requests

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

### Dependencies
- [ ] helmet installed
- [ ] @nestjs/throttler installed
- [ ] class-validator & class-transformer installed

### Security Headers
- [ ] Helmet configured di main.ts
- [ ] CSP policy configured
- [ ] All security headers enabled
- [ ] Headers working di response

### Rate Limiting
- [ ] ThrottlerModule configured
- [ ] Global rate limit (100 req/15min)
- [ ] Per-route custom limits working
- [ ] @Public() routes skip rate limiting
- [ ] Rate limit headers in response

### Input Validation
- [ ] Global ValidationPipe enabled
- [ ] Whitelist enabled
- [ ] Transform enabled
- [ ] Validation errors return 400 dengan details

### CORS
- [ ] CORS enabled di main.ts
- [ ] Origins configured from env
- [ ] Credentials allowed
- [ ] Preflight requests handled

### Testing
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Headers present in response
- [ ] Rate limiting works (429 after limit)
- [ ] Validation rejects invalid input

---

## Cara Testing

### 1. Type Check & Lint

```bash
cd backend
npm run type-check
npm run lint
```

Expected: No errors

### 2. Start Server

```bash
npm run start:dev
```

### 3. Test Security Headers

```bash
curl -I http://localhost:3000
```

Expected headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-XSS-Protection: 0
Referrer-Policy: no-referrer
Content-Security-Policy: ...
```

### 4. Test Rate Limiting

**Normal Request**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

**Spam Requests** (more than 100 in 15 minutes):
```bash
for i in {1..101}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"password\":\"test\"}"
  echo "Request $i"
done
```

Expected after 100 requests:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

Expected headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: <timestamp>
Retry-After: <seconds>
```

### 5. Test Input Validation

**Valid Input**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"valid@example.com","password":"Test123!@#","name":"Valid User"}'
```

Expected: 201 Created

**Invalid Input (missing required field)**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@example.com"}'
```

Expected: 400 Bad Request dengan validation errors
```json
{
  "statusCode": 400,
  "message": ["password should not be empty", "name should not be empty"],
  "error": "Bad Request"
}
```

**Invalid Input (extra properties)**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","name":"Test","hacker":"attempt"}'
```

Expected: 400 Bad Request (property not whitelisted) OR extra property stripped

### 6. Test CORS

**From allowed origin**:
```bash
curl -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST"
```

Expected headers:
```
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
```

**From disallowed origin**:
```bash
curl -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST"
```

Expected: No CORS headers OR blocked

---

## Implementasi Notes

### Helmet Configuration

```typescript
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
```

### Throttler Module Configuration

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 900000, // 15 minutes in milliseconds
        limit: 100,  // 100 requests per ttl
      },
    ]),
  ],
})
export class AppModule {}
```

### Global Validation Pipe

```typescript
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // Strip properties not in DTO
    forbidNonWhitelisted: true, // Throw error for extra properties
    transform: true,        // Transform to DTO instance
    transformOptions: {
      enableImplicitConversion: true, // Auto-convert types
    },
  }),
);
```

### CORS Configuration

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
  credentials: true,
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 3600,
});
```

### Custom Rate Limit for Specific Route

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  // Custom limit for login: 10 requests per minute
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() dto: LoginDto) {
    // ...
  }
}
```

### Skip Rate Limiting for Public Routes

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Controller('health')
export class HealthController {
  @Get()
  @SkipThrottle() // No rate limiting on health check
  check() {
    return { status: 'ok' };
  }
}
```

---

## Security Notes

1. **CSP (Content Security Policy)**: Prevent XSS attacks by controlling resource loading
2. **Rate Limiting**: Prevent brute force attacks dan DDoS
3. **Input Validation**: Prevent injection attacks (SQL, NoSQL, command injection)
4. **HSTS**: Force HTTPS connections
5. **X-Frame-Options**: Prevent clickjacking attacks
6. **X-Content-Type-Options**: Prevent MIME sniffing
7. **CORS**: Control which origins can access API

**Rate Limiting Strategy**:
- Global: 100 requests per 15 minutes
- Login endpoint: 10 requests per minute (stricter)
- Register endpoint: 5 requests per hour (stricter)
- Public routes (health check): No limit

**Validation Strategy**:
- All DTOs use class-validator decorators
- Zod schemas converted to class-validator (where needed)
- Unknown properties stripped automatically
- Type conversion automatic

---

## Documentation References

- SECURITY-GUIDELINES.md (belum dibuat)
- TECHNICAL-ARCHITECTURE.md Section 5.3 - Security layer
- NestJS Security Best Practices: https://docs.nestjs.com/security/helmet
- OWASP Top 10: https://owasp.org/www-project-top-ten/

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 4.2: Audit Logging System** - Implement comprehensive audit trail untuk compliance

---

## Output Expected

Setelah task selesai:
1. Security headers di setiap response
2. Rate limiting working (429 after limit exceeded)
3. Input validation automatic (400 untuk invalid input)
4. CORS configured properly
5. Type-check passing
6. Lint passing
7. Manual testing successful

**Security Posture Improved**:
- ✅ XSS Protection (CSP + headers)
- ✅ Clickjacking Protection (X-Frame-Options)
- ✅ MIME Sniffing Protection
- ✅ DDoS Protection (rate limiting)
- ✅ Brute Force Protection (rate limiting)
- ✅ Injection Protection (input validation)
- ✅ CSRF Protection (CORS + SameSite cookies)

**Performance Impact**: Minimal (<5ms per request)
