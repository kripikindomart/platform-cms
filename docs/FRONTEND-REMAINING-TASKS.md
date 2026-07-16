# 📋 Frontend Remaining Tasks

**Status:** In Planning  
**Priority:** P0 - CRITICAL  
**Context:** Melanjutkan task original Week 14-15 + menambah Menu Management System

---

## 🎯 Problem Statement

### Issue 1: Task Original Belum Selesai
Week 14-15 di TASK-PLAN.md masih ada 3 task yang belum dikerjakan:
- ❌ Task 7.3: Dashboard Pages Implementation
- ❌ Task 7.4: User Management Pages
- ❌ Task 7.5: Role Management Pages

### Issue 2: Menu Management Belum Ada
**Problem:**
- Setiap kali generate module baru via CLI, tidak ada menu otomatis
- Menu di sidebar masih hardcoded di `config/menu.ts`
- Setiap tenant harus manual edit menu (tidak praktis)
- Tidak ada module registry system

**User Requirement:**
> "module kan nanti tidak mungkin di akses secara manual via link atau membuat menu statis tiap tenant nya"

**Solusi yang Dibutuhkan:**
1. **Module Registry System** - Track semua module yang di-generate
2. **Menu Management Backend** - API untuk manage menu structure
3. **Dynamic Menu Frontend** - Sidebar baca menu dari API, bukan hardcoded
4. **CLI Auto-Register** - Saat generate module, otomatis register ke menu system

---

## 📊 Task Breakdown

### Phase 1: Menu Management System (NEW)

#### Task 7.3: Backend - Module Registry & Menu API
**Priority:** P0 - CRITICAL  
**Estimated Time:** 6 hours  
**Dependencies:** CLI Generator (sudah ada)

**Files to Create:**
```
backend/src/modules/menus/
├── menus.module.ts
├── menus.controller.ts
├── menus.service.ts
├── menus.repository.ts
├── entities/
│   ├── menu.entity.ts
│   └── menu-item.entity.ts
└── dto/
    ├── create-menu.dto.ts
    ├── update-menu.dto.ts
    ├── create-menu-item.dto.ts
    └── menu-response.dto.ts

backend/src/database/schema/tenant/
├── menus.schema.ts          # Main menu groups
└── menu-items.schema.ts     # Nested menu items
```

**Database Schema:**

```typescript
// menus.schema.ts
export const menus = pgTable('menus', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  order: integer('order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  
  // Audit
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
  deleted_at: timestamp('deleted_at'),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
});

// menu-items.schema.ts
export const menuItems = pgTable('menu_items', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  menu_id: bigint('menu_id', { mode: 'number' })
    .notNull()
    .references(() => menus.id, { onDelete: 'cascade' }),
  
  parent_id: bigint('parent_id', { mode: 'number' })
    .references(() => menuItems.id, { onDelete: 'cascade' }),
  
  module_name: varchar('module_name', { length: 100 }).notNull(),
  label: varchar('label', { length: 100 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  order: integer('order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  
  // Permissions
  required_permission: varchar('required_permission', { length: 100 }),
  
  // Metadata
  metadata: text('metadata'), // JSON: { badge, description, external, etc }
  
  // Audit
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  created_by: bigint('created_by', { mode: 'number' }),
  updated_by: bigint('updated_by', { mode: 'number' }),
  deleted_at: timestamp('deleted_at'),
  deleted_by: bigint('deleted_by', { mode: 'number' }),
});
```

**API Endpoints:**
```typescript
// Menu Groups
GET    /api/menus              // List all menu groups
GET    /api/menus/:id          // Get single menu group
POST   /api/menus              // Create menu group
PATCH  /api/menus/:id          // Update menu group
DELETE /api/menus/:id          // Delete menu group

// Menu Items
GET    /api/menus/:menuId/items           // List items in menu
GET    /api/menu-items/:id                // Get single item
POST   /api/menus/:menuId/items           // Create menu item
PATCH  /api/menu-items/:id                // Update menu item
DELETE /api/menu-items/:id                // Delete menu item
POST   /api/menu-items/:id/reorder        // Reorder items

// Dynamic Menu (for frontend)
GET    /api/menus/active                  // Get all active menus with items
GET    /api/menus/for-user                // Get menus filtered by user permissions
```

**Features:**
- ✅ CRUD menu groups (Dashboard, Settings, Reports, etc.)
- ✅ CRUD menu items (nested with parent_id)
- ✅ Permission-based filtering
- ✅ Drag & drop reordering (order field)
- ✅ Icon support (Lucide icons)
- ✅ Active/inactive toggle
- ✅ Module tracking (module_name field)

