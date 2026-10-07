'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export interface LabelItem {
  id: string;
  name: string;
  color: string;
  description?: string;
  order?: number;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
];

interface TagManagerProps {
  title: string;
  description?: string;
  items: LabelItem[];
  onChange: (items: LabelItem[]) => void;
  readOnly?: boolean;
}

export function TagManager({
  title,
  description,
  items,
  onChange,
  readOnly = false,
}: TagManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<LabelItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<LabelItem | null>(null);

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState(PRESET_COLORS[0]);

  function openCreate() {
    setActiveItem(null);
    setFormName('');
    setFormDesc('');
    setFormColor(PRESET_COLORS[0]);
    setModalOpen(true);
  }

  function openEdit(item: LabelItem) {
    setActiveItem(item);
    setFormName(item.name);
    setFormDesc(item.description || '');
    setFormColor(item.color || PRESET_COLORS[0]);
    setModalOpen(true);
  }

  function handleSave() {
    if (!formName.trim()) return;

    let updated: LabelItem[];
    if (activeItem) {
      updated = items.map((it) =>
        it.id === activeItem.id
          ? {
              ...it,
              name: formName.trim(),
              description: formDesc.trim(),
              color: formColor,
            }
          : it,
      );
    } else {
      const newId = formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const newItem: LabelItem = {
        id: `${newId}_${Date.now()}`,
        name: formName.trim(),
        description: formDesc.trim(),
        color: formColor,
        order: items.length,
      };
      updated = [...items, newItem];
    }

    onChange(updated);
    setModalOpen(false);
  }

  function confirmDelete(item: LabelItem) {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  }

  function handleDelete() {
    if (!itemToDelete) return;
    const updated = items.filter((it) => it.id !== itemToDelete.id);
    onChange(updated);
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
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
            + Create New
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden bg-card/40">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-16 text-center text-xs">S.No.</TableHead>
              <TableHead className="text-xs">Label Name</TableHead>
              <TableHead className="text-xs">Content / Description</TableHead>
              <TableHead className="text-xs">Label Color</TableHead>
              {!readOnly && <TableHead className="w-24 text-right text-xs">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                  No labels found. Click &quot;+ Create New&quot; to add one.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, idx) => (
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
                  <TableCell className="text-xs text-muted-foreground">
                    {item.description || '—'}
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        borderColor: `${item.color}30`,
                      }}
                    >
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.color}
                    </span>
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
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

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeItem ? 'Edit Label' : 'Create New Label'}</DialogTitle>
            <DialogDescription>
              Labels help agents quickly filter and categorize conversations and contacts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Label Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. VIP Customer"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description (Optional)</Label>
              <Input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="e.g. High priority accounts"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Label Color</Label>
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
              {activeItem ? 'Save Changes' : 'Create Label'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Label</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{itemToDelete?.name}&quot;?
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
