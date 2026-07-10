/**
 * CRUD Generator
 * Extends Module Generator with field definitions
 */

import { ModuleGenerator, ModuleGeneratorOptions } from './module.generator';

export interface Field {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  nullable?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  defaultValue?: string;
  // Enum support
  enumValues?: string[];
  // Relation support
  relationModule?: string;
  relationType?: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  // Display settings
  isSearchable?: boolean;
  isSortable?: boolean;
  isFilterable?: boolean;
  showInList?: boolean;
  showInDetail?: boolean;
  showInForm?: boolean;
  // Frontend
  inputType?: string;
  placeholder?: string;
  helpText?: string;
}

export interface CrudGeneratorOptions extends ModuleGeneratorOptions {
  fields?: string;
  enum?: string; // "status:draft,published,archived"
  relation?: string; // "category:categories:many-to-one"
  display?: string; // "title:list:detail:form"
  searchable?: string; // "title,content"
  sortable?: string; // "title,created_at"
  filterable?: string; // "status,category"
  input?: string; // "content:wysiwyg,thumbnail:image"
}

export class CrudGenerator extends ModuleGenerator {
  /**
   * Generate complete CRUD with fields
   */
  async generate(name: string, options: CrudGeneratorOptions = {}): Promise<void> {
    this.logStart('CRUD', name);

    try {
      // Parse all options
      const enumMaps = this.parseEnumOptions(options.enum);
      const relationMaps = this.parseRelationOptions(options.relation);
      const displayMaps = this.parseDisplayOptions(options.display);
      const searchableFields = this.parseListOptions(options.searchable);
      const sortableFields = this.parseListOptions(options.sortable);
      const filterableFields = this.parseListOptions(options.filterable);
      const inputTypeMaps = this.parseInputOptions(options.input);

      // Parse fields with all metadata
      const fields = this.parseFields(
        options.fields || '',
        enumMaps,
        relationMaps,
        displayMaps,
        searchableFields,
        sortableFields,
        filterableFields,
        inputTypeMaps,
      );

      // Prepare template data with fields
      const data = {
        ...this.prepareTemplateData(name, options),
        fields,
        hasFields: fields.length > 0,
      };

      // Generate all files using parent method
      const files = await this.generateFiles(name, data, options);

      // Write files
      await this.writeFiles(files);

      // Auto-import to app.module.ts
      if (!options.dryRun) {
        await this.autoImportModule(name, options);
        await this.autoExportEntity(name, options);
      }

      // Log success
      this.logComplete(files.length);
      this.showCrudNextSteps(name, options, fields);
    } catch (error) {
      this.logError(error as Error);
      throw error;
    }
  }

