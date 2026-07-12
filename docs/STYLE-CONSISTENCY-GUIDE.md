# Style Consistency Guide
**Platform CMS Template System**  
**Version**: 1.0.0  
**Last Updated**: 2026-07-12

---

## 🎨 DESIGN TOKENS (STRICT RULES)

### Input Elements
```tsx
// ✅ CORRECT - Always use these
<Input className="h-12 rounded-xl border-neutral-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20" />

// ❌ WRONG - Don't use
<Input className="h-14 rounded-lg px-3 text-base ring-3" />
```

**Rules**:
- Height: `h-12` (48px)
- Radius: `rounded-xl` (16px)
- Border: `border-neutral-200`
- Padding: `px-4` (horizontal), `py-3` (vertical)
- Text: `text-sm`
- Focus border: `focus:border-indigo-500`
- Focus ring: `focus:ring-4 focus:ring-indigo-500/20`

---

### Buttons
```tsx
// ✅ PRIMARY BUTTON
<Button className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold shadow-lg shadow-indigo-500/30" />

// ✅ SECONDARY BUTTON  
<Button className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50" />

// ✅ GHOST BUTTON
<Button className="h-12 rounded-xl px-6 text-sm font-semibold hover:bg-neutral-100" />
```

**Rules**:
- Height: `h-12` (48px)
- Radius: `rounded-xl` (16px)
- Padding: `px-6` (horizontal)
- Text: `text-sm font-semibold`
- Primary: gradient with shadow
- Secondary: border-2
- Ghost: no border, hover bg

---

### Cards
```tsx
// ✅ CORRECT
<div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-xl transition-all" />

// ❌ WRONG
<div className="p-4 rounded-lg shadow-md" />
```

**Rules**:
- Padding: `p-6` (24px)
- Radius: `rounded-2xl` (20px)
- Border: `border border-neutral-200`
- Shadow: `shadow-sm` default, `shadow-xl` on hover
- Transition: `transition-all duration-300`

---

### Modals/Dialogs
```tsx
// ✅ CORRECT
<div className="p-8 bg-white rounded-2xl border border-neutral-200 shadow-2xl" />
```

**Rules**:
- Padding: `p-8` (32px)
- Radius: `rounded-2xl` (20px)
- Shadow: `shadow-2xl`
- Border: `border border-neutral-200`

---

### Dropdowns/Popovers
```tsx
// ✅ CORRECT
<div className="p-2 bg-white rounded-xl border border-neutral-200 shadow-xl" />
```

**Rules**:
- Padding: `p-2` (8px) for container
- Item padding: `px-3 py-2.5`
- Radius: `rounded-xl` (16px)
- Shadow: `shadow-xl`

---

### Icon Containers
```tsx
// ✅ CORRECT - Small (stat cards)
<div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
  <Icon className="w-6 h-6 text-indigo-600" />
</div>

// ✅ CORRECT - Medium (feature cards)
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
  <Icon className="w-7 h-7 text-white" />
</div>

// ✅ CORRECT - Large (hero sections)
<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
  <Icon className="w-8 h-8 text-white" />
</div>
```

**Rules**:
- Small: `w-12 h-12 rounded-xl` → icon `w-6 h-6`
- Medium: `w-14 h-14 rounded-2xl` → icon `w-7 h-7`
- Large: `w-16 h-16 rounded-2xl` → icon `w-8 h-8`

---

### Avatars
```tsx
// ✅ CORRECT - Small
<div className="w-8 h-8 rounded-lg" />

// ✅ CORRECT - Medium
<div className="w-10 h-10 rounded-xl" />

// ✅ CORRECT - Large
<div className="w-12 h-12 rounded-xl" />
```

**Rules**:
- Small: `w-8 h-8 rounded-lg`
- Medium: `w-10 h-10 rounded-xl`
- Large: `w-12 h-12 rounded-xl`

---

## 📏 SPACING SYSTEM (8px Grid)

```tsx
// ✅ CORRECT - Use these values only
gap-2   // 8px
gap-3   // 12px  
gap-4   // 16px
gap-6   // 24px
gap-8   // 32px

p-2     // 8px
p-3     // 12px
p-4     // 16px
p-6     // 24px
p-8     // 32px

// ❌ WRONG - Don't use odd values
gap-5   // 20px - NO!
p-5     // 20px - NO!
```

---

## 🎨 COLOR USAGE

### Gradients (Always use these exact combinations)
```tsx
// Primary (Indigo/Purple)
"from-indigo-500 to-purple-600"
"from-indigo-600 to-purple-600"

// Accent (Cyan/Blue)
"from-cyan-500 to-blue-600"
"from-cyan-600 to-blue-600"

// Success (Green/Emerald)
"from-green-500 to-emerald-600"

// Warning (Amber/Orange)
"from-amber-500 to-orange-600"

// Danger (Rose/Pink)
"from-rose-500 to-pink-600"
```

