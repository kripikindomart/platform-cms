# Task 1.5: Environment Configuration

**Prioritas**: P1 - HIGH  
**Estimasi Waktu**: 2 jam  
**Dependencies**: Task 1.1, 1.3, 1.4  
**Status**: Belum Dimulai

---

## Tujuan Task

Membuat environment configuration yang robust dengan validation schema menggunakan Zod. Setup untuk multiple environments (development, test, production) dengan proper secrets management.

---

## Yang Akan Dikerjakan

### 1. Install Dependencies

Install package yang diperlukan:

```bash
npm install zod
```

**Package yang akan terinstall:**
- `zod` - Schema validation untuk environment variables

### 2. Struktur File

File environment yang akan dibuat/diupdate:

```
backend/
├── .env                    (sudah ada, akan diupdate)
├── .env.example            (sudah ada, akan diupdate)
├── .env.test               (baru, untuk testing)
├── .env.production         (baru, template untuk production)
└── src/config/
    ├── app.config.ts       (sudah ada, akan diupdate)
    ├── database.config.ts  (sudah ada, OK)
    ├── redis.config.ts     (sudah ada, OK)
    ├── env.validation.ts   (baru, Zod schema)
    └── index.ts            (baru, export semua configs)
```

### 3. Environment Variables (Complete)

**.env.example** - Template dengan semua variables:

```bash
# Application
NODE_ENV=development
APP_PORT=3000
APP_NAME=Platform CMS
APP_URL=http://localhost:3000
API_PREFIX=/api

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=platform_cms
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
DB_MAX_CONNECTIONS=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-secret-key-change-in-production-min-32-characters
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3001
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=debug

# Session
SESSION_SECRET=your-session-secret-change-in-production
SESSION_MAX_AGE=86400000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DEST=./uploads
```

### 4. Create Environment Validation Schema

**env.validation.ts** - Zod schema untuk validate environment:

```typescript
import { z } from 'zod';

export const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'test', 'production', 'staging'])
    .default('development'),
  APP_PORT: z.string().default('3000').transform(Number),
  APP_NAME: z.string().default('Platform CMS'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_PREFIX: z.string().default('/api'),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432').transform(Number),
  DB_NAME: z.string().default('platform_cms'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_SSL: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  DB_MAX_CONNECTIONS: z.string().default('20').transform(Number),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default('0').transform(Number),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .default('change-this-in-production-use-strong-random-string-min-32-chars'),
  JWT_EXPIRATION: z.string().default('24h'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Security
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),
  RATE_LIMIT_TTL: z.string().default('60').transform(Number),
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  CORS_CREDENTIALS: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),

  // Logging
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug', 'verbose'])
    .default('debug'),

  // Session
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters')
    .default('change-this-in-production-use-strong-random-string-min-32-chars'),
  SESSION_MAX_AGE: z.string().default('86400000').transform(Number),

  // File Upload
  MAX_FILE_SIZE: z.string().default('5242880').transform(Number),
  UPLOAD_DEST: z.string().default('./uploads'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`,
      );
      throw new Error(
        `Environment validation failed:\n${messages.join('\n')}`,
      );
    }
    throw error;
  }
}
```

### 5. Update app.config.ts

Update untuk gunakan validated env:

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.APP_PORT || '3000', 10),
  name: process.env.APP_NAME || 'Platform CMS',
  url: process.env.APP_URL || 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX || '/api',
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-in-production',
    expiration: process.env.JWT_EXPIRATION || '24h',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    dest: process.env.UPLOAD_DEST || './uploads',
  },
}));
```

### 6. Create config index.ts

**config/index.ts** - Export semua configs:

```typescript
import appConfig from './app.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';

export const configs = [appConfig, databaseConfig, redisConfig];

export { appConfig, databaseConfig, redisConfig };
```

### 7. Update app.module.ts

Update untuk gunakan validation:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configs } from './config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './core/cache/redis.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validate: validateEnv,
      validationOptions: {
        abortEarly: false,
      },
    }),
    DatabaseModule,
    RedisModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### 8. Create .env.test

**.env.test** - Environment untuk testing:

```bash
NODE_ENV=test
APP_PORT=3001
APP_NAME=Platform CMS Test
APP_URL=http://localhost:3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=platform_cms_test
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=1

JWT_SECRET=test-secret-key-minimum-32-characters-long-for-testing
JWT_EXPIRATION=1h

BCRYPT_ROUNDS=4
LOG_LEVEL=error
```

### 9. Create .env.production (Template)

**.env.production** - Template untuk production:

```bash
NODE_ENV=production
APP_PORT=3000
APP_NAME=Platform CMS
APP_URL=https://your-domain.com
API_PREFIX=/api

# Database - CHANGE THESE IN PRODUCTION
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=platform_cms_prod
DB_USER=your-db-user
DB_PASSWORD=CHANGE-THIS-STRONG-PASSWORD
DB_SSL=true
DB_MAX_CONNECTIONS=50

# Redis - CHANGE THESE IN PRODUCTION
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE-THIS-STRONG-PASSWORD
REDIS_DB=0

# JWT - CHANGE THESE IN PRODUCTION
JWT_SECRET=CHANGE-THIS-USE-STRONG-RANDOM-STRING-MINIMUM-32-CHARACTERS
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info

# Session
SESSION_SECRET=CHANGE-THIS-USE-STRONG-RANDOM-STRING-MINIMUM-32-CHARACTERS
SESSION_MAX_AGE=86400000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DEST=/var/app/uploads
```

