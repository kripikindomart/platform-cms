# Task 5.2: Module Generator

**Prioritas**: P1 - HIGH  
**Estimasi Waktu**: 8 jam  
**Dependencies**: Task 5.1 (CLI Framework Setup)  
**Status**: Belum Dimulai

---

## Tujuan Task

Implement module generator untuk CLI yang akan generate complete NestJS module structure dengan controller, service, repository, entity (Drizzle schema), DTOs, dan tests. Generator ini akan follow project conventions dan support tenant isolation, soft delete, dan audit logging.

---

## Yang Akan Dikerjakan

### 1. Module Generator Implementation

**File yang akan dibuat**:
```
cli/src/generators/module.generator.ts    (baru) - Module generator class
```

**Templates yang akan dibuat**:
```
cli/templates/backend/module/
├── module.hbs           (baru) - Module file template
├── controller.hbs       (baru) - Controller template
├── service.hbs          (baru) - Service template
├── repository.hbs       (baru) - Repository template
├── entity.hbs           (baru) - Drizzle schema template
└── dto/
    ├── create.hbs       (baru) - Create DTO template
    ├── update.hbs       (baru) - Update DTO template
    └── response.hbs     (baru) - Response DTO template
```

### 2. Command Implementation

**Update existing file**:
- `cli/src/commands/generate.command.ts` - Connect module subcommand to ModuleGenerator

**Command Usage**:
```bash
cms generate module <name> [options]

Options:
  --tenant         Enable tenant isolation (automatic schema switching)
  --soft-delete    Enable soft delete support
  --audit          Enable audit logging
  --dir <path>     Output directory (default: backend/src/modules)
  --dry-run        Show what would be generated without creating files
  --force          Overwrite existing files without prompting
```

### 3. Generated Module Structure

**Example**: `cms generate module products --tenant --soft-delete --audit`

**Output Files**:
```
backend/src/modules/products/
├── products.module.ts              - Module with imports/exports
├── products.controller.ts          - Controller dengan @Controller decorator
├── products.service.ts             - Service dengan business logic methods
├── products.repository.ts          - Repository extending BaseRepository
├── dto/
│   ├── create-product.dto.ts       - Create DTO
│   ├── update-product.dto.ts       - Update DTO (partial of create)
│   └── product-response.dto.ts     - Response DTO
└── entities/
    └── product.entity.ts           - Drizzle schema definition
```

### 4. Template Features

**Module Template** (`module.hbs`):
- Import statements (controller, service, repository)
- Module decorator dengan providers dan exports
- Conditional imports (TenantContextService if --tenant)
- Conditional imports (AuditModule if --audit)

**Controller Template** (`controller.hbs`):
- @Controller decorator dengan route prefix
- Constructor dependency injection
- CRUD methods stubs (will be filled in Task 5.3)
- Guards integration (JwtAuthGuard if authenticated)
- API documentation decorators (@ApiTags, @ApiOperation)

**Service Template** (`service.hbs`):
- @Injectable decorator
- Constructor with repository injection
- Basic CRUD methods:
  - findAll(filters?, pagination?)
  - findById(id)
  - create(dto)
  - update(id, dto)
  - delete(id) / softDelete(id) if --soft-delete
- Audit logging calls if --audit
- Error handling

**Repository Template** (`repository.hbs`):
- Extends BaseRepository if --soft-delete
- Custom query methods skeleton
- Tenant-scoped queries if --tenant
- Uses withTenantSchema() wrapper

**Entity Template** (`entity.hbs`):
- Drizzle schema definition
- Table name: {moduleName} (singular, snake_case)
- Standard fields: id, created_at, updated_at, created_by, updated_by
- Soft delete fields if --soft-delete: deleted_at, deleted_by
- Relations skeleton
- Indexes

**DTO Templates**:
- **create.hbs**: Fields untuk create operation
- **update.hbs**: Extends PartialType(CreateDto)
- **response.hbs**: Output DTO dengan all fields

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

### Generator Implementation
- [ ] ModuleGenerator class created
- [ ] Extends BaseGenerator
- [ ] Implements generate() method
- [ ] Generates 8+ files per module

### Templates
- [ ] Module template created
- [ ] Controller template created
- [ ] Service template created
- [ ] Repository template created
- [ ] Entity template created
- [ ] Create DTO template created
- [ ] Update DTO template created
- [ ] Response DTO template created

