'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Layout, GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-radix';
import { PortalLink } from '@/components/ui/portal-link';
import { usePortalRouter } from '@/hooks/use-portal-router';
import { useModuleGenerator } from '@/hooks/use-module-generator';
import { moduleGeneratorService } from '@/lib/api/services/module-generator.service';
import { toast } from 'sonner';
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

// Auto-hidden fields (tidak perlu form input)
const AUTO_FIELDS = ['id', 'created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by'];

// ALL input type options (not filtered by field type)
const ALL_INPUT_TYPE_OPTIONS = [
  'text',
  'textarea',
  'wysiwyg',
  'markdown',
  'number',
  'range',
  'rating',
  'checkbox',
  'switch',
  'radio',
  'date',
  'datetime-local',
  'time',
  'month',
  'week',
  'email',
  'url',
  'tel',
  'password',
  'color',
  'select',
  'button-group',
  'json-editor',
  'code-editor',
  'hidden',
];

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  inputType?: string; // text, textarea, wysiwyg, select, date, number, email, url, etc
  options?: string[]; // untuk dropdown/select
  placeholder?: string;
  helpText?: string;
  isVisibleInForm?: boolean;
  validations?: ValidationRule[];
  order?: number;
}

interface ValidationRule {
  id: string;
  type: 'required' | 'email' | 'url' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'integer' | 'positive' | 'negative' | 'arrayMinLength' | 'arrayMaxLength' | 'custom';
  value?: any;
  message?: string;
}