  /**
   * Parse fields string into Field array with complete metadata
   * Format: "name:string:255:10:2!@?"
   * Syntax: name:type:length:precision:scale:modifiers
   * Modifiers: ! (required), @ (unique), ? (nullable)
   */
  private parseFields(
    fieldsStr: string,
    enumMaps: Map<string, string[]>,
    relationMaps: Map<string, { module: string; type: string }>,
    displayMaps: Map<string, { list: boolean; detail: boolean; form: boolean }>,
    searchableFields: Set<string>,
    sortableFields: Set<string>,
    filterableFields: Set<string>,
    inputTypeMaps: Map<string, string>,
  ): Field[] {
    if (!fieldsStr) return [];

    return fieldsStr.split(',').map((fieldStr) => {
      const parts = fieldStr.trim().split(':');
      const name = parts[0].trim();
      
      if (!parts[1]) {
        throw new Error(`Field '${name}' missing type definition`);
      }

      let typeWithModifiers = parts[1];
      let length: number | undefined;
      let precision: number | undefined;
      let scale: number | undefined;
      let required = false;
      let unique = false;
      let nullable = false;

      // Determine base type
      const baseType = typeWithModifiers.replace(/[!@?]/g, '').trim().toLowerCase();

      // Parse numeric parameters based on type
      if (baseType === 'decimal' || baseType === 'numeric' || baseType === 'float') {
        // For decimal types: parts[2] = precision, parts[3] = scale
        if (parts[2] && /^\d+$/.test(parts[2])) {
          precision = parseInt(parts[2], 10);
        }
        if (parts[3] && /^\d+$/.test(parts[3])) {
          scale = parseInt(parts[3], 10);
        }
      } else {
        // For other types: parts[2] = length, parts[3] = precision, parts[4] = scale
        if (parts[2] && /^\d+$/.test(parts[2])) {
          length = parseInt(parts[2], 10);
        }
        if (parts[3] && /^\d+$/.test(parts[3])) {
          precision = parseInt(parts[3], 10);
        }
        if (parts[4] && /^\d+$/.test(parts[4])) {
          scale = parseInt(parts[4], 10);
        }
      }

      // Parse modifiers from last part or type
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('!')) {
        required = true;
        typeWithModifiers = typeWithModifiers.replace('!', '');
      }
      if (lastPart.includes('@')) {
        unique = true;
        typeWithModifiers = typeWithModifiers.replace('@', '');
      }
      if (lastPart.includes('?')) {
        nullable = true;
        typeWithModifiers = typeWithModifiers.replace('?', '');
      }

      const type = this.normalizeType(typeWithModifiers.trim());

      // Build field with metadata
      const field: Field = {
        name,
        type,
        required,
        unique,
        nullable,
        length,
        precision,
        scale,
      };

      // Add enum values if defined
      if (enumMaps.has(name)) {
        field.enumValues = enumMaps.get(name);
      }

      // Add relation if defined
      if (relationMaps.has(name)) {
        const relation = relationMaps.get(name)!;
        field.relationModule = relation.module;
        field.relationType = relation.type as any;
      }

      // Add display settings
      if (displayMaps.has(name)) {
        const display = displayMaps.get(name)!;
        field.showInList = display.list;
        field.showInDetail = display.detail;
        field.showInForm = display.form;
      } else {
        // Default: show everywhere
        field.showInList = true;
        field.showInDetail = true;
        field.showInForm = true;
      }

      // Add search/sort/filter flags
      field.isSearchable = searchableFields.has(name);
      field.isSortable = sortableFields.has(name);
      field.isFilterable = filterableFields.has(name);

      // Determine input type
      field.inputType = inputTypeMaps.get(name) || this.getDefaultInputType(type);

      return field;
    });
  }

  /**
   * Parse enum options
   * Format: "status:draft,published,archived;priority:low,medium,high"
   */
  private parseEnumOptions(enumStr?: string): Map<string, string[]> {
    const map = new Map<string, string[]>();
    if (!enumStr) return map;

    enumStr.split(';').forEach((enumDef) => {
      const [fieldName, values] = enumDef.split(':');
      if (fieldName && values) {
        map.set(fieldName.trim(), values.split(',').map((v) => v.trim()));
      }
    });

    return map;
  }

  /**
   * Parse relation options
   * Format: "category:categories:many-to-one;tags:tags:many-to-many"
   */
  private parseRelationOptions(relationStr?: string): Map<string, { module: string; type: string }> {
    const map = new Map<string, { module: string; type: string }>();
    if (!relationStr) return map;

    relationStr.split(';').forEach((relationDef) => {
      const [fieldName, module, type] = relationDef.split(':');
      if (fieldName && module && type) {
        map.set(fieldName.trim(), {
          module: module.trim(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: type.trim() as any,
        });
      }
    });

    return map;
  }

  /**
   * Parse display options
   * Format: "title:list:detail:form;content:detail:form"
   */
  private parseDisplayOptions(displayStr?: string): Map<string, { list: boolean; detail: boolean; form: boolean }> {
    const map = new Map<string, { list: boolean; detail: boolean; form: boolean }>();
    if (!displayStr) return map;

    displayStr.split(';').forEach((displayDef) => {
      const parts = displayDef.split(':');
      const fieldName = parts[0].trim();
      const settings = parts.slice(1).map((s) => s.trim().toLowerCase());

      map.set(fieldName, {
        list: settings.includes('list'),
        detail: settings.includes('detail'),
        form: settings.includes('form'),
      });
    });

    return map;
  }

  /**
   * Parse list options (searchable, sortable, filterable)
   * Format: "field1,field2,field3"
   */
  private parseListOptions(listStr?: string): Set<string> {
    const set = new Set<string>();
    if (!listStr) return set;

    listStr.split(',').forEach((field) => {
      set.add(field.trim());
    });

    return set;
  }

  /**
   * Parse input type overrides
   * Format: "content:wysiwyg;thumbnail:image;config:json-editor"
   */
  private parseInputOptions(inputStr?: string): Map<string, string> {
    const map = new Map<string, string>();
    if (!inputStr) return map;

    inputStr.split(';').forEach((inputDef) => {
      const [fieldName, inputType] = inputDef.split(':');
      if (fieldName && inputType) {
        map.set(fieldName.trim(), inputType.trim());
      }
    });

    return map;
  }

  /**
   * Get default input type based on field type
   */
  private getDefaultInputType(fieldType: string): string {
    const inputTypeMap: Record<string, string> = {
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

    return inputTypeMap[fieldType] || 'text';
  }

  /**
   * Normalize field type
   */
  private normalizeType(type: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      text: 'text',
      number: 'number',
      int: 'number',
      integer: 'number',
      float: 'number',
      decimal: 'number',
      boolean: 'boolean',
      bool: 'boolean',
      date: 'date',
      datetime: 'datetime',
      timestamp: 'timestamp',
      email: 'email',
      url: 'url',
      uuid: 'uuid',
      json: 'json',
    };

    return typeMap[type.toLowerCase()] || 'string';
  }

  /**
   * Auto-import module to app.module.ts
   */
  private async autoImportModule(name: string, options: CrudGeneratorOptions): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const moduleName = this.toPascalCase(this.pluralize(name));
    const moduleFileName = this.toKebabCase(this.pluralize(name));
    
    // Calculate correct path - cross-platform way
    // Strategy: look for backend/src/app.module.ts from current directory upwards
    let workspaceRoot = this.options.outputPath || process.cwd();
    
    // Normalize path separators for cross-platform compatibility
    workspaceRoot = path.normalize(workspaceRoot);
    
    // Check if current directory has backend/src/app.module.ts
    let appModulePath = path.join(workspaceRoot, 'backend', 'src', 'app.module.ts');
    
    // If not found, try going up one level (for when CLI is run from cli/ folder)
    try {
      await fs.access(appModulePath);
    } catch {
      workspaceRoot = path.join(workspaceRoot, '..');
      appModulePath = path.join(workspaceRoot, 'backend', 'src', 'app.module.ts');
    }
    
    try {
      // Read app.module.ts
      const content = await fs.readFile(appModulePath, 'utf-8');
      
      // Check if already imported
      if (content.includes(`${moduleName}Module`)) {
        console.log(`\n⚠ ${moduleName}Module already imported in app.module.ts`);
        return;
      }
      
      // Find the last import statement
      const importLines = content.split('\n');
      let lastImportIndex = -1;
      for (let i = 0; i < importLines.length; i++) {
        if (importLines[i].trim().startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      
      // Add import statement
      const importStatement = `import { ${moduleName}Module } from './modules/${moduleFileName}/${moduleFileName}.module';`;
      importLines.splice(lastImportIndex + 1, 0, importStatement);
      
      // Find imports array in @Module decorator
      const newContent = importLines.join('\n');
      const importsMatch = newContent.match(/(imports:\s*\[)([\s\S]*?)(\],)/);
      
      if (importsMatch) {
        const beforeImports = importsMatch[1];
        let importsContent = importsMatch[2];
        const afterImports = importsMatch[3];
        
        // Clean up existing content and add module
        importsContent = importsContent.trim();
        
        // Remove trailing comma if exists
        if (importsContent.endsWith(',')) {
          importsContent = importsContent.slice(0, -1);
        }
        
        // Add module to imports array
        const updatedImports = `${importsContent},\n    ${moduleName}Module`;
        const updatedContent = newContent.replace(
          importsMatch[0],
          `${beforeImports}${updatedImports}\n  ${afterImports}`
        );
        
        // Write back
        await fs.writeFile(appModulePath, updatedContent, 'utf-8');
        console.log(`\n✓ Auto-imported ${moduleName}Module to app.module.ts`);
      } else {
        console.log(`\n⚠ Could not auto-import: imports array not found in app.module.ts`);
        console.log(`  Please manually add: ${moduleName}Module`);
      }
    } catch (error) {
      console.log(`\n⚠ Could not auto-import to app.module.ts: ${(error as Error).message}`);
      console.log(`  Please manually add: import { ${moduleName}Module } from './modules/${moduleFileName}/${moduleFileName}.module';`);
    }
  }

  /**
   * Auto-export entity to tenant schema index
   */
  private async autoExportEntity(name: string, options: CrudGeneratorOptions): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const entityFileName = this.toKebabCase(this.singularize(name));
    
    // Calculate correct path
    let workspaceRoot = this.options.outputPath || process.cwd();
    workspaceRoot = path.normalize(workspaceRoot);
    
    // Check if current directory has tenant schema
    let tenantSchemaPath = path.join(workspaceRoot, 'backend', 'src', 'database', 'schema', 'tenant', 'index.ts');
    
    // If not found, try going up one level
    try {
      await fs.access(tenantSchemaPath);
    } catch {
      workspaceRoot = path.join(workspaceRoot, '..');
      tenantSchemaPath = path.join(workspaceRoot, 'backend', 'src', 'database', 'schema', 'tenant', 'index.ts');
    }
    
    try {
      // Read tenant schema index
      const content = await fs.readFile(tenantSchemaPath, 'utf-8');
      
      // Check if already exported
      const exportStatement = `export * from '../../../modules/${this.toKebabCase(this.pluralize(name))}/entities/${entityFileName}.entity';`;
      
      if (content.includes(entityFileName)) {
        console.log(`⚠ Entity already exported in tenant schema index`);
        return;
      }
      
      // Add export statement at the end
      const updatedContent = content.trim() + `\n${exportStatement}\n`;
      
      await fs.writeFile(tenantSchemaPath, updatedContent, 'utf-8');
      console.log(`✓ Auto-exported entity to tenant schema index`);
    } catch (error) {
      console.log(`\n⚠ Could not auto-export entity: ${(error as Error).message}`);
      console.log(`  Please manually add to backend/src/database/schema/tenant/index.ts:`);
      console.log(`  export * from '../../../modules/${this.toKebabCase(this.pluralize(name))}/entities/${entityFileName}.entity';`);
    }
  }

  /**
   * Show CRUD-specific next steps
   */
  private showCrudNextSteps(
    name: string,
    options: CrudGeneratorOptions,
    fields: Field[],
  ): void {
    console.log('\nNext steps:');
    console.log(`  1. ✓ Module auto-imported to app.module.ts`);
    console.log(`  2. ✓ Entity auto-exported to tenant schema`);
    
    if (fields.length > 0) {
      console.log(`  3. Review generated fields (${fields.length} fields added)`);
      console.log(`  4. Run: npm run db:generate && npm run db:push`);
      console.log(`  5. Add additional validation rules in DTOs if needed`);
    } else {
      console.log(`  3. Define fields in entities/${this.toKebabCase(this.singularize(name))}.entity.ts`);
      console.log(`  4. Run: npm run db:generate && npm run db:push`);
      console.log(`  3. Add validation rules in DTOs`);
    }

    console.log(`  4. Test endpoints with Swagger UI at /api-docs`);

    if (options.tenant) {
      console.log(`  5. Ensure TenantContextService is set in requests`);
    }
  }

  // Helper methods (imported from string utils)
  private toPascalCase(str: string): string {
    return str.split(/[-_\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  }

  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
  }

  private pluralize(word: string): string {
    if (word.endsWith('s') && !word.endsWith('ss')) return word;
    if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
    return word + 's';
  }

  private singularize(word: string): string {
    if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }
}
