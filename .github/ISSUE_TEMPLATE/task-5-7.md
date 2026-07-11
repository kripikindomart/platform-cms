---
name: Task 5.7 - CLI Interactive Mode
about: Implementasi mode interaktif untuk CLI generator
title: "[TASK 5.7] CLI Interactive Mode (Phase 5)"
labels: enhancement, cli, dx
assignees: ''
---

## 📋 Task 5.7: CLI Interactive Mode (Phase 5)

**Status**: 🔄 IN PROGRESS  
**Priority**: P2 - MEDIUM  
**Estimated Time**: 3 jam  
**Dependencies**: Phase 1-4 Complete

---

## 🎯 Objective

Implementasi mode interaktif untuk CLI generator agar developer bisa generate module dengan guided prompts, tanpa perlu hafal semua parameter CLI.

---

## ✨ Features

### 1. Interactive CRUD Generator
```bash
# Command baru
cms generate crud --interactive
# atau alias
cms g crud -i

# Guided prompts:
? Module name (singular): product
? Enable tenant isolation? (Y/n): Y
? Enable soft delete? (Y/n): Y
? Enable audit logging? (Y/n): Y
? Add fields (one per line, empty to finish):
  name:string:255
  price:decimal:10:2
  stock:integer
  description:text
  (empty line to finish)
? Add searchable fields (comma separated): name,description
? Add filterable fields (comma separated): price,stock
? Add sortable fields (comma separated): name,price,created_at
✓ Generated products module with 12 files!
```

### 2. Field Definition Helper
```bash
# Interactive field builder
? Field name: price
? Field type: (Use arrow keys)
  > string
    text
    number
    integer
    decimal
    boolean
    date
    datetime
? Is required? (Y/n): Y
? Is unique? (Y/n): N
? Max length (for string): 10
? Decimal places (for decimal): 2
✓ Added field: price:decimal:10:2
? Add another field? (Y/n): 
```

### 3. Relation Builder (Optional)
```bash
? Add relations? (Y/n): Y
? Relation type: (Use arrow keys)
  > one-to-many
    many-to-one
    many-to-many
? Related module: categories
? Foreign key name: category_id
✓ Added relation to categories
```

---

## 📁 Files to Create/Modify

### New Files
1. `cli/src/commands/interactive.command.ts` - Interactive command logic
2. `cli/src/utils/interactive.utils.ts` - Prompt helpers & validators

### Modified Files
1. `cli/src/commands/generate.command.ts` - Add `--interactive` flag
2. `cli/src/cli.ts` - Register interactive command
3. `cli/package.json` - Ensure inquirer installed

---

## 🔧 Implementation Details

### 1. Interactive Command Structure
```typescript
// cli/src/commands/interactive.command.ts
import inquirer from 'inquirer';

export async function interactiveCrudGeneration() {
  // Step 1: Basic info
  const basic = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Module name (singular):' },
    { type: 'confirm', name: 'tenant', message: 'Enable tenant isolation?', default: true },
    { type: 'confirm', name: 'softDelete', message: 'Enable soft delete?', default: true },
    { type: 'confirm', name: 'audit', message: 'Enable audit logging?', default: true },
  ]);

  // Step 2: Fields
  const fields = await collectFields();

  // Step 3: Query options
  const queryOptions = await inquirer.prompt([
    { type: 'input', name: 'searchable', message: 'Searchable fields (comma separated):' },
    { type: 'input', name: 'filterable', message: 'Filterable fields (comma separated):' },
    { type: 'input', name: 'sortable', message: 'Sortable fields (comma separated):' },
  ]);

  // Generate
  return { ...basic, fields, ...queryOptions };
}

async function collectFields(): Promise<string[]> {
  const fields: string[] = [];
  let addMore = true;

  while (addMore) {
    const field = await inquirer.prompt([
      { type: 'input', name: 'definition', message: `Field ${fields.length + 1} (name:type:length or empty to finish):` },
    ]);

    if (!field.definition) {
      addMore = false;
    } else {
      fields.push(field.definition);
    }
  }

  return fields;
}
```

### 2. Add Interactive Flag
```typescript
// cli/src/commands/generate.command.ts
cmd
  .command('crud <name>')
  .option('-i, --interactive', 'Interactive mode with prompts')
  .action(async (name, options) => {
    if (options.interactive) {
      // Launch interactive mode
      const answers = await interactiveCrudGeneration();
      name = answers.name;
      options = { ...options, ...answers };
    }
    
    // Generate as usual
    await generateCrud(name, options);
  });
```

---

## ✅ Acceptance Criteria

### Functionality
- [ ] `cms generate crud --interactive` launches guided prompts
- [ ] Alias `cms g crud -i` works
- [ ] Can input module name, tenant, soft-delete, audit options
- [ ] Can add multiple fields interactively
- [ ] Can specify searchable/filterable/sortable fields
- [ ] Empty input finishes field collection
- [ ] Generated output sama dengan non-interactive mode

### Developer Experience
- [ ] Clear, friendly prompts dengan default values
- [ ] Validation untuk required fields
- [ ] Auto-suggest untuk common patterns
- [ ] Error handling yang helpful
- [ ] Progress indicators saat generate

### Edge Cases
- [ ] Handle Ctrl+C (graceful exit)
- [ ] Validate field definitions sebelum generate
- [ ] Handle duplicate field names
- [ ] Support all existing CLI options

---

## 🧪 Testing Checklist

```bash
# Test 1: Basic interactive flow
cms g crud -i
# Input: product, Y, Y, Y
# Fields: name:string:255, price:decimal:10:2
# Searchable: name
# Expected: ✓ Generate 12 files

# Test 2: Empty fields (should fail gracefully)
cms g crud -i
# Input: test, Y, Y, Y
# Fields: (empty)
# Expected: ✗ Error "At least 1 field required"

# Test 3: Invalid field definition
cms g crud -i
# Fields: name:invalidtype
# Expected: ✗ Error "Invalid field type"

# Test 4: Ctrl+C handling
cms g crud -i
# Press Ctrl+C during prompts
# Expected: ✓ Graceful exit "Generation cancelled"
```

---

## 📚 Related Documentation

- **CLI Commands**: `.kiro/skills/cli-commands.md`
- **Generator Rules**: `.kiro/skills/generator-rules.md`
- **CLI Upgrade Plan**: `docs/CLI-ENTERPRISE-UPGRADE-PLAN.md`

---

## 🎯 Success Metrics

- ✅ Interactive mode reduces parameter errors by 80%
- ✅ New developers can generate modules without docs
- ✅ Average generation time < 2 minutes
- ✅ Zero breaking changes to existing CLI

---

## 📝 Notes

**ATURAN SEQUENTIAL**: Phase 5 harus selesai sebelum Phase 6!

**Optional Enhancements** (future):
- Field builder with advanced validation
- Relation builder interactive mode
- Preview generated files before saving
- Template selection (basic/advanced/custom)

---

**Assignee**: AI Agent  
**Created**: 2026-07-11  
**Phase**: CLI Enhancement Phase 5