### Features
- [ ] --tenant flag working (adds tenant isolation code)
- [ ] --soft-delete flag working (adds soft delete support)
- [ ] --audit flag working (adds audit logging)
- [ ] --dir option working (custom output directory)
- [ ] Generated code follows AI-RULES.md conventions:
  - [ ] kebab-case untuk file names
  - [ ] PascalCase untuk class names
  - [ ] camelCase untuk method names
  - [ ] snake_case untuk table names

### Integration
- [ ] Command connected to generator
- [ ] Can generate module with all flags
- [ ] Generated code compiles without errors
- [ ] Prettier formatting applied
- [ ] Type-check passes pada generated code

### Testing
- [ ] Type-check passes pada CLI
- [ ] Lint passes pada CLI
- [ ] Can generate basic module
- [ ] Can generate module dengan --tenant
- [ ] Can generate module dengan --soft-delete
- [ ] Can generate module dengan --audit
- [ ] Can generate module dengan all flags combined

---

## Cara Testing

### 1. Setup Testing Environment

```bash
# Ensure CLI is built
cd cli
npm run build

# Link globally (if not already linked)
npm link

# Go back to project root
cd ..
```

### 2. Test Basic Module Generation

```bash
# Generate basic module
cms generate module test-basic

# Check generated files
ls -la backend/src/modules/test-basic/

# Expected output:
# - test-basic.module.ts
# - test-basic.controller.ts
# - test-basic.service.ts
# - test-basic.repository.ts
# - dto/create-test-basic.dto.ts
# - dto/update-test-basic.dto.ts
# - dto/test-basic-response.dto.ts
# - entities/test-basic.entity.ts
```

### 3. Test Module dengan Tenant Isolation

```bash
cms generate module tenanted-module --tenant

# Check that generated code includes:
# - withTenantSchema() in repository
# - TenantContextService injection
```

### 4. Test Module dengan Soft Delete

```bash
cms generate module soft-deletable --soft-delete

# Check that generated code includes:
# - Extends BaseRepository
# - deleted_at, deleted_by fields in entity
# - softDelete() method in service
```

### 5. Test Module dengan Audit Logging

```bash
cms generate module audited --audit

# Check that generated code includes:
# - AuditService injection
# - Audit logging calls in service methods
```

### 6. Test Module dengan All Features

```bash
cms generate module full-featured --tenant --soft-delete --audit

# Check that all features are included
```

### 7. Verify Generated Code Compiles

```bash
cd backend
npm run type-check

# Should pass without errors (may have unused var warnings)
```

### 8. Verify Formatting

```bash
# Generated files should already be formatted
# Check that code follows project conventions
cat backend/src/modules/test-basic/test-basic.service.ts
```

---

## Implementasi Notes

### ModuleGenerator Class Structure

```typescript
import { BaseGenerator } from './base.generator';

export interface ModuleOptions {
  tenant?: boolean;
  softDelete?: boolean;
  audit?: boolean;
  dir?: string;
}

export class ModuleGenerator extends BaseGenerator {
  async generate(name: string, options: ModuleOptions = {}): Promise<void> {
    this.logStart('Module', name);

    try {
      const data = this.prepareTemplateData(name, options);
      const files = await this.generateFiles(name, data, options);
      
      await this.writeFiles(files);
      
      this.logComplete(files.length);
      this.showNextSteps(name);
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  private prepareTemplateData(name: string, options: ModuleOptions) {
    return {
      ...this.getTemplateData(name),
      tenant: options.tenant || false,
      softDelete: options.softDelete || false,
      audit: options.audit || false,
      // Add more template variables
    };
  }

  private async generateFiles(name: string, data: any, options: ModuleOptions) {
    const files: GeneratedFile[] = [];
    
    // Generate module file
    files.push({
      path: this.getModulePath(name, 'module.ts', options),
      content: await this.renderTemplate('backend/module/module.hbs', data),
    });

    // Generate controller file
    files.push({
      path: this.getModulePath(name, 'controller.ts', options),
      content: await this.renderTemplate('backend/module/controller.hbs', data),
    });

    // ... generate other files

    return files;
  }

  private getModulePath(name: string, file: string, options: ModuleOptions): string {
    const dir = options.dir || 'backend/src/modules';
    const moduleName = toKebabCase(name);
    return `${dir}/${moduleName}/${moduleName}.${file}`;
  }
}
```

### Template Example - Module File

