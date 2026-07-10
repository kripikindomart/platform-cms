# CLI ENTERPRISE UPGRADE PLAN
**Platform CMS - Advanced CRUD Generator**

**Created**: 2024-01-08  
**Last Updated**: 2026-07-10  
**Status**: Phase 1.1 Complete ✅  
**Priority**: HIGH

---

## 🎯 Objective

Upgrade CLI CRUD generator dari basic ke **ENTERPRISE-GRADE** dengan features:
1. ✅ Database metadata integration
2. Enhanced validation (in progress)
3. Relations support  
4. Pagination, filtering, sorting
5. Test generation
6. Interactive mode
7. Frontend types generation

---

## ✅ COMPLETED (Task 5.3.3)

- Enhanced field parser (enum, relations, display)
- Auto-import module to app.module.ts
- Auto-export entity to tenant schema
- Auto-delete module command
- Decimal type handling
- Cross-platform support
- Template system working

---

## ✅ COMPLETED (Phase 1.1 - 2026-07-10)

**CLI Metadata Database Integration**
- ✅ Metadata saved to database after generation
- ✅ Installed node-fetch + @types/node-fetch
- ✅ Auto-save module + fields + validations
- ✅ Fixed workspace root detection (Windows/Linux/Docker)
- ✅ Fixed absolute path handling
- ✅ Validation types match DB enum
- ✅ Cross-platform compatibility verified
- ✅ Tested: Generate from cli/ directory works correctly

**Git Commit**: bb46966

---

## ✅ COMPLETED (Phase 1.2 - 2026-07-10)

**Enhanced DTO Validators**
- ✅ Comprehensive validation decorators auto-generated
- ✅ String length validation (`@MaxLength()`)
- ✅ Email/URL validation with default lengths
- ✅ Number Min/Max based on precision/scale
- ✅ Enum validation with TypeScript union types
- ✅ Date/DateTime with Transform decorator
- ✅ Math Handlebars helpers (pow, subtract, add, etc)
- ✅ Fixed field parser to extract length with modifiers
- ✅ Enhanced imports and conditional validation

**Git Commit**: f740b93

---

## 🔧 ENTERPRISE FEATURES TO IMPLEMENT

### **PHASE 1: DATABASE & VALIDATION (HIGH PRIORITY)** - 100% Complete ✅

#### ~~1.1 CLI Metadata Database Integration~~ ✅ COMPLETE
Status: **DONE** (2026-07-10)

#### ~~1.2 Enhanced DTO Validators~~ ✅ COMPLETE
Status: **DONE** (2026-07-10)

---

### **PHASE 2: RELATIONS & ADVANCED FEATURES (MEDIUM PRIORITY)**

**Goal**: Auto-generate proper validation based on field type

```handlebars
{{#each fields}}
{{#if this.required}}
  @ApiProperty({ description: '{{toTitleCase this.name}}', required: true })
{{else}}
  @ApiProperty({ description: '{{toTitleCase this.name}}', required: false })
{{/if}}
{{#if (eq this.type 'string')}}
  @IsString()
  {{#if this.length}}
  @MaxLength({{this.length}})
  {{/if}}
{{else if (eq this.type 'email')}}
  @IsEmail()
  @MaxLength(255)
{{else if (eq this.type 'url')}}
  @IsUrl()
{{else if (eq this.type 'number')}}
  @IsNumber()
  {{#if this.precision}}
  @Min(0)
  @Max({{pow 10 (subtract this.precision this.scale)}})
  {{/if}}
{{else if (eq this.type 'boolean')}}
  @IsBoolean()
{{else if (eq this.type 'datetime')}}
  @IsDate()
  @Type(() => Date)
{{else if (eq this.type 'uuid')}}
  @IsUUID()
{{/if}}
{{#if this.enumValues}}
  @IsEnum([{{#each this.enumValues}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}])
{{/if}}
{{#if this.required}}
  @IsNotEmpty()
{{else}}
  @IsOptional()
{{/if}}
  {{camelCase this.name}}{{#unless this.required}}?{{/unless}}: {{mapTypeToTS this.type}};

{{/each}}
```

**Add Handlebars helpers**:
```typescript
// cli/src/utils/handlebars-helpers.ts
export const helpers = {
  pow: (base: number, exp: number) => Math.pow(base, exp),
  subtract: (a: number, b: number) => a - b,
  mapTypeToTS: (type: string) => {
    const map: Record<string, string> = {
      string: 'string',
      text: 'string',
      number: 'number',
      boolean: 'boolean',
      date: 'Date',
      datetime: 'Date',
      uuid: 'string',
      json: 'any',
    };
    return map[type] || 'any';
  },
  toTitleCase: (str: string) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
};
```

---

### **PHASE 2: RELATIONS (HIGH PRIORITY)**

#### 2.1 Foreign Key Column Generation
**File**: `cli/templates/backend/module/entities/entity.hbs`

**Goal**: Generate foreign key columns for relations

