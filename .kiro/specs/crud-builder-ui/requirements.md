# Requirements: Visual CRUD Builder UI

**Feature Name**: Visual CRUD Builder UI  
**Version**: 1.0.0  
**Status**: Draft  
**Created**: 2026-07-22  
**Priority**: P1 - HIGH

---

## 1. EXECUTIVE SUMMARY

### 1.1 Problem Statement
Saat ini, developer harus menggunakan CLI untuk generate CRUD module. Untuk non-technical user atau developer yang lebih suka interface visual, CLI kurang user-friendly dan memiliki learning curve.

### 1.2 Proposed Solution
Membuat Visual CRUD Builder berbasis web yang memungkinkan user untuk:
- Design module schema secara visual (drag-drop atau form-based)
- Configure field properties dengan UI yang intuitif
- Preview generated code sebelum create
- Generate module langsung dari browser tanpa perlu CLI
- Auto-create permissions, menu items, dan role assignment

### 1.3 Success Criteria
- User dapat generate module tanpa menggunakan CLI
- Generation time < 10 detik untuk module sederhana
- Zero errors pada generated code (compile ready)
- 80% user prefer UI builder dibanding CLI (survey)

### 1.4 Out of Scope (Not in MVP)
- Frontend code generation (backend only)
- Visual database diagram editor
- Code preview dengan syntax highlighting
- Module template library
- Export/import module definitions
- Collaborative module design

---

## 2. USER PERSONAS

### 2.1 Primary Persona: Junior Developer
**Name**: Budi  
**Role**: Junior Backend Developer  
**Experience**: 6 bulan programming, baru belajar NestJS  
**Pain Points**:
- Sering typo saat pakai CLI
- Lupa syntax field definitions
- Tidak yakin field mana yang perlu index
- Butuh reference visual saat design schema

**Goals**:
- Generate module tanpa error
- Belajar best practices dari UI hints
- Cepat prototype module baru

### 2.2 Secondary Persona: Technical Product Manager
**Name**: Siti  
**Role**: Technical PM  
**Experience**: Paham database, tapi tidak coding sehari-hari  
**Pain Points**:
- Tidak nyaman dengan CLI
- Perlu quickly prototype module untuk demo
- Ingin tahu struktur module tanpa baca code

**Goals**:
- Define module schema untuk developer
- Export requirements ke developer
- Validate module structure sebelum implement

### 2.3 Tertiary Persona: Senior Developer
**Name**: Andi  
**Role**: Senior Full-stack Developer  
**Experience**: 5 tahun, expert di NestJS  
**Pain Points**:
- CLI cukup cepat, tapi UI lebih visual untuk complex modules
- Perlu explain module structure ke junior
- Kadang butuh preview sebelum generate

**Goals**:
- Speed up module generation untuk complex schema
- Teach junior developer via visual interface
- Validate generated code quality

---

## 3. USER STORIES

### 3.1 Module Creation (Core Flow)

#### User Story 1.1: Create New Module
**As a** developer  
**I want to** create a new module using visual interface  
**So that** I can generate CRUD module without using CLI

**Acceptance Criteria**:
- [ ] User dapat akses halaman "Module Builder" dari menu
- [ ] User dapat input module name (singular form)
- [ ] System validate module name (lowercase, no spaces, alphanumeric)
- [ ] System check jika module sudah exist (show warning)
- [ ] User dapat enable/disable: Tenant Isolation, Soft Delete, Audit Logging
- [ ] System show preview module path yang akan dibuat

**Priority**: P0 - CRITICAL  
**Estimated Effort**: 4 jam

---

#### User Story 1.2: Add Fields to Module
**As a** developer  
**I want to** add fields dengan visual form  
**So that** I don't need to remember field syntax

**Acceptance Criteria**:
- [ ] User dapat klik "Add Field" button
- [ ] Form tampil dengan fields: name, type, length, required, unique, default value
- [ ] Dropdown type menampilkan 15+ tipe data (string, text, integer, decimal, boolean, date, datetime, email, url, json, uuid, enum)
- [ ] Length field muncul conditional (hanya untuk string, varchar)
- [ ] Precision & Scale field muncul untuk decimal/numeric
- [ ] Checkbox "Required" dan "Unique"
- [ ] Input "Default Value" (optional)
- [ ] System validate field name (lowercase, snake_case)
- [ ] User dapat edit field yang sudah ditambahkan
- [ ] User dapat delete field (dengan confirmation)
- [ ] User dapat reorder fields (drag-drop atau up/down button)

