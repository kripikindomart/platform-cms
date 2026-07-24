'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Blocks, FileCode, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useModuleGenerator } from '@/hooks/use-module-generator';
import { toast } from 'sonner';
import { PortalLink } from '@/components/ui/portal-link';
import { usePortalRouter } from '@/hooks/use-portal-router';
import { FieldManager } from '@/app/(private)/org/[tenant]/portal/module-builder/components/field-manager-v2';
import { QueryConfigTab } from '@/app/(private)/org/[tenant]/portal/module-builder/components/query-config-tab';

// Use ModuleField type from field-manager
export type { ModuleField } from '@/app/(private)/org/[tenant]/portal/module-builder/components/field-manager-v2';

export default function CreateModulePage() {
  const { push } = usePortalRouter();
  const { generateModule, loading } = useModuleGenerator();

  const [moduleName, setModuleName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Array<{
    id: string;
    name: string;
    label: string;
    type: string;
    length?: number;
    precision?: number;
    scale?: number;
    isVisibleInList: boolean;
    isRequired: boolean;
    isSearchable: boolean;
    isFilterable: boolean;
    isSortable: boolean;
    defaultValue?: string;
  }>>([]);

  const handleSubmit = async () => {
    if (!moduleName || !displayName) {
      toast.error('Module name dan display name harus diisi');
      return;
    }

    if (fields.length === 0) {
      toast.error('Minimal 1 field harus ditambahkan');
      return;
    }

    const searchableFields = fields.filter(f => f.isSearchable).map(f => f.name);
    const filterableFields = fields.filter(f => f.isFilterable).map(f => f.name);
    const sortableFields = fields.filter(f => f.isSortable).map(f => f.name);

    try {
      // Save schema to visual_modules (draft)
      const result: any = await generateModule({
        moduleName,
        displayName,
        description: description || undefined,
        isTenantIsolated: true,
        hasSoftDelete: true,
        hasAudit: true,
        searchableFields,
        filterableFields,
        sortableFields,
        fields: fields.map((f, index) => ({
          name: f.name,
          label: f.label,
          type: f.type,
          isRequired: f.type === 'uuid' ? false : f.isRequired,
          isUnique: f.type === 'uuid',
          isVisibleInList: f.isVisibleInList,
          length: f.length,
          precision: f.precision,
          scale: f.scale,
          defaultValue: f.defaultValue,
          validations: [],
          order: index,
        })),
      });

      toast.success('Schema berhasil disimpan!', {
        description: 'Lanjutkan ke Form Builder.'
      });
      
      // Redirect to Form Builder (Step 2)
      const moduleId = result?.data?.id || result?.id;
      push(`/module-builder/${moduleId}/form-builder`);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PortalLink href="/module-builder">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </PortalLink>

          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Schema Builder</h1>
            <p className="text-neutral-600 mt-1">Define reusable module schema (global)</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm">
        {/* Basic Information */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Blocks className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Basic Information</h3>
              <p className="text-sm text-neutral-600">Module name and description</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Module Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Module Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="user_profile"
                value={moduleName}
                onChange={(e) => {
                  // Auto convert to snake_case
                  const value = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, '_')
                    .replace(/_+/g, '_')
                    .replace(/^_/, '');
                  setModuleName(value);
                }}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Snake_case format (e.g., user_profile)
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="User Profile"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {/* Description - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
              <Textarea
                placeholder="Module description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Schema Fields */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Schema Fields</h3>
              <p className="text-sm text-neutral-600">Define table columns and data types</p>
            </div>
          </div>

          <FieldManager fields={fields} setFields={setFields} />
        </div>

        {/* Query Configuration */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Query Configuration</h3>
              <p className="text-sm text-neutral-600">Configure searchable, filterable, and sortable fields</p>
            </div>
          </div>

          <QueryConfigTab fields={fields} setFields={(newFields) => setFields(newFields)} />
        </div>

        {/* Info Box */}
        <div className="p-6 border-b border-neutral-100 bg-blue-50">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Module Marketplace</h4>
              <p className="text-sm text-blue-700">
                Schema disimpan sebagai <strong>draft</strong> di module marketplace. 
                Untuk menggunakan, install module ke tenant yang diinginkan.
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="p-6 bg-neutral-50 rounded-b-2xl">
          <div className="flex items-center justify-end gap-3">
            <PortalLink href="/module-builder">
              <Button type="button" variant="outline" disabled={loading}>
                Batal
              </Button>
            </PortalLink>
            <Button
              onClick={handleSubmit}
              disabled={loading || !moduleName || !displayName || fields.length === 0}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving Schema...' : 'Save Schema'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
