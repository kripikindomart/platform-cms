# MODULE GENERATOR - Panduan Implementasi Teknis

**Untuk**: AI Agent yang akan implement Frontend Generation  
**Level**: Technical Deep Dive  
**Bahasa**: Indonesia + English untuk code

---

## 📐 ARSITEKTUR DETAIL

### GenerationContext Interface

Ini adalah context object yang di-pass ke semua template:

```typescript
export interface GenerationContext {
  // Module Info
  moduleName: string;        // kebab-case: "user-profile"
  displayName: string;       // "User Profile"
  description?: string;
  className: string;         // PascalCase: "UserProfile"
  tableName: string;         // snake_case: "user_profiles"
  
  // Flags
  isTenantIsolated: boolean;
  hasSoftDelete: boolean;
  hasAudit: boolean;
  
  // Fields
  fields: FieldContext[];
  searchableFields: string[];
  filterableFields: string[];
  sortableFields: string[];
  
  // Tenant
  tenantSchema: string;      // "tenant_10"
  
  // UI Config (IMPORTANT!)
  uiConfig?: {
    createFormType?: 'page' | 'modal';
    editFormType?: 'page' | 'modal';
  };
}
```

### FieldContext Interface

```typescript
export interface FieldContext {
  name: string;              // snake_case: "first_name"
  camelCase: string;         // camelCase: "firstName"
  type: string;              // "string", "integer", "date", etc.
  dbType: string;            // "VARCHAR", "INTEGER", "DATE"
  tsType: string;            // "string", "number", "Date"
  drizzleType: string;       // "varchar", "integer", "date"
  
  // Constraints
  length?: number;
  precision?: number;
  scale?: number;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue?: string;
  
  // Validations (TODO: implement)
  validations: any[];
}
```

---

## 🎨 FRONTEND GENERATION - STEP BY STEP

### Step 1: Buat Template Files

**Location**: `backend/src/modules/module-generator/templates/frontend/`

#### 1.1 List Page Template

**File**: `list-page.tsx.hbs`

**Struktur**:
```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Conditional import based on uiConfig
{{#if (eq uiConfig.createFormType "modal")}}
import { Create{{className}}Modal } from './create-{{moduleName}}-modal';
{{else}}
import { useRouter } from 'next/navigation';
{{/if}}

export default function {{className}}ListPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  {{#unless (eq uiConfig.createFormType "modal")}}
  const router = useRouter();
  {{/unless}}

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ['{{moduleName}}'],
    queryFn: () => fetch('/api/{{moduleName}}').then(r => r.json()),
  });

  // Table columns
  const columns = [
    {{#each fields}}
    {{#if isVisibleInList}}
    {
      accessorKey: '{{camelCase}}',
      header: '{{label}}',
    },
    {{/if}}
    {{/each}}
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      ),
    },
  ];

  const handleCreate = () => {
    {{#if (eq uiConfig.createFormType "modal")}}
    setShowCreateModal(true);
    {{else}}
    router.push('/portal/{{moduleName}}/create');
    {{/if}}
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{{displayName}}</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}

      {{#if (eq uiConfig.createFormType "modal")}}
      <Create{{className}}Modal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
      {{/if}}
    </div>
  );
}
```

**Key Features**:
- Conditional create button (modal vs router.push)
- Auto-generate columns dari fields yang `isVisibleInList: true`
- TanStack Query untuk data fetching
- Skeleton/loading state

---

#### 1.2 Create Modal Template

**File**: `create-modal.tsx.hbs`

