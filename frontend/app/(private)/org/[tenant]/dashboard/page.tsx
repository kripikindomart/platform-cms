'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default function TenantDashboardPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);

  useEffect(() => {
    // Save selected tenant
    const tenant = resolvedParams.tenant;
    document.cookie = `selected-tenant=${tenant}; path=/; max-age=31536000`;
    localStorage.setItem('selected-tenant', tenant);
    
    // Redirect to portal with tenant context
    router.push(`/org/${tenant}/portal`);
  }, [resolvedParams.tenant, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Setting up workspace...</p>
      </div>
    </div>
  );
}
