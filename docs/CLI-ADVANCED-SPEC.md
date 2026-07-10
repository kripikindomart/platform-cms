# CLI ADVANCED GENERATOR SPECIFICATION
# Platform CMS - Intelligent Code Generator with Database Tracking

**Document Version**: 2.0  
**Last Updated**: 2026-07-10  
**Status**: Advanced CLI Specification  
**Reference**: CLI-BUILDER-SPEC.md, TECHNICAL-ARCHITECTURE.md, ERD-DATABASE.md

---

## 🎯 Overview

Advanced CLI Generator adalah evolution dari basic CLI tool dengan kemampuan:
- ✅ **Database Tracking** - Setiap module/field yang di-generate tercatat di database
- ✅ **Reversible Operations** - Bisa undo/delete generated modules
- ✅ **Smart Field Metadata** - Track validation rules, input types, display settings
- ✅ **Frontend-Backend Sync** - Frontend tahu exact validation dan input type dari backend
- ✅ **Audit Trail** - Complete history of all CLI operations
- ✅ **Intelligent Validation** - Validasi rules tersimpan dan bisa di-share ke frontend

---

## 1. Database Schema untuk CLI Metadata

### 1.1 Schema Tables

#### Table: `generated_modules`
Track semua modules yang di-generate oleh CLI.

```typescript
{
  id: number;
  name: string;                    // 'products', 'users', etc
  display_name: string;            // 'Products', 'Users', etc
  description: string;
  has_tenant_isolation: boolean;   // --tenant flag
  has_soft_delete: boolean;        // --soft-delete flag
  has_audit: boolean;              // --audit flag
  generated_files: string[];       // Array of file paths
  cli_command: string;             // Original command used
  generator_version: string;       // CLI version
  is_active: boolean;
  created_at: Date;
  created_by: number;
  deleted_at: Date;
}
```

#### Table: `module_fields`
Track semua fields dalam setiap module dengan metadata lengkap.

```typescript
{
  id: number;
  module_id: number;               // FK to generated_modules
  name: string;                    // 'price', 'email', etc
  display_name: string;            // 'Price', 'Email', etc
  description: string;
  
  // Database field info
  field_type: FieldType;           // string, number, boolean, date, etc
  is_required: boolean;
  is_unique: boolean;
  is_nullable: boolean;
  default_value: string;
  length: number;                  // For varchar
  min_value: number;
  max_value: number;
  
  // Enum support
  enum_values: string[];           // ['active', 'inactive', 'pending']
  
  // Relations
  relation_module: string;         // 'users', 'categories'
  relation_type: string;           // 'one-to-one', 'one-to-many', 'many-to-many'
  
  // Frontend metadata
  input_type: InputType;           // text, number, email, select, etc
  placeholder: string;
  help_text: string;
  
  // Display settings
  is_searchable: boolean;          // Show in search?
  is_sortable: boolean;            // Can sort by this field?
  is_filterable: boolean;          // Show in filters?
  show_in_list: boolean;           // Show in table list?
  show_in_detail: boolean;         // Show in detail view?
  show_in_form: boolean;           // Show in create/edit form?
  
  order: number;                   // Display order
  created_at: Date;
  updated_at: Date;
}
```

#### Table: `field_validations`
Track validation rules untuk setiap field.

```typescript
{
  id: number;
  field_id: number;                // FK to module_fields
  validation_type: ValidationType; // required, email, min, max, pattern, etc
  validation_params: object;       // { min: 10, max: 100 }
  error_message: string;           // Custom error message
  order: number;
  created_at: Date;
}
```

#### Table: `generation_history`
Audit trail untuk semua CLI operations.

```typescript
{
  id: number;
  operation: string;               // 'generate', 'update', 'delete'
  module_id: number;
  command: string;                 // Full CLI command
  options: object;                 // Command options
  success: boolean;
  error_message: string;
  files_created: string[];
  files_modified: string[];
  files_deleted: string[];
  can_rollback: boolean;
  rollback_data: object;           // Backup for undo
  created_at: Date;
  created_by: number;
}
```

---

## 2. Enhanced Field Types & Input Types

### 2.1 Field Types (Database)

```typescript
enum FieldType {
  // Text types
  STRING = 'string',           // varchar
  TEXT = 'text',               // text (unlimited)
  
  // Numeric types
  NUMBER = 'number',           // integer
  INTEGER = 'integer',         // integer (alias)
  FLOAT = 'float',             // numeric/float
  DECIMAL = 'decimal',         // decimal with precision
  
  // Boolean
  BOOLEAN = 'boolean',
  
  // Date/Time
  DATE = 'date',
  DATETIME = 'datetime',
  TIMESTAMP = 'timestamp',
  
  // Special types
  EMAIL = 'email',             // varchar with email validation
  URL = 'url',                 // text with URL validation
  UUID = 'uuid',               // UUID type
  JSON = 'json',               // JSON/JSONB
  
  // Advanced
  ENUM = 'enum',               // Predefined values
  RELATION = 'relation',       // Foreign key
}
```

