# Design Document: Visual CRUD Builder UI

**Feature Name**: Visual CRUD Builder UI  
**Version**: 1.0.0  
**Status**: Draft  
**Created**: 2026-07-22  
**Based on**: requirements.md v1.0.0

---

## 1. SYSTEM ARCHITECTURE

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Module Builder Page                                         │
│  ├── Module Form Component                                   │
│  ├── Field Manager Component                                 │
│  ├── Query Config Component                                  │
│  └── Preview Component                                       │
├─────────────────────────────────────────────────────────────┤
│  Module List Page                                            │
│  ├── Module Table Component                                  │
│  └── Module Actions Component                                │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                     Backend (NestJS)                         │
├─────────────────────────────────────────────────────────────┤
│  ModuleGeneratorModule                                       │
│  ├── ModuleGeneratorController (REST endpoints)             │
│  ├── ModuleGeneratorService (business logic)                │
│  ├── CodeGenerationService (file creation)                  │
│  ├── TemplateService (handlebars rendering)                 │
│  └── ModuleMetadataRepository (database)                    │
├─────────────────────────────────────────────────────────────┤
│  PermissionService (auto-create permissions)                │
│  MenuService (auto-create menu items)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Database (PostgreSQL)                    │
├─────────────────────────────────────────────────────────────┤
│  Tenant Schema: tenant_xxx                                   │
│  ├── generated_modules (metadata)                           │
│  ├── generated_module_fields (field definitions)            │
│  ├── permissions (auto-created)                             │
│  ├── menus & menu_items (auto-created)                      │
│  └── {generated_module_table} (dynamic tables)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Filesystem                               │
├─────────────────────────────────────────────────────────────┤
│  backend/src/modules/{module-name}/                         │
│  ├── {module-name}.module.ts                                │
│  ├── {module-name}.controller.ts                            │
│  ├── {module-name}.service.ts                               │
│  ├── {module-name}.repository.ts                            │
│  ├── dto/ (4 files)                                         │
│  ├── entities/ (1 file)                                     │
│  └── *.spec.ts (3 test files)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. DATABASE DESIGN

### 2.1 Schema: Tenant Schema (`tenant_xxx`)

#### Table: `generated_modules`
```sql
CREATE TABLE generated_modules (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  module_name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Features
  is_tenant_isolated BOOLEAN NOT NULL DEFAULT true,
  has_soft_delete BOOLEAN NOT NULL DEFAULT true,
  has_audit BOOLEAN NOT NULL DEFAULT true,
  visibility VARCHAR(20) NOT NULL DEFAULT 'private', -- future: public for marketplace
  
  -- Query config
  searchable_fields TEXT[], -- array of field names
  filterable_fields TEXT[],
  sortable_fields TEXT[],
  
  -- Statistics
  fields_count INTEGER NOT NULL DEFAULT 0,
  permissions_count INTEGER NOT NULL DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT NOT NULL REFERENCES public.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by BIGINT REFERENCES public.users(id),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES public.users(id)
);

-- Indexes
CREATE INDEX idx_generated_modules_tenant_id ON generated_modules(tenant_id);
CREATE INDEX idx_generated_modules_module_name ON generated_modules(module_name);
CREATE INDEX idx_generated_modules_created_by ON generated_modules(created_by);
CREATE INDEX idx_generated_modules_deleted_at ON generated_modules(deleted_at);
```

#### Table: `generated_module_fields`
```sql
CREATE TABLE generated_module_fields (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES generated_modules(id) ON DELETE CASCADE,
  
  -- Field definition
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- string, text, integer, decimal, boolean, etc.
  field_length INTEGER, -- for string/varchar
  precision INTEGER, -- for decimal
  scale INTEGER, -- for decimal
  
  -- Constraints
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_unique BOOLEAN NOT NULL DEFAULT false,
  default_value TEXT,
  
  -- Validations (JSON array)
  validations JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"type": "min", "value": 3}, {"type": "email"}]
  
  -- Order
  field_order INTEGER NOT NULL DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(module_id, field_name)
);

-- Indexes
CREATE INDEX idx_generated_module_fields_module_id ON generated_module_fields(module_id);
CREATE INDEX idx_generated_module_fields_field_order ON generated_module_fields(field_order);
```

