'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

export interface StatusItem {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
  isSystem?: boolean;
  isWon?: boolean;
  isLost?: boolean;
}

const PRESET_COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
  '#64748b', // slate
];

interface StatusManagerProps {
  title: string;
  description?: string;
  items: StatusItem[];
  onChange: (items: StatusItem[]) => void;
  allowWonLost?: boolean;
  readOnly?: boolean;
}

export function StatusManager({
  title,
  description,
  items,
  onChange,
  allowWonLost = false,
  readOnly = false,
}: StatusManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<StatusItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StatusItem | null>(null);

  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(PRESET_COLORS[0]);
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formIsWon, setFormIsWon] = useState(false);
  const [formIsLost, setFormIsLost] = useState(false);

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  function openCreate() {
    setActiveItem(null);
    setFormName('');
    setFormColor(PRESET_COLORS[0]);
    setFormIsDefault(false);
    setFormIsWon(false);
    setFormIsLost(false);
    setModalOpen(true);
  }

  function openEdit(item: StatusItem) {
    setActiveItem(item);
    setFormName(item.name);
    setFormColor(item.color || PRESET_COLORS[0]);
    setFormIsDefault(Boolean(item.isDefault));
    setFormIsWon(Boolean(item.isWon));
    setFormIsLost(Boolean(item.isLost));
    setModalOpen(true);
  }

  function handleSave() {
    if (!formName.trim()) return;

    let updated: StatusItem[];
    if (activeItem) {
      // Editing
      updated = items.map((it) => {
        if (it.id === activeItem.id) {
          return {
            ...it,
            name: formName.trim(),
            color: formColor,
            isDefault: formIsDefault,
            ...(allowWonLost ? { isWon: formIsWon, isLost: formIsLost } : {}),
          };
        }
        if (formIsDefault) {
          return { ...it, isDefault: false };
        }
        return it;
      });
    } else {
      // Creating
      const newId = formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const newItem: StatusItem = {
        id: `${newId}_${Date.now()}`,
        name: formName.trim(),
        color: formColor,
        order: items.length,
        isDefault: formIsDefault,
        ...(allowWonLost ? { isWon: formIsWon, isLost: formIsLost } : {}),
      };
      if (formIsDefault) {
        updated = [...items.map((it) => ({ ...it, isDefault: false })), newItem];
      } else {
        updated = [...items, newItem];
      }
    }

    onChange(updated);
    setModalOpen(false);
  }

  function confirmDelete(item: StatusItem) {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  }

  function handleDelete() {
    if (!itemToDelete) return;
    const updated = items
      .filter((it) => it.id !== itemToDelete.id)
      .map((it, idx) => ({ ...it, order: idx }));
    onChange(updated);
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sortedItems.length) return;

    const copy = [...sortedItems];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    const reordered = copy.map((it, idx) => ({ ...it, order: idx }));
    onChange(reordered);
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
            Add Status
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden bg-card/40">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-12 text-center text-xs">#</TableHead>
              <TableHead className="text-xs">Status Name</TableHead>
              <TableHead className="text-xs">Color Swatch</TableHead>
              <TableHead className="text-xs">Attributes</TableHead>
              {!readOnly && <TableHead className="w-28 text-right text-xs">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                  No statuses defined. Click &quot;Add Status&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item, idx) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="text-center text-xs font-mono text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border border-border/40"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.color}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.isDefault && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          Default
                        </Badge>
                      )}
                      {item.isWon && (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] py-0 px-1.5">
                          Won
                        </Badge>
                      )}
                      {item.isLost && (
                        <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/30 text-[10px] py-0 px-1.5">
                          Lost
                        </Badge>
                      )}
                      {item.isSystem && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                          System
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, 'up')}
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Move Up"
                        >
                          <ChevronUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === sortedItems.length - 1}
                          onClick={() => moveItem(idx, 'down')}
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Move Down"
                        >
                          <ChevronDown className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(item)}
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(item)}
                          disabled={item.isSystem}
                          className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 disabled:opacity-30"
                          title={item.isSystem ? 'Cannot delete system status' : 'Delete'}
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

      {/* Create / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeItem ? 'Edit Status' : 'Create Status'}</DialogTitle>
            <DialogDescription>
              Configure the display name, color indicator, and default behavior.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Status Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. In Review"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status Color</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormColor(color)}
                    className="size-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: formColor === color ? 'var(--foreground)' : 'transparent',
                    }}
                  >
                    {formColor === color && <Check className="size-3.5 text-white" />}
                  </button>
                ))}
                <Input
                  type="text"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="h-7 w-24 text-xs font-mono ml-2"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="font-medium">Set as Default Status</span>
              </label>

              {allowWonLost && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formIsWon}
                      onChange={(e) => {
                        setFormIsWon(e.target.checked);
                        if (e.target.checked) setFormIsLost(false);
                      }}
                      className="rounded border-border text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      Marks Deal / Lead as Won
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formIsLost}
                      onChange={(e) => {
                        setFormIsLost(e.target.checked);
                        if (e.target.checked) setFormIsWon(false);
                      }}
                      className="rounded border-border text-rose-500 focus:ring-rose-500"
                    />
                    <span className="font-medium text-rose-600 dark:text-rose-400">
                      Marks Deal / Lead as Lost
                    </span>
                  </label>
                </>
              )}
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
              disabled={!formName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {activeItem ? 'Update Status' : 'Create Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{itemToDelete?.name}&quot;? Existing records will keep their historical record.
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
