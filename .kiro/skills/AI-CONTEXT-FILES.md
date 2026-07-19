# AI Context Files - Platform CMS
**Purpose**: Single source of truth untuk AI tentang file mana yang WAJIB dibaca
**Last Updated**: 2026-07-19

---

## RULE: JANGAN BUAT FILE BARU SEMBARANGAN!

Sebelum buat file dokumentasi baru, BACA FILE INI DULU untuk pastikan tidak duplikasi.

---

## PRIMARY FILES (WAJIB BACA SAAT CONTEXT BARU)

### 1. PROJECT CONTEXT
**File**: `.kiro/skills/platform-cms-rules.md`
**When**: SELALU baca first time di session baru
**Content**: 
- Development rules (NO EMOJI, Bahasa Indonesia, Bash commands)
- Coding standards (Backend NestJS, Frontend Next.js)
- Git workflow
- Testing requirements

### 2. ACTIVE TASKS
**File**: `.kiro/specs/tenant-module-enhancement.md`
**When**: Saat mau mulai kerja
**Content**:
- Task breakdown detail (TASK 7.1 - 7.10)
- Implementation checklist
- Files to modify
- Acceptance criteria

### 3. BUSINESS REQUIREMENTS
**File**: `docs/BRD.md`
**When**: Perlu understand WHY feature exists
**Content**:
- Business goals
- Problem statements
- Success metrics
- Scope definition

### 4. TECHNICAL ARCHITECTURE
**File**: `docs/TECHNICAL-ARCHITECTURE.md`
**When**: Perlu understand HOW system works
**Content**:
- Multi-tenancy design
- Database schema approach
- Auth & permissions flow
- Module structure

---

## SECONDARY FILES (BACA KALAU BUTUH)

### API Documentation
**File**: `docs/API-CONTRACT.md`
**When**: Implement/modify API endpoints
**Content**: All API endpoints, request/response format

### Database Schema
**File**: `docs/ERD-DATABASE.md`
**When**: Database changes/migrations
**Content**: Table structures, relationships, indexes

### Security Guidelines
**File**: `docs/SECURITY-GUIDELINES.md`
**When**: Implement auth/security features
**Content**: Security best practices, common vulnerabilities

### Business Rules
**File**: `docs/BUSINESS-RULES.md`
**When**: Implement business logic
**Content**: Validation rules, business constraints

---

## REFERENCE FILES (BACA KALAU PERLU DETAIL)

### Project Brief
**File**: `docs/PROJECT-BRIEF.md`
**When**: Need high-level project context

### PRD (Product Requirements)
**File**: `docs/PRD.md`
**When**: Need detailed feature specifications

### Session Summaries
**Files**: `docs/SESSION-SUMMARY-*.md`
**When**: Need to know what was done in previous sessions

---

## MODULE-SPECIFIC DOCS

### Backend Docs
**Location**: `backend/docs/`
**Files**:
- `MULTI_TENANT_ARCHITECTURE.md` - Tenant system design
- `FINAL_SCHEMA_ARCHITECTURE.md` - Database architecture
- `BUGFIX-CURRENT-USER-PROTECTION.md` - Security bugfix detail
- `QUICK_ADMIN_SETUP.md` - Admin user setup
- `TESTING_*.md` - Testing guides

**When**: Working on specific backend features

### Frontend Design
**Files**:
- `docs/FRONTEND-DESIGN-SYSTEM.md` - UI components & patterns
- `docs/COMPONENT-LIBRARY.md` - Available components
- `docs/STYLE-CONSISTENCY-GUIDE.md` - Styling rules

**When**: Building frontend pages

---

## FILES TO IGNORE (ARCHIVED)

**Location**: `docs/archive/`
**Reason**: Outdated atau completed features, tidak relevan untuk current development

**DO NOT READ** unless specifically asked:
- `docs/archive/completed/*` - Old completion summaries
- `docs/archive/outdated/*` - Old task tracking

---

## WORKFLOW: SAAT CONTEXT BARU

```
1. READ: .kiro/skills/platform-cms-rules.md (2 min)
   → Understand development rules

2. READ: .kiro/skills/AI-CONTEXT-FILES.md (THIS FILE) (1 min)
   → Know what to read

3. READ: .kiro/specs/tenant-module-enhancement.md (5 min)
   → Know current tasks

4. CHECK: GitHub issues (gh issue list)
   → Know what's pending

5. START: Implement task
```

---

## WORKFLOW: SAAT BUTUH INFO SPESIFIK

**Need API info?**
→ Read `docs/API-CONTRACT.md`

**Need database schema?**
→ Read `docs/ERD-DATABASE.md`

**Need security guidance?**
→ Read `docs/SECURITY-GUIDELINES.md`

**Need business logic?**
→ Read `docs/BUSINESS-RULES.md`

**Need technical design?**
→ Read `docs/TECHNICAL-ARCHITECTURE.md`

---

## ATURAN MEMBUAT FILE BARU

### ❌ JANGAN BUAT FILE BARU UNTUK:
- Task tracking (use GitHub issues instead)
- Progress updates (use git commits + issue comments)
- Temporary notes (use `.kiro/specs/` for specs)
- Completion summaries (use session summaries if needed)

### ✅ BOLEH BUAT FILE BARU UNTUK:
- Detailed technical specs (`.kiro/specs/[module]-spec.md`)
- Bugfix documentation (`backend/docs/BUGFIX-*.md`)
- Testing guides (`backend/docs/TESTING-*.md`)
- Session summaries (`docs/SESSION-SUMMARY-[date]-[topic].md`)

### 📝 TEMPLATE FILE BARU

Kalau WAJIB buat file baru:

```markdown
# [Title]
**Created**: YYYY-MM-DD
**Status**: ACTIVE / ARCHIVED
**Purpose**: [One sentence]
**Related**: [Link to spec/issue]

---

[Content]

---

**Version**: 1.0
**Last Updated**: YYYY-MM-DD
```

---

## FILE CLEANUP CHECKLIST

Sebelum commit dokumentasi baru:

- [ ] Cek apakah info sudah ada di file existing
- [ ] Pastikan tidak duplikasi dengan file lain
- [ ] Taruh di lokasi yang benar (docs/ vs backend/docs/ vs .kiro/)
- [ ] Update THIS FILE kalau add file baru yang important
- [ ] Archive file lama kalau sudah outdated

---

## SUMMARY: FILE PRIORITY

**TIER 1 (WAJIB)**: 
- `platform-cms-rules.md`
- `tenant-module-enhancement.md`
- `BRD.md`

**TIER 2 (PENTING)**:
- `API-CONTRACT.md`
- `ERD-DATABASE.md`
- `TECHNICAL-ARCHITECTURE.md`

**TIER 3 (REFERENSI)**:
- `SECURITY-GUIDELINES.md`
- `BUSINESS-RULES.md`
- Backend docs

**TIER 4 (OPTIONAL)**:
- Design docs
- Session summaries
- Project brief/PRD

---

**Version**: 1.0
**Maintainer**: AI Agent
**Review**: Setiap ada file baru yang important
