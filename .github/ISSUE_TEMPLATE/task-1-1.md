# Task 1.1: Setup Proyek Backend NestJS

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 4 jam  
**Dependencies**: Tidak ada  
**Status**: Belum Dimulai

---

## Tujuan Task

Membuat project backend menggunakan NestJS 10 dengan TypeScript. Project ini akan menjadi fondasi untuk semua API dan business logic aplikasi Platform CMS.

---

## Yang Akan Dikerjakan

### 1. Struktur Folder
Buat struktur folder seperti ini:
```
backend/
├── src/
│   ├── main.ts              (file utama untuk start aplikasi)
│   ├── app.module.ts        (root module NestJS)
│   ├── common/              (folder untuk code yang dipakai bersama)
│   ├── config/              (folder untuk konfigurasi)
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── redis.config.ts
│   ├── database/            (folder untuk database)
│   │   ├── drizzle.provider.ts
│   │   └── schema/
│   │       ├── public/      (schema database global)
│   │       └── tenant/      (schema database per tenant)
│   └── modules/             (folder untuk module-module fitur)
├── test/                    (folder untuk test)
│   └── app.e2e-spec.ts
├── .env.example             (contoh file environment variables)
├── .eslintrc.js             (konfigurasi ESLint untuk quality code)
├── .prettierrc              (konfigurasi Prettier untuk format code)
├── .gitignore               (file yang tidak di-commit ke git)
├── nest-cli.json            (konfigurasi NestJS CLI)
├── package.json             (daftar dependencies)
├── tsconfig.json            (konfigurasi TypeScript)
├── tsconfig.build.json      (konfigurasi TypeScript untuk build)
└── vitest.config.ts         (konfigurasi Vitest untuk testing)
```

### 2. Install Dependencies
Install package-package ini dengan npm:

**Framework NestJS**:
- @nestjs/core
- @nestjs/common
- @nestjs/platform-express
- @nestjs/config
- rxjs
- reflect-metadata

**TypeScript**:
- typescript
- @types/node
- ts-node
- @swc/cli
- @swc/core

**Code Quality**:
- eslint
- @typescript-eslint/parser
- @typescript-eslint/eslint-plugin
- prettier
- eslint-config-prettier
- eslint-plugin-prettier

**Testing**:
- vitest
- @vitest/ui
- @nestjs/testing

**Development**:
- @nestjs/cli

### 3. File Konfigurasi

**tsconfig.json** - Konfigurasi TypeScript dengan strict mode
**eslintrc.js** - Rules untuk ESLint sesuai AI-RULES.md
**.prettierrc** - Format code (single quote, trailing comma, dll)
**nest-cli.json** - Konfigurasi NestJS CLI
**vitest.config.ts** - Konfigurasi testing dengan Vitest

### 4. File Source Code

**src/main.ts**:
- Entry point aplikasi
- Bootstrap NestJS application
- Listen di port 3000 (dari environment variable)
- Enable CORS
- Setup validation pipe

**src/app.module.ts**:
- Root module
- Import ConfigModule untuk environment variables
- Import DatabaseModule (akan dibuat nanti)

**src/config/app.config.ts**:
- Konfigurasi aplikasi (port, name, environment)
- Menggunakan @nestjs/config

**src/config/database.config.ts**:
- Konfigurasi database PostgreSQL
- Host, port, database name, user, password
- Connection pooling settings

**src/config/redis.config.ts**:
- Konfigurasi Redis
- Host, port, password, database number

### 5. Environment Variables

