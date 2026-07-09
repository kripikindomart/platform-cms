# Task 1.3: Setup Database Connection

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 3 jam  
**Dependencies**: Task 1.1 (Backend Project Setup)  
**Status**: Belum Dimulai

---

## Tujuan Task

Membuat koneksi database PostgreSQL dengan Drizzle ORM dan setup database provider untuk backend NestJS. Koneksi ini akan mendukung multi-tenancy dengan schema-based isolation.

---

## Yang Akan Dikerjakan

### 1. Install Dependencies

Install package yang diperlukan dengan npm:

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
```

**Package yang akan terinstall:**
- `drizzle-orm` - ORM untuk database operations
- `pg` - PostgreSQL client untuk Node.js
- `drizzle-kit` - CLI tool untuk migrations
- `@types/pg` - TypeScript types untuk pg

### 2. File Konfigurasi

**drizzle.config.ts** - Konfigurasi Drizzle Kit untuk migrations
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema/**/*.schema.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'platform_cms',
  },
} satisfies Config;
```

### 3. File yang Akan Dibuat

**Struktur folder:**
```
backend/src/
├── database/
│   ├── database.module.ts          (Database module NestJS)
│   ├── drizzle.provider.ts         (Drizzle provider untuk DI)
│   ├── schema/
│   │   ├── public/                 (Global schema - nanti)
│   │   └── tenant/                 (Tenant schema - nanti)
│   └── migrations/                 (Migration files - auto generated)
├── config/
│   └── database.config.ts          (Sudah ada, akan diupdate)
└── drizzle.config.ts               (Root level config)
```

### 4. Update database.config.ts

File ini sudah ada dari Task 1.1, akan diupdate dengan konfigurasi lengkap:

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'platform_cms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true',
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
}));
```

### 5. Create Database Provider

**drizzle.provider.ts** - Provider untuk inject Drizzle DB instance:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

export const DRIZZLE_TOKEN = 'DRIZZLE';

export const drizzleProvider = {
  provide: DRIZZLE_TOKEN,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const pool = new Pool({
      host: configService.get<string>('database.host'),
      port: configService.get<number>('database.port'),
      database: configService.get<string>('database.database'),
      user: configService.get<string>('database.user'),
      password: configService.get<string>('database.password'),
      ssl: configService.get<boolean>('database.ssl'),
      max: configService.get<number>('database.maxConnections'),
      idleTimeoutMillis: configService.get<number>('database.idleTimeoutMillis'),
      connectionTimeoutMillis: configService.get<number>('database.connectionTimeoutMillis'),
    });

    // Test connection
    try {
      const client = await pool.connect();
      console.log('Database connected successfully');
      client.release();
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }

    return drizzle(pool);
  },
};
```

### 6. Create Database Module

**database.module.ts** - NestJS module untuk database:

```typescript
import { Module, Global } from '@nestjs/common';
import { drizzleProvider } from './drizzle.provider';

@Global()
@Module({
  providers: [drizzleProvider],
  exports: [drizzleProvider],
})
export class DatabaseModule {}
```

### 7. Update app.module.ts

