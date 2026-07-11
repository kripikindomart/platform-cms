'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