### 2.2 Relationships
```
generated_modules (1) ──< (N) generated_module_fields
generated_modules (N) ──> (1) users (created_by)
generated_modules (N) ──> (1) tenants (tenant_id)
```

---

## 3. API DESIGN

### 3.1 Base Path
```
/api/module-generator
```

### 3.2 Endpoints

#### 3.2.1 Generate Module
```http
POST /api/module-generator/generate
Authorization: Bearer {token}
X-Tenant-Slug: {tenant_slug}
Content-Type: application/json

Request Body:
{
  "moduleName": "product",
  "displayName": "Product",
  "description": "Product management module",
  "isTenantIsolated": true,
  "hasSoftDelete": true,
  "hasAudit": true,
  "fields": [
    {
      "name": "name",
      "type": "string",
      "length": 255,
      "isRequired": true,
      "isUnique": false,
      "defaultValue": null,
      "validations": [
        {"type": "minLength", "value": 3},
        {"type": "maxLength", "value": 255}
      ]
    },
    {
      "name": "price",
      "type": "decimal",
      "precision": 10,
      "scale": 2,
      "isRequired": true,
      "validations": [
        {"type": "min", "value": 0}
      ]
    },
    {
      "name": "stock",
      "type": "integer",
      "isRequired": false,
      "defaultValue": "0"
    }
  ],
  "searchableFields": ["name"],
  "filterableFields": ["price", "stock"],
  "sortableFields": ["name", "price", "created_at"]
}

Response 201 Created:
{
  "success": true,
  "message": "Module 'product' berhasil di-generate",
  "data": {
    "moduleId": 1,
    "moduleName": "product",
    "filesCreated": 12,
    "permissionsCreated": 4,
    "menuItemCreated": true,
    "files": [
      "backend/src/modules/product/product.module.ts",
      "backend/src/modules/product/product.controller.ts",
      ...
    ]
  },
  "meta": {
    "generationTime": "8.5s"
  }
}

Response 400 Bad Request:
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "moduleName",
      "message": "Module name harus lowercase tanpa spasi"
    },
    {
      "field": "fields",
      "message": "Minimal 1 field harus didefinisikan"
    }
  ]
}

Response 409 Conflict:
{
  "success": false,
  "code": "MODULE_ALREADY_EXISTS",
  "message": "Module 'product' sudah ada"
}
```

#### 3.2.2 List Modules
```http
GET /api/module-generator/modules
Authorization: Bearer {token}
X-Tenant-Slug: {tenant_slug}
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - search: string (search by module name)
  - sort: string (name|created_at, default: created_at)
  - order: string (asc|desc, default: desc)

Response 200 OK:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "moduleName": "product",
      "displayName": "Product",
      "description": "Product management module",
      "fieldsCount": 3,
      "permissionsCount": 4,
      "createdAt": "2026-07-22T10:30:00Z",
      "createdBy": {
        "id": 1,
        "name": "John Doe"
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### 3.2.3 Get Module Details
```http
GET /api/module-generator/modules/:id
Authorization: Bearer {token}
X-Tenant-Slug: {tenant_slug}

