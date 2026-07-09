# SECURITY GUIDELINES
# Platform CMS - Core Framework

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: Security Implementation Guidelines  
**Reference**: PROJECT-BRIEF.md, TECHNICAL-ARCHITECTURE.md, BUSINESS-RULES.md

---

## Pendahuluan

Dokumen ini adalah **panduan keamanan lengkap** untuk Platform CMS. Security adalah **PRIORITAS UTAMA** dalam development. Semua developer WAJIB mengikuti guidelines ini.

**Security Principles**:
- 🔒 **Security by Default** - Secure first, convenience second
- 🛡️ **Defense in Depth** - Multiple layers of security
- 🚫 **Principle of Least Privilege** - Minimal access by default
- ✅ **Fail Securely** - Errors should not expose sensitive data
- 📝 **Audit Everything** - Log all critical actions

**Compliance**:
- OWASP Top 10 (2021)
- ISO 27001 principles
- GDPR requirements (data protection)
- Indonesian data protection laws

---

## 1. OWASP Top 10 Mitigation

### 1.1 A01: Broken Access Control

**Threat**: Users can access resources they shouldn't.

**Mitigation**:

```typescript
// ✅ GOOD - Check permission on EVERY endpoint
@Controller('users')
export class UsersController {
  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('users.read.tenant') // Required permission
  async findOne(@Param('id') id: number, @CurrentUser() user: User) {
    // Additional check: own data vs tenant data
    const targetUser = await this.usersService.findOne(id);
    
    if (targetUser.tenantId !== user.tenantId) {
      throw new ForbiddenException('Akses ditolak');
    }
    
    return targetUser;
  }
}

// ❌ BAD - No permission check
@Get(':id')
async findOne(@Param('id') id: number) {
  return this.usersService.findOne(id); // Anyone can access!
}
```

**Checklist**:
- [ ] Semua endpoint protected dengan `@UseGuards(JwtAuthGuard)`
- [ ] Semua endpoint punya `@Permissions()` decorator
- [ ] Tenant isolation enforced di repository layer
- [ ] User tidak bisa akses data tenant lain
- [ ] Super Admin permissions terbatas pada module management only

---

### 1.2 A02: Cryptographic Failures

**Threat**: Sensitive data exposed, weak encryption.

**Mitigation**:

```typescript
// ✅ GOOD - Strong password hashing
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Production: 12-14

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ❌ BAD - Weak hashing
const hash = crypto.createHash('md5').update(password).digest('hex'); // NEVER!
```

**Encryption Standards**:

```typescript
// Environment variables encryption (use dotenv-vault or AWS Secrets Manager)
JWT_SECRET=<random-256-bit-key> // NEVER commit to git!
DATABASE_PASSWORD=<encrypted>

// Password requirements
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Minimal 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
```

**Checklist**:
- [ ] Password di-hash dengan bcrypt (cost 12+)
- [ ] JWT secret minimal 256-bit random string
- [ ] Sensitive data encrypted at rest (database level)
- [ ] HTTPS enforced (production)
- [ ] No sensitive data in logs
- [ ] No sensitive data in error messages
- [ ] API keys/secrets stored in environment variables (NOT in code)

---

### 1.3 A03: Injection

**Threat**: SQL injection, NoSQL injection, command injection.

**Mitigation**:

```typescript
// ✅ GOOD - Parameterized queries (Drizzle ORM)
async findByEmail(email: string): Promise<User | null> {
  return this.db
    .select()
    .from(users)
    .where(eq(users.email, email)) // Parameterized, safe
    .execute();
}

// ❌ BAD - Raw SQL with string concatenation
async findByEmail(email: string): Promise<User | null> {
  const query = `SELECT * FROM users WHERE email = '${email}'`; // SQL INJECTION!
  return this.db.execute(query);
}

// ✅ GOOD - Input sanitization
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitize(req.body);
    }
    next();
  }
  
  private sanitize(obj: any): any {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj, {
        allowedTags: [], // Strip ALL HTML
        allowedAttributes: {},
      });
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = this.sanitize(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  }
}
```

**Checklist**:
- [ ] ALWAYS use ORM (Drizzle) - NEVER raw SQL dengan string concat
- [ ] ALWAYS sanitize HTML input
- [ ] ALWAYS validate input dengan Zod
- [ ] NEVER trust user input
- [ ] NEVER execute system commands dengan user input
- [ ] NEVER use `eval()` atau `Function()` dengan user input

---

### 1.4 A04: Insecure Design