### 10. Update .gitignore

Pastikan .gitignore mengignore environment files:

```
# Environment variables
.env
.env.local
.env.development
.env.test
.env.production
.env*.local

# Keep example
!.env.example
```

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] Package zod sudah terinstall
- [ ] File env.validation.ts sudah dibuat dengan Zod schema
- [ ] File config/index.ts sudah dibuat
- [ ] File app.config.ts sudah diupdate dengan config lengkap
- [ ] File .env.example sudah diupdate dengan semua variables
- [ ] File .env.test sudah dibuat
- [ ] File .env.production sudah dibuat (template)
- [ ] ConfigModule sudah diupdate dengan validation
- [ ] .gitignore sudah updated
- [ ] Command `npm run type-check` berhasil tanpa error
- [ ] Command `npm run lint` berhasil tanpa error
- [ ] Command `npm run start:dev` berhasil dengan validated env
- [ ] App fails dengan clear error jika env vars invalid
- [ ] Config values accessible via ConfigService

---

## Cara Testing

### 1. Test dengan Valid Environment

```bash
cd backend
npm run start:dev
```

Expected: App starts successfully dengan log semua configs loaded

### 2. Test dengan Invalid Environment

Edit .env, ubah JWT_SECRET jadi kurang dari 32 characters:
```bash
JWT_SECRET=short
```

Run:
```bash
npm run start:dev
```

Expected: App fails dengan error:
```
Environment validation failed:
JWT_SECRET: String must contain at least 32 character(s)
```

### 3. Test dengan Missing Required Vars

Hapus JWT_SECRET dari .env, run:
```bash
npm run start:dev
```

Expected: App uses default value atau fails jika required

### 4. Test Different Environments

```bash
# Test environment
NODE_ENV=test npm run start:dev
# Should use .env.test

# Production environment (dry run)
NODE_ENV=production npm run start:dev
# Should use .env.production
```

### 5. Test Config Access

Buat test file untuk verify config accessible:

```typescript
// test-config.ts
import { ConfigService } from '@nestjs/config';

async function testConfig(configService: ConfigService) {
  console.log('App Port:', configService.get('app.port'));
  console.log('DB Host:', configService.get('database.host'));
  console.log('Redis Host:', configService.get('redis.host'));
  console.log('JWT Secret:', configService.get('app.jwt.secret').substring(0, 10) + '...');
}
```

---

## Dokumentasi Referensi

Baca dokumen ini sebelum mulai:
- `docs/TASK-PLAN.md` - Task 1.5 detail
- `docs/AI-RULES.md` - Environment best practices
- NestJS ConfigModule docs
- Zod documentation

---

## Aturan Penting

1. **JANGAN commit file .env** (hanya .env.example)
2. **SECRETS harus min 32 characters** untuk production
3. **VALIDATION wajib** untuk semua env vars
4. **DEFAULT VALUES** untuk development, REQUIRED untuk production
5. **CLEAR ERROR MESSAGES** jika validation fails
6. **SEPARATE ENV FILES** untuk dev/test/prod
7. **TYPE-SAFE** config access via ConfigService
8. **GITIGNORE** semua .env files kecuali .env.example
9. **DOCUMENTATION** untuk setiap env variable
10. **AUDIT** secrets sebelum commit (use git-secrets)

---

## Troubleshooting

**Problem**: Validation error on startup
**Solution**: Check .env file matches schema, check for typos

**Problem**: Config not accessible
**Solution**: Verify ConfigModule.forRoot dengan load: configs

**Problem**: Wrong environment loaded
**Solution**: Set NODE_ENV env variable sebelum run

**Problem**: Default values not working
**Solution**: Check Zod schema .default() calls

**Problem**: Type errors on ConfigService.get()
**Solution**: Use proper config namespace: `configService.get('app.port')`

---

## Output Expected

Setelah task selesai:
1. Environment validation working dengan Zod
2. Clear error messages untuk invalid configs
3. Separate configs untuk dev/test/prod
4. All secrets documented in .env.example
5. App starts dengan validated environment
6. Type-safe config access
7. No secrets committed to git
8. All tests pass (type-check, lint, build)

---

## Security Notes

**Secrets Management:**
- NEVER commit .env files
- Use different secrets per environment
- Rotate secrets regularly
- Use strong random strings (min 32 chars)
- Consider using vault/secrets manager for production

**Production Checklist:**
- [ ] All secrets changed from defaults
- [ ] Strong passwords used
- [ ] SSL enabled for database
- [ ] Redis password set
- [ ] CORS properly configured
- [ ] Rate limiting configured
- [ ] Log level set to 'info' or 'warn'

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 1.6: Git & CI/CD Setup** - Setup GitHub Actions untuk automated testing