**Example Data:**
```json
{
  "id": 1,
  "name": "Main Menu",
  "slug": "main-menu",
  "icon": "LayoutDashboard",
  "order": 1,
  "items": [
    {
      "id": 1,
      "module_name": "dashboard",
      "label": "Dashboard",
      "url": "/portal",
      "icon": "Home",
      "order": 1,
      "required_permission": null
    },
    {
      "id": 2,
      "module_name": "users",
      "label": "User Management",
      "url": "/portal/users",
      "icon": "Users",
      "order": 2,
      "required_permission": "users:read",
      "children": [
        {
          "id": 3,
          "module_name": "users",
          "label": "All Users",
          "url": "/portal/users",
          "order": 1
        },
        {
          "id": 4,
          "module_name": "users",
          "label": "Add User",
          "url": "/portal/users/create",
          "order": 2,
          "required_permission": "users:create"
        }
      ]
    }
  ]
}
```

**Acceptance Criteria:**
- [ ] Menu groups CRUD working
- [ ] Menu items CRUD working
- [ ] Nested menu items support
- [ ] Permission filtering working
- [ ] Reorder API working
- [ ] Module name tracked

---

#### Task 7.4: CLI - Auto Menu Registration
**Priority:** P0 - CRITICAL  
**Estimated Time:** 4 hours  
**Dependencies:** Task 7.3

**Files to Modify:**
```
cli/src/commands/generate.ts
cli/templates/backend/module/menu-item.sql.hbs
cli/src/utils/menu-register.ts
```

**CLI Enhancement:**

```bash
# Saat generate module, otomatis register menu
cms generate crud products --tenant

# Output:
✓ Generated module files (12 files)
✓ Registered to app.module.ts
✓ Created migration files
✓ Created permissions
✓ Registered menu items  <-- NEW!
  - Added "Products" to Main Menu
  - URL: /portal/products
  - Icon: Package
  - Permission: products:read
```

**Menu Registration Flow:**

1. **Generate Module** → CLI creates module files
2. **Auto Menu Insert** → CLI creates SQL file:
   ```sql
   -- File: backend/src/database/migrations/menus/products-menu.sql
   INSERT INTO menus (name, slug, icon, order) 
   VALUES ('Main Menu', 'main-menu', 'LayoutDashboard', 1)
   ON CONFLICT (slug) DO NOTHING;
   
   INSERT INTO menu_items (
     menu_id, 
     module_name, 
     label, 
     url, 
     icon, 
     required_permission,
     order
   )
   SELECT 
     m.id,
     'products',
     'Products',
     '/portal/products',
     'Package',
     'products:read',
     (SELECT COALESCE(MAX(order), 0) + 1 FROM menu_items WHERE menu_id = m.id)
   FROM menus m WHERE m.slug = 'main-menu';
   ```

3. **Apply Migration** → Menu langsung muncul di database

**CLI Config Options:**

```bash
# Generate dengan custom menu config
cms generate crud products \
  --tenant \
  --menu-label="Product Management" \
  --menu-icon="ShoppingCart" \
  --menu-parent="catalog" \
  --no-menu  # Skip menu registration
```

**Acceptance Criteria:**
- [ ] CLI auto-generates menu SQL
- [ ] Menu inserted to correct parent
- [ ] Icon and label customizable
- [ ] Permission auto-linked
- [ ] Can skip menu with --no-menu flag

---

#### Task 7.5: Frontend - Dynamic Menu System
**Priority:** P0 - CRITICAL  
**Estimated Time:** 5 hours  
**Dependencies:** Task 7.3, 7.4

**Files to Create/Modify:**
```
frontend/lib/api/services/
└── menus.service.ts          # API calls

frontend/hooks/
└── use-menu.ts               # React hook for menu data

frontend/components/layout/
├── app-sidebar.tsx           # MODIFY: Use dynamic menu
└── nav-main.tsx              # MODIFY: Render from API
```

**API Service:**

```typescript
// frontend/lib/api/services/menus.service.ts
import { apiClient } from '../client';

export interface MenuItem {
  id: number;
  module_name: string;
  label: string;
  url: string;
  icon?: string;
  order: number;
  children?: MenuItem[];
  required_permission?: string;
}

export interface Menu {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  order: number;
  items: MenuItem[];
}

export const menusService = {
  // Get active menus for current user (permission-filtered)
  async getActiveMenus(): Promise<Menu[]> {
    const response = await apiClient.get<Menu[]>('/menus/for-user');
    return response.data || [];
  },

  // Get all menus (admin only)
  async getAllMenus(): Promise<Menu[]> {
    const response = await apiClient.get<Menu[]>('/menus');
    return response.data || [];
  },
};
```

