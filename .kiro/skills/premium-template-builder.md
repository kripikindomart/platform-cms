---
name: Premium Template Builder
description: Build billion-dollar SaaS quality templates (Linear, Stripe, Vercel standard)
version: 1.0.0
author: Platform CMS Team
---

# Premium Template Builder Skill

## 🎯 Mission
Build production-ready, premium quality SaaS templates that look like they belong to billion-dollar startups (Linear, Stripe, Vercel, Notion, Framer, Attio).

---

## 🎨 Design Principles (ALWAYS FOLLOW)

### Quality Standard
- **THIS IS NOT**: Bootstrap, AdminLTE, generic Tailwind templates
- **THIS IS**: Linear, Stripe, Vercel, Notion quality
- **Every pixel must feel intentional**
- **Worth $99+ if sold on ThemeForest**

### Visual Style
```
✅ DO:
- Minimalist and premium
- Lots of whitespace (8px grid system)
- Soft gradients (indigo→purple, cyan→blue)
- Soft shadows with color tints
- 20-24px rounded corners (rounded-xl, rounded-2xl)
- Glassmorphism (backdrop-blur-xl) - use sparingly
- Smooth animations (Framer Motion)
- Micro-interactions on hover/focus
- Premium typography (Inter, bold headings)

❌ DON'T:
- Harsh borders or high contrast
- Too many colors or busy design
- Generic admin panel look
- Bootstrap/AdminLTE aesthetic
- Cheap appearance
- Cluttered layouts
```

---

## 🎨 Design System Reference

### Colors (ALWAYS USE THESE)
```typescript
// Background
background: '#FAFBFC'  // Not pure white!
card: '#FFFFFF'
border: '#ECECEC'      // Very subtle

// Primary Gradient
from-indigo-600 to-purple-600
shadow-lg shadow-indigo-500/30

// Accent Gradient  
from-cyan-500 to-blue-600
shadow-lg shadow-cyan-500/30

// Success
from-emerald-500 to-green-600
bg-green-50, text-green-700

// Warning
from-amber-500 to-orange-600
bg-yellow-50, text-yellow-700

// Danger
from-rose-500 to-pink-600
bg-red-50, text-red-700

// Text
neutral-900 (headings)
neutral-600 (body)
neutral-400 (disabled)
```

### Typography
```typescript
// Font Family
font-family: 'Inter'

// Sizes
text-xs   : 12px  // Helper text
text-sm   : 14px  // Body small
text-base : 16px  // Body
text-lg   : 18px  // Lead text
text-xl   : 20px  // Small heading
text-2xl  : 24px  // Section title
text-3xl  : 30px  // Page title
text-4xl  : 36px  // Hero title
text-5xl  : 48px  // Large hero

// Weights
font-normal    : 400  // Body text
font-medium    : 500  // Buttons, labels
font-semibold  : 600  // Card titles
font-bold      : 700  // Page headings
```

### Spacing (8px Grid)
```
gap-1  : 4px
gap-2  : 8px
gap-3  : 12px
gap-4  : 16px
gap-6  : 24px
gap-8  : 32px
gap-12 : 48px
gap-16 : 64px

p-4 : 16px  // Standard card padding
p-6 : 24px  // Large card padding
```

### Border Radius
```
rounded-lg  : 12px  // Buttons, inputs
rounded-xl  : 16px  // Cards, modals
rounded-2xl : 20px  // Large cards
rounded-3xl : 24px  // Hero sections
```

### Shadows
```typescript
// Standard
shadow-sm   // Subtle elevation
shadow-lg   // Card hover
shadow-xl   // Modal, drawer

// Colored (Premium!)
shadow-lg shadow-indigo-500/30  // Primary buttons
shadow-xl shadow-indigo-500/40  // Primary buttons hover
shadow-lg shadow-cyan-500/30    // Accent elements
```

### Animations
```typescript
// Durations
transition-all duration-200  // Normal
transition-all duration-300  // Slow

// Easings
ease-in-out  // Default
cubic-bezier(0.4, 0, 0.2, 1)  // Smooth

// Framer Motion
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

// Hover Effects
hover:scale-110         // Icons
hover:translate-y-[-4px]  // Cards
hover:shadow-xl         // Elevate
```

---

## 📋 Template Building Checklist

### Before Starting
- [ ] Read design system tokens: `components/templates/design-system/tokens.ts`
- [ ] Check existing templates for reference
- [ ] Review phase planning docs: `docs/TEMPLATE-SYSTEM-PLAN.md`
- [ ] Confirm component location (templates vs ui)

### During Development
- [ ] Use design tokens from `tokens.ts`
- [ ] Follow 8px grid spacing
- [ ] Use 20-24px rounded corners
- [ ] Add soft shadows with color tints
- [ ] Include Framer Motion animations
- [ ] Add hover states
- [ ] Add focus states (accessibility)
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error states
- [ ] Test responsive breakpoints
- [ ] Add TypeScript types
- [ ] Use semantic HTML
- [ ] Add ARIA labels

### After Development
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Test in browser
- [ ] Test responsive design
- [ ] Test keyboard navigation
- [ ] Update documentation
- [ ] Add to template gallery
- [ ] Commit with descriptive message

---

## 📁 File Structure Rules

### Template Components
```
components/templates/
├── design-system/     # Design tokens & showcase
├── auth/             # Authentication templates
├── layouts/          # Layout templates
├── dashboards/       # Dashboard templates
├── forms/            # Form templates
├── tables/           # Table templates
├── charts/           # Chart components
├── empty-states/     # Empty state templates
├── loading-states/   # Loading skeletons
└── error-pages/      # Error page templates
```