**Threat**: Flawed architecture, missing security controls.

**Mitigation**:

**1. Implement Rate Limiting**

```typescript
// Global rate limiting
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 60 seconds
      limit: 100, // 100 requests
    }),
  ],
})
export class AppModule {}

// Endpoint-specific rate limiting
@Post('login')
@Throttle(5, 900) // 5 attempts per 15 minutes
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

**2. Implement Account Lockout**

```typescript
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

async login(dto: LoginDto): Promise<LoginResponse> {
  const user = await this.usersRepository.findByEmail(dto.email);
  
  if (!user) {
    throw new UnauthorizedException('Email atau password salah');
  }
  
  // Check if account is locked
  if (user.lockedUntil && new Date() < user.lockedUntil) {
    throw new ForbiddenException('Akun terkunci. Coba lagi nanti.');
  }
  
  // Verify password
  const isValid = await bcrypt.compare(dto.password, user.passwordHash);
  
  if (!isValid) {
    // Increment failed attempts
    await this.incrementFailedAttempts(user.id);
    
    if (user.failedLoginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
      await this.lockAccount(user.id, LOCKOUT_DURATION);
      throw new ForbiddenException('Akun terkunci karena terlalu banyak percobaan login gagal.');
    }
    
    throw new UnauthorizedException('Email atau password salah');
  }
  
  // Reset failed attempts on success
  await this.resetFailedAttempts(user.id);
  
  // Generate token
  return this.generateToken(user);
}
```

**3. Implement Session Management**

```typescript
// Session timeout
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Store session in Redis
async createSession(user: User): Promise<string> {
  const sessionId = uuidv4();
  const sessionData = {
    userId: user.id,
    tenantId: user.tenantId,
    roles: user.roles,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + SESSION_TIMEOUT),
  };
  
  await this.redis.set(
    `session:${sessionId}`,
    JSON.stringify(sessionData),
    'EX',
    SESSION_TIMEOUT / 1000,
  );
  
  return sessionId;
}

// Invalidate session on logout
async logout(sessionId: string): Promise<void> {
  await this.redis.del(`session:${sessionId}`);
}
```

**Checklist**:
- [ ] Rate limiting implemented (global + per-endpoint)
- [ ] Account lockout after failed login attempts
- [ ] Session timeout enforced
- [ ] Concurrent session limits (optional)
- [ ] Password reset tokens expire (1 hour)
- [ ] Multi-factor authentication (Phase 2)

---

### 1.5 A05: Security Misconfiguration

**Threat**: Default configs, unnecessary features enabled, verbose errors.

**Mitigation**:

**1. Disable Debug Mode in Production**

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  logger: process.env.NODE_ENV === 'production' 
    ? ['error', 'warn'] 
    : ['error', 'warn', 'log', 'debug', 'verbose'],
});

// Disable Swagger in production
if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('Platform CMS API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
```

**2. Hide Sensitive Info in Errors**

```typescript
// Global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    const status = exception.getStatus?.() || 500;
    
    // Hide stack traces in production
    const errorResponse = {
      success: false,
      error: {
        code: exception.code || 'INTERNAL_ERROR',
        message: exception.message || 'Terjadi kesalahan sistem',
        errors: exception.errors || [],
        // Only include stack in development
        ...(process.env.NODE_ENV !== 'production' && {
          stack: exception.stack,
        }),
      },
      meta: {
        requestId: ctx.getRequest().id,
        timestamp: new Date().toISOString(),
      },
    };
    
    // Log error (for monitoring)
    logger.error(exception);
    
    response.status(status).json(errorResponse);
  }
}
```

**3. Security Headers**

```typescript
import * as helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

**Checklist**:
- [ ] Debug mode OFF in production
- [ ] Swagger/API docs disabled in production
- [ ] Verbose errors disabled in production
- [ ] Default credentials changed
- [ ] Unnecessary features/endpoints disabled
- [ ] Security headers configured (Helmet)
- [ ] CORS properly configured
- [ ] File upload restrictions enforced

---

### 1.6 A06: Vulnerable and Outdated Components

**Threat**: Using libraries with known vulnerabilities.

**Mitigation**:

```bash
# Regular dependency audit
npm audit

# Fix vulnerabilities
npm audit fix

# Force update (with caution)
npm audit fix --force

# Check for outdated packages
npm outdated

