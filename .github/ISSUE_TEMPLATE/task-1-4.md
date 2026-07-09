# Task 1.4: Setup Redis Connection

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 2 jam  
**Dependencies**: Task 1.1 (Backend Project Setup)  
**Status**: Belum Dimulai

---

## Tujuan Task

Membuat koneksi Redis dengan ioredis library dan setup RedisService untuk caching dan session management di backend NestJS.

---

## Yang Akan Dikerjakan

### 1. Install Dependencies

Install package yang diperlukan dengan npm:

```bash
npm install ioredis
npm install -D @types/ioredis
```

**Package yang akan terinstall:**
- `ioredis` - Redis client untuk Node.js (high performance)
- `@types/ioredis` - TypeScript types untuk ioredis

### 2. Struktur Folder

Buat struktur folder untuk Redis module:

```
backend/src/
├── core/
│   └── cache/
│       ├── redis.service.ts       (Redis service dengan operations)
│       ├── redis.module.ts        (Redis module NestJS)
│       └── redis.provider.ts      (Redis provider untuk DI)
└── config/
    └── redis.config.ts            (Sudah ada, akan diverifikasi)
```

### 3. File redis.config.ts

File ini sudah ada dari Task 1.1, verify isinya:

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
}));
```

### 4. Create Redis Provider

**redis.provider.ts** - Provider untuk inject Redis client:

```typescript
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';

export const REDIS_TOKEN = 'REDIS';

