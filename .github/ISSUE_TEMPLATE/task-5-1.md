# Task 5.1: CLI Framework Setup

**Prioritas**: P1 - HIGH  
**Estimasi Waktu**: 4 jam  
**Dependencies**: None (separate project)  
**Status**: Belum Dimulai

---

## Tujuan Task

Build CLI framework untuk Platform CMS yang akan digunakan untuk generate modules, CRUD operations, migrations, dan components. CLI ini akan mempercepat development dari 3-4 hari per module menjadi 30 menit per module dengan menggunakan template system.

---

## Yang Akan Dikerjakan

### 1. Struktur Project

Buat separate package untuk CLI tools:

```
@platform-cms/cli/
├── src/
│   ├── cli.ts                    (baru) - Main CLI entry point
│   ├── commands/
│   │   ├── new.command.ts        (baru) - Create new project
│   │   ├── generate.command.ts   (baru) - Generate resources
│   │   ├── migrate.command.ts    (baru) - Database migrations
│   │   └── validate.command.ts   (baru) - Validate code/config
│   ├── generators/
│   │   ├── base.generator.ts     (baru) - Base generator class
│   │   ├── module.generator.ts   (baru) - Module generator
│   │   ├── crud.generator.ts     (baru) - CRUD generator
│   │   └── component.generator.ts (baru) - Component generator
│   └── utils/
│       ├── file.utils.ts         (baru) - File operations
│       ├── string.utils.ts       (baru) - String helpers (camelCase, PascalCase, etc)
│       ├── template.utils.ts     (baru) - Template rendering
│       └── logger.utils.ts       (baru) - Console logging dengan colors
├── templates/
│   ├── backend/
│   │   ├── module/               (templates for module)
│   │   ├── controller/           (templates for controller)
│   │   ├── service/              (templates for service)
│   │   ├── repository/           (templates for repository)
│   │   └── dto/                  (templates for DTOs)
│   └── frontend/
│       ├── component/            (templates for React components)
│       └── page/                 (templates for pages)
├── bin/
│   └── cms.js                    (executable script)
├── package.json
├── tsconfig.json
└── README.md
```

### 2. CLI Commands Structure

**Main Commands**:
```bash
cms --help                              # Show help
cms new <project-name>                  # Create new project
cms generate <type> <name> [options]    # Generate resources
cms migrate <action>                    # Run migrations
cms validate                            # Validate project structure
```

**Generate Subcommands** (untuk Task 5.2-5.4):
```bash
cms generate module <name>              # Generate module
cms generate crud <name> [fields]       # Generate full CRUD
cms generate component <name> [type]    # Generate React component
cms generate service <name>             # Generate service only
cms generate controller <name>          # Generate controller only
```

### 3. Dependencies to Install

```json
{
  "dependencies": {
    "commander": "^11.1.0",           // CLI framework
    "handlebars": "^4.7.8",           // Template engine
    "chalk": "^5.3.0",                // Terminal colors
    "inquirer": "^9.2.12",            // Interactive prompts
    "ora": "^8.0.1",                  // Spinners
    "prettier": "^3.1.1",             // Code formatting
    "fs-extra": "^11.2.0"             // File operations
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/fs-extra": "^11.0.4",
    "@types/inquirer": "^9.0.7",
    "typescript": "^5.3.3",
    "vitest": "^1.1.0"
  }
}
```

### 4. Implementation Features

**CLI Framework**:
- Command registration dengan Commander.js
- Help system dengan usage examples
- Version management
- Error handling dengan clear messages
- Colored output untuk better UX

