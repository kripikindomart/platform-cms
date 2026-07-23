'use client';

import { useState } from 'react';
import { Plus, Check, GripVertical, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useModuleGenerator } from '@/hooks/use-module-generator';
import { FieldFormDialog, type ModuleField } from './field-form-dialog';
import { toast } from 'sonner';

interface ModuleBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ModuleBuilderDialog({ open, onOpenChange, onSuccess }: ModuleBuilderDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [fields, setFields] = useState<ModuleField[]>([]);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);

  // Form state
  const [moduleName, setModuleName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');

  const { generateModule, loading } = useModuleGenerator();

  const handleSubmit = async () => {
    if (!moduleName || !displayName) {
      toast.error('Module name dan display name harus diisi');
      return;
    }

    if (fields.length === 0) {
      toast.error('Minimal 1 field harus ditambahkan');
      return;
    }

    // Transform fields to match DTO
    const searchableFields = fields.filter(f => f.isSearchable).map(f => f.name);
    const filterableFields = fields.filter(f => f.isFilterable).map(f => f.name);
    const sortableFields = fields.filter(f => f.isSortable).map(f => f.name);

    try {
      await generateModule({
        moduleName,
        displayName,
        description: description || undefined,
        isTenantIsolated: true,
        hasSoftDelete: true,
        hasAudit: true,
        searchableFields,
        filterableFields,
        sortableFields,
        fields: fields.map(f => ({
          name: f.name,
          type: f.type,
          isRequired: f.isRequired,
          isUnique: f.isUnique,
          length: f.length,
          precision: f.precision,
          scale: f.scale,
          defaultValue: f.defaultValue,
          validations: f.validations || [],
        })),
      });

      // Reset form
      onOpenChange(false);
      setModuleName('');
      setDisplayName('');
      setDescription('');
      setFields([]);
      setActiveTab('basic');
      
      // Callback to refresh list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleAddField = () => {
    setEditingFieldIndex(null);
    setIsFieldDialogOpen(true);
  };

  const handleEditField = (index: number) => {
    setEditingFieldIndex(index);
    setIsFieldDialogOpen(true);
  };

  const handleSaveField = (field: ModuleField) => {
    if (editingFieldIndex !== null) {
      const newFields = [...fields];
      newFields[editingFieldIndex] = field;
      setFields(newFields);
    } else {
      setFields([...fields, field]);
    }
    setIsFieldDialogOpen(false);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Generate CRUD Module</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="fields">Fields ({fields.length})</TabsTrigger>
              <TabsTrigger value="query">Query Config</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              {/* Tab 1: Basic Info */}
              <TabsContent value="basic" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="user-profile"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Kebab-case format (e.g., user-profile)
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="User Profile"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Module description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </TabsContent>

              {/* Tab 2: Fields */}
              <TabsContent value="fields" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {fields.length === 0 ? 'Belum ada field' : `${fields.length} fields`}
                  </p>
                  <Button type="button" size="sm" onClick={handleAddField}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>

                {fields.length > 0 && (
                  <div className="border rounded-lg divide-y">
                    {fields.map((field, index) => (
                      <div key={index} className="p-3 flex items-center gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="cursor-move"
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                          <div className="font-medium">{field.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {field.name} • {field.type}
                            {field.isRequired && ' • Required'}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorderField(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorderField(index, 'down')}
                            disabled={index === fields.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditField(index)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteField(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Query Config */}
              <TabsContent value="query" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure field capabilities untuk query operations
                </p>
                {fields.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Tambahkan fields terlebih dahulu
                  </p>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead className="w-[100px]">Searchable</TableHead>
                          <TableHead className="w-[100px]">Filterable</TableHead>
                          <TableHead className="w-[100px]">Sortable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
                          <TableRow key={index}>
                            <TableCell>{field.label}</TableCell>
                            <TableCell>
                              <Checkbox
                                checked={field.isSearchable}
                                onCheckedChange={(checked) => {
                                  const newFields = [...fields];
                                  newFields[index].isSearchable = !!checked;
                                  setFields(newFields);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={field.isFilterable}
                                onCheckedChange={(checked) => {
                                  const newFields = [...fields];
                                  newFields[index].isFilterable = !!checked;
                                  setFields(newFields);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={field.isSortable}
                                onCheckedChange={(checked) => {
                                  const newFields = [...fields];
                                  newFields[index].isSortable = !!checked;
                                  setFields(newFields);
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              {activeTab !== 'basic' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['basic', 'fields', 'query'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                  }}
                >
                  Previous
                </Button>
              )}
              {activeTab !== 'query' ? (
                <Button
                  type="button"
                  onClick={() => {
                    const tabs = ['basic', 'fields', 'query'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || fields.length === 0}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {loading ? 'Generating...' : 'Generate Module'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Field Form Dialog */}
      <FieldFormDialog
        open={isFieldDialogOpen}
        onOpenChange={setIsFieldDialogOpen}
        field={editingFieldIndex !== null ? fields[editingFieldIndex] : undefined}
        onSave={handleSaveField}
      />
    </>
  );
}
