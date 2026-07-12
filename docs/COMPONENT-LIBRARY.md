# Platform CMS - Premium UI Component Library

Dokumentasi lengkap untuk komponen UI premium yang siap digunakan untuk generator.

## 🎨 Design System

### Colors
- **Primary**: Indigo/Purple gradient (`from-indigo-600 to-purple-600`)
- **Accent**: Cyan/Blue gradient (`from-cyan-500 to-blue-600`)
- **Background**: `#FAFBFC`
- **Border**: `#ECECEC` (neutral-200)
- **Text**: neutral-900 (headings), neutral-600 (body)

### Spacing
- Base: 8px grid system
- Rounded corners: `rounded-xl` (12px), `rounded-2xl` (16px)
- Padding: `p-4`, `p-6` (standard spacing)

### Shadows
- Soft: `shadow-sm`
- Medium: `shadow-lg shadow-indigo-500/30`
- Large: `shadow-xl shadow-indigo-500/40`

---

## 📦 Available Components

### 1. Alert
Premium alert/notification boxes dengan berbagai variants.

**Variants**: `default`, `success`, `error`, `warning`, `info`

**Features**:
- Auto icon berdasarkan variant
- Dismissible dengan animasi
- Colored backgrounds
- Title + Description support

**Usage**:
```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';

<Alert variant="success" dismissible onDismiss={() => console.log('dismissed')}>
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>
```

---

### 2. Button
Premium button dengan gradients dan shadows.

**Variants**: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`

**Sizes**: `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

**Usage**:
```tsx
import { Button } from '@/components/ui';

<Button>Default Button</Button>
<Button variant="outline">Outline</Button>
<Button size="sm">Small Button</Button>
<Button disabled>Disabled</Button>
```

---

### 3. Input
Premium text input dengan focus states.

**Features**:
- 12px height (h-12)
- Rounded-xl corners
- Indigo focus ring
- Disabled state styling

**Usage**:
```tsx
import { Input, Label } from '@/components/ui';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
  />
</div>
```

---

### 4. Textarea
Multi-line text input dengan label dan error support.

**Props**:
- `label`: Optional label
- `error`: Error message
- `helperText`: Helper text below input
- `required`: Shows asterisk

**Usage**:
```tsx
import { Textarea } from '@/components/ui';

<Textarea
  label="Description"
  placeholder="Enter description..."
  helperText="Maximum 500 characters"
  error="This field is required"
  rows={4}
/>
```

---

### 5. Select & CustomSelect
Dropdown select components.

**Select**: Native HTML select dengan styling premium.

**CustomSelect**: React-based select dengan descriptions dan search.

**Usage**:
```tsx
import { Select, CustomSelect } from '@/components/ui';

// Native Select
<Select
  options={[
    { value: 'id', label: 'Indonesia' },
    { value: 'us', label: 'United States' },
  ]}
/>

// Custom Select
<CustomSelect
  value={value}
  onValueChange={setValue}
  placeholder="Select a role"
  options={[
    { 
      value: 'admin', 
      label: 'Administrator',
      description: 'Full access to all features' 
    },
  ]}
/>
```

---

### 6. Switch
Toggle switch dengan gradient active state.

**Features**:
- Gradient background when checked
- Label + Description support
- Smooth animations
- Focus ring

**Usage**:
```tsx
import { Switch } from '@/components/ui';

<Switch
  checked={value}
  onCheckedChange={setValue}
  label="Enable notifications"
  description="Receive email notifications"
/>
```

---

### 7. RadioGroup
Premium radio button group dengan cards.

**Features**:
- Card-style radio options
- Description support per option
- Gradient border when selected
- Disabled state support

**Usage**:
```tsx
import { RadioGroup } from '@/components/ui';

<RadioGroup
  value={value}
  onValueChange={setValue}
  name="plan"
  options={[
    {
      value: 'starter',
      label: 'Starter Plan',
      description: 'Perfect for individuals',
    },
    {
      value: 'pro',
      label: 'Pro Plan',
      description: 'For growing businesses',
      disabled: true,
    },
  ]}
/>
```

---

### 8. Tabs
Premium tab navigation dengan smooth transitions.

**Features**:
- Pill-style tabs
- Active state dengan shadow
- Animated content switching
- Clean design

**Usage**:
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="preview">Preview</TabsTrigger>
    <TabsTrigger value="code">Code</TabsTrigger>
  </TabsList>
  <TabsContent value="preview">
    Preview content...
  </TabsContent>
  <TabsContent value="code">
    Code content...
  </TabsContent>
