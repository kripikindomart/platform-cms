# Platform CMS Documentation
# 📚 Complete Documentation Index

**Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: Documentation Complete (Phase 1)

---

## 🚀 Quick Start

Baru pertama kali? Mulai dari sini:

1. **START HERE** → [SUMMARY.md](SUMMARY.md) - Quick reference & dokumentasi index
2. **Pahami Proyek** → [PROJECT-BRIEF.md](PROJECT-BRIEF.md) - Foundation document
3. **Aturan Kerja** → [AI-RULES.md](AI-RULES.md) - Development guidelines (WAJIB BACA!)

---

## 📋 Dokumentasi Lengkap (14 Dokumen)

### ✅ Foundation Documents

| No | Dokumen | Fungsi | Kapan Dibaca |
|----|---------|--------|--------------|
| 1 | [**SUMMARY.md**](SUMMARY.md) | 📖 Quick reference, index, executive summary | **Pertama kali** |
| 2 | [**PROJECT-BRIEF.md**](PROJECT-BRIEF.md) | 🎯 Foundation, single source of truth | **Pertama kali** |
| 3 | [**AI-RULES.md**](AI-RULES.md) | 🤖 AI coding guidelines, aturan kerja | **SEBELUM coding** |

### ✅ Business Documents

| No | Dokumen | Fungsi | Kapan Dibaca |
|----|---------|--------|--------------|
| 4 | [**BRD.md**](BRD.md) | 💼 Business requirements, stakeholder needs | Saat pahami business context |
| 5 | [**PRD.md**](PRD.md) | 📝 Product requirements, user stories | SEBELUM implement fitur |
| 6 | [**BUSINESS-RULES.md**](BUSINESS-RULES.md) | ⚖️ Business logic rules, workflow | SEBELUM implement logic |

### ✅ Feature Documents

| No | Dokumen | Fungsi | Kapan Dibaca |
|----|---------|--------|--------------|
| 7 | [**FEATURE-LIST.md**](FEATURE-LIST.md) | 📊 Feature catalog dengan prioritas | Saat planning sprint |
| 8 | [**USER-FLOW.md**](USER-FLOW.md) | 🔄 User journey, flow diagram | SEBELUM buat UI/UX |
| 9 | [**SCREEN-LIST.md**](SCREEN-LIST.md) | 🖥️ Screen catalog, routes | SEBELUM buat frontend |

### ✅ Technical Documents

| No | Dokumen | Fungsi | Kapan Dibaca |
|----|---------|--------|--------------|
| 10 | [**TECHNICAL-ARCHITECTURE.md**](TECHNICAL-ARCHITECTURE.md) | 🏗️ System architecture, tech stack, deployment | **SEBELUM coding** |
| 11 | [**ERD-DATABASE.md**](ERD-DATABASE.md) | 🗄️ Database design, ERD, schema | SEBELUM buat entity/migration |
| 12 | [**API-CONTRACT.md**](API-CONTRACT.md) | 🔌 API specs, endpoints, format | SEBELUM buat/consume API |
| 13 | [**VALIDATION-RULES.md**](VALIDATION-RULES.md) | ✔️ Validation rules per field | SEBELUM buat form/validation |

### ✅ Planning Documents

| No | Dokumen | Fungsi | Kapan Dibaca |
|----|---------|--------|--------------|
| 14 | [**DOCUMENTATION-PLAN.md**](DOCUMENTATION-PLAN.md) | 📅 Documentation roadmap | Untuk tracking progress |

---

## 🎯 Dokumen Wajib Baca Sebelum Coding

### Checklist Developer

- [ ] **SUMMARY.md** - Pahami overview proyek
- [ ] **PROJECT-BRIEF.md** - Pahami identitas & tech stack
- [ ] **AI-RULES.md** - Pahami aturan kerja & conventions
- [ ] **BUSINESS-RULES.md** - Pahami logika bisnis
- [ ] **VALIDATION-RULES.md** - Pahami aturan validasi
- [ ] **API-CONTRACT.md** - Pahami format API
- [ ] **ERD-DATABASE.md** - Pahami database schema
- [ ] **TECHNICAL-ARCHITECTURE.md** - Pahami arsitektur sistem

---

## ⚠️ Critical Rules (MUST REMEMBER!)

1. ❌ **JANGAN hard delete** → ALWAYS soft delete
2. ❌ **JANGAN ubah tech stack** → Stack is IMMUTABLE
3. ❌ **JANGAN skip tenant isolation** → ALWAYS tenant-aware
4. ❌ **JANGAN English error messages** → ALWAYS Bahasa Indonesia
5. ❌ **JANGAN guess** → ALWAYS baca dokumentasi

---

## 📊 Tech Stack Summary

### Backend
- **Framework**: NestJS 10+
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 15+ (multi-tenancy schema-based)
- **Cache**: Redis 7+
- **Validation**: Zod

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod

### Development
- **Package Manager**: npm 10+ (BUKAN yarn/pnpm)
- **Node.js**: 20 LTS
- **Testing**: Vitest + Playwright

---

## 📅 MVP Timeline

**Phase 1: Core Platform** (16 weeks)
- Week 1-4: Foundation & Auth
- Week 5-8: User & Role Management
- Week 9-12: Master Data & Audit
- Week 13-16: Testing & Documentation

---

## ✅ Documentation Status

**Total Documents**: 14 completed  
**Coverage**: 100% (Phase 1 requirements)  
**Last Review**: 2024-01-08  

---

**Happy Coding! 🚀**