# Update dependencies (weekly)
npm update
```

**Dependency Policy**:

```json
// package.json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix",
    "outdated": "npm outdated"
  }
}
```

**Checklist**:
- [ ] Run `npm audit` before every deploy
- [ ] No HIGH/CRITICAL vulnerabilities
- [ ] Dependencies updated monthly
- [ ] Lock file committed (`package-lock.json`)
- [ ] Use exact versions for critical deps
- [ ] Review dependency licenses
- [ ] Remove unused dependencies

---

### 1.7 A07: Identification and Authentication Failures

**Threat**: Weak authentication, session hijacking, credential stuffing.

**Mitigation**:

**1. Strong Password Policy**

```typescript
export const PasswordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128, 'Password maksimal 128 karakter')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/\d/, 'Password harus mengandung angka')
  .regex(/[@$!%*?&]/, 'Password harus mengandung karakter khusus (@$!%*?&)');
```

**2. JWT Token Security**

```typescript
// Generate JWT
const payload = {
  userId: user.id,
  email: user.email,
  tenantId: user.tenantId,
  roles: user.roles.map(r => r.name),
};

const token = this.jwtService.sign(payload, {
  secret: process.env.JWT_SECRET, // Strong secret (256-bit)
  expiresIn: '24h', // Short expiry
  issuer: 'platform-cms',
  audience: 'platform-cms-api',
});

// Verify JWT
const decoded = this.jwtService.verify(token, {
  secret: process.env.JWT_SECRET,
  issuer: 'platform-cms',
  audience: 'platform-cms-api',
});
```

**3. Secure Cookie Configuration**

```typescript
// Set cookie with secure flags
response.cookie('access_token', token, {
  httpOnly: true, // Prevent XSS
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
});
```

**Checklist**:
- [ ] Strong password policy enforced
- [ ] Password complexity validated (Zod)
- [ ] Passwords hashed with bcrypt (cost 12+)
- [ ] JWT tokens have short expiry (24h)
- [ ] JWT secret is strong (256-bit)
- [ ] Cookies are httpOnly, secure, sameSite
- [ ] Password reset tokens expire (1h)
- [ ] No credentials in URLs or logs
- [ ] Session invalidation on logout
- [ ] Account lockout after failed attempts

---

### 1.8 A08: Software and Data Integrity Failures

**Threat**: Unsigned code, insecure CI/CD, deserialization attacks.

**Mitigation**:

**1. Verify NPM Packages**

```bash
# Check package integrity
npm install --ignore-scripts

# Verify package signatures
npm audit signatures
```

**2. Code Review Process**

```yaml
# .github/workflows/code-review.yml
name: Code Review

on:
  pull_request:
    branches: [main, develop]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run linter
        run: npm run lint
      
      - name: Run security scan
        run: npm audit
      
      - name: Run tests
        run: npm test
      
      - name: Check for secrets
        uses: trufflesecurity/trufflehog@v3
```

**3. Input Deserialization Safety**

```typescript
// ✅ GOOD - Use Zod for validation
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(255),
});

@Post()
async create(@Body() body: unknown) {
  const dto = UserSchema.parse(body); // Validates AND transforms
  return this.usersService.create(dto);
}

// ❌ BAD - Direct deserialization
@Post()
async create(@Body() body: any) { // No validation!
  return this.usersService.create(body);
}
```

**Checklist**:
- [ ] All PRs require code review
- [ ] All tests pass before merge
- [ ] No secrets in git history
- [ ] Dependencies from trusted sources only
- [ ] Package-lock.json committed
- [ ] CI/CD pipeline secured
- [ ] Input validation with Zod
- [ ] No unsafe deserialization

---

### 1.9 A09: Security Logging and Monitoring Failures

**Threat**: Attacks go undetected, no audit trail.

**Mitigation**:

**1. Audit Logging**

```typescript
@Injectable()
export class AuditService {
  async log(params: {
    userId?: number;
    tenantId: number;
    action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';
    resource: string;
    resourceId?: number;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.auditLogsRepository.create({
      ...params,
      createdAt: new Date(),
    });
    
    // Send critical actions to SIEM
    if (this.isCriticalAction(params)) {
      await this.sendToSIEM(params);
    }
  }
  
  private isCriticalAction(params: any): boolean {
    const criticalActions = ['delete', 'update'];
    const criticalResources = ['users', 'roles', 'tenants', 'permissions'];
    
    return criticalResources.includes(params.resource) &&
           criticalActions.includes(params.action);
  }
}
```

**2. Security Event Monitoring**

```typescript
// Monitor failed login attempts
@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger(SecurityMonitoringService.name);
  