Response 200 OK:
{
  "success": true,
  "data": {
    "id": 1,
    "moduleName": "product",
    "displayName": "Product",
    "description": "Product management module",
    "isTenantIsolated": true,
    "hasSoftDelete": true,
    "hasAudit": true,
    "searchableFields": ["name"],
    "filterableFields": ["price", "stock"],
    "sortableFields": ["name", "price", "created_at"],
    "fields": [
      {
        "id": 1,
        "name": "name",
        "type": "string",
        "length": 255,
        "isRequired": true,
        "isUnique": false,
        "validations": [
          {"type": "minLength", "value": 3},
          {"type": "maxLength", "value": 255}
        ],
        "order": 1
      },
      {
        "id": 2,
        "name": "price",
        "type": "decimal",
        "precision": 10,
        "scale": 2,
        "isRequired": true,
        "validations": [{"type": "min", "value": 0}],
        "order": 2
      }
    ],
    "permissions": [
      "product.read.tenant",
      "product.create.tenant",
      "product.update.tenant",
      "product.delete.tenant"
    ],
    "menuItem": {
      "label": "Products",
      "url": "/portal/products",
      "icon": "Package"
    },
    "apiEndpoints": [
      "GET /api/products",
      "POST /api/products",
      "GET /api/products/:id",
      "PATCH /api/products/:id",
      "DELETE /api/products/:id"
    ],
    "createdAt": "2026-07-22T10:30:00Z",
    "createdBy": {
      "id": 1,
      "name": "John Doe"
    }
  }
}
```

#### 3.2.4 Delete Module
```http
DELETE /api/module-generator/modules/:id
Authorization: Bearer {token}
X-Tenant-Slug: {tenant_slug}

Response 200 OK:
{
  "success": true,
  "message": "Module 'product' berhasil dihapus",
  "data": {
    "filesDeleted": 12,
    "permissionsDeleted": 4,
    "menuItemDeleted": true,
    "tableDropped": true
  }
}

Response 404 Not Found:
{
  "success": false,
  "code": "MODULE_NOT_FOUND",
  "message": "Module dengan ID 999 tidak ditemukan"
}
```

#### 3.2.5 Validate Module Name
```http
POST /api/module-generator/validate-name
Authorization: Bearer {token}
X-Tenant-Slug: {tenant_slug}
Content-Type: application/json

Request Body:
{
  "moduleName": "product"
}

Response 200 OK:
{
  "success": true,
  "available": false,
  "message": "Module name 'product' sudah digunakan"
}

Response 200 OK:
{
  "success": true,
  "available": true,
  "message": "Module name 'order' tersedia"
}
```

---

## 4. BACKEND IMPLEMENTATION

### 4.1 Module Structure
```
backend/src/modules/module-generator/
├── module-generator.module.ts
├── module-generator.controller.ts
├── module-generator.service.ts
├── code-generation.service.ts
├── template.service.ts
├── module-metadata.repository.ts
├── dto/
│   ├── generate-module.dto.ts
│   ├── module-field.dto.ts
│   ├── query-modules.dto.ts
│   └── module-response.dto.ts
├── entities/
│   ├── generated-module.entity.ts
│   └── generated-module-field.entity.ts
└── interfaces/
    ├── generation-result.interface.ts
    └── template-context.interface.ts
```

### 4.2 Key Services

#### 4.2.1 ModuleGeneratorService
**Responsibilities**:
- Validate module definition
- Coordinate generation process
- Save metadata to database
- Handle errors & rollback

**Key Methods**:
```typescript
async generateModule(dto: GenerateModuleDto, userId: number): Promise<GenerationResult>
async listModules(query: QueryModulesDto): Promise<PaginatedResponse<ModuleResponse>>
async getModuleDetails(id: number): Promise<ModuleDetailResponse>
async deleteModule(id: number, userId: number): Promise<DeletionResult>
async validateModuleName(name: string): Promise<ValidationResult>
```

#### 4.2.2 CodeGenerationService
**Responsibilities**:
- Generate files from templates
- Write files to filesystem
- Create permissions & menu items
- Run database migrations

**Key Methods**:
```typescript
async generateModuleFiles(context: TemplateContext): Promise<string[]>
async createPermissions(moduleName: string, tenantSchema: string): Promise<number>
async createMenuItem(moduleName: string, tenantSchema: string): Promise<boolean>
async runMigration(moduleName: string): Promise<boolean>
```

#### 4.2.3 TemplateService
**Responsibilities**:
- Load Handlebars templates
- Render templates dengan context
- Validate template syntax

**Key Methods**:
```typescript
async renderTemplate(templateName: string, context: any): Promise<string>
async loadTemplate(path: string): Promise<HandlebarsTemplateDelegate>
```



---

## 5. FRONTEND IMPLEMENTATION

### 5.1 Page Structure
```
frontend/app/(private)/org/[tenant]/portal/
├── module-builder/
│   ├── page.tsx (Module Builder Form)
│   └── components/
│       ├── ModuleForm.tsx
│       ├── FieldManager.tsx
│       ├── FieldForm.tsx
│       ├── QueryConfig.tsx
│       └── GenerationPreview.tsx
├── modules/
│   ├── page.tsx (Module List)
│   ├── [id]/
│   │   └── page.tsx (Module Detail)
│   └── components/
│       ├── ModuleTable.tsx
│       ├── ModuleCard.tsx
│       └── DeleteModuleDialog.tsx
```

### 5.2 Key Components

#### 5.2.1 ModuleForm Component
**Purpose**: Form untuk module basic info

**Props**:
```typescript
interface ModuleFormProps {
  onSubmit: (data: ModuleFormData) => void;
  isLoading?: boolean;
}

