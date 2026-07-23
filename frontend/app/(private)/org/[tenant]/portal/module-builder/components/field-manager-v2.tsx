'use client';

import { Plus, GripVertical, Trash2 } from 'lucide-react';
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const fieldTypes = [
  'string', 'text', 'number', 'boolean', 'date',
  'datetime', 'email', 'url', 'json', 'uuid'
] as const;

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

interface FieldManagerProps {
  fields: ModuleField[];
  setFields: (fields: ModuleField[]) => void;
}

// Helper: Convert camelCase to snake_case
const toSnakeCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
};

// Helper: Convert camelCase/PascalCase to Title Case with spaces
const fieldNameToLabel = (fieldName: string): string => {
  if (!fieldName) return '';
  const withSpaces = fieldName.replace(/([A-Z])/g, ' $1').replace(/([0-9]+)/g, ' $1');
  return withSpaces
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface SortableRowProps {
  field: ModuleField;
  index: number;
  onUpdate: (index: number, updates: Partial<ModuleField>) => void;
  onDelete: (index: number) => void;
  isDisabled: boolean;
}

function SortableRow({ field, index, onUpdate, onDelete, isDisabled }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-neutral-50/50 transition-colors border-b border-neutral-100 last:border-b-0"
    >
      <td className="px-4 py-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-1 hover:bg-neutral-100 rounded inline-flex"
        >
          <GripVertical className="h-4 w-4 text-neutral-400" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Input
          placeholder="firstName"
          value={field.name}
          onChange={(e) => onUpdate(index, { name: e.target.value })}
          className="h-9 font-mono text-sm"
        />
      </td>
      <td className="px-4 py-3">
        <Input
          placeholder="First Name"
          value={field.label}
          onChange={(e) => onUpdate(index, { label: e.target.value })}
          className="h-9"
        />
      </td>
      <td className="px-4 py-3">
        <Select
          value={field.type}
          onValueChange={(value) => onUpdate(index, { type: value })}
        >
          <SelectTrigger className="h-9 w-32">
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
      </td>
      <td className="px-4 py-3 text-center">
        <Checkbox
          checked={field.isVisibleInList ?? true}
          onCheckedChange={(checked) => onUpdate(index, { isVisibleInList: !!checked })}
        />
      </td>
      <td className="px-4 py-3 text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(index)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}

export function FieldManager({ fields, setFields }: FieldManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddField = () => {
    const newField: ModuleField = {
      id: `field-${Date.now()}`,
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
    const currentField = newFields[index];
    
    // Auto-generate label when name changes
    if (updates.name !== undefined) {
      // Convert to snake_case first
      const snakeCaseName = toSnakeCase(updates.name);
      updates.name = snakeCaseName;
      
      // Only auto-fill label if it's empty OR still matches the previous auto-generated label
      const previousAutoLabel = fieldNameToLabel(currentField.name);
      if (!currentField.label || currentField.label === previousAutoLabel) {
        updates.label = fieldNameToLabel(snakeCaseName);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      setFields(arrayMove(fields, oldIndex, newIndex));
    }
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
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 w-12"></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">Field Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">Type</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-700 w-24">Visible</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-700 w-20"></th>
                </tr>
              </thead>
              <tbody>
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((field, index) => (
                    <SortableRow
                      key={field.id}
                      field={field}
                      index={index}
                      onUpdate={handleUpdateField}
                      onDelete={handleDeleteField}
                      isDisabled={isFieldDisabled(field)}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>
      )}
    </div>
  );
}