Buat file .env.example dengan variabel:
```
# Application
NODE_ENV=development
APP_PORT=3000
APP_NAME=Platform CMS
APP_URL=http://localhost:3000

# Database (akan dipakai di task berikutnya)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=platform_cms
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Redis (akan dipakai di task berikutnya)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT (akan dipakai di task berikutnya)
JWT_SECRET=change-this-in-production
JWT_EXPIRATION=24h

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### 6. NPM Scripts

Tambahkan scripts di package.json:
```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest --coverage",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "lint:fix": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] Folder backend sudah dibuat dengan struktur yang benar
- [ ] File package.json sudah ada dan dependencies sudah terinstall
- [ ] File tsconfig.json sudah ada dengan strict mode enabled
- [ ] File .eslintrc.js sudah ada sesuai AI-RULES.md (kebab-case, PascalCase, dll)
- [ ] File .prettierrc sudah ada (single quote, trailing comma all)
- [ ] File .gitignore sudah ada (node_modules, dist, .env)
- [ ] File nest-cli.json sudah ada
- [ ] File vitest.config.ts sudah ada
- [ ] File .env.example sudah ada dengan semua variabel
- [ ] File src/main.ts sudah ada dan bisa running
- [ ] File src/app.module.ts sudah ada
- [ ] File src/config/app.config.ts sudah ada
- [ ] File src/config/database.config.ts sudah ada
- [ ] File src/config/redis.config.ts sudah ada
- [ ] File test/app.e2e-spec.ts sudah ada
- [ ] Command `npm run start:dev` berhasil tanpa error
- [ ] Command `npm run lint` berhasil tanpa error
- [ ] Command `npm run test` berhasil tanpa error
- [ ] Command `npm run type-check` berhasil tanpa error
- [ ] Akses http://localhost:3000 mengembalikan response (bisa 404 atau hello world)

---

## Cara Testing

1. Jalankan `npm install` - harus berhasil tanpa error
2. Jalankan `npm run type-check` - harus berhasil tanpa error TypeScript
3. Jalankan `npm run lint` - harus berhasil tanpa error ESLint
4. Jalankan `npm run test` - harus berhasil (walau belum ada test)
5. Jalankan `npm run start:dev` - aplikasi harus start di port 3000
6. Buka browser ke http://localhost:3000 - harus ada response (tidak error)
7. Tekan Ctrl+C untuk stop aplikasi - harus stop dengan bersih

---

## Dokumentasi Referensi

Baca dokumen ini sebelum mulai:
- `docs/TASK-PLAN.md` - Task 1.1 (halaman awal)
- `docs/AI-RULES.md` - Section 5 (Backend Coding Rules)
- `docs/TECHNICAL-ARCHITECTURE.md` - Section 2.1 (Backend Tech Stack)
- `docs/TECHNICAL-ARCHITECTURE.md` - Section 3.1 (Backend Structure)

---

## Aturan Penting

1. **HARUS install dependencies DULU** sebelum import di code
2. **JANGAN gunakan** `any` type di TypeScript
3. **GUNAKAN** naming convention:
   - File: kebab-case (user.controller.ts)
   - Class: PascalCase (UserController)
   - Variable: camelCase (userId)
   - Constant: UPPER_SNAKE_CASE (MAX_ATTEMPTS)
4. **GUNAKAN** npm (BUKAN yarn atau pnpm)
5. **ENABLE** TypeScript strict mode
6. **JANGAN** commit file .env (hanya .env.example)

---

## Troubleshooting

**Problem**: npm install error "cannot find module"
**Solution**: Hapus folder node_modules dan file package-lock.json, lalu `npm install` lagi

**Problem**: TypeScript error "cannot find name"
**Solution**: Pastikan sudah install @types/node

**Problem**: ESLint error banyak
**Solution**: Jalankan `npm run lint:fix` untuk auto-fix

**Problem**: Port 3000 sudah dipakai
**Solution**: Ubah APP_PORT di .env atau kill process yang pakai port 3000

---

## Output Expected

Setelah task selesai:
1. Folder `backend/` exist dengan struktur lengkap
2. Command `npm run start:dev` berhasil start aplikasi
3. Browser bisa akses http://localhost:3000
4. Tidak ada error di console
5. Code sudah formatted dengan Prettier
6. Code sudah lulus ESLint check
7. TypeScript compilation berhasil tanpa error

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 1.2: Frontend Project Setup** - Setup Next.js 15 dengan App Router
