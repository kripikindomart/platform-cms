'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';

interface MenuItem {
  id: number;
  label: string;
  url: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  parent_id: number | null;
}

interface MenuData {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  items: MenuItem[];
}

export default function MenusPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<MenuData[]>(
        '/menus/active'
      );
      setMenus(response || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  const filteredMenus = menus.filter(
    (menu) =>
      menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      menu.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
            <Menu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Menu Management</h1>
            <p className="text-neutral-600 mt-0.5">
              {loading ? 'Loading...' : `${menus.length} total menus`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Search menus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Menu List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
            <div className="text-red-600 font-semibold mb-2">Failed to load menus</div>
            <p className="text-sm text-neutral-600">{error}</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 text-center">
            <Menu className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-600">No menus found</p>
          </div>
        ) : (
          filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <Menu className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{menu.name}</h3>
                    <p className="text-sm text-neutral-500">/{menu.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={menu.is_active ? 'default' : 'secondary'}>
                    {menu.is_active ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline">Order: {menu.order}</Badge>
                </div>
              </div>

              {/* Menu Items */}
              {menu.items && menu.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Menu Items ({menu.items.length})
                  </p>
                  <div className="space-y-1">
                    {menu.items
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                        >
                          <span className="text-xs text-neutral-400 font-mono w-6">
                            {item.order}
                          </span>
                          <span className="flex-1 text-sm text-neutral-700">{item.label}</span>
                          <span className="text-xs text-neutral-500 font-mono">{item.url}</span>
                          <Badge
                            variant={item.is_active ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.is_active ? 'Active' : 'Hidden'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
