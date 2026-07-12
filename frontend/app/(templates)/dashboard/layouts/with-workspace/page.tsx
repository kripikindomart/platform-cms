'use client';

import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { WorkspaceSwitcher } from '@/components/templates/layouts/workspace-switcher';

export default function WorkspaceLayoutPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Layout with Workspace Switcher
            </h1>
            <p className="text-neutral-600 mb-6">
              Multi-workspace support for teams and organizations
            </p>

            {/* Workspace Switcher Demo */}
            <div className="max-w-sm">
              <WorkspaceSwitcher />
            </div>
          </div>

          {/* Workspace Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-neutral-200">
              <h3 className="font-bold text-neutral-900 mb-3">Current Workspace</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  AC
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Acme Corp</p>
                  <p className="text-sm text-neutral-500">24 members</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600">
                You are an <span className="font-semibold text-indigo-600">Owner</span> of this workspace
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200">
              <h3 className="font-bold text-neutral-900 mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>✓ Switch workspaces instantly</li>
                <li>✓ Search workspaces</li>
                <li>✓ Role-based access</li>
                <li>✓ Create new workspace</li>
              </ul>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200">
              <h3 className="font-bold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full h-10 px-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-sm font-semibold transition-colors">
                  Invite Members
                </button>
                <button className="w-full h-10 px-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-sm font-semibold transition-colors">
                  Workspace Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
