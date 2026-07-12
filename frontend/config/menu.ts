import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Database,
  FileText,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  superAdminOnly?: boolean;
  adminOnly?: boolean;
  items?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    url: '/portal',
    icon: LayoutDashboard,
  },
  {
    title: 'UI Components',
    url: '/portal/components',
    icon: Sparkles,
    badge: 'New',
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
        icon: Users,
      },
      {
        title: 'Add User',
        url: '/mgmt-users/create',
        icon: Users,
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
        icon: Shield,
      },
      {
        title: 'Permissions',
        url: '/mgmt-roles/permissions',
        icon: Shield,
      },
    ],
  },
  {
    title: 'Tenant Management',
    url: '/mgmt-tenants',
    icon: Building2,
    superAdminOnly: true,
  },
  {
    title: 'Master Data',
    url: '/data-master',
    icon: Database,
    items: [
      {
        title: 'Categories',
        url: '/data-master/categories',
        icon: Database,
      },
      {
        title: 'Tags',
        url: '/data-master/tags',
        icon: Database,
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
        icon: FileText,
      },
      {
        title: 'Settings',
        url: '/sys-settings',
        icon: Settings,
      },
    ],
  },
];