**Priority**: P0 - CRITICAL  
**Estimated Effort**: 8 jam

---

#### User Story 1.3: Configure Query Options
**As a** developer  
**I want to** configure searchable, filterable, sortable fields  
**So that** generated module supports advanced queries

**Acceptance Criteria**:
- [ ] User dapat pilih field mana yang searchable (multi-select)
- [ ] User dapat pilih field mana yang filterable (multi-select)
- [ ] User dapat pilih field mana yang sortable (multi-select)
- [ ] System hanya tampilkan fields yang sudah ditambahkan
- [ ] System disable pilihan yang tidak compatible (misal: search pada boolean)
- [ ] Preview menunjukkan query features yang akan di-generate

**Priority**: P1 - HIGH  
**Estimated Effort**: 4 jam

---

#### User Story 1.4: Generate Module
**As a** developer  
**I want to** generate module dengan 1 klik  
**So that** backend code auto-created sesuai design

**Acceptance Criteria**:
- [ ] User dapat klik "Generate Module" button
- [ ] System validate semua input (module name, minimal 1 field, dll)
- [ ] System show loading state selama generation
- [ ] System create 12 files (controller, service, repository, DTOs, entity, tests)
- [ ] System create permissions (4 default: read, create, update, delete)
- [ ] System create menu item di "Main Menu"
- [ ] System assign permissions ke current user role
- [ ] System show success message dengan summary:
  - Files created: 12
  - Permissions created: 4
  - Menu item created: Yes
- [ ] System provide link ke generated module code
- [ ] Generation time < 10 detik

**Priority**: P0 - CRITICAL  
**Estimated Effort**: 12 jam

---

### 3.2 Validation & Preview

#### User Story 2.1: Field Validation Rules
**As a** developer  
**I want to** add validation rules ke field  
**So that** generated DTO automatically validates input

**Acceptance Criteria**:
- [ ] User dapat add multiple validations per field
- [ ] Validation options: min length, max length, min value, max value, regex pattern, email format, url format, numeric only, alpha only
- [ ] System auto-suggest validation based on field type (email → email validation)
- [ ] User dapat see validation preview in DTO
- [ ] Generated DTO include class-validator decorators

**Priority**: P1 - HIGH  
**Estimated Effort**: 6 jam

---

#### User Story 2.2: Preview Generated Structure
**As a** developer  
**I want to** preview module structure sebelum generate  
**So that** I can validate design sebelum create files

**Acceptance Criteria**:
- [ ] User dapat klik "Preview" button
- [ ] Modal/sidebar show file tree yang akan di-generate
- [ ] Show jumlah files, permissions, menu items
- [ ] Show database table structure (columns, indexes, constraints)
- [ ] Show API endpoints yang akan tersedia (GET, POST, PATCH, DELETE)
- [ ] User dapat collapse/expand sections

**Priority**: P2 - MEDIUM  
**Estimated Effort**: 4 jam

---

### 3.3 Permission & Menu Management

#### User Story 3.1: Auto-Create Permissions
**As a** developer  
**I want** permissions auto-created saat generate module  
**So that** I don't need to manually seed permissions

**Acceptance Criteria**:
- [ ] System auto-create 4 default permissions:
  - {module}.read.tenant
  - {module}.create.tenant
  - {module}.update.tenant
  - {module}.delete.tenant
- [ ] System insert permissions ke tenant schema
- [ ] Permissions assigned ke role "admin" automatically
- [ ] User current role juga dapat permissions (jika bukan admin)
- [ ] Success message show permissions created

**Priority**: P0 - CRITICAL  
**Estimated Effort**: 3 jam

---

#### User Story 3.2: Auto-Create Menu Item
**As a** developer  
**I want** menu item auto-created saat generate module  
**So that** module langsung accessible dari navigation

**Acceptance Criteria**:
- [ ] System auto-create menu item di "Main Menu"
- [ ] Menu properties:
  - Label: PascalCase dari module name (e.g., "Products")
  - URL: /portal/{module-name} (e.g., "/portal/products")
  - Icon: default icon based on module name (e.g., "Package" for products)
  - Order: auto-increment from last menu item
  - Required Permission: {module}.read.tenant