// Sortable Field Item Component
function SortableFieldItem({ field, index, onUpdate, onToggleVisibility, onAddValidation, onRemoveValidation, onUpdateValidation, validationTypes }: any) {
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

  const isAutoField = AUTO_FIELDS.includes(field.name);

  // Show ALL validation types (no filtering by field type)
  const availableValidations = validationTypes;
  
  // Get used validation types in this field (to prevent duplicates)
  const usedValidationTypes = field.validations?.map((v: ValidationRule) => v.type) || [];

  // Show ALL input type options (no filtering by field type)
  const inputTypeOptions = ALL_INPUT_TYPE_OPTIONS;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border border-neutral-200 rounded-xl bg-white ${!field.isVisibleInForm ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing pt-2"
        >
          <GripVertical className="w-5 h-5 text-neutral-400" />
        </div>

        {/* Field Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              {/* Editable Label */}
              <Input
                value={field.label}
                onChange={(e) => onUpdate(index, 'label', e.target.value)}
                className="font-semibold text-neutral-900 border-0 px-0 py-1 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Field Label"
              />
              <p className="text-sm text-neutral-500 mt-1">
                Field: <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">{field.name}</code>
                {' • '}
                Type: <span className="font-medium">{field.type}</span>
                {isAutoField && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Auto-generated</span>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleVisibility(index)}
                className="h-8 w-8 p-0"
                title={field.isVisibleInForm ? 'Hide from form' : 'Show in form'}
              >
                {field.isVisibleInForm ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4 text-neutral-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Only show config for visible fields */}
          {field.isVisibleInForm && (
            <div className="space-y-4">
              {/* Row 1: Input Type, Placeholder, Help Text (3 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Input Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Input Type
                  </label>
                  <Select
                    value={field.inputType || inputTypeOptions[0]}
                    onValueChange={(value) => onUpdate(index, 'inputType', value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {inputTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Placeholder
                  </label>
                  <Input
                    placeholder="Enter placeholder text..."
                    value={field.placeholder || ''}
                    onChange={(e) => onUpdate(index, 'placeholder', e.target.value)}
                  />
                </div>

                {/* Help Text */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Help Text
                  </label>
                  <Input
                    placeholder="Enter help text..."
                    value={field.helpText || ''}
                    onChange={(e) => onUpdate(index, 'helpText', e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Dropdown Options (conditional, full width) */}
              {['select', 'radio', 'checkbox', 'button-group'].includes(field.inputType || '') && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Options (comma separated)
                  </label>
                  <Input
                    placeholder="option1, option2, option3"
                    value={(field.options || []).join(', ')}
                    onChange={(e) => {
                      const options = e.target.value.split(',').map(o => o.trim()).filter(Boolean);
                      onUpdate(index, 'options', options);
                    }}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Separate options with commas
                  </p>
                </div>
              )}

              {/* Validation Rules Section */}
              <div>
                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-neutral-900">Validation Rules</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddValidation(index)}
                      className="h-7 text-xs"
                      disabled={validationTypes.length === 0}
                    >
                      <span className="mr-1">+</span> Add Rule
                    </Button>
                  </div>
                  
                  {validationTypes.length === 0 && (
                    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                      Loading validation types...
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {field.validations && field.validations.length > 0 ? (
                      field.validations.map((validation: ValidationRule, vIndex: number) => {
                        // Find validation type details
                        const validationType = validationTypes.find((vt: any) => vt.code === validation.type);
                        
                        return (
                        <div key={validation.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                          {/* Row 1: Validation Type & Value */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {/* Validation Type */}
                            <div>
                              <label className="block text-xs font-medium text-neutral-600 mb-1">Type</label>
                              <Select
                                value={validation.type}
                                onValueChange={(value) => onUpdateValidation(index, vIndex, 'type', value)}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select validation..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableValidations.map((vt: any) => {
                                    // Check if this validation is already used (exclude current)
                                    const isUsed = usedValidationTypes.includes(vt.code) && validation.type !== vt.code;
                                    return (
                                      <SelectItem 
                                        key={vt.code} 
                                        value={vt.code}
                                        disabled={isUsed}
                                      >
                                        {vt.name} {isUsed ? '(Already used)' : ''}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Validation Value (if needed) */}
                            {validationType && validationType.requiresValue && (
                              <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">Value</label>
                                <Input
                                  type={validationType.valueType === 'number' ? 'number' : 'text'}
                                  placeholder={validationType.valueType === 'regex' ? 'Pattern' : 'Value'}
                                  value={validation.value || ''}
                                  onChange={(e) => onUpdateValidation(index, vIndex, 'value', e.target.value)}
                                  className="h-9 text-sm"
                                />
                              </div>
                            )}
                          </div>

                          {/* Row 2: Custom Error Message */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-medium text-neutral-600">Custom Error Message</label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveValidation(index, vIndex)}
                                className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                            <Input
                              placeholder="Custom error message (optional)"
                              value={validation.message || ''}
                              onChange={(e) => onUpdateValidation(index, vIndex, 'message', e.target.value)}
                              className="text-sm"
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                              Use <code className="bg-neutral-100 px-1 rounded">{'{{label}}'}</code> for field label, <code className="bg-neutral-100 px-1 rounded">{'{{value}}'}</code> for validation value
                            </p>
                          </div>
                        </div>
                      );
                      })
                    ) : (
                      <div className="text-sm text-neutral-500 text-center py-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                        No validation rules. Click "Add Rule" to add one.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Form Builder Page (Step 2)
 * Configure form UI/UX for the module
 */
export default function FormBuilderPage() {
  const params = useParams();
  const { push } = usePortalRouter();
  const { fetchModuleDetail, loading } = useModuleGenerator();
  const [module, setModule] = useState<any>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [validationTypes, setValidationTypes] = useState<any[]>([]);
  const [loadingValidations, setLoadingValidations] = useState(false);
  
  // UI/UX Settings
  const [uiConfig, setUiConfig] = useState({
    createFormType: 'page' as 'page' | 'modal',
    editFormType: 'page' as 'page' | 'modal',
  });

  const moduleId = Number(params.id);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadModule();
    loadValidationTypes();
  }, [moduleId]);

  const loadValidationTypes = async () => {
    try {
      setLoadingValidations(true);
      const response = await moduleGeneratorService.getValidationTypes();
      
      // API service already extracts .data, so response is the array directly
      const types = Array.isArray(response) ? response : [];
      setValidationTypes(types);
    } catch (error) {
      console.error('Failed to load validation types:', error);
      toast.error('Failed to load validation types');
    } finally {
      setLoadingValidations(false);
    }
  };

  const loadModule = async () => {
    const data = await fetchModuleDetail(moduleId);
    setModule(data);
    
    // Load UI config if exists
    if (data?.uiConfig) {
      try {
        const config = typeof data.uiConfig === 'string' ? JSON.parse(data.uiConfig) : data.uiConfig;
        setUiConfig({
          createFormType: config.createFormType || 'page',
          editFormType: config.editFormType || 'page',
        });
      } catch (e) {
        console.error('Failed to parse UI config:', e);
      }
    }
    
    // Load fields from module and add unique IDs for drag & drop
    if (data?.fields) {
      const loadedFields = data.fields.map((f: any, index: number) => {
        const isAutoField = AUTO_FIELDS.includes(f.name);
        return {
          id: `field-${index}`, // Unique ID for dnd-kit
          name: f.name,
          label: f.label || f.name,
          type: f.type,
          inputType: f.inputType || getDefaultInputType(f.type),
          options: f.options || [],
          placeholder: f.placeholder || '',
          helpText: f.helpText || '',
          isVisibleInForm: !isAutoField, // Auto-hide auto fields
          validations: f.validations || [], // Load existing validations
          order: f.order || index,
        };
      });
      setFields(loadedFields);
    }
  };

  // Helper function to get default input type based on field type
  const getDefaultInputType = (fieldType: string): string => {
    switch (fieldType) {
      case 'string': return 'text';
      case 'text': return 'textarea';
      case 'number': return 'number';
      case 'boolean': return 'checkbox';
      case 'date': return 'date';
      case 'datetime': return 'datetime-local';
      case 'email': return 'email';
      case 'url': return 'url';
      case 'uuid': return 'text';
      case 'json': return 'json-editor';
      case 'enum': return 'select';
      default: return 'text';
    }
  };

  const handleFieldUpdate = (index: number, field: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFields(newFields);
  };

  const handleToggleVisibility = (index: number) => {
    const newFields = [...fields];
    newFields[index].isVisibleInForm = !newFields[index].isVisibleInForm;
    setFields(newFields);
  };

  const handleAddValidation = (fieldIndex: number) => {
    const newFields = [...fields];
    if (!newFields[fieldIndex].validations) {
      newFields[fieldIndex].validations = [];
    }
    newFields[fieldIndex].validations!.push({
      id: `validation-${Date.now()}`,
      type: 'required' as any,
      value: undefined,
      message: '',
    });
    setFields(newFields);
  };

  const handleRemoveValidation = (fieldIndex: number, validationIndex: number) => {
    const newFields = [...fields];
    newFields[fieldIndex].validations!.splice(validationIndex, 1);
    setFields(newFields);
  };

  const handleUpdateValidation = (fieldIndex: number, validationIndex: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[fieldIndex].validations![validationIndex] = {
      ...newFields[fieldIndex].validations![validationIndex],
      [key]: value,
    };
    setFields(newFields);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveFormConfig = async () => {
    try {
      // Prepare field configurations to save
      const fieldConfigurations = fields.map((field, index) => ({
        name: field.name,
        label: field.label,
        inputType: field.inputType,
        options: field.options || [],
        placeholder: field.placeholder || '',
        helpText: field.helpText || '',
        isVisibleInForm: field.isVisibleInForm,
        validations: field.validations || [],
        order: index, // Update order based on current position
      }));

      // Save BOTH UI config AND field configurations to backend
      await moduleGeneratorService.update(moduleId, {
        uiConfig: JSON.stringify(uiConfig),
        fieldConfigurations: JSON.stringify(fieldConfigurations), // NEW: Save field configs
      } as any); // Cast to bypass TypeScript cache issue
      
      toast.success('Form configuration saved!', {
        description: `Saved UI config and ${fieldConfigurations.length} field configurations`
      });
      
      // Redirect to assign page (Step 3)
      push(`/module-builder/${moduleId}/assign`);
    } catch (error: any) {
      toast.error('Failed to save form config', {
        description: error.message
      });
    }
  };

  const handleSkip = () => {
    // Skip form builder, use default config
    push(`/module-builder/${moduleId}/assign`);
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
          <PortalLink href={`/module-builder/${moduleId}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </PortalLink>

          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Form Builder</h1>
            <p className="text-neutral-600 mt-1">Configure form UI/UX for {module.displayName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSkip}>
            Skip (Use Default)
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-green-600"></div>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Step 1: Schema Builder</p>
              <p className="text-sm text-green-600">Completed ✓</p>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-neutral-400" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-blue-600"></div>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Step 2: Form Builder</p>
              <p className="text-sm text-blue-600">In Progress</p>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-neutral-400" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-neutral-300"></div>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Step 3: Assign to Tenant</p>
              <p className="text-sm text-neutral-500">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* UI/UX Settings Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-neutral-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">UI/UX Settings</h3>
              <p className="text-sm text-neutral-600">Configure how forms are displayed</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create Form Type */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-neutral-900">
                Create Form Display
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-neutral-50"
                  style={{
                    borderColor: uiConfig.createFormType === 'page' ? 'rgb(59, 130, 246)' : 'rgb(229, 231, 235)',
                    backgroundColor: uiConfig.createFormType === 'page' ? 'rgb(239, 246, 255)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="createFormType"
                    value="page"
                    checked={uiConfig.createFormType === 'page'}
                    onChange={(e) => setUiConfig({ ...uiConfig, createFormType: e.target.value as 'page' })}
                    className="mt-0.5 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">New Page</div>
                    <div className="text-sm text-neutral-600 mt-1">
                      Navigate to a dedicated create page
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-neutral-50"
                  style={{
                    borderColor: uiConfig.createFormType === 'modal' ? 'rgb(59, 130, 246)' : 'rgb(229, 231, 235)',
                    backgroundColor: uiConfig.createFormType === 'modal' ? 'rgb(239, 246, 255)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="createFormType"
                    value="modal"
                    checked={uiConfig.createFormType === 'modal'}
                    onChange={(e) => setUiConfig({ ...uiConfig, createFormType: e.target.value as 'modal' })}
                    className="mt-0.5 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">Modal Dialog</div>
                    <div className="text-sm text-neutral-600 mt-1">
                      Open form in a modal overlay
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Edit Form Type */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-neutral-900">
                Edit Form Display
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-neutral-50"
                  style={{
                    borderColor: uiConfig.editFormType === 'page' ? 'rgb(139, 92, 246)' : 'rgb(229, 231, 235)',
                    backgroundColor: uiConfig.editFormType === 'page' ? 'rgb(245, 243, 255)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="editFormType"
                    value="page"
                    checked={uiConfig.editFormType === 'page'}
                    onChange={(e) => setUiConfig({ ...uiConfig, editFormType: e.target.value as 'page' })}
                    className="mt-0.5 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">New Page</div>
                    <div className="text-sm text-neutral-600 mt-1">
                      Navigate to a dedicated edit page
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-neutral-50"
                  style={{
                    borderColor: uiConfig.editFormType === 'modal' ? 'rgb(139, 92, 246)' : 'rgb(229, 231, 235)',
                    backgroundColor: uiConfig.editFormType === 'modal' ? 'rgb(245, 243, 255)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="editFormType"
                    value="modal"
                    checked={uiConfig.editFormType === 'modal'}
                    onChange={(e) => setUiConfig({ ...uiConfig, editFormType: e.target.value as 'modal' })}
                    className="mt-0.5 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">Modal Dialog</div>
                    <div className="text-sm text-neutral-600 mt-1">
                      Open form in a modal overlay
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Modal dialogs are great for quick edits, while dedicated pages work better for complex forms with many fields.
            </p>
          </div>
        </div>
      </div>

      {/* Form Configuration */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Form Fields Configuration</h3>
              <p className="text-sm text-neutral-600">Configure validation, placeholders, and help text</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {fields.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Layout className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-neutral-600 mb-4">No fields to configure yet.</p>
              <p className="text-sm text-neutral-500">
                Fields will be loaded from the schema you created.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-neutral-600">
                  {fields.filter(f => f.isVisibleInForm).length} visible • {fields.filter(f => !f.isVisibleInForm).length} hidden
                </p>
                <p className="text-xs text-neutral-500">
                  Drag to reorder • Click eye to hide/show
                </p>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((field, index) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      index={index}
                      onUpdate={handleFieldUpdate}
                      onToggleVisibility={handleToggleVisibility}
                      onAddValidation={handleAddValidation}
                      onRemoveValidation={handleRemoveValidation}
                      onUpdateValidation={handleUpdateValidation}
                      validationTypes={validationTypes}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-neutral-50 border-t border-neutral-100 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleSkip}>
              Skip (Use Defaults)
            </Button>
            <Button
              onClick={handleSaveFormConfig}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