export const redisProvider = {
  provide: REDIS_TOKEN,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('RedisProvider');

    const client = new Redis({
      host: configService.get<string>('redis.host'),
      port: configService.get<number>('redis.port'),
      password: configService.get<string>('redis.password') || undefined,
      db: configService.get<number>('redis.db'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    // Event handlers
    client.on('connect', () => {
      logger.log('✅ Redis connected successfully');
      logger.log(`🔗 Redis: ${configService.get<string>('redis.host')}:${configService.get<number>('redis.port')}`);
      logger.log(`📊 Database: ${configService.get<number>('redis.db')}`);
    });

    client.on('error', (err) => {
      logger.error('❌ Redis connection error:', err.message);
    });

    client.on('close', () => {
      logger.warn('⚠️ Redis connection closed');
    });

    client.on('reconnecting', () => {
      logger.log('🔄 Redis reconnecting...');
    });

    // Test connection
    try {
      await client.ping();
      logger.log('✅ Redis PING successful');
    } catch (error) {
      logger.error('❌ Redis PING failed:', error);
      throw error;
    }

    return client;
  },
};
```

### 5. Create Redis Service

**redis.service.ts** - Service dengan basic operations:

```typescript
import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { REDIS_TOKEN } from './redis.provider';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_TOKEN)
    private readonly client: Redis,
  ) {}

  async onModuleDestroy() {
    await this.client.quit();
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  // JSON operations
  async setJSON(key: string, value: any, ttl?: number): Promise<void> {
    const jsonString = JSON.stringify(value);
    await this.set(key, jsonString, ttl);
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.client.hdel(key, ...fields);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.client.lpush(key, ...values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.client.rpush(key, ...values);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sismember(key, member);
    return result === 1;
  }

  // Utility
  async ping(): Promise<string> {
    return this.client.ping();
  }

  async flushdb(): Promise<string> {
    return this.client.flushdb();
  }

  getClient(): Redis {
    return this.client;
  }
}
```

### 6. Create Redis Module

**redis.module.ts** - NestJS module:

```typescript
import { Module, Global } from '@nestjs/common';
import { redisProvider } from './redis.provider';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [redisProvider, RedisService],
  exports: [redisProvider, RedisService],
})
export class RedisModule {}
```

### 7. Update app.module.ts

Import RedisModule:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './core/cache/redis.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: '.env',
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

### 8. Update Health Check

Update `health.controller.ts` untuk include Redis status:

```typescript
import { Controller, Get, Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../database/drizzle.provider';
import { RedisService } from '../core/cache/redis.service';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async check() {
    const timestamp = new Date().toISOString();
    
    // Check database
    let databaseStatus = 'disconnected';
    try {
      await this.db.execute(sql`SELECT 1 as status`);
      databaseStatus = 'connected';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check Redis
    let redisStatus = 'disconnected';
    try {
      await this.redisService.ping();
      redisStatus = 'connected';
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    const overallStatus = 
      databaseStatus === 'connected' && redisStatus === 'connected' 
        ? 'ok' 
        : 'degraded';

    return {
      status: overallStatus,
      database: databaseStatus,
      redis: redisStatus,
      timestamp,
      service: 'Platform CMS API',
    };
  }
}
```

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] Package ioredis dan @types/ioredis sudah terinstall
- [ ] File redis.config.ts sudah diverifikasi
- [ ] File redis.provider.ts sudah dibuat
- [ ] File redis.service.ts sudah dibuat dengan operations lengkap
- [ ] File redis.module.ts sudah dibuat (Global module)
- [ ] RedisModule sudah di-import ke AppModule
- [ ] Health check controller sudah diupdate dengan Redis status
- [ ] Command `npm run type-check` berhasil tanpa error
- [ ] Command `npm run lint` berhasil tanpa error
- [ ] Command `npm run build` berhasil tanpa error
- [ ] Command `npm run start:dev` berhasil dan Redis connected
- [ ] Redis PING berhasil
- [ ] Health check endpoint return Redis status
- [ ] Test basic operations (set, get, del, exists)

---

## Cara Testing

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Redis

**Option A: Lokal Redis**
```bash
# Install Redis (Windows WSL atau Linux)
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping
# Should return: PONG
```

**Option B: Docker Redis**
```bash
docker run --name redis-platform-cms \
  -p 6379:6379 \
  -d redis:7
  
# Verify
docker exec -it redis-platform-cms redis-cli ping
# Should return: PONG
```

**Option C: Windows Redis (via Memurai)**
```bash
# Download Memurai from memurai.com
# Install dan start service
# Test connection
redis-cli ping
```

### 3. Verify .env

Pastikan .env punya config Redis:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 4. Start Application
```bash
npm run start:dev
```

Expected logs:
```
[RedisProvider] ✅ Redis connected successfully
[RedisProvider] 🔗 Redis: localhost:6379
[RedisProvider] 📊 Database: 0
[RedisProvider] ✅ Redis PING successful
```

### 5. Test Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-01-08T10:00:00.000Z",
  "service": "Platform CMS API"
}
```

### 6. Test Redis Operations (via redis-cli)
```bash
# Set key
redis-cli SET test:key "Hello Redis"

# Get key
redis-cli GET test:key
# Should return: "Hello Redis"

# Check keys
redis-cli KEYS "test:*"

# Delete key
redis-cli DEL test:key
```

### 7. Test dengan Code

Buat test file `test-redis.ts`:
```typescript
import { RedisService } from './src/core/cache/redis.service';

async function testRedis(redisService: RedisService) {
  // Test set/get
  await redisService.set('test:key', 'test value', 60);
  const value = await redisService.get('test:key');
  console.log('Get value:', value); // Should be: test value
  
  // Test JSON
  await redisService.setJSON('test:json', { name: 'John', age: 30 }, 60);
  const json = await redisService.getJSON('test:json');
  console.log('Get JSON:', json); // Should be: { name: 'John', age: 30 }
  
  // Test exists
  const exists = await redisService.exists('test:key');
  console.log('Exists:', exists); // Should be: true
  
  // Test delete
  await redisService.del('test:key');
  const deleted = await redisService.exists('test:key');
  console.log('After delete:', deleted); // Should be: false
}
```

---

## Dokumentasi Referensi

Baca dokumen ini sebelum mulai:
- `docs/TASK-PLAN.md` - Task 1.4 detail
- `docs/TECHNICAL-ARCHITECTURE.md` - Section 2.1 (Redis for caching)
- `docs/AI-RULES.md` - Backend coding rules

---

## Aturan Penting

1. **HARUS install dependencies DULU** sebelum import di code
2. **GUNAKAN** ioredis (BUKAN redis package)
3. **GLOBAL MODULE** untuk RedisService (injectable everywhere)
4. **ERROR HANDLING** untuk connection failures
5. **LOGGING** untuk connection events (connect, error, close, reconnect)
6. **RETRY STRATEGY** configured (exponential backoff)
7. **TTL SUPPORT** untuk semua set operations
8. **JSON SUPPORT** untuk complex data structures
9. **TypeScript strict mode** tetap enforced
10. **GRACEFUL SHUTDOWN** (quit connection on destroy)

---

## Troubleshooting

**Problem**: npm install error
**Solution**: Gunakan `npm install --legacy-peer-deps`

**Problem**: Redis connection refused
**Solution**: 
- Check Redis service running: `redis-cli ping`
- Check port 6379 tidak blocked
- Verify REDIS_HOST dan REDIS_PORT di .env

**Problem**: ECONNREFUSED error
**Solution**:
- Start Redis: `sudo systemctl start redis-server`
- Or Docker: `docker start redis-platform-cms`

**Problem**: Authentication failed
**Solution**:
- Check REDIS_PASSWORD di .env
- Verify Redis requirepass: `redis-cli CONFIG GET requirepass`

**Problem**: Connection timeout
**Solution**:
- Increase maxRetriesPerRequest
- Check network/firewall

**Problem**: Memory issues
**Solution**:
- Set maxmemory di Redis: `redis-cli CONFIG SET maxmemory 256mb`
- Set eviction policy: `redis-cli CONFIG SET maxmemory-policy allkeys-lru`

---

## Output Expected

Setelah task selesai:
1. Backend application start dengan Redis connected
2. Log "✅ Redis connected successfully" muncul
3. Log "✅ Redis PING successful" muncul
4. Health check return `{"redis":"connected"}`
5. RedisService injectable di semua modules
6. Basic operations (set, get, del) bekerja
7. JSON operations bekerja
8. TTL operations bekerja
9. TypeScript compilation berhasil
10. Lint berhasil tanpa error

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 1.5: Environment Configuration** - Complete environment setup untuk dev/staging/prod