**Generate ONLY if**: `uiConfig.createFormType === "modal"`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Zod schema
const formSchema = z.object({
  {{#each fields}}
  {{#unless (or (eq name "id") (eq name "created_at") (eq name "updated_at"))}}
  {{camelCase}}: z.{{tsType}}(){{#if isRequired}}.min(1, '{{label}} wajib diisi'){{/if}},
  {{/unless}}
  {{/each}}
});

type FormData = z.infer<typeof formSchema>;

interface Create{{className}}ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Create{{className}}Modal({ open, onOpenChange }: Create{{className}}ModalProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      {{#each fields}}
      {{#unless (or (eq name "id") (eq name "created_at") (eq name "updated_at"))}}
      {{camelCase}}: {{#if defaultValue}}'{{defaultValue}}'{{else}}''{{/if}},
      {{/unless}}
      {{/each}}
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      fetch('/api/{{moduleName}}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      toast.success('{{displayName}} berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['{{moduleName}}'] });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error('Gagal membuat {{displayName}}');
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Tambah {{displayName}}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {{#each fields}}
            {{#unless (or (eq name "id") (eq name "created_at") (eq name "updated_at"))}}
            <FormField
              control={form.control}
              name="{{camelCase}}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{{label}}</FormLabel>
                  <FormControl>
                    {{#if (eq type "text")}}
                    <Textarea {...field} />
                    {{else if (eq type "boolean")}}
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    {{else if (eq type "date")}}
                    <Input type="date" {...field} />
                    {{else}}
                    <Input type="text" {...field} />
                    {{/if}}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {{/unless}}
            {{/each}}
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

**Key Features**:
- Auto-generate form fields berdasarkan field type
- Zod validation schema
- TanStack Query mutation
- Toast notifications
- Form reset after success

---

#### 1.3 Create Page Template

**File**: `create-page.tsx.hbs`

**Generate ONLY if**: `uiConfig.createFormType === "page"`

Struktur mirip dengan modal, tapi:
- Full page layout dengan Card components
- Breadcrumb navigation
- Back button
- Bisa lebih banyak sections (Basic Info, Advanced Settings, etc.)

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Create{{className}}Page() {
  const router = useRouter();
  const form = useForm<FormData>({ /* ... */ });

  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <h1 className="text-3xl font-bold mb-6">Tambah {{displayName}}</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form fields */}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit">
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### Step 2: Implement generateFrontendPages Method

**File**: `backend/src/modules/module-generator/services/code-generation.service.ts`

**Current**:
```typescript
private async generateFrontendPages(context: GenerationContext): Promise<string[]> {
  // TODO: Implement frontend generation with modal support
  return [];
}
```

**New Implementation**:
```typescript
private async generateFrontendPages(context: GenerationContext): Promise<string[]> {
  const filesCreated: string[] = [];
  const basePath = path.join('..', 'frontend', 'app', '(private)', 'org', '[tenant]', 'portal', context.moduleName);

  try {
    // 1. Always generate List Page
    const listPageContent = await this.templateService.render('frontend/list-page.tsx.hbs', context);
    const listPagePath = path.join(basePath, 'page.tsx');
    await this.fileSystemService.writeFile(listPagePath, listPageContent);
    filesCreated.push(listPagePath);
    this.logger.log(`  ✓ Generated list page: ${listPagePath}`);

    // 2. Generate Create Form (modal or page)
    if (context.uiConfig?.createFormType === 'modal') {
      // Generate modal component
      const createModalContent = await this.templateService.render('frontend/create-modal.tsx.hbs', context);
      const createModalPath = path.join(basePath, `create-${context.moduleName}-modal.tsx`);
      await this.fileSystemService.writeFile(createModalPath, createModalContent);
      filesCreated.push(createModalPath);
      this.logger.log(`  ✓ Generated create modal: ${createModalPath}`);
    } else {
      // Generate separate page
      const createPageContent = await this.templateService.render('frontend/create-page.tsx.hbs', context);
      const createPagePath = path.join(basePath, 'create', 'page.tsx');
      await this.fileSystemService.writeFile(createPagePath, createPageContent);
      filesCreated.push(createPagePath);
      this.logger.log(`  ✓ Generated create page: ${createPagePath}`);
    }

    // 3. Generate Edit Form (modal or page)
    if (context.uiConfig?.editFormType === 'modal') {
      // Generate edit modal component
      const editModalContent = await this.templateService.render('frontend/edit-modal.tsx.hbs', context);
      const editModalPath = path.join(basePath, `edit-${context.moduleName}-modal.tsx`);
      await this.fileSystemService.writeFile(editModalPath, editModalContent);
      filesCreated.push(editModalPath);
      this.logger.log(`  ✓ Generated edit modal: ${editModalPath}`);
    } else {
      // Generate separate edit page
      const editPageContent = await this.templateService.render('frontend/edit-page.tsx.hbs', context);
      const editPagePath = path.join(basePath, '[id]', 'edit', 'page.tsx');
      await this.fileSystemService.writeFile(editPagePath, editPageContent);
      filesCreated.push(editPagePath);
      this.logger.log(`  ✓ Generated edit page: ${editPagePath}`);
    }

    // 4. Generate Detail Page (optional)
    // const detailPageContent = await this.templateService.render('frontend/detail-page.tsx.hbs', context);
    // const detailPagePath = path.join(basePath, '[id]', 'page.tsx');
    // await this.fileSystemService.writeFile(detailPagePath, detailPageContent);
    // filesCreated.push(detailPagePath);

    this.logger.log(`✓ Generated ${filesCreated.length} frontend files`);
    return filesCreated;
  } catch (error: any) {
    this.logger.error(`Frontend generation failed: ${error.message}`);
    // Rollback created files
    for (const file of filesCreated) {
      try {
        await this.fileSystemService.deleteFile(file);
      } catch (e) {
        this.logger.warn(`Could not delete ${file}`);
      }
    }
    throw error;
  }
}
```

---

### Step 3: Handlebars Helpers

Untuk conditional rendering di template, tambahkan helpers:

**File**: `backend/src/modules/module-generator/services/template.service.ts`

```typescript
import Handlebars from 'handlebars';

export class TemplateService {
  constructor() {
    // Register helpers
    this.registerHelpers();
  }

  private registerHelpers() {
    // Equality check
    Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });

    // OR logic
    Handlebars.registerHelper('or', function(...args) {
      // Remove the options object (last argument)
      args.pop();
      return args.some(Boolean);
    });

    // Case conversions (might already exist)
    Handlebars.registerHelper('pascalCase', (str: string) => {
      return str.split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    });

    Handlebars.registerHelper('camelCase', (str: string) => {
      const pascal = str.split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    });
  }
}
```

---

## 🧪 TESTING FRONTEND GENERATION

### Test Case 1: Modal Form
```typescript
// Input
const dto = {
  moduleName: 'products',
  displayName: 'Products',
  fields: [
    { name: 'name', type: 'string', isRequired: true, isVisibleInList: true },
    { name: 'price', type: 'decimal', isRequired: true, isVisibleInList: true },
    { name: 'description', type: 'text', isRequired: false, isVisibleInList: false },
  ],
  uiConfig: {
    createFormType: 'modal',
    editFormType: 'modal',
  },
};

// Expected Output Files
frontend/app/(private)/org/[tenant]/portal/products/
├── page.tsx                          ← List page with "Create" button → opens modal
├── create-products-modal.tsx         ← Create modal component
└── edit-products-modal.tsx           ← Edit modal component
```

### Test Case 2: Page Form
```typescript
// Input
const dto = {
  moduleName: 'articles',
  displayName: 'Articles',
  fields: [
    { name: 'title', type: 'string', isRequired: true },
    { name: 'content', type: 'text', isRequired: true },
    { name: 'author', type: 'string', isRequired: true },
    { name: 'published_date', type: 'date', isRequired: true },
    { name: 'tags', type: 'string', isRequired: false },
    { name: 'category', type: 'string', isRequired: true },
  ],
  uiConfig: {
    createFormType: 'page',   // > 5 fields → use page
    editFormType: 'page',
  },
};

// Expected Output Files
frontend/app/(private)/org/[tenant]/portal/articles/
├── page.tsx                          ← List page
├── create/
│   └── page.tsx                     ← Full create page
└── [id]/
    └── edit/
        └── page.tsx                 ← Full edit page
```

### Manual Testing Steps
```bash
# 1. Generate module dengan frontend
POST /api/module-generator/:id/assign

# 2. Check generated files
cd frontend/app/(private)/org/[tenant]/portal/{module-name}
ls -la

# 3. Run frontend
cd frontend
npm run dev

# 4. Navigate to module
http://localhost:3001/org/{tenant}/portal/{module-name}

# 5. Test CRUD
- Click "Tambah" button
- Fill form
- Submit
- Verify data in list
- Click edit
- Update data
- Delete data
```

---

## 🎯 FIELD TYPE MAPPING

Untuk generate correct form inputs:

```typescript
const fieldTypeMapping = {
  // Text inputs
  'string': '<Input type="text" {...field} />',
  'email': '<Input type="email" {...field} />',
  'url': '<Input type="url" {...field} />',
  'uuid': '<Input type="text" {...field} disabled />',
  
  // Textarea
  'text': '<Textarea {...field} rows={4} />',
  
  // Numbers
  'integer': '<Input type="number" {...field} />',
  'decimal': '<Input type="number" step="0.01" {...field} />',
  'bigint': '<Input type="number" {...field} />',
  
  // Date/Time
  'date': '<Input type="date" {...field} />',
  'datetime': '<Input type="datetime-local" {...field} />',
  
  // Boolean
  'boolean': '<Switch checked={field.value} onCheckedChange={field.onChange} />',
  
  // JSON
  'json': '<Textarea {...field} placeholder="{}" />',
};
```

---

## 📋 CHECKLIST IMPLEMENTASI

### Phase 1: Template Files
- [ ] Buat `templates/frontend/` folder
- [ ] Buat `list-page.tsx.hbs`
- [ ] Buat `create-modal.tsx.hbs`
- [ ] Buat `create-page.tsx.hbs`
- [ ] Buat `edit-modal.tsx.hbs`
- [ ] Buat `edit-page.tsx.hbs`

### Phase 2: Service Implementation
- [ ] Implement `generateFrontendPages()` method
- [ ] Add Handlebars helpers (`eq`, `or`)
- [ ] Add field type → input mapping logic
- [ ] Test template rendering

### Phase 3: Testing
- [ ] Generate module dengan modal forms
- [ ] Generate module dengan page forms
- [ ] Test form submission
- [ ] Test edit functionality
- [ ] Test delete functionality
- [ ] Verify TypeScript compilation
- [ ] Verify ESLint passes

### Phase 4: Cleanup & Rollback
- [ ] Update `rollbackGeneration()` untuk delete frontend files
- [ ] Test delete module (verify frontend files deleted)
- [ ] Add error handling untuk frontend generation failures

---

**File Berikutnya**: `MODULE-GENERATOR-TROUBLESHOOTING.md`
