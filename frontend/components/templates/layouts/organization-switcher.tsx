'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Plus,
  Settings,
  Users,
  Building2,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
  members: number;
  avatar?: string;
  color: string;
}

export interface OrganizationSwitcherProps {
  organizations: Organization[];
  currentOrganizationId: string;
  onSwitch?: (organizationId: string) => void;
  onCreateNew?: () => void;
  className?: string;
}

const defaultOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    role: 'owner',
    members: 24,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: '2',
    name: 'Startup Inc',
    slug: 'startup-inc',
    role: 'admin',
    members: 12,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: '3',
    name: 'Tech Solutions',
    slug: 'tech-solutions',
    role: 'member',
    members: 48,
    color: 'from-green-500 to-emerald-600',
  },
];

export function OrganizationSwitcher({
  organizations = defaultOrganizations,
  currentOrganizationId = '1',
  onSwitch,
  onCreateNew,
  className,
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentOrg = organizations.find((org) => org.id === currentOrganizationId);

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSwitch = (orgId: string) => {
    onSwitch?.(orgId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getRoleBadgeColor = (role: Organization['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-indigo-100 text-indigo-700';
      case 'admin':
        return 'bg-cyan-100 text-cyan-700';
      case 'member':
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
          'hover:bg-neutral-50 border border-neutral-200',
          isOpen && 'bg-neutral-50 ring-2 ring-indigo-500/20'
        )}
      >
        {/* Organization Avatar */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-lg',
            currentOrg?.color
          )}
        >
          {currentOrg?.name.slice(0, 2).toUpperCase()}
        </div>

        {/* Organization Info */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">
            {currentOrg?.name}
          </p>
          <p className="text-xs text-neutral-500 truncate">
            {currentOrg?.members} members
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-neutral-400 transition-transform flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden z-50"
            >
              {/* Search */}
              <div className="p-3 border-b border-neutral-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-neutral-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Organizations List */}
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredOrgs.length === 0 ? (
                  <div className="py-8 text-center">
                    <Building2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">No organizations found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredOrgs.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => handleSwitch(org.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                          org.id === currentOrganizationId
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50'
                            : 'hover:bg-neutral-50'
                        )}
                      >
                        {/* Avatar */}
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-lg',
                            org.color
                          )}
                        >
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p
                              className={cn(
                                'text-sm font-semibold truncate',
                                org.id === currentOrganizationId
                                  ? 'text-indigo-900'
                                  : 'text-neutral-900'
                              )}
                            >
                              {org.name}
                            </p>
                            <span
                              className={cn(
                                'px-2 py-0.5 text-xs font-semibold rounded-md',
                                getRoleBadgeColor(org.role)
                              )}
                            >
                              {org.role}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {org.members} members
                          </p>
                        </div>

                        {/* Check Icon */}
                        {org.id === currentOrganizationId && (
                          <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-2 border-t border-neutral-100 space-y-1">
                <button
                  onClick={() => {
                    onCreateNew?.();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700 hover:text-neutral-900"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span>Create new organization</span>
                </button>

                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700 hover:text-neutral-900">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-neutral-600" />
                  </div>
                  <span>Manage organizations</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