### Template Pages (Showcase)
```
app/(templates)/dashboard/
├── auth/             # Auth template previews
├── layouts/          # Layout previews
├── dashboards/       # Dashboard previews
├── forms/            # Form previews
└── ...
```

### Base UI Components
```
components/ui/        # Reusable base components
```

---

## 🎯 Component Template Pattern

### Reusable Template Component
```tsx
'use client';

import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateProps {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function TemplateName({
  title,
  description,
  className,
  children,
}: TemplateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'p-6 bg-white rounded-2xl border border-neutral-200',
        'shadow-sm hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      {/* Icon with gradient */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-600">{description}</p>

      {children}
    </motion.div>
  );
}
```

### Page Template
```tsx
'use client';

import { TemplateName } from '@/components/templates/category/template-name';

export default function TemplatePreviewPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Template Name
          </h1>
          <p className="text-neutral-600">Description</p>
        </div>

        {/* Template Preview */}
        <TemplateName
          title="Example"
          description="Example description"
        />
      </div>
    </div>
  );
}
```

---

## 🎨 Common Patterns

### Stat Card
```tsx
<div className="p-6 bg-white rounded-2xl border border-neutral-200 hover:shadow-xl transition-all">
  <div className="flex items-start justify-between mb-4">
    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
      <Icon className="w-6 h-6 text-indigo-600" />
    </div>
    <div className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
      +12.5%
    </div>
  </div>
  <h3 className="text-sm font-medium text-neutral-600">Total Users</h3>
  <p className="text-3xl font-bold text-neutral-900">2,543</p>
</div>
```

### Action Button
```tsx
<button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all group">
  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
    <Icon className="w-5 h-5 text-white" />
  </div>
  <span className="font-semibold text-neutral-700 group-hover:text-neutral-900">
    Action Name
  </span>
</button>
```

### Gradient Header
```tsx
<div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200">
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 mb-4">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
    <span className="text-xs font-semibold text-neutral-700">Status</span>
  </div>
  <h2 className="text-2xl font-bold text-neutral-900 mb-2">Title</h2>
  <p className="text-neutral-600">Description</p>
</div>
```

---

## 🚀 Quick Start Commands

### Create New Template
```bash
# 1. Create component
touch components/templates/category/template-name.tsx

# 2. Create page
mkdir -p app/(templates)/dashboard/category/template-name
touch app/(templates)/dashboard/category/template-name/page.tsx

# 3. Build and test
npm run build
```

### Test Template
```bash
# Start dev server (if not running)
npm run dev

# Open browser
http://localhost:3001/dashboard/category/template-name
```

---

## 📚 Reference Materials

### Design Inspiration
- **Linear**: https://linear.app (sidebar, animations)
- **Stripe**: https://dashboard.stripe.com (charts, tables)
- **Vercel**: https://vercel.com/dashboard (analytics, clean design)
- **Notion**: https://notion.so (workspace switcher, clean UI)
- **Framer**: https://framer.com (animations, micro-interactions)
- **Attio**: https://attio.com (CRM, data tables)
- **Clerk**: https://clerk.com (auth pages)

### Documentation
- Design Tokens: `components/templates/design-system/tokens.ts`
- Planning Doc: `docs/TEMPLATE-SYSTEM-PLAN.md`
- Component Library: `docs/COMPONENT-LIBRARY.md`
- UI Components: `components/ui/index.ts`

### Code References
- Existing Dashboard: `app/(private)/portal/page.tsx`
- Existing Sidebar: `components/layout/sidebar.tsx`
- Existing Auth: `app/(auth)/login/page.tsx`

---

## ⚠️ Common Mistakes to Avoid

### Design Mistakes
- ❌ Using pure white (#FFFFFF) background - use #FAFBFC
- ❌ Harsh borders (border-2, border-black) - use border-neutral-200
- ❌ Too many colors - stick to primary gradient + accent
- ❌ Small rounded corners - use rounded-xl or rounded-2xl
- ❌ No shadows - always add soft shadows
- ❌ No hover states - every interactive element needs hover
- ❌ No loading states - always include skeleton/loading
- ❌ No empty states - handle empty data gracefully

### Code Mistakes
- ❌ Not using design tokens from tokens.ts
- ❌ Hardcoding colors instead of Tailwind classes
- ❌ Missing TypeScript types
- ❌ Missing accessibility (ARIA labels)
- ❌ Not testing responsive design
- ❌ Forgetting Framer Motion animations
- ❌ Not handling loading/error states

### Process Mistakes
- ❌ Not building before committing
- ❌ Not testing in browser
- ❌ Not updating documentation
- ❌ Not adding to template gallery
- ❌ Not following naming conventions

---

## 📝 Commit Message Format

```
feat(templates): add [template-name] [category]

[Description of what was built]

Components:
- [Component 1]
- [Component 2]

Pages:
- [Page 1]
- [Page 2]

Quality: Premium (Linear/Stripe/Vercel standard)
Build: ✅ Successful
Responsive: ✅ Tested
Accessible: ✅ ARIA labels added
```

---

## 🎯 Success Criteria

Every template must meet these standards:
- ✅ Looks like Linear/Stripe/Vercel quality
- ✅ Uses design system tokens
- ✅ Has smooth animations (Framer Motion)
- ✅ Responsive on all breakpoints
- ✅ Accessible (keyboard nav, ARIA labels)
- ✅ Has loading states
- ✅ Has empty states
- ✅ Has error states
- ✅ No TypeScript errors
- ✅ Build successful
- ✅ Documented

---

**Remember**: We're building templates that look like they belong to billion-dollar SaaS companies. Quality over quantity. Every template must feel premium and intentional.

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-12  
**Status**: Active
