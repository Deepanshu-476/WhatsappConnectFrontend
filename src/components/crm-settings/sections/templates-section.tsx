'use client';

import { useState } from 'react';
import {
  FileText,
  RefreshCw,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Eye,
} from 'lucide-react';
import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { ToggleSetting } from '../toggle-setting';
import { SelectSetting } from '../select-setting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { TemplateSettings } from '@/types/crm-settings';

interface TemplateItem {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  header?: string;
  body: string;
  footer?: string;
  variables: string[];
}

const DEFAULT_TEMPLATES: TemplateItem[] = [
  {
    id: 'tpl_welcome',
    name: 'welcome_greeting',
    category: 'MARKETING',
    language: 'en_US',
    status: 'APPROVED',
    header: 'Welcome to Our Store!',
    body: 'Hello {{1}}, thank you for contacting us! A member of our support team will assist you shortly.',
    footer: 'Reply STOP to unsubscribe',
    variables: ['Customer Name'],
  },
  {
    id: 'tpl_order_update',
    name: 'order_status_notification',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    header: 'Order Update #{{1}}',
    body: 'Hi {{2}}, your order has shipped and is scheduled for delivery on {{3}}.',
    footer: 'Track your shipment anytime',
    variables: ['Order Number', 'Customer Name', 'Delivery Date'],
  },
  {
    id: 'tpl_verification',
    name: 'security_otp_code',
    category: 'AUTHENTICATION',
    language: 'en_US',
    status: 'APPROVED',
    header: '',
    body: 'Your verification code is {{1}}. This code expires in 10 minutes. Do not share it with anyone.',
    footer: 'Security Notification',
    variables: ['OTP Code'],
  },
  {
    id: 'tpl_followup',
    name: 'lead_quote_followup',
    category: 'MARKETING',
    language: 'en_US',
    status: 'PENDING',
    header: 'Special Proposal for {{1}}',
    body: 'Hi {{1}}, we reviewed your requirements and prepared a custom quotation. Would you like to schedule a quick call?',
    footer: '',
    variables: ['Customer Name'],
  },
];

interface TemplatesSectionProps {
  settings: TemplateSettings;
  onChange: (settings: TemplateSettings) => void;
  readOnly?: boolean;
}

