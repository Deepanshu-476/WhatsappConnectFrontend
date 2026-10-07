'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, Type, Hash, Mail, Phone, Calendar, ChevronDown, ListCheck, ToggleLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CustomField, CustomFieldType } from '@/types/crm-settings';

interface CustomFieldManagerProps {
  title: string;
  description?: string;
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  readOnly?: boolean;
}

const FIELD_TYPES: { type: CustomFieldType; label: string; icon: typeof Type }[] = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'multiselect', label: 'Multi Select', icon: ListCheck },
  { type: 'boolean', label: 'Boolean (Yes/No)', icon: ToggleLeft },
];

export function CustomFieldManager({
  title,
  description,
  fields,
  onChange,
  readOnly = false,
}: CustomFieldManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activeField, setActiveField] = useState<CustomField | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<CustomField | null>(null);

  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formType, setFormType] = useState<CustomFieldType>('text');
  const [formRequired, setFormRequired] = useState(false);
  const [formOptions, setFormOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');

  function openCreate() {
    setActiveField(null);
    setFormName('');
    setFormKey('');
    setFormType('text');
    setFormRequired(false);
    setFormOptions([]);
    setNewOptionInput('');
    setModalOpen(true);
  }

  function openEdit(field: CustomField) {
    setActiveField(field);
    setFormName(field.name);
    setFormKey(field.key);
    setFormType(field.type);
    setFormRequired(Boolean(field.required));
    setFormOptions(field.options || []);
    setNewOptionInput('');
    setModalOpen(true);
  }

  function handleNameChange(val: string) {
    setFormName(val);
    if (!activeField) {
      setFormKey(val.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    }
  }

  function addOption() {
    if (!newOptionInput.trim()) return;
    if (!formOptions.includes(newOptionInput.trim())) {
      setFormOptions([...formOptions, newOptionInput.trim()]);
    }
    setNewOptionInput('');
  }

  function removeOption(opt: string) {
    setFormOptions(formOptions.filter((o) => o !== opt));
  }

  function handleSave() {
    if (!formName.trim() || !formKey.trim()) return;

    let updated: CustomField[];
    if (activeField) {
      updated = fields.map((f) =>
        f.id === activeField.id
          ? {
              ...f,
              name: formName.trim(),
              key: formKey.trim(),
              type: formType,
              required: formRequired,
              options: formOptions,
            }
          : f,
      );
    } else {
      const newField: CustomField = {
        id: `field_${Date.now()}`,
        name: formName.trim(),
        key: formKey.trim(),
        type: formType,
        required: formRequired,
        options: formOptions,
      };
      updated = [...fields, newField];
    }

    onChange(updated);
    setModalOpen(false);
  }

  function confirmDelete(field: CustomField) {
    setFieldToDelete(field);
    setDeleteConfirmOpen(true);
  }

  function handleDelete() {
    if (!fieldToDelete) return;
    const updated = fields.filter((f) => f.id !== fieldToDelete.id);
    onChange(updated);
    setDeleteConfirmOpen(false);
    setFieldToDelete(null);
  }

  function getFieldTypeBadge(type: CustomFieldType) {
    const meta = FIELD_TYPES.find((m) => m.type === type);
    const Icon = meta?.icon || Type;
    return (
      <Badge variant="outline" className="gap-1 text-[11px] font-normal capitalize">
        <Icon className="size-3 text-muted-foreground" />
        {meta?.label || type}
      </Badge>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {!readOnly && (
          <Button
            type="button"
            size="sm"
            onClick={openCreate}
            className="h-8 gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            Add Custom Field
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden bg-card/40">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs">Field Name</TableHead>
              <TableHead className="text-xs">Field Key</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Required</TableHead>
              <TableHead className="text-xs">Options</TableHead>
              {!readOnly && <TableHead className="w-24 text-right text-xs">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                  No custom fields defined. Click &quot;Add Custom Field&quot; to configure.
                </TableCell>
              </TableRow>
            ) : (
              fields.map((field) => (
                <TableRow key={field.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-medium text-foreground">
                    {field.name}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {field.key}
                  </TableCell>
                  <TableCell className="text-xs">{getFieldTypeBadge(field.type)}</TableCell>
                  <TableCell className="text-xs">
                    {field.required ? (
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] py-0 px-1.5">
                        Required
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">Optional</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {field.options && field.options.length > 0 ? field.options.join(', ') : '—'}
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(field)}
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(field)}
                          className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeField ? 'Edit Custom Field' : 'Add Custom Field'}</DialogTitle>
            <DialogDescription>
              Define the data type and validation rules for this custom attribute.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Display Label</Label>
                <Input
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Annual Revenue"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Identifier Key</Label>
                <Input
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="annual_revenue"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Field Data Type</Label>
              <Select value={formType} onValueChange={(val) => setFormType(val as CustomFieldType)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.type} value={t.type}>
                      <span className="flex items-center gap-2">
                        <t.icon className="size-3.5 text-muted-foreground" />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formType === 'dropdown' || formType === 'multiselect') && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                <Label className="text-xs font-semibold">Select Options</Label>
                <div className="flex gap-2">
                  <Input
                    value={newOptionInput}
                    onChange={(e) => setNewOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                    placeholder="Add option and press Enter"
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={addOption}
                    className="h-8 px-2 text-xs"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formOptions.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic">
                      No options added yet.
                    </p>
                  ) : (
                    formOptions.map((opt) => (
                      <span
                        key={opt}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border text-xs"
                      >
                        {opt}
                        <button
                          type="button"
                          onClick={() => removeOption(opt)}
                          className="hover:text-rose-500"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border/50">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formRequired}
                  onChange={(e) => setFormRequired(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="font-medium">Mandatory / Required Field</span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!formName.trim() || !formKey.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {activeField ? 'Save Changes' : 'Create Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Custom Field</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{fieldToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