### 2.2 Input Types (Frontend)

```typescript
enum InputType {
  // Basic HTML5 inputs
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  EMAIL = 'email',
  PASSWORD = 'password',
  URL = 'url',
  TEL = 'tel',
  
  // Date/Time inputs
  DATE = 'date',
  DATETIME_LOCAL = 'datetime-local',
  TIME = 'time',
  
  // Selection inputs
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  
  // File inputs
  FILE = 'file',
  IMAGE = 'image',
  
  // Rich inputs
  COLOR = 'color',
  RANGE = 'range',
  WYSIWYG = 'wysiwyg',         // Rich text editor
  MARKDOWN = 'markdown',        // Markdown editor
  JSON_EDITOR = 'json-editor',  // JSON editor
  
  // Relation inputs
  RELATION_SELECT = 'relation-select',  // Select from related module
}
```

### 2.3 Field Type to Input Type Mapping

```typescript
const fieldTypeToInputType = {
  string: 'text',
  text: 'textarea',
  number: 'number',
  integer: 'number',
  float: 'number',
  decimal: 'number',
  boolean: 'checkbox',
  date: 'date',
  datetime: 'datetime-local',
  timestamp: 'datetime-local',
  email: 'email',
  url: 'url',
  uuid: 'text',
  json: 'json-editor',
  enum: 'select',
  relation: 'relation-select',
};
```

---

## 3. Enhanced CLI Commands

### 3.1 Generate CRUD with Full Metadata

```bash
cms generate crud posts \
  --fields="title:string:255!,slug:string:255@,content:text,price:decimal:10:2,status:enum,category:relation,published_at:datetime" \
  --enum="status:draft,published,archived" \
  --relation="category:categories:many-to-one" \
  --display="title:list:detail:form,content:detail:form" \
  --searchable="title,content" \
  --sortable="title,created_at,price" \
  --tenant \
  --soft-delete \
  --audit
```

**Field Syntax**:
```
name:type:length:precision:scale:modifiers

Modifiers:
  ! = required
  @ = unique
  ? = nullable

Examples:
  title:string:255!      → varchar(255) NOT NULL
  slug:string:255@       → varchar(255) UNIQUE
  price:decimal:10:2     → decimal(10,2)
  status:enum            → enum type (needs --enum)
  category:relation      → foreign key (needs --relation)
```

**Advanced Options**:
```bash
--enum="field:value1,value2,value3"
  Define enum values
  
--relation="field:module:type"
  Define relations
  Types: one-to-one, many-to-one, one-to-many, many-to-many
  
--display="field:list:detail:form"
  Control where field appears
  
--input="field:input-type"
  Override default input type
  Example: --input="content:wysiwyg,thumbnail:image"
  
--validation="field:type:params:message"
  Add custom validations
  Example: --validation="price:min:0:Price must be positive"
  
--searchable="field1,field2"
  Mark fields as searchable
  
--sortable="field1,field2"
  Mark fields as sortable
  
--filterable="field1,field2"
  Mark fields as filterable
```

### 3.2 List Generated Modules

```bash
cms list modules
cms list modules --active
cms list modules --deleted
cms list modules --filter="has_soft_delete:true"
```

**Output**:
```
┌────┬──────────┬──────────────┬────────┬────────┬────────────────────────┐
│ ID │ Name     │ Fields       │ Tenant │ Status │ Created                │
├────┼──────────┼──────────────┼────────┼────────┼────────────────────────┤
│ 1  │ products │ 8 fields     │ Yes    │ Active │ 2026-07-10 10:30:00    │
│ 2  │ posts    │ 12 fields    │ Yes    │ Active │ 2026-07-10 11:15:00    │
│ 3  │ orders   │ 15 fields    │ Yes    │ Active │ 2026-07-10 14:20:00    │
└────┴──────────┴──────────────┴────────┴────────┴────────────────────────┘
```

### 3.3 Show Module Details

```bash
cms show module products
cms show module products --fields
cms show module products --validations
cms show module products --files
```

**Output**:
```yaml
Module: products
├─ Display Name: Products
├─ Description: Product catalog module
├─ Configuration:
│  ├─ Tenant Isolation: Yes
│  ├─ Soft Delete: Yes
│  └─ Audit Logging: Yes
├─ Fields: 8
│  ├─ name (string:255, required, searchable, sortable)
│  │  ├─ Input: text
│  │  ├─ Validations: required, maxLength:255
│  │  └─ Display: list, detail, form
│  ├─ price (decimal:10:2, required, sortable)
│  │  ├─ Input: number
│  │  ├─ Validations: required, min:0
│  │  └─ Display: list, detail, form
│  └─ status (enum, required, filterable)
│     ├─ Input: select
│     ├─ Values: active, inactive, draft
│     ├─ Validations: required, enum
│     └─ Display: list, detail, form
├─ Files: 8
│  ├─ backend/src/modules/products/products.module.ts
│  ├─ backend/src/modules/products/products.controller.ts
│  ├─ backend/src/modules/products/products.service.ts
│  └─ ...
└─ Created: 2026-07-10 10:30:00
```