- [ ] Menu item visible setelah generation
- [ ] User dapat customize label & icon via UI (optional)

**Priority**: P1 - HIGH  
**Estimated Effort**: 4 jam



---

### 3.4 Module Management

#### User Story 4.1: List Generated Modules
**As a** developer  
**I want to** see list semua module yang sudah di-generate  
**So that** I can manage existing modules

**Acceptance Criteria**:
- [ ] Halaman "Modules" menampilkan table/grid semua generated modules
- [ ] Columns: Module Name, Fields Count, Created Date, Created By, Status (Active/Inactive)
- [ ] User dapat search by module name
- [ ] User dapat filter by status
- [ ] User dapat sort by name, date
- [ ] Pagination (10 per page default)
- [ ] Click module name navigate ke module detail

**Priority**: P1 - HIGH  
**Estimated Effort**: 6 jam

---

#### User Story 4.2: View Module Details
**As a** developer  
**I want to** view detail module yang sudah di-generate  
**So that** I can understand module structure

**Acceptance Criteria**:
- [ ] Halaman detail show:
  - Module name
  - Created date & by who
  - List of fields dengan properties
  - Query options (searchable, filterable, sortable)
  - Permissions created
  - Menu item info
  - API endpoints list
- [ ] User dapat copy API endpoint URL
- [ ] User dapat export module definition (JSON)

**Priority**: P2 - MEDIUM  
**Estimated Effort**: 4 jam

---

#### User Story 4.3: Delete Generated Module
**As a** developer  
**I want to** delete module yang sudah di-generate  
**So that** I can cleanup unused modules

**Acceptance Criteria**:
- [ ] User dapat klik "Delete" button pada module
- [ ] Confirmation modal show:
  - "Are you sure? This will delete all files, database table, permissions, and menu item"
  - Checkbox: "I understand this cannot be undone"
- [ ] System delete:
  - Module files (12 files)
  - Database table (CASCADE delete)
  - Permissions (4 permissions)
  - Menu item
  - Role-permission assignments
- [ ] Success message: "Module deleted successfully"
- [ ] User redirected ke module list

**Priority**: P1 - HIGH  
**Estimated Effort**: 6 jam

---

### 3.5 Advanced Features (Post-MVP)

#### User Story 5.1: Field Relations (Not MVP)
**As a** developer  
**I want to** define relations between modules  
**So that** I can create foreign keys

**Status**: DEFERRED - Post-MVP

---

#### User Story 5.2: Custom Validation Rules (Not MVP)
**As a** developer  
**I want to** create custom validation rules  
**So that** I can validate complex business logic

**Status**: DEFERRED - Post-MVP

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Module Builder Page

**FR-1.1**: System MUST provide halaman "Module Builder" accessible via menu  
**FR-1.2**: System MUST validate module name (lowercase, alphanumeric, no spaces)  
**FR-1.3**: System MUST check duplicate module name sebelum generate  
**FR-1.4**: System MUST support enable/disable Tenant Isolation, Soft Delete, Audit Logging  

### 4.2 Field Management

**FR-2.1**: System MUST support 15+ field types  
**FR-2.2**: System MUST validate field name (lowercase, snake_case)  
**FR-2.3**: System MUST support field properties: name, type, length, precision, scale, required, unique, default value  
**FR-2.4**: System MUST allow edit/delete fields sebelum generate  
**FR-2.5**: System MUST support reorder fields  

### 4.3 Query Configuration

**FR-3.1**: System MUST allow select searchable fields (multi-select)  
**FR-3.2**: System MUST allow select filterable fields (multi-select)  
**FR-3.3**: System MUST allow select sortable fields (multi-select)  
**FR-3.4**: System MUST disable incompatible query options (e.g., search on boolean)  

### 4.4 Code Generation

**FR-4.1**: System MUST generate 12 files per module:
- 1 module file
- 1 controller file
- 1 service file
- 1 repository file
- 4 DTO files (create, update, query, response)
- 1 entity file
- 3 test files

**FR-4.2**: System MUST generate permissions (4 default: read, create, update, delete)  
**FR-4.3**: System MUST create menu item di tenant schema  
**FR-4.4**: System MUST assign permissions ke current user role  
**FR-4.5**: System MUST complete generation dalam < 10 detik  

