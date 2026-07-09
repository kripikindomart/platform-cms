# Task 1.2: Setup Proyek Frontend Next.js

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 3 jam  
**Dependencies**: Tidak ada (independent dari backend)  
**Status**: Belum Dimulai

---

## Tujuan Task

Membuat project frontend menggunakan Next.js 15 dengan App Router dan TypeScript. Project ini akan menjadi fondasi untuk semua user interface aplikasi Platform CMS.

---

## Yang Akan Dikerjakan

### 1. Struktur Folder
Buat struktur folder seperti ini:
```
frontend/
├── app/
│   ├── layout.tsx           (root layout)
│   ├── page.tsx             (home page)
│   ├── globals.css          (global styles)
│   ├── (auth)/              (route group untuk auth)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   └── (private)/           (route group untuk private pages)
│       ├── portal/          (dashboard - bukan /dashboard)
│       │   └── page.tsx
│       └── layout.tsx
├── components/
│   ├── ui/                  (shadcn/ui components)
│   └── layout/              (layout components)
├── lib/
│   ├── utils.ts             (utility functions)
│   └── api.ts               (API client)
├── hooks/                   (custom React hooks)
├── stores/                  (Zustand stores)
├── types/                   (TypeScript types)
├── public/                  (static assets)
├── .env.local.example       (environment variables template)
├── .eslintrc.json           (ESLint config)
├── .prettierrc              (Prettier config)
├── .gitignore               (git ignore)
├── components.json          (shadcn/ui config)
├── next.config.js           (Next.js config)
├── package.json             (dependencies)
├── postcss.config.js        (PostCSS config)
├── tailwind.config.ts       (Tailwind config)
├── tsconfig.json            (TypeScript config)
└── vitest.config.ts         (Vitest config untuk testing)
```

### 2. Install Dependencies
Install package-package ini dengan npm:

**Framework Next.js**:
- next@15
- react@19
- react-dom@19

**TypeScript**:
- typescript
- @types/node
- @types/react
- @types/react-dom

**Tailwind CSS**:
- tailwindcss
- postcss
- autoprefixer
- tailwindcss-animate

**UI Components (shadcn/ui)**:
- @radix-ui/react-* (akan terinstall otomatis via shadcn)
- lucide-react (icons)
- class-variance-authority
- clsx
- tailwind-merge

**Forms & Validation**:
- react-hook-form
- @hookform/resolvers
- zod

**State Management**:
- zustand
- @tanstack/react-query

**HTTP Client**:
- axios

**Testing**:
- vitest
- @testing-library/react
- @testing-library/jest-dom
- @vitejs/plugin-react

**Development**:
- eslint
- eslint-config-next
- prettier

### 3. File Konfigurasi

**tsconfig.json** - Konfigurasi TypeScript dengan strict mode
**eslintrc.json** - Rules untuk ESLint per AI-RULES.md
**.prettierrc** - Format code (single quote, trailing comma)
**next.config.js** - Konfigurasi Next.js
**tailwind.config.ts** - Konfigurasi Tailwind CSS
**postcss.config.js** - Konfigurasi PostCSS
**components.json** - Konfigurasi shadcn/ui
**vitest.config.ts** - Konfigurasi testing

### 4. Initialize shadcn/ui

Jalankan command:
```bash
npx shadcn-ui@latest init
```

Pilih options:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Install komponen dasar:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add toast
```

### 5. File Source Code

**app/layout.tsx**:
- Root layout untuk semua pages
- Setup font (Inter dari next/font)
- Include Tailwind CSS global styles
- Setup providers (TanStack Query)

**app/page.tsx**:
- Home page / landing page
- Sementara bisa redirect ke /login

**app/globals.css**:
- Import Tailwind CSS
- CSS variables untuk theming
- Custom styles

**app/(auth)/layout.tsx**:
- Layout untuk auth pages (login, register)
- Centered design tanpa sidebar

**app/(auth)/login/page.tsx**:
- Login form (email, password)
- Link to register page

**app/(private)/layout.tsx**:
- Layout untuk private pages
- Include header, sidebar (nanti)

**app/(private)/portal/page.tsx**:
- Dashboard page
- Show "Dashboard" text sementara

**lib/utils.ts**:
- Utility function cn() untuk class merging
- Helper functions

**lib/api.ts**:
- Axios instance dengan baseURL
- Request/response interceptors
- Error handling

### 6. Environment Variables

Buat file .env.local.example:
```
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# App
NEXT_PUBLIC_APP_NAME=Platform CMS
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 7. NPM Scripts