**React Hook:**

```typescript
// frontend/hooks/use-menu.ts
import { useState, useEffect } from 'react';
import { menusService, Menu } from '@/lib/api/services/menus.service';
import { toast } from 'sonner';

export function useMenu() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await menusService.getActiveMenus();
      setMenus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Gagal memuat menu');
    } finally {
      setLoading(false);
    }
  };

  return {
    menus,
    loading,
    error,
    refetch: fetchMenus,
  };
}
```

**Dynamic Sidebar:**

```typescript
// frontend/components/layout/app-sidebar.tsx
'use client';

import { useMenu } from '@/hooks/use-menu';
import { NavMain } from './nav-main';
import { Skeleton } from '@/components/ui/skeleton';

export function AppSidebar() {
  const { menus, loading } = useMenu();

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Sidebar>
      {menus.map((menu) => (
        <NavMain
          key={menu.id}
          title={menu.name}
          items={menu.items}
        />
      ))}
    </Sidebar>
  );
}
```

**Benefits:**
- ✅ Menu berubah otomatis saat module baru di-generate
- ✅ Tenant bisa customize menu tanpa deploy
- ✅ Permission-based visibility (user hanya lihat menu yang boleh diakses)
- ✅ No hardcoded menu
- ✅ Support nested menu

**Acceptance Criteria:**
- [ ] Sidebar loads menu from API
- [ ] Menu filtered by user permissions
- [ ] Loading state shown
- [ ] Error handling
- [ ] Icon rendering works

---

### Phase 2: Core Frontend Pages (Original Task)

#### Task 7.6: Dashboard Page Implementation
**Priority:** P0 - CRITICAL  
**Estimated Time:** 6 hours  
**Dependencies:** Task 7.5

**Files to Create:**
```
frontend/app/(private)/portal/
├── page.tsx                     # Main dashboard
├── loading.tsx                  # Loading state
└── error.tsx                    # Error boundary

frontend/components/dashboard/
├── stat-card.tsx                # Stats widget
├── recent-activity.tsx          # Activity feed
├── quick-actions.tsx            # Quick action buttons
└── welcome-banner.tsx           # Welcome message
```

**Dashboard Features:**
- Stats cards (users, roles, modules, active sessions)
- Recent activity feed
- Quick actions (Create User, Assign Role, etc.)
- Welcome banner with tenant info
- Charts (optional - using Recharts from template system)

**API Integration:**
```typescript
GET /api/dashboard/stats
GET /api/dashboard/recent-activity
```

**Acceptance Criteria:**
- [ ] Dashboard renders successfully
- [ ] Stats load from API
- [ ] Recent activity shows
- [ ] Quick actions work
- [ ] Responsive design

---

#### Task 7.7: User Management Pages
**Priority:** P0 - CRITICAL  
**Estimated Time:** 8 hours  
**Dependencies:** Task 7.6

**Files to Create:**
```
frontend/app/(private)/portal/users/
├── page.tsx                     # Users list (table)
├── create/page.tsx              # Create user form
├── [id]/page.tsx                # View user detail
├── [id]/edit/page.tsx           # Edit user form
└── components/
    ├── users-table.tsx          # Data table component
    ├── user-form.tsx            # Reusable form
    ├── user-filters.tsx         # Search & filters
    └── assign-role-modal.tsx    # Role assignment
```

**Features:**
- User list with DataTable (sorting, filtering, pagination)
- Create/edit user forms (validation)
- Assign roles (multi-select)
- Activate/deactivate user
- Delete user (soft delete)
- View user details
- Search by name/email
- Filter by role/status

**API Integration:**
```typescript
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
POST   /api/users/:id/assign-roles
DELETE /api/users/:id/remove-role/:roleId
```

**Acceptance Criteria:**
- [ ] Users list loads
- [ ] Can create user
- [ ] Can edit user
- [ ] Can assign roles
- [ ] Can delete user
- [ ] Form validation works
- [ ] Table features work (sort, filter, search)

---

#### Task 7.8: Role Management Pages
**Priority:** P0 - CRITICAL  
**Estimated Time:** 8 hours  
**Dependencies:** Task 7.7

**Files to Create:**
```
frontend/app/(private)/portal/roles/
├── page.tsx                     # Roles list
├── create/page.tsx              # Create role form
├── [id]/page.tsx                # View role detail
├── [id]/edit/page.tsx           # Edit role form
└── components/
    ├── roles-table.tsx          # Roles table
    ├── role-form.tsx            # Role form
    ├── permissions-tree.tsx     # Permission selection tree
    └── role-users.tsx           # Users with this role
```