**Template System**:
- Handlebars template engine
- Variable substitution ({{name}}, {{PascalCase}}, {{camelCase}})
- Conditional rendering ({{#if tenantIsolated}})
- Loop rendering ({{#each fields}})
- Helper functions (capitalize, pluralize, etc)

**File Operations**:
- Create directories
- Write files dengan prettier formatting
- Check file existence
- Safe overwrites (with confirmation prompt)
- Dry-run mode (show what would be generated)

**String Utilities**:
- `toPascalCase()` - UserRole
- `toCamelCase()` - userRole
- `toKebabCase()` - user-role
- `toSnakeCase()` - user_role
- `pluralize()` - users
- `singularize()` - user

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

### CLI Framework
- [ ] CLI package created di `cli/` directory
- [ ] Dependencies installed
- [ ] Commander.js configured
- [ ] Help command works (`cms --help`)
- [ ] Version command works (`cms --version`)

### Commands Structure
- [ ] `new` command stub created
- [ ] `generate` command stub created
- [ ] `migrate` command stub created
- [ ] `validate` command stub created

### Generators Base
- [ ] BaseGenerator abstract class created
- [ ] File utilities implemented
- [ ] String utilities implemented
- [ ] Logger utilities implemented

### Template System
- [ ] Handlebars configured
- [ ] Template loader implemented
- [ ] Variable substitution working
- [ ] Helper functions registered

### Testing
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Build succeeds
- [ ] CLI executable works (`cms --help`)
- [ ] Can import generators in code

---

## Cara Testing

### 1. Setup CLI Package

```bash
# Create CLI package
mkdir -p cli
cd cli
npm init -y

# Install dependencies
npm install commander handlebars chalk inquirer ora prettier fs-extra
npm install -D @types/node @types/fs-extra @types/inquirer typescript vitest

# Setup tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Update package.json
npm pkg set name="@platform-cms/cli"
npm pkg set version="0.1.0"
npm pkg set bin.cms="./bin/cms.js"
npm pkg set scripts.build="tsc"
npm pkg set scripts.dev="tsc --watch"
npm pkg set scripts.type-check="tsc --noEmit"
```

### 2. Test CLI Executable

```bash
# Build CLI
npm run build

# Link globally (untuk testing)
npm link

# Test commands
cms --help
cms --version

# Should show help output dengan commands list
```

### 3. Test String Utilities

Create test file `cli/src/utils/string.utils.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  pluralize,
  singularize,
} from './string.utils';

describe('String Utilities', () => {
  it('should convert to PascalCase', () => {
    expect(toPascalCase('user-role')).toBe('UserRole');
    expect(toPascalCase('user_role')).toBe('UserRole');
    expect(toPascalCase('userRole')).toBe('UserRole');
  });

  it('should convert to camelCase', () => {
    expect(toCamelCase('user-role')).toBe('userRole');
    expect(toCamelCase('UserRole')).toBe('userRole');
  });

  it('should convert to kebab-case', () => {
    expect(toKebabCase('UserRole')).toBe('user-role');
    expect(toKebabCase('user_role')).toBe('user-role');
  });

  it('should convert to snake_case', () => {
    expect(toSnakeCase('UserRole')).toBe('user_role');
    expect(toSnakeCase('user-role')).toBe('user_role');
  });

  it('should pluralize', () => {
    expect(pluralize('user')).toBe('users');
    expect(pluralize('category')).toBe('categories');
  });

  it('should singularize', () => {
    expect(singularize('users')).toBe('user');
    expect(singularize('categories')).toBe('category');
  });
});
```

Run tests:
```bash
npm run test
```

### 4. Test Template System

Create test template `cli/templates/backend/test.hbs`:

```handlebars
export class {{PascalCase name}}Service {
  constructor(
    private readonly {{camelCase name}}Repository: {{PascalCase name}}Repository,
  ) {}

  async findAll(): Promise<{{PascalCase name}}[]> {
    return this.{{camelCase name}}Repository.findAll();
  }
}
```

Test rendering:

```typescript
import { renderTemplate } from './utils/template.utils';

const result = renderTemplate('backend/test.hbs', {
  name: 'user-profile'
});

console.log(result);
// Should output: UserProfileService, userProfileRepository, etc
```

Expected output:
```typescript
export class UserProfileService {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async findAll(): Promise<UserProfile[]> {
    return this.userProfileRepository.findAll();
  }
}
```

---

## Implementasi Notes

### CLI Entry Point (cli/src/cli.ts)

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { newCommand } from './commands/new.command';
import { generateCommand } from './commands/generate.command';
import { migrateCommand } from './commands/migrate.command';
import { validateCommand } from './commands/validate.command';

const program = new Command();

program
  .name('cms')
  .description('Platform CMS CLI - Generate modules, CRUD, components')
  .version('0.1.0');

// Register commands
program.addCommand(newCommand());
program.addCommand(generateCommand());
program.addCommand(migrateCommand());
program.addCommand(validateCommand());

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
```

### Base Generator (cli/src/generators/base.generator.ts)

```typescript
import * as fs from 'fs-extra';
import * as path from 'path';
import prettier from 'prettier';
import { renderTemplate } from '../utils/template.utils';
import { logger } from '../utils/logger.utils';

export interface GeneratorOptions {
  dryRun?: boolean;
  force?: boolean;
  outputPath?: string;
}

export abstract class BaseGenerator {
  constructor(protected options: GeneratorOptions = {}) {}

  /**
   * Generate files based on templates
   */
  abstract generate(name: string, data?: any): Promise<void>;

  /**
   * Render template with data
   */
  protected async renderTemplate(
    templatePath: string,
    data: any,
  ): Promise<string> {
    return renderTemplate(templatePath, data);
  }

  /**
   * Write file dengan prettier formatting
   */
  protected async writeFile(
    filePath: string,
    content: string,
  ): Promise<void> {
    if (this.options.dryRun) {
      logger.info(`[DRY RUN] Would create: ${filePath}`);
      return;
    }

    // Check if file exists
    if (await fs.pathExists(filePath) && !this.options.force) {
      const shouldOverwrite = await this.promptOverwrite(filePath);
      if (!shouldOverwrite) {
        logger.warn(`Skipped: ${filePath}`);
        return;
      }
    }

    // Ensure directory exists
    await fs.ensureDir(path.dirname(filePath));

    // Format dengan prettier
    const formatted = await prettier.format(content, {
      parser: this.getParser(filePath),
      ...this.getPrettierConfig(),
    });

    // Write file
    await fs.writeFile(filePath, formatted, 'utf-8');
    logger.success(`Created: ${filePath}`);
  }

  /**
   * Get parser based on file extension
   */
  private getParser(filePath: string): string {
    const ext = path.extname(filePath);
    switch (ext) {
      case '.ts':
      case '.tsx':
        return 'typescript';
      case '.js':
      case '.jsx':
        return 'babel';
      case '.json':
        return 'json';
      case '.md':
        return 'markdown';
      default:
        return 'typescript';
    }
  }

  /**
   * Get prettier config
   */
  private getPrettierConfig() {
    return {
      singleQuote: true,
      trailingComma: 'all',
      tabWidth: 2,
      semi: true,
      printWidth: 100,
    };
  }

  /**
   * Prompt user for overwrite confirmation
   */
  private async promptOverwrite(filePath: string): Promise<boolean> {
    // Implementation with inquirer
    return false; // placeholder
  }
}
```

### String Utilities (cli/src/utils/string.utils.ts)

```typescript
/**
 * Convert string to PascalCase
 * user-role -> UserRole
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert string to camelCase
 * user-role -> userRole
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert string to kebab-case
 * UserRole -> user-role
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to snake_case
 * UserRole -> user_role
 */
export function toSnakeCase(str: string): string {
  return toKebabCase(str).replace(/-/g, '_');
}

/**
 * Pluralize word (basic implementation)
 */
export function pluralize(word: string): string {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s')) {
    return word + 'es';
  }
  return word + 's';
}

/**
 * Singularize word (basic implementation)
 */
export function singularize(word: string): string {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('ses')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s')) {
    return word.slice(0, -1);
  }
  return word;
}
```

---

## Security Notes

1. **Input Validation**: Validate nama files dan paths untuk prevent directory traversal
2. **Overwrite Protection**: Always confirm sebelum overwrite existing files
3. **Dry Run Mode**: Test commands dengan --dry-run flag
4. **Template Security**: Sanitize user input dalam templates

---

## Documentation References

- CLI-BUILDER-SPEC.md Section 1-2 - CLI architecture dan commands
- AI-RULES.md Section 5 - Backend naming conventions
- AI-RULES.md Section 6 - Frontend naming conventions
- TECHNICAL-ARCHITECTURE.md Section 7 - Development tools

---

## Next Task

Setelah task ini selesai:
- Lanjut ke **Task 5.2: Module Generator** (generate complete NestJS modules)

---

## Output Expected

Setelah task selesai:
1. CLI package created dan configured
2. `cms --help` command works
3. `cms --version` command works
4. Base generator class implemented
5. String utilities working
6. Template system configured
7. File utilities working
8. Type-check passing
9. Lint passing
10. Ready untuk implement generators (Task 5.2-5.4)

**CLI Ready To**:
- ✅ Register commands
- ✅ Parse arguments
- ✅ Render templates
- ✅ Write files dengan prettier
- ✅ Show colored output
- ✅ Handle errors gracefully