### 3.4 Delete Module (with Rollback)

```bash
cms delete module products
cms delete module products --force
cms delete module products --keep-db-records
```

**Interactive Prompt**:
```
⚠️  Warning: This will delete the following files:
  - backend/src/modules/products/products.module.ts
  - backend/src/modules/products/products.controller.ts
  - backend/src/modules/products/products.service.ts
  - backend/src/modules/products/products.repository.ts
  - backend/src/modules/products/entities/product.entity.ts
  - backend/src/modules/products/dto/create-product.dto.ts
  - backend/src/modules/products/dto/update-product.dto.ts
  - backend/src/modules/products/dto/product-response.dto.ts

? Are you sure you want to delete this module? (y/N)
✓ Module 'products' deleted successfully
ℹ You can undo this operation with: cms undo 123
```

### 3.5 Undo Last Operation

```bash
cms undo
cms undo --operation=123
cms history
cms history --limit=20
```

---

## 4. API Endpoints untuk Metadata

Backend akan provide API endpoints untuk frontend consume metadata:

### 4.1 Get Module Metadata

```http
GET /api/cli/modules
GET /api/cli/modules/:name
GET /api/cli/modules/:name/fields
GET /api/cli/modules/:name/validations
```

**Response Example**:
```json
{
  "id": 1,
  "name": "products",
  "display_name": "Products",
  "fields": [
    {
      "id": 1,
      "name": "name",
      "display_name": "Product Name",
      "field_type": "string",
      "input_type": "text",
      "is_required": true,
      "is_searchable": true,
      "show_in_list": true,
      "show_in_form": true,
      "validations": [
        {
          "type": "required",
          "message": "Product name is required"
        },
        {
          "type": "maxLength",
          "params": { "max": 255 },
          "message": "Product name cannot exceed 255 characters"
        }
      ]
    }
  ]
}
```

### 4.2 Frontend Form Generation

Frontend bisa auto-generate forms based on metadata:

```typescript
// Frontend usage
const moduleMetadata = await fetch('/api/cli/modules/products');
const formConfig = generateFormConfig(moduleMetadata);

// Auto-generated form with proper validation
<DynamicForm config={formConfig} onSubmit={handleSubmit} />
```

---

## 5. Implementation Phases

### Phase 1: Database Schema (Current)
- ✅ Create CLI metadata schema
- ✅ Migration files
- ✅ Drizzle schema definitions

### Phase 2: CLI Core Enhancement
- [ ] Metadata service (save to DB on generate)
- [ ] Enhanced field parser (support all field types)
- [ ] Validation generator
- [ ] Input type mapper

### Phase 3: Delete & Undo
- [ ] Delete command implementation
- [ ] File backup system
- [ ] Undo/rollback mechanism
- [ ] History tracking

### Phase 4: API Endpoints
- [ ] Metadata API endpoints
- [ ] Frontend SDK
- [ ] Dynamic form generator

### Phase 5: Advanced Features
- [ ] Module update command
- [ ] Field add/remove command
- [ ] Validation update command
- [ ] Migration generator from changes

---

## 6. Benefits

### 6.1 For Developers
- ✅ Faster development (10x speed)
- ✅ Consistent code quality
- ✅ Less manual work
- ✅ Easy to undo mistakes

### 6.2 For Frontend
- ✅ No hardcoded validation rules
- ✅ Auto form generation
- ✅ Always in sync with backend
- ✅ Type-safe from DB to UI

### 6.3 For Project
- ✅ Complete audit trail
- ✅ Trackable changes
- ✅ Easy onboarding (see generated modules)
- ✅ Documentation via metadata

---

## 7. Example Workflow

```bash
# 1. Generate CRUD with metadata
cms generate crud products \
  --fields="name:string:255!,price:decimal:10:2!,stock:integer,description:text,status:enum" \
  --enum="status:draft,active,inactive" \
  --searchable="name,description" \
  --sortable="name,price,created_at" \
  --tenant --soft-delete --audit

✓ Generated 8 files
✓ Saved metadata to database (module_id: 5)
✓ Created 5 fields with 12 validations

# 2. View metadata
cms show module products

# 3. Frontend auto-generates form
GET /api/cli/modules/products
→ Frontend creates form with proper inputs and validations

# 4. Made mistake? Delete it
cms delete module products
✓ Deleted module and backed up files
ℹ Undo with: cms undo 15

# 5. Oops! Undo delete
cms undo
✓ Restored module 'products'
```

---

## 8. Next Steps

1. ✅ Update dokumentasi (this file)
2. ⏳ Update task plan
3. ⏳ Update GitHub issues
4. ⏳ Implement Phase 1 (Schema)
5. ⏳ Implement Phase 2 (CLI Enhancement)
6. ⏳ Implement Phase 3 (Delete/Undo)
7. ⏳ Implement Phase 4 (API)

---

**End of Document**