interface ModuleFormData {
  moduleName: string;
  displayName: string;
  description?: string;
  isTenantIsolated: boolean;
  hasSoftDelete: boolean;
  hasAudit: boolean;
}
```

**UI Elements**:
- Text Input: Module Name (lowercase, validation)
- Text Input: Display Name
- Textarea: Description (optional)
- Checkbox: Tenant Isolation (default: checked)
- Checkbox: Soft Delete (default: checked)
- Checkbox: Audit Logging (default: checked)
- Hint text: Path preview (`backend/src/modules/{module-name}/`)

---

#### 5.2.2 FieldManager Component
**Purpose**: Manage list of fields

**Props**:
```typescript
interface FieldManagerProps {
  fields: ModuleField[];
  onAddField: (field: ModuleField) => void;
  onEditField: (index: number, field: ModuleField) => void;
  onDeleteField: (index: number) => void;
  onReorderField: (fromIndex: number, toIndex: number) => void;
}

interface ModuleField {
  name: string;
  type: FieldType;
  length?: number;
  precision?: number;
  scale?: number;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue?: string;
  validations: Validation[];
}
```

**UI Elements**:
- Button: "Add Field"
- Table/List: Fields list dengan columns (Name, Type, Required, Unique, Actions)
- Actions: Edit, Delete, Move Up, Move Down
- Empty State: "No fields yet. Add your first field."

---

#### 5.2.3 FieldForm Component
**Purpose**: Form untuk add/edit field

**Props**:
```typescript
interface FieldFormProps {
  field?: ModuleField; // for edit mode
  onSubmit: (field: ModuleField) => void;
  onCancel: () => void;
}
```

**UI Elements**:
- Text Input: Field Name (lowercase, snake_case)
- Select Dropdown: Field Type (15+ options)
- Conditional Fields:
  - Length (visible for: string, varchar)
  - Precision & Scale (visible for: decimal, numeric)
  - Enum Values (visible for: enum)
- Checkbox: Required
- Checkbox: Unique
- Text Input: Default Value (optional)
- Multi-select: Validations (minLength, maxLength, min, max, email, url, regex)
- Buttons: Save, Cancel

**Field Type Options**:
```typescript
const FIELD_TYPES = [
  { value: 'string', label: 'String (VARCHAR)', requiresLength: true },
  { value: 'text', label: 'Text (TEXT)' },
  { value: 'integer', label: 'Integer (INT)' },
  { value: 'decimal', label: 'Decimal (NUMERIC)', requiresPrecision: true },
  { value: 'float', label: 'Float (REAL)' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'DateTime (TIMESTAMP)' },
  { value: 'email', label: 'Email (validated)' },
  { value: 'url', label: 'URL (validated)' },
  { value: 'uuid', label: 'UUID' },
  { value: 'json', label: 'JSON (JSONB)' },
  { value: 'enum', label: 'Enum (select)', requiresValues: true },
];
```

---

#### 5.2.4 QueryConfig Component
**Purpose**: Configure searchable, filterable, sortable fields

**Props**:
```typescript
interface QueryConfigProps {
  fields: ModuleField[];
  searchableFields: string[];
  filterableFields: string[];
  sortableFields: string[];
  onChangeSearchable: (fields: string[]) => void;
  onChangeFilterable: (fields: string[]) => void;
  onChangeSortable: (fields: string[]) => void;
}
```

**UI Elements**:
- Multi-select: Searchable Fields (only text/string fields)
- Multi-select: Filterable Fields (all fields except text/json)
- Multi-select: Sortable Fields (all fields)
- Hints: "Fields marked as searchable will support full-text search"

---

#### 5.2.5 GenerationPreview Component
**Purpose**: Preview what will be generated

**Props**:
```typescript
interface GenerationPreviewProps {
  moduleName: string;
  fieldsCount: number;
  permissionsCount: number;
  hasMenuIten: boolean;
}
```

**UI Elements**:
- Card: Summary
  - Files to create: 12
  - Permissions to create: 4
  - Menu item: Yes
- Expandable Section: File Tree
  ```
  backend/src/modules/product/
  ├── product.module.ts
  ├── product.controller.ts
  ├── product.service.ts
  └── ...
  ```
- Expandable Section: Permissions
  ```
  - product.read.tenant
  - product.create.tenant
  - product.update.tenant
  - product.delete.tenant
  ```
- Expandable Section: API Endpoints
  ```
  GET    /api/products
  POST   /api/products
  GET    /api/products/:id
  PATCH  /api/products/:id
  DELETE /api/products/:id
  ```

---

#### 5.2.6 ModuleTable Component
**Purpose**: Display list of generated modules

**Props**:
```typescript
interface ModuleTableProps {
  modules: ModuleListItem[];
  isLoading: boolean;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void;
}