Scripts yang harus ada di package.json:
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] Folder frontend sudah dibuat dengan struktur yang benar
- [ ] File package.json sudah ada dan dependencies sudah terinstall
- [ ] File tsconfig.json sudah ada dengan strict mode enabled
- [ ] File .eslintrc.json sudah ada sesuai AI-RULES.md
- [ ] File .prettierrc sudah ada (single quote, trailing comma all)
- [ ] File .gitignore sudah ada (node_modules, .next, .env.local)
- [ ] File next.config.js sudah ada
- [ ] File tailwind.config.ts sudah ada
- [ ] File postcss.config.js sudah ada
- [ ] File components.json sudah ada (shadcn/ui initialized)
- [ ] File vitest.config.ts sudah ada
- [ ] File .env.local.example sudah ada
- [ ] File app/layout.tsx sudah ada
- [ ] File app/page.tsx sudah ada
- [ ] File app/globals.css sudah ada
- [ ] File app/(auth)/login/page.tsx sudah ada
- [ ] File app/(private)/portal/page.tsx sudah ada
- [ ] File lib/utils.ts sudah ada
- [ ] File lib/api.ts sudah ada
- [ ] shadcn/ui initialized dengan beberapa komponen
- [ ] Command `npm run dev` berhasil tanpa error
- [ ] Command `npm run lint` berhasil tanpa error
- [ ] Command `npm run type-check` berhasil tanpa error
- [ ] Akses http://localhost:3001 menampilkan home page
- [ ] Akses http://localhost:3001/login menampilkan login page
- [ ] Akses http://localhost:3001/portal menampilkan dashboard page

---

## Cara Testing

1. Jalankan `npm install` - harus berhasil tanpa error
2. Jalankan `npm run type-check` - harus berhasil tanpa error TypeScript
3. Jalankan `npm run lint` - harus berhasil tanpa error ESLint
4. Jalankan `npm run dev` - aplikasi harus start di port 3001
5. Buka browser ke http://localhost:3001 - harus tampil home page
6. Buka http://localhost:3001/login - harus tampil login page
7. Buka http://localhost:3001/portal - harus tampil dashboard page
8. Hot reload harus bekerja (ubah file, auto refresh)
9. Tekan Ctrl+C untuk stop aplikasi - harus stop dengan bersih

---

## Dokumentasi Referensi

Baca dokumen ini sebelum mulai:
- `docs/TASK-PLAN.md` - Task 1.2
- `docs/AI-RULES.md` - Section 6 (Frontend Coding Rules)
- `docs/TECHNICAL-ARCHITECTURE.md` - Section 2.2 (Frontend Tech Stack)
- `docs/TECHNICAL-ARCHITECTURE.md` - Section 3.2 (Frontend Structure)
- `docs/FRONTEND-DESIGN-SYSTEM.md` - Design tokens and components

---

## Aturan Penting

1. **HARUS install dependencies DULU** sebelum import di code
2. **JANGAN gunakan** `any` type di TypeScript
3. **GUNAKAN** naming convention:
   - File: kebab-case (user-form.tsx)
   - Component: PascalCase (UserForm)
   - Variable: camelCase (userId)
   - Constant: UPPER_SNAKE_CASE (API_BASE_URL)
4. **GUNAKAN** npm (BUKAN yarn atau pnpm)
5. **ENABLE** TypeScript strict mode
6. **JANGAN** commit file .env.local (hanya .env.local.example)
7. **GUNAKAN** App Router (BUKAN Pages Router)
8. **GUNAKAN** Tailwind CSS (BUKAN inline styles atau CSS modules)
9. **GUNAKAN** "use client" directive untuk client components
10. **PATH harus non-standard**: /portal (bukan /dashboard), /mgmt-users (bukan /users)

---

## Troubleshooting

**Problem**: npm install error peer dependencies
**Solution**: Gunakan `npm install --legacy-peer-deps`

**Problem**: shadcn-ui init gagal
**Solution**: Pastikan tailwind sudah terinstall dan configured

**Problem**: TypeScript error "Cannot find module next"
**Solution**: Restart TypeScript server di VSCode (Ctrl+Shift+P > Restart TS Server)

**Problem**: Port 3001 sudah dipakai
**Solution**: Ubah port di package.json script atau kill process yang pakai port 3001

**Problem**: Tailwind classes tidak apply
**Solution**: Check postcss.config.js dan tailwind.config.ts sudah benar

---

## Output Expected

Setelah task selesai:
1. Folder `frontend/` exist dengan struktur lengkap
2. Command `npm run dev` berhasil start aplikasi di port 3001
3. Browser bisa akses http://localhost:3001
4. Login page sudah ada di /login
5. Dashboard page sudah ada di /portal
6. Tidak ada error di console browser
7. Hot reload bekerja (ubah file, auto refresh)
8. Code sudah formatted dengan Prettier
9. Code sudah lulus ESLint check
10. TypeScript compilation berhasil tanpa error

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 1.3: Database Connection Setup** - Setup PostgreSQL dengan Drizzle ORM
