'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Header } from '@/components/layout/header';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useTenant } from '@/lib/hooks/use-tenant';
import { Loader2 } from 'lucide-react';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { tenantSlug } = useTenant(); // Auto-detect tenant from URL
  const [isChecking, setIsChecking] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check authentication on mount
    const authenticated = checkAuth();
    
    if (!authenticated) {
      router.push('/login');
    }
    
    // Always stop checking after first check
    setIsChecking(false);
  }, [checkAuth, router]);

  // Show loading state while checking auth (only on first mount)
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-sm text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar onCollapseChange={setSidebarCollapsed} />
      <div 
        className="flex-1 flex flex-col pt-16 transition-all duration-300"
        style={{ paddingLeft: sidebarCollapsed ? '80px' : '280px' }}
      >
        <Header sidebarCollapsed={sidebarCollapsed} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}