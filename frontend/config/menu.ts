import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Database,
  FileText,
  Settings,
  Tag,
  FolderTree,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  superAdminOnly?: boolean;
  adminOnly?: boolean;
  isActive?: boolean;
  items?: Array<{
    title: string;
    url: string;
  }>;
}

// Main navigation items
export const navMainItems: MenuItem[] = [
  {
    title: 'Dashboard',
    url: '/portal',
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: 'User Management',
    url: '/mgmt-users',
    icon: Users,
    adminOnly: true,
    items: [
      {
        title: 'All Users',
        url: '/mgmt-users',
      },
      {
        title: 'Add User',
        url: '/mgmt-users/create',
      },
    ],
  },
  {
    title: 'Role Management',
    url: '/mgmt-roles',
    icon: Shield,
    adminOnly: true,
    items: [
      {
        title: 'All Roles',
        url: '/mgmt-roles',
      },
      {
        title: 'Permissions',
        url: '/mgmt-roles/permissions',
      },
    ],
  },
  {
    title: 'Master Data',
    url: '/data-master',
    icon: Database,
    items: [
      {
        title: 'Categories',
        url: '/data-master/categories',
      },
      {
        title: 'Tags',
        url: '/data-master/tags',
      },
    ],
  },
  {
    title: 'System',
    url: '/sys-settings',
    icon: Settings,
    items: [
      {
        title: 'Audit Logs',
        url: '/sys-audit',
      },
      {
        title: 'Settings',
        url: '/sys-settings',
      },
    ],
  },
];

// Projects/Quick Access (optional)
export const projectsItems = [
  {
    name: 'Tenant Management',
    url: '/mgmt-tenants',
    icon: Building2,
  },
];

// User data (will be replaced with actual auth)
export const userData = {
  name: 'Admin User',
  email: 'admin@demo.com',
  avatar: '/avatars/admin.jpg',
};

// Teams/Tenants data (for multi-tenant support)
export const teamsData = [
  {
    name: 'Platform CMS',
    logo: Building2,
    plan: 'Enterprise',
  },
];
