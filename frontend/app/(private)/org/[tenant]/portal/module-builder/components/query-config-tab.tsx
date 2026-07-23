'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export interface ModuleField {
  id: string; // For drag & drop
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

interface QueryConfigTabProps {
  fields: ModuleField[];
  setFields: (fields: ModuleField[]) => void;
}

export function QueryConfigTab({ fields, setFields }: QueryConfigTabProps) {
  const handleToggleSearchable = (index: number) => {
    const field = fields[index];
    if (field.type === 'uuid' || !field.isVisibleInList) return;
    
    const newFields = [...fields];
    newFields[index].isSearchable = !newFields[index].isSearchable;
    setFields(newFields);
  };

  const handleToggleFilterable = (index: number) => {
    const field = fields[index];
    if (field.type === 'uuid' || !field.isVisibleInList) return;
    
    const newFields = [...fields];
    newFields[index].isFilterable = !newFields[index].isFilterable;
    setFields(newFields);
  };

  const handleToggleSortable = (index: number) => {
    const field = fields[index];
    if (field.type === 'uuid' || !field.isVisibleInList) return;
    
    const newFields = [...fields];
    newFields[index].isSortable = !newFields[index].isSortable;
    setFields(newFields);
  };

  const isFieldDisabled = (field: ModuleField) => {
    return field.type === 'uuid' || !field.isVisibleInList;
  };

  if (fields.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p>Belum ada field. Tambahkan field di tab "Schema Fields" terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 px-6 py-4 bg-neutral-50/50 border-b border-neutral-200">
          <div className="font-semibold text-sm text-neutral-700">Field</div>
          <div className="text-center font-semibold text-sm text-neutral-700">Searchable</div>
          <div className="text-center font-semibold text-sm text-neutral-700">Filterable</div>
          <div className="text-center font-semibold text-sm text-neutral-700">Sortable</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-neutral-100">
          {fields.map((field, index) => {
            const disabled = isFieldDisabled(field);
            
            return (
              <div 
                key={index} 
                className={`grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 px-6 py-4 items-center hover:bg-neutral-50/50 transition-colors ${
                  disabled ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-neutral-900">{field.label}</div>
                  <div className="text-sm text-neutral-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{field.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {field.type}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Checkbox
                    checked={field.isSearchable}
                    onCheckedChange={() => handleToggleSearchable(index)}
                    disabled={disabled}
                  />
                </div>

                <div className="flex justify-center">
                  <Checkbox
                    checked={field.isFilterable}
                    onCheckedChange={() => handleToggleFilterable(index)}
                    disabled={disabled}
                  />
                </div>

                <div className="flex justify-center">
                  <Checkbox
                    checked={field.isSortable}
                    onCheckedChange={() => handleToggleSortable(index)}
                    disabled={disabled}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="text-sm text-blue-800 space-y-1.5">
          <p>
            <strong className="font-semibold">Searchable:</strong> Field dapat digunakan untuk pencarian full-text
          </p>
          <p>
            <strong className="font-semibold">Filterable:</strong> Field dapat digunakan untuk filter hasil query
          </p>
          <p>
            <strong className="font-semibold">Sortable:</strong> Field dapat digunakan untuk sorting hasil query
          </p>
        </div>
      </div>
    </div>
  );
}