interface ModuleListItem {
  id: number;
  moduleName: string;
  displayName: string;
  fieldsCount: number;
  createdAt: string;
  createdBy: string;
}
```

**UI Elements**:
- Search Input: Filter by module name
- Table Columns:
  - Module Name
  - Display Name
  - Fields Count
  - Created Date
  - Created By
  - Actions (View, Delete)
- Pagination: Page numbers, Prev/Next buttons

---

### 5.3 State Management

#### 5.3.1 Module Builder State (useState)
```typescript
const [moduleInfo, setModuleInfo] = useState<ModuleFormData>({
  moduleName: '',
  displayName: '',
  description: '',
  isTenantIsolated: true,
  hasSoftDelete: true,
  hasAudit: true,
});

const [fields, setFields] = useState<ModuleField[]>([]);

const [queryConfig, setQueryConfig] = useState({
  searchableFields: [],
  filterableFields: [],
  sortableFields: [],
});

const [isGenerating, setIsGenerating] = useState(false);
```

#### 5.3.2 API Calls (React Query / TanStack Query)
```typescript
// Hook: useGenerateModule
const useGenerateModule = () => {
  return useMutation({
    mutationFn: (data: GenerateModuleDto) => 
      moduleGeneratorService.generate(data),
    onSuccess: (result) => {
      toast.success('Module berhasil di-generate!');
      router.push('/portal/modules');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Hook: useModules (list)
const useModules = (params: QueryModulesDto) => {
  return useQuery({
    queryKey: ['modules', params],
    queryFn: () => moduleGeneratorService.list(params),
  });
};

// Hook: useModuleDetails
const useModuleDetails = (id: number) => {
  return useQuery({
    queryKey: ['module', id],
    queryFn: () => moduleGeneratorService.getDetails(id),
  });
};

// Hook: useDeleteModule
const useDeleteModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => moduleGeneratorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['modules']);
      toast.success('Module berhasil dihapus');
    },
  });
};
```

---

### 5.4 API Service Layer

**File**: `frontend/lib/api/services/module-generator.service.ts`

```typescript
import { apiClient } from '../client';

export interface GenerateModuleDto {
  moduleName: string;
  displayName: string;
  description?: string;
  isTenantIsolated: boolean;
  hasSoftDelete: boolean;
  hasAudit: boolean;
  fields: ModuleField[];
  searchableFields: string[];
  filterableFields: string[];
  sortableFields: string[];
}