  async monitorFailedLogin(email: string, ipAddress: string) {
    const key = `failed-login:${email}:${ipAddress}`;
    const count = await this.redis.incr(key);
    await this.redis.expire(key, 3600); // 1 hour window
    
    if (count > 10) {
      // Alert security team
      this.logger.warn(`Suspicious activity: ${count} failed logins for ${email} from ${ipAddress}`);
      
      // Send alert
      await this.alertService.send({
        severity: 'high',
        message: `Multiple failed login attempts detected`,
        details: { email, ipAddress, count },
      });
    }
  }
  
  async monitorSuspiciousActivity(userId: number, action: string) {
    // Track unusual patterns
    // e.g., accessing many records in short time, bulk deletions, etc.
  }
}
```

**What to Log**:
- ✅ Authentication attempts (success/failure)
- ✅ Authorization failures
- ✅ Input validation failures
- ✅ Critical data changes (CRUD on users, roles, permissions)
- ✅ Account lockouts
- ✅ Password changes
- ✅ Session creation/destruction
- ✅ API rate limit violations
- ✅ System errors

**What NOT to Log**:
- ❌ Passwords (even hashed)
- ❌ JWT tokens
- ❌ API keys/secrets
- ❌ Credit card numbers
- ❌ Personal identifiable information (PII) - unless encrypted

**Checklist**:
- [ ] Audit logging for all critical actions
- [ ] Failed login attempts logged
- [ ] Authorization failures logged
- [ ] Log rotation configured
- [ ] Logs stored securely (encrypted)
- [ ] No sensitive data in logs
- [ ] Centralized logging (ELK Stack)
- [ ] Real-time alerting for critical events
- [ ] Log retention policy (90+ days)

---

### 1.10 A10: Server-Side Request Forgery (SSRF)

**Threat**: Attacker makes server request internal/external resources.

**Mitigation**:

```typescript
// ✅ GOOD - Validate and whitelist URLs
const ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com'];

async fetchExternalResource(url: string): Promise<any> {
  const parsedUrl = new URL(url);
  
  // Validate domain
  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    throw new BadRequestException('Domain tidak diizinkan');
  }
  
  // Prevent access to internal IPs
  if (this.isInternalIP(parsedUrl.hostname)) {
    throw new BadRequestException('Akses ke internal IP tidak diizinkan');
  }
  
  return axios.get(url);
}

private isInternalIP(hostname: string): boolean {
  const internalPatterns = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^localhost$/,
  ];
  
  return internalPatterns.some(pattern => pattern.test(hostname));
}

// ❌ BAD - No validation
async fetchExternalResource(url: string): Promise<any> {
  return axios.get(url); // Can access internal resources!
}
```

**Checklist**:
- [ ] URL whitelist implemented
- [ ] Internal IP access blocked
- [ ] No user-controlled URLs without validation
- [ ] Network segmentation (prevent access to internal services)
- [ ] Disable unnecessary URL schemes (file://, gopher://, etc.)

---

## 2. Authentication & Authorization

### 2.1 Authentication Flow

```
User submits credentials
   ↓
1. Validate input (Zod)
   ↓
2. Sanitize input (remove HTML)
   ↓
3. Find user by email (case-insensitive)
   ↓
4. Check if account locked
   ↓
5. Verify password (bcrypt)
   ↓
6. Check if user is active
   ↓
7. Check if tenant is active
   ↓
8. Generate JWT token
   ↓
9. Create session (Redis)
   ↓
10. Log successful login (audit)
   ↓
11. Return token + user data
```

### 2.2 Authorization (RBAC + CASL)

**Permission Naming Convention**:
```
{resource}.{action}.{scope}

