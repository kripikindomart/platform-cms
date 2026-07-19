'use client';

import { useState } from 'react';
import { FormSection, FormField } from '@/components/templates/forms';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Save } from 'lucide-react';
import { CreateRoleDTO, Role } from '@/lib/api/types';

interface RoleFormProps {
  initialData?: Role;
  onSubmit: (data: CreateRoleDTO) => Promise<void>;
  loading?: boolean;
}

export function RoleForm({ initialData, onSubmit, loading }: RoleFormProps) {
  const [formData, setFormData] = useState({
    display_name: initialData?.display_name || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate name (slug) from display_name
  const handleDisplayNameChange = (value: string) => {
    setFormData({
      ...formData,
      display_name: value,
      name: value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.display_name) newErrors.display_name = 'Role name is required';
    if (!formData.name) newErrors.name = 'Identifier is required';
    if (formData.name && !/^[a-z0-9_-]+$/.test(formData.name)) {
      newErrors.name = 'Identifier must contain only lowercase letters, numbers, underscores, and hyphens';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormSection
        title="Role Information"
        description="Basic details about this role"
        icon={Shield}
      >
        <FormField label="Role Name" required error={errors.display_name}>
          <Input
            value={formData.display_name}
            onChange={(e) => handleDisplayNameChange(e.target.value)}
            placeholder="e.g. Wilayah"
            disabled={loading}
            className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
          />
        </FormField>

        <FormField 
          label="Identifier" 
          required 
          error={errors.name}
          hint="Internal identifier (auto-generated, lowercase with underscore)"
        >
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g. wilayah"
            disabled={loading}
            className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm font-mono focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
          />
        </FormField>

        <FormField 
          label="Description" 
          hint="Brief description of this role's purpose and responsibilities"
        >
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe what this role can do..."
            rows={4}
            disabled={loading}
            className="rounded-xl border-neutral-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
          />
        </FormField>
      </FormSection>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => window.history.back()}
          className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {initialData ? 'Update Role' : 'Create Role'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
