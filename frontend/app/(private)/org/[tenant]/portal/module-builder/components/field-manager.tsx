'use client';

import { useState } from 'react';
import { Plus, GripVertical, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';
import { Badge } from '@/components/ui/badge';

const fieldTypes = [
  'string', 'text', 'number', 'boolean', 'date',
  'datetime', 'email', 'url', 'json', 'uuid'
] as const;

export interface ModuleField {
  name: string;
  label: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  isVisibleInList: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  defaultValue?: string;
}

interface FieldManagerProps {
  fields: ModuleField[];
  setFields: (fields: ModuleField[]) => void;
}

// Helper: Convert camelCase/PascalCase to Title Case with spaces
const fieldNameToLabel = (fieldName: string): string => {
  if (!fieldName) return '';
  
  // Insert space before capital letters and numbers
  const withSpaces = fieldName.replace(/([A-Z])/g, ' $1').replace(/([0-9]+)/g, ' $1');
  
  // Capitalize first letter of each word
  return withSpaces
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export function FieldManager({ fields, setFields }: FieldManagerProps) {
  const handleAddField = () => {
    const newField: ModuleField = {
      name: '',
      label: '',
      type: 'string',
      isVisibleInList: true,
      isSearchable: false,
      isFilterable: false,
      isSortable: false,
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<ModuleField>) => {
    const newFields = [...fields];
    
    // Auto-generate label from name if name changes (but user can override)
    if (updates.name !== undefined && updates.name !== '') {
      // Only auto-fill if label is empty or matches the previous auto-generated label
      const currentField = newFields[index];
      const previousAutoLabel = fieldNameToLabel(currentField.name);
      
      if (!currentField.label || currentField.label === previousAutoLabel) {
        updates.label = fieldNameToLabel(updates.name);
      }
    }
    
    // If type is UUID, disable search/filter/sort
    if (updates.type === 'uuid') {
      updates.isSearchable = false;
      updates.isFilterable = false;
      updates.isSortable = false;
    }
    
    // If not visible in list, disable search/filter/sort
    if (updates.isVisibleInList === false) {
      updates.isSearchable = false;
      updates.isFilterable = false;
      updates.isSortable = false;
    }
    
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const handleDeleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleReorderField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const isFieldDisabled = (field: ModuleField) => {
    return field.type === 'uuid' || !field.isVisibleInList;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          {fields.length === 0 ? 'Belum ada field' : `${fields.length} fields`}
        </p>
        <Button type="button" size="sm" onClick={handleAddField} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const disabled = isFieldDisabled(field);

            return (
              <div
                key={index}
                className="group bg-white border border-neutral-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="cursor-move h-9 w-9 p-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <GripVertical className="h-4 w-4 text-neutral-400" />
                  </Button>

                  {/* Main Content */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Row 1: Field Name & Label */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                        Field Name
                      </label>
                      <Input
                        placeholder="firstName"
                        value={field.name}
                        onChange={(e) => handleUpdateField(index, { name: e.target.value })}
                        className="h-9 font-mono text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                        Label
                      </label>
                      <Input
                        placeholder="First Name"
                        value={field.label}
                        onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                        className="h-9"
                      />
                    </div>

                    {/* Row 2: Type & Visible */}
                    <div className="md:col-span-3">
                      <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                        Field Type
                      </label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => handleUpdateField(index, { type: value })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                        Visible in List
                      </label>
                      <div className="flex items-center h-9">
                        <Checkbox
                          checked={field.isVisibleInList ?? true}
                          onCheckedChange={(checked) =>
                            handleUpdateField(index, { isVisibleInList: !!checked })
                          }
                        />
                        <span className="ml-2 text-sm text-neutral-600">Show</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorderField(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                      title="Move up"
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorderField(index, 'down')}
                      disabled={index === fields.length - 1}
                      className="h-8 w-8 p-0"
                      title="Move down"
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteField(index)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Info message for disabled fields */}
                {disabled && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500 italic">
                      {field.type === 'uuid'
                        ? 'UUID fields cannot be searched, filtered, or sorted'
                        : 'Hidden fields cannot be searched, filtered, or sorted'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