Examples:
- users.read.own      → Read own user data
- users.read.tenant   → Read all users in tenant
- users.create.tenant → Create users in tenant
- users.delete.tenant → Delete users in tenant
```

**Permission Check Flow**:

```typescript
@Controller('users')
export class UsersController {
  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @Permissions('users.read.tenant', 'users.read.own')
  async findOne(
    @Param('id') id: number,
    @CurrentUser() user: User,
  ) {
    const targetUser = await this.usersService.findOne(id);
    
    // Check if user can access this resource
    const ability = this.caslAbilityFactory.createForUser(user);
    
    if (ability.can('read', targetUser)) {
      return targetUser;
    }
    
    throw new ForbiddenException('Akses ditolak');
  }
}
```

**CASL Ability Factory**:

```typescript
@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );
    
    user.permissions.forEach((perm) => {
      const { resource, action, scope } = perm;
      
      if (scope === 'all') {
        // Super Admin - access to ALL data
        can(action, resource);
      } else if (scope === 'tenant') {
        // Tenant Admin - access to tenant data only
        can(action, resource, { tenantId: user.tenantId });
      } else if (scope === 'own') {
        // Regular User - access to own data only
        can(action, resource, { userId: user.id });
      }
    });
    
    return build();
  }
}
```

---

## 3. Input Validation & Sanitization

### 3.1 Validation Strategy

**All input MUST be validated** - No exceptions!

```typescript
// Step 1: Define Zod schema
export const CreateUserDtoSchema = z.object({
  email: z
    .string({ required_error: 'Email harus diisi' })
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter')
    .transform(val => val.toLowerCase().trim()),
  
  password: z
    .string({ required_error: 'Password harus diisi' })
    .min(8, 'Password minimal 8 karakter')
    .max(128, 'Password maksimal 128 karakter')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/\d/, 'Password harus mengandung angka')
    .regex(/[@$!%*?&]/, 'Password harus mengandung karakter khusus'),
  
  name: z
    .string({ required_error: 'Nama harus diisi' })
    .min(2, 'Nama minimal 2 karakter')
    .max(255, 'Nama maksimal 255 karakter')
    .trim(),
  
  phone: z
    .string()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .regex(/^\+?[0-9\s\-()]+$/, 'Format nomor telepon tidak valid')
    .optional(),
  
  roleIds: z
    .array(z.number().int().positive())
    .min(1, 'Minimal pilih 1 role')
    .max(10, 'Maksimal 10 roles'),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

// Step 2: Use validation pipe
@Post()
async create(@Body(new ZodValidationPipe(CreateUserDtoSchema)) dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

### 3.2 Sanitization Strategy

```typescript
// Sanitize middleware (applied globally)
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }
    
    next();
  }
  
  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      // Remove HTML tags
      let sanitized = sanitizeHtml(obj, {
        allowedTags: [],
        allowedAttributes: {},
      });
      
      // Remove null bytes
      sanitized = sanitized.replace(/\0/g, '');
      
      // Trim whitespace
      sanitized = sanitized.trim();
      
      return sanitized;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  }
}
```

### 3.3 File Upload Security

```typescript
// File upload configuration
@Post('upload')
@UseInterceptors(
  FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, callback) => {
      // Whitelist allowed MIME types
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('Tipe file tidak diizinkan'), false);
      }
    },
  }),
)
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // Validate file signature (magic bytes)
  const isValid = await this.validateFileSignature(file);
  
  if (!isValid) {
    throw new BadRequestException('File tidak valid');
  }
  
  // Scan for malware (optional, use ClamAV)
  const isSafe = await this.scanFile(file);
  
  if (!isSafe) {
    throw new BadRequestException('File terdeteksi berbahaya');
  }
  
  // Generate safe filename
  const safeFilename = this.generateSafeFilename(file.originalname);
  
  // Save file
  return this.filesService.save(file, safeFilename);
}

private generateSafeFilename(original: string): string {
  const ext = path.extname(original);
  const name = path.basename(original, ext);
  
  // Sanitize filename
  const safeName = name
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 100);
  
  // Add UUID for uniqueness
  return `${safeName}_${uuidv4()}${ext}`;
}
```

**File Upload Checklist**:
- [ ] File size limit enforced (5MB default)
- [ ] MIME type whitelist enforced
- [ ] File signature validation (magic bytes)
- [ ] Filename sanitized (remove special chars)
- [ ] Files stored outside web root
- [ ] Direct URL access disabled
- [ ] Malware scanning (optional)
- [ ] Access control enforced

---

## 4. Data Protection (GDPR Compliance)

### 4.1 Personal Data Handling

**Personal Data Includes**:
- Email addresses
- Names
- Phone numbers
- IP addresses
- User activity logs

**Requirements**:
1. **Right to Access** - User can request their data
2. **Right to Rectification** - User can update their data
3. **Right to Erasure** - User can request deletion
4. **Right to Data Portability** - User can export their data
5. **Right to Object** - User can object to processing

```typescript
// Data export endpoint
@Get('me/export')
@UseGuards(JwtAuthGuard)
async exportMyData(@CurrentUser() user: User) {
  const userData = await this.usersService.exportUserData(user.id);
  
  // Return as JSON download
  return {
    personal_info: {
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      created_at: userData.createdAt,
    },
    activity_logs: userData.auditLogs,
    // ... other data
  };
}

// Data deletion endpoint (GDPR right to erasure)
@Delete('me')
@UseGuards(JwtAuthGuard)
async deleteMyAccount(@CurrentUser() user: User) {
  // Soft delete user (keep for audit trail)
  await this.usersService.softDelete(user.id);
  
  // Anonymize personal data
  await this.usersService.anonymize(user.id);
  
  // Logout user
  await this.authService.logout(user.id);
  
  return { message: 'Akun Anda telah dihapus' };
}
```

### 4.2 Data Encryption

```typescript
// Encrypt sensitive fields (e.g., SSN, credit card)
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return iv + authTag + encrypted
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

function decrypt(encrypted: string): string {
  const iv = Buffer.from(encrypted.slice(0, 32), 'hex');
  const authTag = Buffer.from(encrypted.slice(32, 64), 'hex');
  const encryptedText = encrypted.slice(64);
  
  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## 5. Secure Development Practices

### 5.1 Code Review Checklist

Before approving PR, check:

- [ ] **Authentication**: All endpoints protected?
- [ ] **Authorization**: Permission checks in place?
- [ ] **Input Validation**: Zod schemas for all input?
- [ ] **SQL Injection**: Using ORM, not raw SQL?
- [ ] **XSS Prevention**: HTML sanitized?
- [ ] **Sensitive Data**: No passwords/secrets in code?
- [ ] **Error Handling**: No sensitive info in errors?
- [ ] **Logging**: Audit log for critical actions?
- [ ] **Testing**: Security tests written?
- [ ] **Documentation**: Security considerations documented?

### 5.2 Security Testing

```typescript
// Security test example
describe('Users API Security', () => {
  it('should not allow SQL injection in email field', async () => {
    const maliciousEmail = "admin@example.com' OR '1'='1";
    
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: maliciousEmail, password: 'password' })
      .expect(401); // Should fail, not return all users
    
    expect(res.body.error.message).not.toContain('syntax error');
  });
  
  it('should not allow XSS in name field', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    const res = await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'test@example.com',
        name: xssPayload,
        password: 'Password123!',
        roleIds: [2],
      })
      .expect(201);
    
    // Name should be sanitized
    expect(res.body.data.name).not.toContain('<script>');
  });
  
  it('should enforce tenant isolation', async () => {
    // Login as tenant A
    const tenantA = await loginAsTenant('tenant-a');
    
    // Try to access tenant B data
    const res = await request(app.getHttpServer())
      .get(`/api/v1/users/${tenantBUserId}`)
      .set('Authorization', `Bearer ${tenantA.token}`)
      .expect(403); // Should be forbidden
  });
});
```

---

## 6. Incident Response Plan

### 6.1 Security Incident Classification

| Level | Severity | Examples | Response Time |
|-------|----------|----------|---------------|
| P0 | Critical | Data breach, system compromise | Immediate (< 1 hour) |
| P1 | High | DoS attack, privilege escalation | < 4 hours |
| P2 | Medium | Brute force attempts, suspicious activity | < 24 hours |
| P3 | Low | Minor vulnerabilities | < 1 week |

### 6.2 Incident Response Procedure

```
1. DETECT
   - Monitoring alerts trigger
   - Security team notified
   ↓