### 4.5 Module Management

**FR-5.1**: System MUST provide list semua generated modules  
**FR-5.2**: System MUST support search, filter, sort pada module list  
**FR-5.3**: System MUST allow view module details  
**FR-5.4**: System MUST allow delete module (with confirmation)  
**FR-5.5**: System MUST CASCADE delete all related data (files, table, permissions, menu)  

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance

**NFR-1.1**: Module generation MUST complete dalam < 10 detik untuk module dengan < 20 fields  
**NFR-1.2**: Page load time MUST < 2 detik  
**NFR-1.3**: Form input response time MUST < 100ms  
**NFR-1.4**: Module list pagination MUST load < 500ms per page  

### 5.2 Usability

**NFR-2.1**: UI MUST intuitive untuk junior developer (< 5 menit learning time)  
**NFR-2.2**: Form validation MUST provide clear error messages dalam Bahasa Indonesia  
**NFR-2.3**: Success messages MUST clear dan actionable  
**NFR-2.4**: UI MUST responsive (desktop, tablet, mobile)  

### 5.3 Reliability

**NFR-3.1**: Generated code MUST compile without errors (100% success rate)  
**NFR-3.2**: System MUST rollback pada failure (atomic operation)  
**NFR-3.3**: System MUST log all generation operations untuk audit  
**NFR-3.4**: System MUST validate all inputs sebelum generation  

### 5.4 Security

**NFR-4.1**: Module builder MUST require authentication  
**NFR-4.2**: Module generation MUST require permission "modules.create.tenant"  
**NFR-4.3**: Module deletion MUST require permission "modules.delete.tenant"  
**NFR-4.4**: Generated permissions MUST follow tenant isolation  

### 5.5 Maintainability

