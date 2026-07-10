# @platform-cms/cli

Platform CMS CLI tool for generating modules, CRUD operations, and components.

## Installation

```bash
# Install dependencies
cd cli
npm install

# Build CLI
npm run build

# Link globally for development
npm link
```

## Usage

```bash
# Show help
cms --help

# Show version
cms --version

# Create new project (coming soon)
cms new my-project

# Generate module
cms generate module users

# Generate full CRUD
cms generate crud posts --fields="title:string,content:text"

# Generate React component
cms generate component UserCard --type=card

# Run migrations
cms migrate run

# Validate project
cms validate
```

## Commands

### `cms new <project-name>`

Create a new Platform CMS project.

**Options:**
- `-d, --dir <directory>` - Output directory (default: `.`)
- `--skip-install` - Skip npm install

### `cms generate <type> <name>`

Generate resources (module, crud, component, etc.)

**Aliases:** `g`

**Types:**
- `module` - Generate NestJS module
- `crud` - Generate full CRUD (module, controller, service, repository, DTOs)
- `component` - Generate React component
- `service` - Generate NestJS service
- `controller` - Generate NestJS controller
- `repository` - Generate repository

**Common Options:**
- `--tenant` - Enable tenant isolation
- `--soft-delete` - Enable soft delete
- `--auth` - Add authentication guards
- `--fields <fields>` - Field definitions for CRUD (e.g., `name:string,email:email`)
- `--type <type>` - Component type for React components (form, table, card)
- `--dir <directory>` - Output directory

### `cms migrate [action]`

Database migration operations.

**Actions:**
- `generate` - Generate new migration
- `run` - Run pending migrations (default)
- `rollback` - Rollback last migration

**Options:**
- `--name <name>` - Migration name
- `--tenant <schema>` - Tenant schema name

### `cms validate`

Validate project structure and configuration.

**Options:**
- `--fix` - Auto-fix issues when possible

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Test
npm run test
```

## Architecture

```
cli/
├── src/
│   ├── cli.ts                    # Main entry point
│   ├── commands/                 # Command implementations
│   │   ├── new.command.ts
│   │   ├── generate.command.ts
│   │   ├── migrate.command.ts
│   │   └── validate.command.ts
│   ├── generators/               # Code generators
│   │   ├── base.generator.ts
│   │   ├── module.generator.ts
│   │   ├── crud.generator.ts
│   │   └── component.generator.ts
│   └── utils/                    # Utility functions
│       ├── file.utils.ts
│       ├── string.utils.ts
│       ├── template.utils.ts
│       └── logger.utils.ts
├── templates/                    # Handlebars templates
│   ├── backend/
│   └── frontend/
└── bin/
    └── cms.js                    # Executable script
```

## Template System

The CLI uses Handlebars for templating. Available helpers:

**Case Conversion:**
- `{{PascalCase name}}` - UserProfile
- `{{camelCase name}}` - userProfile
- `{{kebab-case name}}` - user-profile
- `{{snake_case name}}` - user_profile

**Pluralization:**
- `{{pluralize name}}` - users
- `{{singularize name}}` - user

**String Helpers:**
- `{{capitalize name}}` - User
- `{{uppercase name}}` - USER
- `{{lowercase name}}` - user

**Conditionals:**
- `{{#if tenantIsolated}}...{{/if}}`
- `{{#unless softDelete}}...{{/unless}}`

**Loops:**
- `{{#each fields}}{{this.name}}{{/each}}`

## License

MIT
