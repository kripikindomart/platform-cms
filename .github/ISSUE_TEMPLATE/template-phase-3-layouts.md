---
name: Template System - Phase 3 (Layouts)
about: Build 10 premium dashboard layout templates
title: '[TEMPLATE] Phase 3: Layout Templates'
labels: enhancement, templates, phase-3
assignees: ''
---

## 📋 Phase 3: Layout Templates

Build 10 dashboard layout variants with premium navigation systems.

### 🎯 Goal
Create reusable layout templates with different sidebar/navigation styles for the generator.

### 📦 Deliverables

#### Layout Variants

1. **Floating Sidebar Layout**
   - [ ] Sidebar with shadow elevation
   - [ ] Rounded corners
   - [ ] Margin from edges
   - [ ] Glassmorphism effect
   - [ ] Hover animations

2. **Collapsible Sidebar Layout**
   - [ ] Expand/collapse animation
   - [ ] Icon-only collapsed state
   - [ ] Smooth width transition
   - [ ] State persistence
   - [ ] Responsive behavior

3. **Compact Sidebar Layout**
   - [ ] Narrow sidebar (64px)
   - [ ] Icon navigation
   - [ ] Tooltip on hover
   - [ ] Active indicator
   - [ ] Premium styling

4. **Horizontal Navigation Layout**
   - [ ] Top navbar
   - [ ] Mega menu support
   - [ ] Dropdown menus
   - [ ] Sticky header
   - [ ] Backdrop blur

5. **Header + Footer Layout**
   - [ ] Full-width header
   - [ ] Content area
   - [ ] Footer section
   - [ ] Clean spacing
   - [ ] Professional design

6. **Dashboard Layout with Command Palette**
   - [ ] Cmd+K shortcut
   - [ ] Search overlay
   - [ ] Recent items
   - [ ] Quick actions
   - [ ] Keyboard navigation

7. **Layout with Workspace Switcher**
   - [ ] Organization dropdown
   - [ ] Workspace list
   - [ ] Create new workspace
   - [ ] Switch animation
   - [ ] Avatar display

8. **Layout with Notification Center**
   - [ ] Notification bell
   - [ ] Unread badge
   - [ ] Slide-out panel
   - [ ] Notification list
   - [ ] Mark as read

9. **Layout with Global Search**
   - [ ] Search bar in header
   - [ ] Instant results
   - [ ] Recent searches
   - [ ] Keyboard shortcuts
   - [ ] Result preview

10. **Minimal Layout**
    - [ ] No sidebar
    - [ ] Top navigation only
    - [ ] Full-width content
    - [ ] Clean design
    - [ ] Focus mode

---

#### Shared Components

**Command Palette** (`components/templates/layouts/command-palette.tsx`)
- [ ] Cmd+K trigger
- [ ] Modal overlay with blur
- [ ] Search input with icon
- [ ] Grouped results
- [ ] Keyboard navigation (up/down/enter)
- [ ] Recent actions
- [ ] Quick links
- [ ] Close on ESC

**Workspace Switcher** (`components/templates/layouts/workspace-switcher.tsx`)
- [ ] Dropdown trigger
- [ ] Current workspace display
- [ ] Workspace list with avatars
- [ ] Create new option
- [ ] Switch animation
- [ ] Search workspaces

**Organization Switcher** (`components/templates/layouts/organization-switcher.tsx`)
- [ ] Similar to workspace switcher
- [ ] Organization branding
- [ ] Role indicator
- [ ] Switch orgs
- [ ] Manage orgs link

**User Menu** (`components/templates/layouts/user-menu.tsx`)
- [ ] Avatar trigger
- [ ] User info display
- [ ] Menu items (Profile, Settings, Billing)
- [ ] Dividers
- [ ] Sign out option
- [ ] Hover states

**Notification Center** (`components/templates/layouts/notification-center.tsx`)
- [ ] Bell icon with badge
- [ ] Slide-out drawer
- [ ] Notification items
- [ ] Timestamp display
- [ ] Mark as read/unread
- [ ] Clear all
- [ ] Empty state
- [ ] Loading state

**Global Search** (`components/templates/layouts/global-search.tsx`)
- [ ] Search input in header
- [ ] Instant search results
- [ ] Result categories
- [ ] Highlight matches
- [ ] Recent searches
- [ ] Clear history
- [ ] Keyboard shortcuts

**Floating Sidebar** (`components/templates/layouts/floating-sidebar.tsx`)
- [ ] Elevated design
- [ ] Rounded container
- [ ] Shadow effects
- [ ] Logo section
- [ ] Navigation items
- [ ] User section at bottom
- [ ] Active state animations

**Collapsible Sidebar** (`components/templates/layouts/collapsible-sidebar.tsx`)
- [ ] Toggle button
- [ ] Expand/collapse animation
- [ ] Icon + text (expanded)
- [ ] Icon only (collapsed)
- [ ] Submenu support
- [ ] State management

**Horizontal Nav** (`components/templates/layouts/horizontal-nav.tsx`)
- [ ] Top navigation bar
- [ ] Logo on left
- [ ] Nav links center/left
- [ ] User menu on right
- [ ] Dropdown menus
- [ ] Sticky behavior

**Header Component** (`components/templates/layouts/header.tsx`)
- [ ] Logo section
- [ ] Breadcrumbs
- [ ] Search bar
- [ ] Actions (notifications, user menu)
- [ ] Backdrop blur
- [ ] Shadow on scroll

---

### 🎨 Design Requirements

**Quality Standard**: Linear, Vercel, Notion sidebar quality

**Must Have**:
- ✅ Smooth animations (Framer Motion)
- ✅ Glassmorphism where appropriate
- ✅ Soft shadows with elevation
- ✅ 16-20px rounded corners
- ✅ Active state gradients
- ✅ Hover effects
- ✅ Focus states
- ✅ Responsive breakpoints
- ✅ Dark mode support (future)
- ✅ Accessibility (keyboard nav)

---

### 📁 File Structure

```
components/templates/layouts/
├── floating-sidebar.tsx
├── collapsible-sidebar.tsx
├── compact-sidebar.tsx
├── horizontal-nav.tsx
├── header.tsx
├── footer.tsx
├── command-palette.tsx
├── workspace-switcher.tsx
├── organization-switcher.tsx
├── user-menu.tsx
├── notification-center.tsx
└── global-search.tsx

app/(templates)/dashboard/layouts/
├── floating/page.tsx
├── collapsible/page.tsx
├── compact/page.tsx
├── horizontal/page.tsx
├── header-footer/page.tsx
├── command-palette/page.tsx
├── workspace/page.tsx
├── notifications/page.tsx
├── search/page.tsx
└── minimal/page.tsx
```

---

### ✅ Acceptance Criteria

- [ ] All 10 layout variants implemented
- [ ] All shared components created
- [ ] Premium animations (Framer Motion)
- [ ] Responsive design
- [ ] Keyboard navigation working
- [ ] Accessibility (ARIA labels)
- [ ] No TypeScript errors
- [ ] Build successful
- [ ] Documentation updated
- [ ] Examples in gallery

---

### 📚 References

- Design Tokens: `components/templates/design-system/tokens.ts`
- Existing Sidebar: `components/layout/sidebar.tsx` (reference)
- Existing Header: `components/layout/header.tsx` (reference)

---

### 🔗 Related

- Previous: Phase 2 (Authentication)
- Next: Phase 4 (Dashboard Templates)

---

**Priority**: High  
**Estimated Effort**: 3-4 hours  
**Quality Bar**: Linear/Vercel sidebar quality