### Background Colors
```tsx
// ✅ CORRECT
bg-[#FAFBFC]        // Page background (NOT pure white!)
bg-white            // Card background
bg-neutral-50       // Subtle background
bg-neutral-100      // Hover background

// ❌ WRONG
bg-gray-50          // Use neutral instead
bg-slate-50         // Use neutral instead
```

### Border Colors
```tsx
// ✅ CORRECT
border-neutral-100  // Subtle border
border-neutral-200  // Default border
border-neutral-300  // Strong border

// ❌ WRONG
border-gray-200     // Use neutral instead
```

### Text Colors
```tsx
// ✅ CORRECT
text-neutral-900    // Headings
text-neutral-700    // Body (strong)
text-neutral-600    // Body (default)
text-neutral-500    // Muted
text-neutral-400    // Disabled

// ❌ WRONG
text-black          // Use neutral-900
text-gray-600       // Use neutral instead
```

---

## 🎭 SHADOWS

```tsx
// ✅ CORRECT - Standard shadows
shadow-sm           // Subtle card
shadow-lg           // Elevated card
shadow-xl           // Modal/Dropdown
shadow-2xl          // Large modal

// ✅ CORRECT - Colored shadows (Premium!)
shadow-lg shadow-indigo-500/30      // Primary button
shadow-xl shadow-indigo-500/40      // Primary button hover
shadow-lg shadow-cyan-500/30        // Accent button

// ❌ WRONG
shadow-md           // Use shadow-sm or shadow-lg
shadow              // Too generic, be specific
```

---

## ⏱️ ANIMATIONS

```tsx
// ✅ CORRECT - Transitions
transition-all duration-200         // Fast (hover, focus)
transition-all duration-300         // Normal (cards)
transition-all duration-500         // Slow (page transitions)

// ✅ CORRECT - Framer Motion
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

// ❌ WRONG
transition-all                      // Specify duration
duration-100                        // Too fast
```

---

## 📱 RESPONSIVE BREAKPOINTS

```tsx
// ✅ CORRECT - Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Breakpoints:
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

---

## ✅ CHECKLIST (Use for every component)

### Before Committing
- [ ] Input height: `h-12` (not h-14)
- [ ] Border radius: `rounded-xl` for inputs, `rounded-2xl` for cards
- [ ] Spacing: 8px grid (gap-2, gap-3, gap-4, gap-6, gap-8)
- [ ] Colors: Use `neutral` not `gray` or `slate`
- [ ] Background: `#FAFBFC` not pure white
- [ ] Shadows: Include colored shadows for buttons
- [ ] Transitions: Specify duration
- [ ] Focus ring: `ring-4` with opacity 20%
- [ ] Text size: `text-sm` for form elements
- [ ] Padding: Consistent with design tokens

---

## 🔧 QUICK FIX GUIDE

### Found `h-14`?
```tsx
// ❌ Before
<Input className="h-14" />

// ✅ After  
<Input className="h-12" />
```

### Found `rounded-lg`?
```tsx
// ❌ Before (input)
<Input className="rounded-lg" />

// ✅ After
<Input className="rounded-xl" />
```

### Found `px-3`?
```tsx
// ❌ Before (input)
<Input className="px-3" />

// ✅ After
<Input className="px-4" />
```

### Found `ring-3`?
```tsx
// ❌ Before
<Input className="focus:ring-3" />

// ✅ After
<Input className="focus:ring-4 focus:ring-indigo-500/20" />
```

### Found `bg-white` for page?
```tsx
// ❌ Before
<div className="min-h-screen bg-white">

// ✅ After
<div className="min-h-screen bg-[#FAFBFC]">
```

---

## 📋 COMPONENT TEMPLATE

```tsx
// ✅ USE THIS AS BASE TEMPLATE
export function ComponentName() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      {/* Card */}
      <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300">
        
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        
        {/* Heading */}
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Title
        </h2>
        
        {/* Body */}
        <p className="text-sm text-neutral-600 mb-6">
          Description text
        </p>
        
        {/* Input */}
        <Input 
          className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
        />
        
        {/* Button */}
        <Button className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300">
          Submit
        </Button>
      </div>
    </div>
  );
}
```

---

**Remember**: CONSISTENCY IS KEY! Setiap deviation dari guide ini akan membuat design terlihat unprofessional.

**Last Updated**: 2026-07-12  
**Status**: MANDATORY for all new components
