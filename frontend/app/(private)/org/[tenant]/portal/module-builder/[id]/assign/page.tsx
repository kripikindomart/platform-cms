'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalLink } from '@/components/ui/portal-link';
import { usePortalRouter } from '@/hooks/use-portal-router';
import { useModuleGenerator } from '@/hooks/use-module-generator';
import { toast } from 'sonner';

/**
 * Assign to Tenant Page (Step 3)
 * Generate code and assign module to specific tenants
 */
export default function AssignModulePage() {
  const params = useParams();
  const { push } = usePortalRouter();
  const { fetchModuleDetail, loading } = useModuleGenerator();
  const [module, setModule] = useState<any>(null);
  const [assigning, setAssigning] = useState(false);
  
  // Assignment options
  const [options, setOptions] = useState({
    autoPublish: true,
    generateMenu: true,
    createPermissions: true,
    runMigration: true,
  });

  const moduleId = Number(params.id);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    const data = await fetchModuleDetail(moduleId);
    setModule(data);
  };

  const handleAssign = async () => {
    setAssigning(true);
    
    try {
      // Get current tenant from URL path
      const pathSegments = window.location.pathname.split('/');
      const tenantSlug = pathSegments[2]; // /org/{tenant}/portal/...
      
      // Get tenant ID from tenant slug
      // TODO: This should come from context/store, but for now we'll pass slug
      
      // Call assign API with tenant slug instead of ID
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/module-generator/${moduleId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`,
          'X-Tenant-Slug': tenantSlug, // Use header for tenant context
        },
        credentials: 'include',
        body: JSON.stringify({
          options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign module');
      }

      const result = await response.json();
      
      toast.success('Module successfully assigned!', {
        description: `Generated ${result.data.filesCreated} files, created permissions and menu.`
      });
      
      // Redirect to module list
      push('/module-builder');
    } catch (error: any) {
      toast.error('Failed to assign module', {
        description: error.message
      });
    } finally {
      setAssigning(false);
    }
  };

  if (loading || !module) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PortalLink href={`/module-builder/${moduleId}/form-builder`}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </PortalLink>

          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Assign to Tenant</h1>
            <p className="text-neutral-600 mt-1">Generate code and deploy {module.displayName}</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Step 1: Schema</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
          </div>

          <div className="flex-1 h-0.5 bg-green-600 mx-4"></div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Step 2: Form</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
          </div>

          <div className="flex-1 h-0.5 bg-neutral-200 mx-4"></div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Step 3: Deploy</p>
              <p className="text-sm text-blue-600">Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Content */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Ready to Deploy</h2>
            <p className="text-neutral-600">
              This will generate code and assign the module to your current tenant
            </p>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-neutral-900 mb-4">What will happen:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Generate Code</p>
                  <p className="text-sm text-neutral-600">12 files will be created (controller, service, repository, DTOs)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Create Permissions</p>
                  <p className="text-sm text-neutral-600">4 permissions (create, read, update, delete)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Add Menu Item</p>
                  <p className="text-sm text-neutral-600">Menu will be added to your tenant navigation</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Create Database Table</p>
                  <p className="text-sm text-neutral-600">Migration will be executed in your tenant schema</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-4">
            <PortalLink href="/module-builder">
              <Button variant="outline" disabled={assigning}>
                Cancel
              </Button>
            </PortalLink>
            <Button
              onClick={handleAssign}
              disabled={assigning}
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg px-8"
            >
              <Zap className="w-4 h-4 mr-2" />
              {assigning ? 'Assigning...' : 'Assign to Current Tenant'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