Import DatabaseModule ke AppModule:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
```

### 8. Update Environment Variables

Update `.env.example`:

```bash
# Application
NODE_ENV=development
APP_PORT=3000
APP_NAME=Platform CMS
APP_URL=http://localhost:3000

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
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h
```

Buat file `.env` dengan copy dari `.env.example` dan sesuaikan nilai-nilainya.

### 9. Create Health Check Endpoint

Update `main.ts` atau buat health check controller untuk test database connection:

```typescript
// Tambahkan di app.module.ts atau buat health.controller.ts
@Controller('health')
export class HealthController {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: any) {}

  @Get()
  async check() {
    try {
      // Test query
      await this.db.execute(sql`SELECT 1`);
      
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] Package drizzle-orm, pg, drizzle-kit sudah terinstall
- [ ] File drizzle.config.ts sudah dibuat di root
- [ ] File database.config.ts sudah diupdate dengan konfigurasi lengkap
- [ ] File drizzle.provider.ts sudah dibuat
- [ ] File database.module.ts sudah dibuat
- [ ] DatabaseModule sudah di-import ke AppModule
- [ ] File .env sudah dibuat dengan database credentials
- [ ] File .env.example sudah diupdate
- [ ] Health check endpoint sudah dibuat
- [ ] Command `npm run start:dev` berhasil tanpa error
- [ ] Database connection berhasil (log "Database connected successfully")
- [ ] Health check endpoint `/health` return status "connected"
- [ ] Test query `SELECT 1` berhasil executed

---

## Cara Testing

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup PostgreSQL Database

**Option A: Lokal PostgreSQL**
```bash
# Login ke PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE platform_cms;

# Exit
\q
```

**Option B: Docker PostgreSQL**
```bash
docker run --name postgres-platform-cms \
  -e POSTGRES_DB=platform_cms \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Create .env file
```bash
cp .env.example .env
# Edit .env sesuai database credentials
```

### 4. Start Application
```bash
npm run start:dev
```

Expected output:
```
Database connected successfully
[Nest] ... Application successfully started
```

### 5. Test Health Check Endpoint

**Dengan curl:**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-08T10:00:00.000Z"
}
```

**Dengan browser:**
Buka: http://localhost:3000/health

### 6. Test dengan psql

Verify connection dari PostgreSQL side:
```bash
psql -U postgres -d platform_cms -c "SELECT current_database(), current_user, version();"
```

### 7. Check Logs

Pastikan tidak ada error di console/logs:
```bash
npm run start:dev 2>&1 | grep -i error
# Seharusnya tidak ada output error
```

---

## Dokumentasi Referensi

Baca dokumen ini sebelum mulai:
- `docs/TASK-PLAN.md` - Task 1.3 detail
- `docs/TECHNICAL-ARCHITECTURE.md` - Section 2.1 (Database tech stack)
- `docs/ERD-DATABASE.md` - Database architecture overview
- `docs/AI-RULES.md` - Section 7 (Database rules)

---

## Aturan Penting

1. **HARUS install dependencies DULU** sebelum import di code
2. **JANGAN commit file .env** (hanya .env.example)
3. **GUNAKAN** environment variables untuk credentials
4. **TEST connection** sebelum commit
5. **CONNECTION POOLING** harus diaktifkan (max 20 connections)
6. **ERROR HANDLING** untuk connection failures
7. **LOGGING** untuk connection status (success/fail)
8. **HEALTH CHECK** endpoint wajib ada
9. **TypeScript strict mode** tetap enforced
10. **Drizzle ORM** sebagai database client (BUKAN TypeORM)

---

## Troubleshooting

**Problem**: npm install error peer dependencies
**Solution**: Gunakan `npm install --legacy-peer-deps`

**Problem**: Database connection refused
**Solution**: 
- Check PostgreSQL service running: `sudo systemctl status postgresql`
- Check credentials di .env
- Check port 5432 tidak dipakai aplikasi lain

**Problem**: Error "password authentication failed"
**Solution**: 
- Verify username/password di .env
- Reset PostgreSQL password: `ALTER USER postgres WITH PASSWORD 'newpassword';`

**Problem**: Error "database does not exist"
**Solution**: Create database: `CREATE DATABASE platform_cms;`

**Problem**: Connection timeout
**Solution**: 
- Check firewall rules
- Check PostgreSQL accepting connections: `listen_addresses = '*'` di postgresql.conf

**Problem**: Too many connections
**Solution**: 
- Reduce `DB_MAX_CONNECTIONS` di .env
- Check `max_connections` di PostgreSQL config

---

## Output Expected

Setelah task selesai:
1. Backend application start tanpa error
2. Log "Database connected successfully" muncul
3. Health check endpoint `/health` return `{"status":"ok","database":"connected"}`
4. Test query `SELECT 1` berhasil
5. Connection pooling active (max 20 connections)
6. No memory leaks (connection properly closed)
7. TypeScript compilation berhasil tanpa error
8. Drizzle provider properly injectable via DI

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 1.4: Redis Connection Setup** - Setup Redis untuk caching dan session management