2. ANALYZE
   - Investigate scope and impact
   - Identify affected systems/data
   ↓
3. CONTAIN
   - Isolate affected systems
   - Block attacker IP
   - Revoke compromised credentials
   ↓
4. ERADICATE
   - Remove malware/backdoors
   - Patch vulnerabilities
   - Update security controls
   ↓
5. RECOVER
   - Restore from backups
   - Verify system integrity
   - Resume normal operations
   ↓
6. POST-MORTEM
   - Document incident
   - Lessons learned
   - Update procedures
```

---

## Penutup

### Approval & Sign-off

**Prepared by**: [Security Engineer, Development Team]  
**Review by**: [Senior Engineer, Tech Lead]  
**Approved by**: [Project Manager, Security Officer]  

**Date**: 2024-01-08

---

### Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024-01-08 | Initial security guidelines document | Development Team |

---

### Referensi

**Internal Documents**:
- PROJECT-BRIEF.md - Project overview
- TECHNICAL-ARCHITECTURE.md - System architecture
- BUSINESS-RULES.md - Business logic rules
- AI-RULES.md - Development guidelines

**External References**:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [NestJS Security](https://docs.nestjs.com/security/helmet)
- [GDPR Compliance](https://gdpr.eu/)

---

**END OF DOCUMENT**

