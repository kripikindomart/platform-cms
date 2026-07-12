'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Workspace {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface WorkspaceSwitcherProps {
  workspaces?: Workspace[];
  currentWorkspace?: Workspace;
  onSwitch?: (workspace: Workspace) => void;
  onCreate?: () => void;
  className?: string;
}

const defaultWorkspaces: Workspace[] = [
  { id: '1', name: 'Acme Corp', role: 'Owner' },
  { id: '2', name: 'My Personal', role: 'Owner' },
  { id: '3', name: 'Client Project', role: 'Admin' },
];

export function WorkspaceSwitcher({
  workspaces = defaultWorkspaces,
  currentWorkspace = defaultWorkspaces[0],
  onSwitch,
  onCreate,
  className,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 transition-all group"
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {currentWorkspace.avatar || currentWorkspace.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">{currentWorkspace.name}</p>
          <p className="text-xs text-neutral-500">{currentWorkspace.role}</p>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 p-2 bg-white rounded-xl border border-neutral-200 shadow-xl z-50"
            >
              <div className="mb-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search workspaces..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {filteredWorkspaces.map((workspace) => {
                  const isActive = workspace.id === currentWorkspace.id;
                  return (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        onSwitch?.(workspace);
                        setOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                        isActive ? 'bg-indigo-50' : 'hover:bg-neutral-50'
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {workspace.avatar || workspace.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={cn('text-sm font-semibold truncate', isActive ? 'text-indigo-900' : 'text-neutral-900')}>
                          {workspace.name}
                        </p>
                        <p className="text-xs text-neutral-500">{workspace.role}</p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-neutral-200">
                <button
                  onClick={() => {
                    onCreate?.();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-neutral-400" />
                  </div>
                  <span className="text-sm font-semibold text-neutral-700">Create workspace</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
