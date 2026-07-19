'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';
import { useTenantConfig } from '@/hooks/use-tenant-config';
import * as Icons from 'lucide-react';

interface MenuItem {
  id: number;
  module_name: string;
  label: string;
  url: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  required_permission: string | null;
  parent_id: number | null;
  children?: MenuItem[];
}

interface Menu {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  items: MenuItem[];
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const tenantConfig = useTenantConfig();

  // Extract tenant slug from pathname (e.g., /org/acme/portal/users -> acme)
  const tenantSlug = pathname.split('/')[2] || '';

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      // Use /menus/for-user endpoint which returns active menus filtered by user permissions
      const response = await apiClient.get<Menu[]>('/menus/for-user');
      
      // Transform URLs to include tenant slug
      const menusWithTenantUrls = response?.map((menu) => ({
        ...menu,
        items: menu.items.map((item) => transformItemUrls(item)),
      })) || [];
      
      setMenus(menusWithTenantUrls);
      
      // Auto-expand first menu
      if (menusWithTenantUrls && menusWithTenantUrls.length > 0) {
        setOpenMenus([menusWithTenantUrls[0].name]);
      }
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform menu item URLs to include tenant slug
  const transformItemUrls = (item: MenuItem): MenuItem => {
    const transformedUrl = item.url.startsWith('/portal')
      ? `/org/${tenantSlug}${item.url}`
      : item.url;

    return {
      ...item,
      url: transformedUrl,
      children: item.children?.map((child) => transformItemUrls(child)),
    };
  };

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (url: string) => {
    // Exact match first
    if (pathname === url) return true;
    
    // Check if current path starts with the menu URL
    // But make sure it's a proper path segment match (not just substring)
    if (pathname.startsWith(url + '/')) return true;
    
    return false;
  };

  const hasActiveChild = (items: MenuItem[]): boolean => {
    return items.some((item) => isActive(item.url) || (item.children && hasActiveChild(item.children)));
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Icons.Circle;
    const Icon = (Icons as any)[iconName];
    return Icon || Icons.Circle;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const Icon = getIcon(item.icon);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.label)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
              level > 0 && 'ml-4',
              hasActiveChild(item.children!)
                ? 'bg-neutral-50 text-neutral-900'
                : 'hover:bg-neutral-50 text-neutral-700'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5 flex-shrink-0',
                hasActiveChild(item.children!)
                  ? 'text-indigo-600'
                  : 'text-neutral-500 group-hover:text-neutral-700'
              )}
            />
            {!collapsed && (
              <>
                <span className="font-medium text-sm flex-1 text-left">
                  {item.label}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-neutral-400 transition-transform',
                    openMenus.includes(item.label) && 'rotate-180'
                  )}
                />
              </>
            )}
          </button>

          {!collapsed && (
            <AnimatePresence>
              {openMenus.includes(item.label) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {item.children!.map((child) => renderMenuItem(child, level + 1))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.url}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all group text-sm',
          level > 0 && 'ml-4',
          isActive(item.url)
            ? 'bg-indigo-50 text-indigo-700 font-medium'
            : 'hover:bg-neutral-50 text-neutral-600'
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  // Build tree structure
  const buildMenuTree = (items: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<number, MenuItem>();
    const rootItems: MenuItem[] = [];

    // First pass: create map
    items.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build tree
    items.forEach((item) => {
      const menuItem = itemMap.get(item.id)!;
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children!.push(menuItem);
        }
      } else {
        rootItems.push(menuItem);
      }
    });

    // Sort by order
    const sortItems = (items: MenuItem[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach((item) => {
        if (item.children) sortItems(item.children);
      });
    };
    sortItems(rootItems);

    return rootItems;
  };

  if (loading) {
    return (
      <aside className="fixed left-0 top-0 bottom-0 w-280 bg-white border-r border-neutral-200 z-20">
        {/* Logo Section in Loading */}
        <div className="h-16 px-4 flex items-center border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-lg">{tenantConfig.initials}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-neutral-900">
                {tenantConfig.name}
              </h2>
              <p className="text-xs text-neutral-500">
                Loading...
              </p>
            </div>
          </div>
        </div>
        
        {/* Loading Spinner */}
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </aside>
    );
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 bottom-0 bg-white border-r border-neutral-200 z-20 overflow-hidden flex flex-col"
    >
      {/* Logo & Brand Section - Fixed height matching navbar */}
      {!collapsed && (
        <div className="h-16 px-4 flex items-center border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-3 w-full">
            {/* Logo */}
            {tenantConfig.logo_url ? (
              <img 
                src={tenantConfig.logo_url} 
                alt={tenantConfig.name}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-lg"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                <span className="text-white font-bold text-lg">{tenantConfig.initials}</span>
              </div>
            )}
            {/* Brand Text */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-neutral-900 truncate">
                {tenantConfig.name}
              </h2>
              <p className="text-xs text-neutral-500 truncate capitalize">
                {tenantConfig.slug || 'Admin Panel'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Logo */}
      {collapsed && (
        <div className="h-16 px-4 flex items-center justify-center border-b border-neutral-100 flex-shrink-0">
          {tenantConfig.logo_url ? (
            <img 
              src={tenantConfig.logo_url} 
              alt={tenantConfig.name}
              className="w-10 h-10 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-lg">{tenantConfig.initials}</span>
            </div>
          )}
        </div>
      )}

      {/* Toggle Button - Higher z-index to be above menu items */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors z-50 shadow-md"
      >
        <ChevronRight
          className={cn(
            'w-4 h-4 text-neutral-600 transition-transform',
            !collapsed && 'rotate-180'
          )}
        />
      </button>

      {/* Menu Items - Scrollable */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menus
          .filter((menu) => menu.is_active)
          .sort((a, b) => a.order - b.order)
          .map((menu) => {
            const MenuIcon = getIcon(menu.icon);
            const menuItems = buildMenuTree(menu.items.filter((item) => item.is_active));

            return (
              <div key={menu.id}>
                <button
                  onClick={() => toggleMenu(menu.name)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                    hasActiveChild(menu.items)
                      ? 'bg-neutral-50 text-neutral-900'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  )}
                >
                  <MenuIcon
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      hasActiveChild(menu.items)
                        ? 'text-indigo-600'
                        : 'text-neutral-500 group-hover:text-neutral-700'
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="font-medium text-sm flex-1 text-left">
                        {menu.name}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-neutral-400 transition-transform',
                          openMenus.includes(menu.name) && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                </button>

                {!collapsed && (
                  <AnimatePresence>
                    {openMenus.includes(menu.name) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-1 space-y-1 overflow-hidden"
                      >
                        {menuItems.map((item) => renderMenuItem(item))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
      </nav>
    </motion.aside>
  );
}
