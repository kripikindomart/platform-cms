'use client';

import { use } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Menu as MenuIcon,
  Settings,
  BarChart3,
  FileText,
  Folder
} from 'lucide-react';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default function PortalHomePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tenant = resolvedParams.tenant;

  const modules = [
    {
      title: 'Dashboard',
      description: 'Overview and analytics',
      icon: LayoutDashboard,
      href: `/org/${tenant}/portal/dashboard`,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Users',
      description: 'Manage user accounts',
      icon: Users,
      href: `/org/${tenant}/portal/users`,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Roles',
      description: 'Configure permissions',
      icon: Shield,
      href: `/org/${tenant}/portal/roles`,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Menus',
      description: 'Navigation management',
      icon: MenuIcon,
      href: `/org/${tenant}/portal/menus`,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Content',
      description: 'Manage your content',
      icon: FileText,
      href: `/org/${tenant}/portal/content`,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Media',
      description: 'File management',
      icon: Folder,
      href: `/org/${tenant}/portal/media`,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Analytics',
      description: 'Stats and insights',
      icon: BarChart3,
      href: `/org/${tenant}/portal/analytics`,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: Settings,
      href: `/org/${tenant}/portal/settings`,
      color: 'from-slate-500 to-gray-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Portal Dashboard
        </h1>
        <p className="text-slate-600">
          Welcome to {tenant} workspace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-transparent overflow-hidden"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            
            {/* Icon */}
            <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <module.icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="relative">
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                {module.title}
              </h3>
              <p className="text-sm text-slate-600">
                {module.description}
              </p>
            </div>

            {/* Arrow */}
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