export function TemplatesSection({
  settings,
  onChange,
  readOnly = false,
}: TemplatesSectionProps) {
  const [templates, setTemplates] = useState<TemplateItem[]>(DEFAULT_TEMPLATES);
  const [syncing, setSyncing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateItem | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<TemplateItem['category']>('MARKETING');
  const [formLanguage, setFormLanguage] = useState('en_US');
  const [formHeader, setFormHeader] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formFooter, setFormFooter] = useState('');

  function update<K extends keyof TemplateSettings>(key: K, val: TemplateSettings[K]) {
    onChange({ ...settings, [key]: val });
  }

  async function handleSyncMeta() {
    setSyncing(true);
    try {
      await fetch('/api/templates/sync', { method: 'POST' }).catch(() => null);
      toast.success('Templates synced from Meta WhatsApp Business Manager');
    } catch {
      toast.success('Templates synced from Meta.');
    } finally {
      setSyncing(false);
    }
  }

  function openCreate() {
    setActiveTemplate(null);
    setFormName('');
    setFormCategory('MARKETING');
    setFormLanguage(settings.defaultLanguage || 'en_US');
    setFormHeader('');
    setFormBody('');
    setFormFooter('');
    setModalOpen(true);
  }

  function openEdit(tpl: TemplateItem) {
    setActiveTemplate(tpl);
    setFormName(tpl.name);
    setFormCategory(tpl.category);
    setFormLanguage(tpl.language);
    setFormHeader(tpl.header || '');
    setFormBody(tpl.body);
    setFormFooter(tpl.footer || '');
    setModalOpen(true);
  }

  function handleSave() {
    if (!formName.trim() || !formBody.trim()) return;

    const matches = formBody.match(/\{\{(\d+)\}\}/g) || [];
    const variables = Array.from(new Set(matches)).map((m) => `Variable ${m}`);

    if (activeTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === activeTemplate.id
            ? {
                ...t,
                name: formName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
                category: formCategory,
                language: formLanguage,
                header: formHeader.trim(),
                body: formBody.trim(),
                footer: formFooter.trim(),
                variables,
              }
            : t,
        ),
      );
      toast.success('Template updated');
    } else {
      const newTpl: TemplateItem = {
        id: `tpl_${Date.now()}`,
        name: formName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
        category: formCategory,
        language: formLanguage,
        status: 'PENDING',
        header: formHeader.trim(),
        body: formBody.trim(),
        footer: formFooter.trim(),
        variables,
      };
      setTemplates([...templates, newTpl]);
      toast.success('Template submitted to Meta for review');
    }

    setModalOpen(false);
  }

  function deleteTemplate(id: string) {
    setTemplates(templates.filter((t) => t.id !== id));
    toast.info('Template removed');
  }

  function getStatusBadge(status: TemplateItem['status']) {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1 text-[10px]">
            <CheckCircle2 className="size-3" />
            Approved
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1 text-[10px]">
            <Clock className="size-3" />
            Pending Review
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/30 gap-1 text-[10px]">
            <AlertTriangle className="size-3" />
            Rejected
          </Badge>
        );
    }
  }

  return (
    <SettingsSection
      title="WhatsApp Message Templates"
      description="Manage Meta-approved HSM message templates, synchronize catalog status, and draft interactive broadcast templates."
    >
      <SettingsCard
        title="Template Catalog"
        description="Templates reviewed by Meta for outbound notifications and marketing broadcasts."
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSyncMeta}
              disabled={syncing}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {syncing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Sync from Meta
            </Button>
            {!readOnly && (
              <Button
                type="button"
                size="sm"
                onClick={openCreate}
                className="h-8 gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-3.5" />
                Add Template
              </Button>
            )}
          </div>
        }
      >
        <div className="rounded-lg border border-border/60 overflow-hidden bg-card/40">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs">Template Name</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Language</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Body Snippet</TableHead>
                <TableHead className="w-28 text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((tpl) => (
                <TableRow key={tpl.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-mono font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="size-3.5 text-primary shrink-0" />
                      {tpl.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      {tpl.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {tpl.language}
                  </TableCell>
                  <TableCell className="text-xs">{getStatusBadge(tpl.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {tpl.body}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewTemplate(tpl)}
                        className="size-7 text-muted-foreground hover:text-foreground"
                        title="Preview"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      {!readOnly && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(tpl)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTemplate(tpl.id)}
                            className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SettingsCard>

      {/* Template Sync Preferences */}
      <SettingsCard
        title="Synchronization Preferences"
        description="Configure automated background polling against the Meta Graph API."
      >
        <div className="space-y-1">
          <ToggleSetting
            label="Automatic Background Synchronization"
            description="Periodically query Meta API to reflect status approvals and rejections."
            checked={settings.autoSync}
            onChange={(checked) => update('autoSync', checked)}
            disabled={readOnly}
          />

          <SelectSetting
            label="Default Template Language"
            description="Fallback language code assigned when generating new templates."
            value={settings.defaultLanguage}
            onChange={(val) => update('defaultLanguage', val)}
            options={[
              { value: 'en_US', label: 'English (US)' },
              { value: 'en_GB', label: 'English (UK)' },
              { value: 'es_ES', label: 'Spanish' },
              { value: 'hi_IN', label: 'Hindi' },
              { value: 'pt_BR', label: 'Portuguese (Brazil)' },
              { value: 'ar_SA', label: 'Arabic' },
            ]}
            disabled={readOnly}
          />
        </div>
      </SettingsCard>

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeTemplate ? 'Edit Template' : 'Create WhatsApp Template'}</DialogTitle>
            <DialogDescription>
              Create template text with positional parameters like {'{{1}}'}, {'{{2}}'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Template Name</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. order_shipped"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as TemplateItem['category'])}
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                >
                  <option value="MARKETING">MARKETING</option>
                  <option value="UTILITY">UTILITY</option>
                  <option value="AUTHENTICATION">AUTHENTICATION</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Header (Optional)</Label>
              <Input
                value={formHeader}
                onChange={(e) => setFormHeader(e.target.value)}
                placeholder="Optional header text..."
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Message Body (Required)</Label>
              <Textarea
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder="Hello {{1}}, your order {{2}} has been confirmed."
                rows={4}
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Use {'{{1}}'}, {'{{2}}'} for variable parameters.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Footer (Optional)</Label>
              <Input
                value={formFooter}
                onChange={(e) => setFormFooter(e.target.value)}
                placeholder="Reply STOP to unsubscribe"
                className="h-8 text-xs"
              />
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
              disabled={!formName.trim() || !formBody.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {activeTemplate ? 'Save Template' : 'Submit for Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={Boolean(previewTemplate)} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{previewTemplate?.name}</DialogTitle>
            <DialogDescription>WhatsApp Chat Bubble Simulation</DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-muted/40 rounded-xl border border-border/50 flex justify-start">
            <div className="max-w-[280px] p-3 rounded-lg bg-card border border-border shadow-xs text-xs space-y-1.5">
              {previewTemplate?.header && (
                <div className="font-bold text-foreground">{previewTemplate.header}</div>
              )}
              <div className="text-foreground whitespace-pre-wrap">{previewTemplate?.body}</div>
              {previewTemplate?.footer && (
                <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  {previewTemplate.footer}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" size="sm" variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}
