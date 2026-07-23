'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';

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
  isRequired: boolean;
  isUnique: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  defaultValue?: string;
  validations?: Array<{ type: string; value?: any }>;
}

interface FieldFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: ModuleField;
  onSave: (field: ModuleField) => void;
}

export function FieldFormDialog({ open, onOpenChange, field, onSave }: FieldFormDialogProps) {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState('string');
  const [isRequired, setIsRequired] = useState(false);
  const [isUnique, setIsUnique] = useState(false);

  useEffect(() => {
    if (field) {
      setName(field.name);
      setLabel(field.label);
      setType(field.type);
      setIsRequired(field.isRequired);
      setIsUnique(field.isUnique);
    } else {
      setName('');
      setLabel('');
      setType('string');
      setIsRequired(false);
      setIsUnique(false);
    }
  }, [field, open]);

  const handleSubmit = () => {
    if (!name || !label) return;

    onSave({
      name,
      label,
      type,
      isRequired,
      isUnique,
      isSearchable: field?.isSearchable || false,
      isFilterable: field?.isFilterable || false,
      isSortable: field?.isSortable || false,
    });

    // Reset
    setName('');
    setLabel('');
    setType('string');
    setIsRequired(false);
    setIsUnique(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{field ? 'Edit Field' : 'Add Field'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Field Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="firstName"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">camelCase format</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Label <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="First Name"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Field Type <span className="text-red-500">*</span>
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isRequired}
                onCheckedChange={(checked) => setIsRequired(!!checked)}
              />
              <label className="text-sm font-medium">Required</label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={isUnique}
                onCheckedChange={(checked) => setIsUnique(!!checked)}
              />
              <label className="text-sm font-medium">Unique</label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={!name || !label}>
              {field ? 'Update' : 'Add'} Field
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