export const moduleGeneratorService = {
  async generate(data: GenerateModuleDto): Promise<GenerationResult> {
    const response = await apiClient.post('/module-generator/generate', data);
    return response.data;
  },

  async list(params: QueryModulesDto): Promise<PaginatedResponse<ModuleListItem>> {
    const response = await apiClient.get('/module-generator/modules', { params });
    return response.data;
  },

  async getDetails(id: number): Promise<ModuleDetailResponse> {
    const response = await apiClient.get(`/module-generator/modules/${id}`);
    return response.data;
  },

  async delete(id: number): Promise<DeletionResult> {
    const response = await apiClient.delete(`/module-generator/modules/${id}`);
    return response.data;
  },

  async validateName(name: string): Promise<ValidationResult> {
    const response = await apiClient.post('/module-generator/validate-name', { moduleName: name });
    return response.data;
  },
};
```

---

## 6. VALIDATION RULES

### 6.1 Backend Validation (DTO)

#### GenerateModuleDto
```typescript
import { IsString, IsBoolean, IsArray, ValidateNested, Matches, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateModuleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9-]*$/, {
    message: 'Module name harus lowercase, alphanumeric, dan boleh pakai dash (-)',
  })
  moduleName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  isTenantIsolated!: boolean;

  @IsBoolean()
  hasSoftDelete!: boolean;

  @IsBoolean()
  hasAudit!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleFieldDto)
  fields!: ModuleFieldDto[];

  @IsArray()
  @IsString({ each: true })
  searchableFields!: string[];

  @IsArray()
  @IsString({ each: true })
  filterableFields!: string[];

  @IsArray()
  @IsString({ each: true })
  sortableFields!: string[];
}
```

#### ModuleFieldDto
```typescript
export class ModuleFieldDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Field name harus lowercase, snake_case',
  })
  name!: string;

  @IsString()
  @IsIn(['string', 'text', 'integer', 'decimal', 'float', 'boolean', 'date', 'datetime', 'email', 'url', 'uuid', 'json', 'enum'])
  type!: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  @IsOptional()
  length?: number;

  @IsInt()
  @Min(1)
  @Max(65)
  @IsOptional()
  precision?: number;

  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  scale?: number;

  @IsBoolean()
  isRequired!: boolean;

  @IsBoolean()
  isUnique!: boolean;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationRuleDto)
  @IsOptional()
  validations?: ValidationRuleDto[];
}
```

### 6.2 Frontend Validation (Zod)

```typescript
import { z } from 'zod';

export const moduleFormSchema = z.object({
  moduleName: z.string()
    .min(2, 'Module name minimal 2 karakter')
    .max(50, 'Module name maksimal 50 karakter')
    .regex(/^[a-z][a-z0-9-]*$/, 'Module name harus lowercase, alphanumeric, boleh dash'),
  
  displayName: z.string()
    .min(2, 'Display name minimal 2 karakter')
    .max(100, 'Display name maksimal 100 karakter'),
  
  description: z.string()
    .max(500, 'Description maksimal 500 karakter')
    .optional(),
  
  isTenantIsolated: z.boolean(),
  hasSoftDelete: z.boolean(),
  hasAudit: z.boolean(),
});