</Tabs>
```

---

### 9. Table
Premium data table dengan hover effects.

**Components**:
- `Table`
- `TableHeader`, `TableBody`, `TableFooter`
- `TableHead`, `TableRow`, `TableCell`
- `TableCaption`

**Usage**:
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>...</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### 10. Pagination
Premium pagination dengan gradient active state.

**Features**:
- Ellipsis untuk banyak halaman
- Previous/Next buttons
- Gradient active page
- Responsive

**Props**:
- `currentPage`: Current page number
- `totalPages`: Total pages
- `onPageChange`: Callback when page changes
- `showFirstLast`: Show first/last buttons (default: true)

**Usage**:
```tsx
import { Pagination } from '@/components/ui';

<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
/>
```

---

### 11. Modal
Premium modal dialog dengan backdrop blur.

**Features**:
- Framer Motion animations
- Backdrop blur
- ESC key to close
- Click outside to close
- Body scroll lock

**Components**:
- `Modal`
- `ModalHeader`, `ModalTitle`, `ModalDescription`
- `ModalContent`
- `ModalFooter`

**Usage**:
```tsx
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
} from '@/components/ui';

<Modal open={open} onOpenChange={setOpen}>
  <ModalHeader onClose={() => setOpen(false)}>
    <ModalTitle>Create Project</ModalTitle>
    <ModalDescription>Enter project details</ModalDescription>
  </ModalHeader>
  <ModalContent>
    Form content...
  </ModalContent>
  <ModalFooter>
    <Button variant="outline" onClick={() => setOpen(false)}>
      Cancel
    </Button>
    <Button>Create</Button>
  </ModalFooter>
</Modal>
```

---

### 12. Card
Premium card container (already exists, enhanced).

**Components**:
- `Card`
- `CardHeader`, `CardTitle`, `CardDescription`
- `CardContent`
- `CardFooter`

**Usage**:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content...
  </CardContent>
</Card>
```

---

## 🎯 Generator Usage

Semua komponen bisa digunakan untuk generator dengan pattern:

```tsx
import { ComponentName } from '@/components/ui';
```

### Import dari Index
```tsx
// Single import
import { Button, Input, Alert } from '@/components/ui';

// Or individual
import { Button } from '@/components/ui/button';
```

---

## 🚀 Examples

Lihat showcase lengkap di: `/portal/components`

Route file: `frontend/app/(private)/portal/components/page.tsx`

---

## 📝 Design Principles

1. **Premium First**: Setiap komponen dirancang dengan kualitas Linear/Vercel
2. **Consistent Spacing**: 8px grid system
3. **Rounded Corners**: 12-24px (xl, 2xl)
4. **Soft Shadows**: Dengan color tint
5. **Gradients**: Indigo/Purple primary, Cyan/Blue accent
6. **Animations**: Framer Motion untuk smooth transitions
7. **Accessibility**: ARIA labels, keyboard navigation
8. **Responsive**: Mobile-first design

---

## 🎨 Color Palette

```css
/* Primary Gradient */
.bg-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
}

/* Accent Gradient */
.bg-accent {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
}

/* Success */
.text-success { color: #16a34a; }
.bg-success-50 { background: #f0fdf4; }

/* Error */
.text-error { color: #dc2626; }
.bg-error-50 { background: #fef2f2; }

/* Warning */
.text-warning { color: #ca8a04; }
.bg-warning-50 { background: #fefce8; }

/* Info */
.text-info { color: #2563eb; }
.bg-info-50 { background: #eff6ff; }
```

---

## 📦 Component Files

```
frontend/components/ui/
├── alert.tsx          ✅ NEW - Premium alerts
├── avatar.tsx         ✅ Existing
├── badge.tsx          ✅ Existing
├── button.tsx         ✅ Existing (enhanced)
├── card.tsx           ✅ Existing
├── checkbox.tsx       ✅ Existing
├── dialog.tsx         ✅ Existing
├── dropdown-menu.tsx  ✅ Existing
├── input.tsx          ✅ Existing
├── label.tsx          ✅ Existing
├── modal.tsx          ✅ NEW - Premium modal
├── pagination.tsx     ✅ NEW - Premium pagination
├── radio-group.tsx    ✅ NEW - Premium radio
├── select.tsx         ✅ NEW - Premium select
├── separator.tsx      ✅ Existing
├── sheet.tsx          ✅ Existing
├── switch.tsx         ✅ NEW - Premium switch
├── table.tsx          ✅ NEW - Premium table
├── tabs.tsx           ✅ NEW - Premium tabs
├── textarea.tsx       ✅ NEW - Premium textarea
├── tooltip.tsx        ✅ Existing
└── index.ts           ✅ NEW - Barrel export
```

---

## ✨ Next Steps

1. **Generator Integration**: Gunakan komponen ini untuk CRUD generator
2. **Form Builder**: Buat form builder dengan komponen ini
3. **Page Templates**: Buat template halaman dengan komponen ini
4. **Storybook**: (Optional) Setup Storybook untuk dokumentasi visual
5. **Testing**: (Optional) Add component tests

---

Created: 2026-07-12  
Version: 1.0.0  
Quality: Linear/Vercel/Stripe Standard ✨