```handlebars
import { Module } from '@nestjs/common';
import { {{PascalCase name}}Controller } from './{{kebab-case name}}.controller';
import { {{PascalCase name}}Service } from './{{kebab-case name}}.service';
import { {{PascalCase name}}Repository } from './{{kebab-case name}}.repository';
{{#if tenant}}
import { CommonModule } from '../../common/common.module';
{{/if}}
{{#if audit}}
import { AuditModule } from '../../core/audit/audit.module';
{{/if}}

@Module({
  imports: [
    {{#if tenant}}CommonModule,{{/if}}
    {{#if audit}}AuditModule,{{/if}}
  ],
  controllers: [{{PascalCase name}}Controller],
  providers: [{{PascalCase name}}Service, {{PascalCase name}}Repository],
  exports: [{{PascalCase name}}Service],
})
export class {{PascalCase name}}Module {}
```

### Template Example - Service File

```handlebars
import { Injectable } from '@nestjs/common';
import { {{PascalCase name}}Repository } from './{{kebab-case name}}.repository';
import { Create{{PascalCase name}}Dto } from './dto/create-{{kebab-case name}}.dto';
import { Update{{PascalCase name}}Dto } from './dto/update-{{kebab-case name}}.dto';
{{#if audit}}
import { AuditService } from '../../core/audit/audit.service';
{{/if}}

@Injectable()
export class {{PascalCase name}}Service {
  constructor(
    private readonly {{camelCase name}}Repository: {{PascalCase name}}Repository,
    {{#if audit}}
    private readonly auditService: AuditService,
    {{/if}}
  ) {}

  async findAll() {
    return this.{{camelCase name}}Repository.findAll();
  }

  async findById(id: number) {
    return this.{{camelCase name}}Repository.findById(id);
  }

  async create(dto: Create{{PascalCase name}}Dto) {
    const result = await this.{{camelCase name}}Repository.create(dto);
    {{#if audit}}
    await this.auditService.logCrud({
      action: 'create',
      resource: '{{pluralize (kebab-case name)}}',
      resourceId: result.id,
      newValues: dto,
    });
    {{/if}}
    return result;
  }

  async update(id: number, dto: Update{{PascalCase name}}Dto) {
    const result = await this.{{camelCase name}}Repository.update(id, dto);
    {{#if audit}}
    await this.auditService.logCrud({
      action: 'update',
      resource: '{{pluralize (kebab-case name)}}',
      resourceId: id,
      newValues: dto,
    });
    {{/if}}
    return result;
  }

  {{#if softDelete}}
  async softDelete(id: number) {
    const result = await this.{{camelCase name}}Repository.softDelete(id);
    {{#if audit}}
    await this.auditService.logCrud({
      action: 'delete',
      resource: '{{pluralize (kebab-case name)}}',
      resourceId: id,
    });
    {{/if}}
    return result;
  }
  {{else}}
  async delete(id: number) {
    return this.{{camelCase name}}Repository.hardDelete(id);
  }
  {{/if}}
}
```

---

## Security Notes

1. **Input Validation**: Module name harus alphanumeric dengan dash/underscore only
2. **Path Traversal**: Validate output path untuk prevent directory traversal
3. **Overwrite Protection**: Prompt user sebelum overwrite existing files
4. **Dry Run**: Support --dry-run untuk preview tanpa create files

---

## Documentation References

- CLI-BUILDER-SPEC.md Section 2.2 - Module generator specification
- AI-RULES.md Section 5 - Backend naming conventions
- TECHNICAL-ARCHITECTURE.md Section 3 - Backend architecture
- ERD-DATABASE.md - Database schema patterns

---

## Next Task

Setelah task ini selesai:
- Lanjut ke **Task 5.3: CRUD Generator** (build on top of module generator)

---

## Output Expected

Setelah task selesai:
1. ModuleGenerator class implemented
2. 8 Handlebars templates created
3. Can generate complete module structure
4. Generated code follows project conventions
5. All flags working (--tenant, --soft-delete, --audit)
6. Generated code compiles without errors
7. Prettier formatting applied automatically
8. Type-check passing
9. Lint passing

**Module Generation Successful**:
```bash
$ cms generate module products --tenant --soft-delete --audit

Generating module: products
============================

✓ Created: backend/src/modules/products/products.module.ts
✓ Created: backend/src/modules/products/products.controller.ts
✓ Created: backend/src/modules/products/products.service.ts
✓ Created: backend/src/modules/products/products.repository.ts
✓ Created: backend/src/modules/products/entities/product.entity.ts
✓ Created: backend/src/modules/products/dto/create-product.dto.ts
✓ Created: backend/src/modules/products/dto/update-product.dto.ts
✓ Created: backend/src/modules/products/dto/product-response.dto.ts

✓ Generated 8 file(s) successfully!

Next steps:
  1. Add ProductsModule to app.module.ts imports
  2. Define fields in entities/product.entity.ts
  3. Add validation rules in DTOs
  4. Implement business logic in products.service.ts
```

