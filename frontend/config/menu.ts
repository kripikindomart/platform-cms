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
  href: string;
  icon: LucideIcon;
  badge?: string;
  superAdminOnly?: boolean;
  adminOnly?: boolean;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/portal',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    href: '/mgmt-users',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'Role Management',
    href: '/mgmt-roles',
    icon: Shield,
    adminOnly: true,
  },
  {
    title: 'Tenant Management',
    href: '/mgmt-tenants',
    icon: Building2,
    superAdminOnly: true,
    badge: 'Admin',
  },
  {
    title: 'Master Data',
    href: '/data-master',
    icon: Database,
    children: [
      {
        title: 'Categories',
        href: '/data-master/categories',
        icon: FolderTree,
      },
      {
        title: 'Tags',
        href: '/data-master/tags',
        icon: Tag,
      },
    ],
  },
  {
    title: 'Audit Logs',
    href: '/sys-audit',
    icon: FileText,
    adminOnly: true,
  },
  {
    title: 'Settings',
    href: '/sys-settings',
    icon: Settings,
  },
];