```handlebars
{{#each fields}}
{{#if this.relationModule}}
  // Relation: {{this.relationType}} to {{this.relationModule}}
  {{this.name}}: integer('{{this.name}}'){{#if this.required}}.notNull(){{/if}}.references(() => {{camelCase (pluralize this.relationModule)}}.id{{#if (eq this.relationType 'many-to-one')}}, { onDelete: 'cascade' }{{/if}}),
{{else}}
  {{! ... existing field generation ... }}
{{/if}}
{{/each}}
```

#### 2.2 Junction Table for Many-to-Many
**File**: `cli/src/generators/crud.generator.ts`

**Goal**: Auto-generate junction tables

```typescript
private async generateJunctionTables(name: string, fields: Field[]): Promise<void> {
  const manyToManyFields = fields.filter(f => f.relationType === 'many-to-many');
  
  for (const field of manyToManyFields) {
    const junctionTableName = `${this.toSnakeCase(name)}_${field.relationModule}`;
    const junctionPath = path.join(
      this.options.outputPath,
      'backend/src/database/schema/tenant',
      `${junctionTableName}.schema.ts`
    );
    
    const junctionContent = `
import { pgTable, serial, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { ${this.camelCase(this.pluralize(name))} } from '../../../modules/${this.toKebabCase(this.pluralize(name))}/entities/${this.toKebabCase(this.singularize(name))}.entity';
import { ${this.camelCase(this.pluralize(field.relationModule!))} } from './${field.relationModule}.schema';

export const ${this.camelCase(junctionTableName)} = pgTable('${junctionTableName}', {
  ${this.singularize(name)}_id: integer('${this.singularize(name)}_id')
    .notNull()
    .references(() => ${this.camelCase(this.pluralize(name))}.id, { onDelete: 'cascade' }),
  ${this.singularize(field.relationModule!)}_id: integer('${this.singularize(field.relationModule!)}_id')
    .notNull()
    .references(() => ${this.camelCase(this.pluralize(field.relationModule!))}.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey(table.${this.singularize(name)}_id, table.${this.singularize(field.relationModule!)}_id),
}));
`;
    
    await fs.writeFile(junctionPath, junctionContent);
    console.log(`✓ Generated junction table: ${junctionTableName}`);
  }
}
```

---

### **PHASE 3: PAGINATION, FILTERING, SORTING (HIGH PRIORITY)**

#### 3.1 Repository with Query Builder
**File**: `cli/templates/backend/module/repository.hbs`

**Goal**: Add pagination, filtering, sorting

```typescript
/**
 * Find all with pagination, filtering, sorting
 */
async findAllWithQuery(query: QueryDto): Promise<{ data: {{PascalCase (singularize name)}}[]; total: number }> {
  const { page = 1, limit = 10, sort, order = 'asc', filters } = query;
  const offset = (page - 1) * limit;
  
  let dbQuery = this.db.select().from({{camelCase (pluralize name)}});
  
  // Apply filters
  if (filters) {
    const conditions = [];
    {{#each fields}}
    {{#if this.isFilterable}}
    if (filters.{{this.name}}) {
      conditions.push(eq({{../camelCase (../pluralize ../name)}}.{{this.name}}, filters.{{this.name}}));
    }
    {{/if}}
    {{/each}}
    if (conditions.length > 0) {
      dbQuery = dbQuery.where(and(...conditions));
    }
  }
  
  // Apply search
  {{#if (hasSearchable fields)}}
  if (query.search) {
    const searchConditions = [
      {{#each fields}}
      {{#if this.isSearchable}}
      ilike({{../camelCase (../pluralize ../name)}}.{{this.name}}, `%${query.search}%`),
      {{/if}}
      {{/each}}
    ];
    dbQuery = dbQuery.where(or(...searchConditions));
  }
  {{/if}}
  
  // Apply sorting
  const sortField = sort || 'created_at';
  const sortOrder = order === 'desc' ? desc : asc;
  dbQuery = dbQuery.orderBy(sortOrder({{camelCase (pluralize name)}}[sortField]));
  
  // Get total count
  const countQuery = await this.db
    .select({ count: sql<number>`count(*)` })
    .from({{camelCase (pluralize name)}});
  const total = countQuery[0]?.count || 0;
  
  // Apply pagination
  const data = await dbQuery.limit(limit).offset(offset);
  
  return { data, total };
}
```

#### 3.2 Query DTO
**File**: `cli/templates/backend/module/dto/query-dto.hbs`

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class Query{{PascalCase (singularize name)}}Dto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';

  {{#if (hasSearchable fields)}}
  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
  {{/if}}

  {{#each fields}}
  {{#if this.isFilterable}}
  @ApiPropertyOptional({ description: 'Filter by {{this.name}}' })
  @IsOptional()
  {{#if (eq this.type 'number')}}
  @Type(() => Number)
  @IsNumber()
  {{else if (eq this.type 'boolean')}}
  @Type(() => Boolean)
  {{else}}
  @IsString()
  {{/if}}
  {{this.name}}?: {{mapTypeToTS this.type}};
  {{/if}}
  {{/each}}
}
```

---

### **PHASE 4: TESTING (MEDIUM PRIORITY)**

#### 4.1 Unit Test Generation
**File**: `cli/templates/backend/module/service.spec.hbs`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { {{PascalCase name}}Service } from './{{kebab-case name}}.service';
import { {{PascalCase name}}Repository } from './{{kebab-case name}}.repository';

describe('{{PascalCase name}}Service', () => {
  let service: {{PascalCase name}}Service;
  let repository: {{PascalCase name}}Repository;

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    hardDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {{PascalCase name}}Service,
        {
          provide: {{PascalCase name}}Repository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<{{PascalCase name}}Service>({{PascalCase name}}Service);
    repository = module.get<{{PascalCase name}}Repository>({{PascalCase name}}Repository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of {{pluralize (lowercase name)}}', async () => {
      const expected = [{ id: 1, {{#each fields}}{{#if @first}}{{this.name}}: 'test'{{/if}}{{/each}} }];
      mockRepository.findAll.mockResolvedValue(expected);

      const result = await service.findAll();

      expect(result).toEqual(expected);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  // Add more tests...
});
```

---

### **PHASE 5: DEVELOPER EXPERIENCE (MEDIUM PRIORITY)**

#### 5.1 Interactive CLI Mode
**File**: `cli/src/commands/generate.command.ts`

```typescript
cmd
  .command('crud-interactive')
  .description('Generate CRUD with interactive prompts')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Module name (singular):',
        validate: (input) => input.length > 0 || 'Name is required',
      },
      {
        type: 'confirm',
        name: 'tenant',
        message: 'Enable tenant isolation?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'softDelete',
        message: 'Enable soft delete?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'audit',
        message: 'Enable audit logging?',
        default: false,
      },
      {
        type: 'editor',
        name: 'fields',
        message: 'Define fields (one per line: name:type:length):',
        default: 'name:string:255\ndescription:text\nactive:boolean',
      },
    ]);

    // Generate with answers
    const generator = new CrudGenerator({ outputPath: process.cwd() });
    await generator.generate(answers.name, answers);
  });
```

---

### **PHASE 6: FRONTEND INTEGRATION (LOW PRIORITY)**

#### 6.1 TypeScript Types Generation
**File**: `cli/templates/frontend/types.hbs`

```typescript
// Auto-generated types for {{PascalCase (singularize name)}}
// Generated at: {{currentDate}}

export interface {{PascalCase (singularize name)}} {
  id: number;
  {{#each fields}}
  {{this.name}}{{#unless this.required}}?{{/unless}}: {{mapTypeToTS this.type}};
  {{/each}}
  created_at: Date;
  updated_at: Date;
}

export interface Create{{PascalCase (singularize name)}}Dto {
  {{#each fields}}
  {{this.name}}{{#unless this.required}}?{{/unless}}: {{mapTypeToTS this.type}};
  {{/each}}
}

export interface Update{{PascalCase (singularize name)}}Dto {
  {{#each fields}}
  {{this.name}}?: {{mapTypeToTS this.type}};
  {{/each}}
}

export interface {{PascalCase (singularize name)}}Query {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  {{#each fields}}
  {{#if this.isFilterable}}
  {{this.name}}?: {{mapTypeToTS this.type}};
  {{/if}}
  {{/each}}
}
```

---

## 📋 Implementation Checklist

### Phase 1: Database & Validation
- [ ] Add saveMetadataToDatabase() method
- [ ] Enhance DTO validation templates
- [ ] Add Handlebars helpers
- [ ] Test metadata saving
- [ ] Test enhanced validations

### Phase 2: Relations
- [ ] Add foreign key column generation
- [ ] Implement junction table generator
- [ ] Add relation decorators
- [ ] Test one-to-many
- [ ] Test many-to-many

### Phase 3: Query Features
- [ ] Implement findAllWithQuery()
- [ ] Generate Query DTO
- [ ] Add search logic
- [ ] Add filter logic
- [ ] Add sort logic
- [ ] Add pagination logic
- [ ] Test all query features

### Phase 4: Testing
- [ ] Generate service.spec.ts
- [ ] Generate controller.spec.ts
- [ ] Generate repository.spec.ts
- [ ] Add test utilities
- [ ] Test generated tests

### Phase 5: DX
- [ ] Interactive mode
- [ ] Better error messages
- [ ] Field name validation
- [ ] Dependency checker
- [ ] Rollback command

### Phase 6: Frontend
- [ ] TypeScript types generation
- [ ] API client generation
- [ ] React hooks generation (Task 5.4)

---

## 🎯 Success Criteria

- [ ] All CRUD operations work with pagination/filtering/sorting
- [ ] Relations work (foreign keys + junction tables)
- [ ] Enhanced validations prevent invalid data
- [ ] Metadata saved to database correctly
- [ ] Tests are auto-generated and pass
- [ ] Interactive mode works smoothly
- [ ] Frontend types match backend DTOs
- [ ] Documentation complete
- [ ] All integration tests pass

---

## 📝 Notes

**Implementation Order**: Follow phases 1→2→3 for maximum impact. Phases 4-6 can be done in parallel or deferred.

**Backward Compatibility**: All existing CLI commands must continue to work.

**Testing**: Each phase must be integration-tested before moving to next phase.

---

**Next Session**: Start with Phase 1.1 - CLI Metadata Database Integration