**Features:**
- Roles list with table
- Create/edit role forms
- Assign permissions (tree/grid view)
- View users with role
- Delete role
- Role description
- Default role toggle

**API Integration:**
```typescript
GET    /api/roles
POST   /api/roles
GET    /api/roles/:id
PATCH  /api/roles/:id
DELETE /api/roles/:id
GET    /api/roles/permissions  // All available permissions
POST   /api/roles/:id/assign-permissions
```

**Acceptance Criteria:**
- [ ] Roles list loads
- [ ] Can create role
- [ ] Can edit role
- [ ] Can assign permissions
- [ ] Permission tree works
- [ ] Can view role users
- [ ] Can delete role

---

### Phase 3: CLI Frontend Generator (BONUS)

#### Task 7.9: CLI - Generate Frontend CRUD Pages
**Priority:** P1 - HIGH  
**Estimated Time:** 10 hours  
**Dependencies:** Task 7.8

**Goal:** CLI bisa generate frontend pages otomatis

```bash
# Generate backend + frontend sekaligus
cms generate fullstack products \
  --fields="name:string,price:number,stock:number" \
  --tenant

# Output:
✓ Backend generated (12 files)
✓ Frontend generated (8 files)  <-- NEW!
  - /portal/products/page.tsx (list)
  - /portal/products/create/page.tsx (form)
  - /portal/products/[id]/page.tsx (detail)
  - /portal/products/[id]/edit/page.tsx (form)
  - components/products-table.tsx
  - components/product-form.tsx
✓ Menu registered
✓ API service created (products.service.ts)
✓ React hook created (use-products.ts)
```

**Frontend Templates:**
```
cli/templates/frontend/
├── pages/
│   ├── list.tsx.hbs           # List page with table
│   ├── create.tsx.hbs          # Create form page
│   ├── detail.tsx.hbs          # Detail view page
│   └── edit.tsx.hbs            # Edit form page
├── components/
│   ├── table.tsx.hbs           # DataTable component
│   ├── form.tsx.hbs            # Form component
│   └── filters.tsx.hbs         # Filters component
├── services/
│   └── service.ts.hbs          # API service
└── hooks/
    └── hook.ts.hbs             # React hook
```

**Benefits:**
- 🚀 Generate full CRUD pages in 1 command
- 🎨 Consistent UI using template system
- 📝 Form validation auto-generated
- 🔗 API integration ready
- 📊 DataTable with all features

---

## 📋 Task Summary

### Must Have (P0)
1. ✅ Task 7.1: Layout Components (DONE)
2. ✅ Task 7.2: API Integration Layer (DONE)
3. ⏳ Task 7.3: Backend Menu Management API (NEW)
4. ⏳ Task 7.4: CLI Auto Menu Registration (NEW)
5. ⏳ Task 7.5: Frontend Dynamic Menu (NEW)
6. ⏳ Task 7.6: Dashboard Page
7. ⏳ Task 7.7: User Management Pages
8. ⏳ Task 7.8: Role Management Pages

### Nice to Have (P1)
9. ⏳ Task 7.9: CLI Frontend Generator (BONUS)

---

## 🎯 Execution Plan

### Step 1: Menu Management System (Tasks 7.3-7.5)
**Duration:** ~15 hours (2 hari)  
**Deliverable:** Dynamic menu system yang auto-register saat generate module

### Step 2: Core Pages (Tasks 7.6-7.8)
**Duration:** ~22 hours (3 hari)  
**Deliverable:** Dashboard, Users, Roles pages fully functional

### Step 3: CLI Frontend Generator (Task 7.9)
**Duration:** ~10 hours (1.5 hari)  
**Deliverable:** CLI yang bisa generate frontend pages

**Total:** ~47 hours (~6 hari kerja)

---

## 🤔 Questions for User

1. **Menu Management Priority?**
   - Apakah Task 7.3-7.5 (Menu Management) perlu dikerjakan dulu sebelum pages?
   - Atau buat pages dulu dengan hardcoded menu, baru implement menu management?

2. **CLI Frontend Generator?**
   - Apakah Task 7.9 (CLI Frontend Generator) diperlukan?
   - Atau cukup manual create pages untuk Users & Roles saja?

3. **Design Preference?**
   - Pakai design dari Template System (premium design)?
   - Atau buat design baru yang lebih simple?

4. **Additional Features?**
   - Apakah perlu menu drag & drop reorder UI?
   - Apakah perlu menu icon picker?
   - Apakah perlu menu visibility rules (time-based, user-based)?

---

**Menunggu konfirmasi untuk mulai Task 7.3 🚀**