export const fieldFormSchema = z.object({
  name: z.string()
    .min(1, 'Field name wajib diisi')
    .regex(/^[a-z][a-z0-9_]*$/, 'Field name harus lowercase, snake_case'),
  
  type: z.enum(['string', 'text', 'integer', 'decimal', 'float', 'boolean', 'date', 'datetime', 'email', 'url', 'uuid', 'json', 'enum']),
  
  length: z.number()
    .int()
    .min(1)
    .max(10000)
    .optional(),
  
  precision: z.number()
    .int()
    .min(1)
    .max(65)
    .optional(),
  
  scale: z.number()
    .int()
    .min(0)
    .max(30)
    .optional(),
  
  isRequired: z.boolean(),
  isUnique: z.boolean(),
  defaultValue: z.string().optional(),
  validations: z.array(z.object({
    type: z.string(),
    value: z.any().optional(),
  })).optional(),
});
```

---

## 7. ERROR HANDLING

### 7.1 Backend Errors

#### Error Response Format
```typescript
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "User-friendly error message in Indonesian",
  "errors": [ // for validation errors
    {
      "field": "moduleName",
      "message": "Error message for field"
    }
  ]
}
```

#### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `MODULE_ALREADY_EXISTS`: Module name conflict
- `MODULE_NOT_FOUND`: Module not found
- `GENERATION_FAILED`: Code generation failed
- `FILE_WRITE_ERROR`: Cannot write files to disk
- `PERMISSION_DENIED`: User tidak punya permission
- `DATABASE_ERROR`: Database operation failed

### 7.2 Frontend Error Handling

```typescript
try {
  await generateModule.mutateAsync(data);
} catch (error) {
  if (error.code === 'MODULE_ALREADY_EXISTS') {
    toast.error('Module sudah ada, gunakan nama lain');
  } else if (error.code === 'VALIDATION_ERROR') {
    // Show validation errors on form fields
    error.errors.forEach(err => {
      form.setError(err.field, { message: err.message });
    });
  } else {
    toast.error(error.message || 'Terjadi kesalahan saat generate module');
  }
}
```

---

## 8. GENERATION WORKFLOW

### 8.1 Step-by-Step Generation Process

```
1. VALIDATE INPUT
   ├── Check module name format
   ├── Check module name uniqueness
   ├── Validate fields (names, types, constraints)
   └── Validate query config

2. CREATE METADATA
   ├── Insert to generated_modules table
   └── Insert to generated_module_fields table

3. GENERATE CODE FILES
   ├── Load templates (reuse CLI templates)
   ├── Render with Handlebars
   └── Write 12 files to filesystem
       ├── module.ts
       ├── controller.ts
       ├── service.ts
       ├── repository.ts
       ├── dto/ (4 files)
       ├── entities/ (1 file)
       └── *.spec.ts (3 files)

4. CREATE PERMISSIONS
   ├── Insert 4 permissions to tenant schema
   └── Assign to current user role

5. CREATE MENU ITEM
   ├── Get "Main Menu" ID
   ├── Insert menu_items record
   └── Set required_permission

6. RUN DATABASE MIGRATION
   ├── Generate migration (drizzle)
   ├── Apply migration (db:push)
   └── Verify table created

7. ROLLBACK ON ERROR
   ├── Delete metadata
   ├── Delete generated files
   ├── Drop database table
   ├── Delete permissions
   └── Delete menu item

8. RETURN RESULT
   └── Success message dengan summary
```

### 8.2 Transaction Management

Generation process MUST be atomic:
- Use database transaction for metadata + permissions
- Backup files before overwrite (if re-generate)
- Rollback all changes on any failure

---

## 9. SECURITY CONSIDERATIONS

### 9.1 Permission Requirements

**Generate Module**: `modules.create.tenant`  
**List Modules**: `modules.read.tenant`  
**View Details**: `modules.read.tenant`  
**Delete Module**: `modules.delete.tenant`

### 9.2 Input Sanitization

- Module name: Lowercase alphanumeric + dash only
- Field names: Lowercase alphanumeric + underscore only
- SQL injection prevention: Use parameterized queries
- Path traversal prevention: Validate module name path
- XSS prevention: Escape user input in UI

### 9.3 Tenant Isolation

- Generated modules MUST respect tenant context
- Metadata stored in tenant schema (not public)
- Files generated with tenant-scoped paths
- Permissions scoped to tenant

---

## 10. PERFORMANCE OPTIMIZATION

### 10.1 Generation Performance

**Target**: < 10 seconds for module with < 20 fields

**Optimizations**:
- Async file writes (parallel)
- Template caching (load once)
- Database batch inserts (permissions)
- Minimize filesystem I/O

### 10.2 Frontend Performance

- Lazy load FieldForm component
- Debounce module name validation (500ms)
- Virtual scrolling for large field lists
- Pagination for module list (10 per page)

### 10.3 Caching Strategy

- Template cache (in-memory)
- Module list cache (React Query, 5 min stale time)
- Module details cache (React Query, no stale time)

---

**Next Step**: Create tasks.md with implementation breakdown