**NFR-5.1**: Generated code MUST follow platform coding standards  
**NFR-5.2**: Generated code MUST include inline comments  
**NFR-5.3**: System MUST use existing CLI templates (reuse, don't duplicate)  
**NFR-5.4**: Code generation logic MUST testable (unit tests)  

---

## 6. DATA REQUIREMENTS

### 6.1 Module Metadata Storage

System MUST store metadata untuk setiap generated module:

**Table: generated_modules**
- id: BIGSERIAL PRIMARY KEY
- tenant_id: BIGINT (FK to tenants)
- module_name: VARCHAR(100) UNIQUE
- display_name: VARCHAR(255)
- description: TEXT
- is_tenant_isolated: BOOLEAN
- has_soft_delete: BOOLEAN
- has_audit: BOOLEAN
- visibility: VARCHAR(20) DEFAULT 'private' (private/public - for future marketplace)
- fields_count: INTEGER
- permissions_count: INTEGER
- created_at: TIMESTAMPTZ
- created_by: BIGINT (FK to users)
- deleted_at: TIMESTAMPTZ (soft delete)
- deleted_by: BIGINT

**Table: generated_module_fields**
- id: BIGSERIAL PRIMARY KEY
- module_id: BIGINT (FK to generated_modules)
- field_name: VARCHAR(100)
- field_type: VARCHAR(50)
- field_length: INTEGER
- precision: INTEGER
- scale: INTEGER
- is_required: BOOLEAN
- is_unique: BOOLEAN
- default_value: TEXT
- validations: JSONB (array of validation rules)
- order: INTEGER
- created_at: TIMESTAMPTZ

### 6.2 Query Configuration Storage

**Fields di generated_modules table:**
- searchable_fields: TEXT[] (array of field names)
- filterable_fields: TEXT[] (array of field names)
- sortable_fields: TEXT[] (array of field names)

---

## 7. CONSTRAINTS & ASSUMPTIONS

### 7.1 Constraints

**C-1**: Module builder hanya support backend code generation (frontend manual)  
**C-2**: Maximum 50 fields per module  
**C-3**: Module name MUST unique per tenant  
**C-4**: Generated code MUST use existing templates (CLI templates)  
**C-5**: User MUST have permission "modules.create.tenant" untuk generate  

### 7.2 Assumptions

**A-1**: User sudah familiar dengan database concepts (tables, fields, types)  
**A-2**: User sudah login dan memiliki active tenant context  
**A-3**: Backend server dapat write files ke filesystem  
**A-4**: Database migrations auto-applied (drizzle db:push)  
**A-5**: Generated modules follow platform coding standards  

### 7.3 Dependencies

**D-1**: Existing CLI generator templates MUST stable  
**D-2**: Drizzle ORM MUST support dynamic schema generation  
**D-3**: Multi-tenancy system MUST working  
**D-4**: Permission system (CASL) MUST working  
**D-5**: Menu system MUST working  

---

## 8. ACCEPTANCE CRITERIA SUMMARY

### Must Have (MVP)
- [ ] Module creation form dengan basic fields
- [ ] Field management (add, edit, delete, reorder)
- [ ] Query configuration (searchable, filterable, sortable)
- [ ] Generate module (12 files)
- [ ] Auto-create permissions (4 default)
- [ ] Auto-create menu item
- [ ] Module list page
- [ ] Module delete dengan confirmation
- [ ] Validation semua inputs
- [ ] Success/error messages
- [ ] Generated code compile tanpa error

### Should Have (Post-MVP v1.1)
- [ ] Module detail view
- [ ] Field validation rules UI
- [ ] Preview generated structure
- [ ] Export module definition
- [ ] Module search & filter advanced
- [ ] Generation history/log

### Could Have (Post-MVP v2.0)
- [ ] Field relations (FK)
- [ ] Custom validation rules
- [ ] Code preview dengan syntax highlight
- [ ] Module templates library
- [ ] Collaborative design
- [ ] Import module from JSON

### Won't Have (Out of Scope)
- [ ] Frontend code generation
- [ ] Visual ERD diagram editor
- [ ] Database migration management UI
- [ ] Real-time collaboration
- [ ] Version control integration
- [ ] Module Marketplace (install public modules from other tenants)
- [ ] Public module discovery & rating system

**Note**: Field `visibility` (private/public) sudah disiapkan di database untuk future Module Marketplace feature.

---

## 9. RISKS & MITIGATIONS

### Risk 1: Generated Code Quality
**Risk**: Generated code mungkin tidak sesuai standards  
**Impact**: HIGH  
**Probability**: MEDIUM  
**Mitigation**: 
- Reuse existing CLI templates yang sudah tested
- Add automated tests untuk generation
- Manual review generated code samples

### Risk 2: Complex Validations
**Risk**: Validation rules terlalu complex untuk UI  
**Impact**: MEDIUM  
**Probability**: HIGH  
**Mitigation**:
- Start dengan basic validations di MVP
- Defer complex validations ke post-MVP
- Provide manual edit option

### Risk 3: Performance Issues
**Risk**: Generation lambat untuk large modules  
**Impact**: MEDIUM  
**Probability**: LOW  
**Mitigation**:
- Limit max fields per module (50)
- Async generation dengan progress indicator
- Optimize file write operations

### Risk 4: File System Permissions
**Risk**: Backend tidak bisa write files  
**Impact**: HIGH  
**Probability**: LOW  
**Mitigation**:
- Validate write permissions saat app start
- Clear error messages jika permission denied
- Documentation untuk deployment setup

---

## 10. SUCCESS METRICS

### Quantitative Metrics
- **Adoption Rate**: 60% developers use UI builder dalam 1 bulan
- **Generation Success Rate**: > 95% modules compile without errors
- **Time Savings**: 50% faster vs CLI untuk new developers
- **Error Reduction**: 70% less typos/syntax errors vs CLI

### Qualitative Metrics
- **User Satisfaction**: 4/5 rating dalam survey
- **Ease of Use**: Junior developers dapat generate module < 10 menit (first time)
- **Code Quality**: Generated code pass all linting & type-check
- **Support Tickets**: < 5 tickets per month related to builder issues

---

## 11. GLOSSARY

**Module**: Backend CRUD module (controller, service, repository, DTOs, entity)  
**Field**: Column dalam database table  
**Validation**: Rules untuk validate input data  
**Query Options**: Configuration untuk search, filter, sort  
**Tenant Isolation**: Data separation per tenant schema  
**Soft Delete**: Mark record as deleted without physical delete  
**Audit Logging**: Track created_by, updated_by, timestamps  
**Permission**: Access control rule (resource.action.scope)  
**Menu Item**: Navigation link dalam application sidebar  

---

**Document Status**: DRAFT  
**Next Phase**: Design Document  
**Approval Required**: Product Owner, Tech Lead  
**Target Start Date**: TBD
