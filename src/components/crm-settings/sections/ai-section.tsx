'use client';

import { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Workflow,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { ToggleSetting } from '../toggle-setting';
import { SelectSetting } from '../select-setting';
import { SettingRow } from '../setting-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { AiSettings, KnowledgeSource, AutomationRule } from '@/types/crm-settings';

interface AiSectionProps {
  settings: AiSettings;
  onChange: (settings: AiSettings) => void;
  readOnly?: boolean;
}

export function AiSection({
  settings,
  onChange,
  readOnly = false,
}: AiSectionProps) {
  const [editingKey, setEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Knowledge base state
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');

  // Automation rule state
  const [autoModalOpen, setAutoModalOpen] = useState(false);
  const [autoName, setAutoName] = useState('');
  const [autoTrigger, setAutoTrigger] = useState('New WhatsApp message');
  const [autoCondition, setAutoCondition] = useState("Customer is tagged 'VIP'");
  const [autoAction, setAutoAction] = useState('Assign to Sales Team');

  function update<K extends keyof AiSettings>(key: K, val: AiSettings[K]) {
    onChange({ ...settings, [key]: val });
  }

  function handleSaveKey() {
    if (!tempKey.trim()) return;
    update('apiKey', tempKey.trim());
    update('hasApiKey', true);
    setEditingKey(false);
    setTempKey('');
    toast.success('OpenAI API key updated');
  }

  function handleClearKey() {
    update('apiKey', '');
    update('hasApiKey', false);
    setEditingKey(false);
    setTempKey('');
    toast.info('API key cleared');
  }

  function addKnowledgeSource() {
    if (!kbTitle.trim() || !kbContent.trim()) return;
    const newDoc: KnowledgeSource = {
      id: `kb_${Date.now()}`,
      title: kbTitle.trim(),
      content: kbContent.trim(),
      type: 'text',
      enabled: true,
      lastIndexed: new Date().toISOString(),
    };
    update('knowledgeSources', [...settings.knowledgeSources, newDoc]);
    setKbTitle('');
    setKbContent('');
    setKbModalOpen(false);
    toast.success('Document added to Knowledge Base');
  }

  function toggleKnowledge(id: string, enabled: boolean) {
    update(
      'knowledgeSources',
      settings.knowledgeSources.map((kb) => (kb.id === id ? { ...kb, enabled } : kb)),
    );
  }

  function deleteKnowledge(id: string) {
    update(
      'knowledgeSources',
      settings.knowledgeSources.filter((kb) => kb.id !== id),
    );
    toast.info('Knowledge source removed');
  }

  function addAutomation() {
    if (!autoName.trim()) return;
    const newRule: AutomationRule = {
      id: `rule_${Date.now()}`,
      name: autoName.trim(),
      trigger: autoTrigger,
      condition: autoCondition,
      action: autoAction,
      enabled: true,
    };
    update('automations', [...settings.automations, newRule]);
    setAutoName('');
    setAutoModalOpen(false);
    toast.success('Automation rule created');
  }

  function toggleAutomation(id: string, enabled: boolean) {
    update(
      'automations',
      settings.automations.map((r) => (r.id === id ? { ...r, enabled } : r)),
    );
  }

  function deleteAutomation(id: string) {
    update(
      'automations',
      settings.automations.filter((r) => r.id !== id),
    );
    toast.info('Automation rule deleted');
  }

  return (
    <SettingsSection
      title="AI & Automation"
      description="Supercharge your CRM with OpenAI generative intelligence, domain knowledge grounding, and trigger-based workflows."
    >
      {/* 1. Core AI Configuration */}
      <SettingsCard
        title="OpenAI Assistant Configuration"
        description="Connect your OpenAI API key to unlock automated suggestions and drafts."
        badge={
          settings.enabled ? (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-[10px]">
              Disabled
            </Badge>
          )
        }
      >
        <div className="space-y-3">
          <ToggleSetting
            label="Enable AI Assistant"
            description="When enabled, agents can invoke GPT assistance and automated replies."
            checked={settings.enabled}
            onChange={(checked) => update('enabled', checked)}
            disabled={readOnly}
          />

          {/* Secure API Key display */}
          <SettingRow
            label="OpenAI API Key"
            description="Stored securely. Secrets are never exposed in plaintext."
            disabled={readOnly}
          >
            {editingKey ? (
              <div className="flex items-center gap-2">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-48 sm:w-60 h-8 text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowKey(!showKey)}
                  className="size-8"
                >
                  {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveKey}
                  className="h-8 px-2.5 text-xs bg-primary text-primary-foreground"
                >
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingKey(false)}
                  className="h-8 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-muted/50 border border-border/50 text-foreground">
                  {settings.apiKey || (settings.hasApiKey ? 'sk-••••••••••••••••••••' : 'Not Configured')}
                </span>
                {!readOnly && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingKey(true);
                        setTempKey('');
                      }}
                      className="h-8 text-xs"
                    >
                      {settings.hasApiKey || settings.apiKey ? 'Change Key' : 'Add Key'}
                    </Button>
                    {(settings.hasApiKey || settings.apiKey) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearKey}
                        className="h-8 text-xs text-rose-500 hover:text-rose-600"
                      >
                        Clear
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </SettingRow>

          <SelectSetting
            label="Model Selection"
            description="The underlying OpenAI LLM used for replies and drafting."
            value={settings.model}
            onChange={(val) => update('model', val)}
            options={[
              { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cost Efficient)' },
              { value: 'gpt-4o', label: 'GPT-4o (High Intelligence)' },
              { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
            ]}
            disabled={readOnly || !settings.enabled}
          />

          <SettingRow
            label="Sampling Temperature"
            description="Controls reply creativity (0.0 = deterministic, 1.0 = creative)."
            disabled={readOnly || !settings.enabled}
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.temperature}
                onChange={(e) => update('temperature', parseFloat(e.target.value))}
                className="w-28 accent-primary cursor-pointer"
                disabled={readOnly || !settings.enabled}
              />
              <span className="text-xs font-mono text-foreground w-8 text-right">
                {settings.temperature.toFixed(2)}
              </span>
            </div>
          </SettingRow>

          <SettingRow
            label="Max Tokens per Response"
            description="Upper ceiling on the number of generated response tokens."
            disabled={readOnly || !settings.enabled}
          >
            <Input
              type="number"
              min="50"
              max="2000"
              value={settings.maxResponseLength}
              onChange={(e) => update('maxResponseLength', parseInt(e.target.value, 10) || 500)}
              className="w-24 h-8 text-xs font-mono text-right"
              disabled={readOnly || !settings.enabled}
            />
          </SettingRow>

          <ToggleSetting
            label="Autonomous Auto-Reply"
            description="Generate and transmit answers to customers directly without operator review."
            checked={settings.autoReply}
            onChange={(checked) => update('autoReply', checked)}
            disabled={readOnly || !settings.enabled}
          />

          <ToggleSetting
            label="Human-in-the-Loop Approval Mode"
            description="Always queue drafts for human agent sign-off before transmission."
            checked={settings.approvalMode}
            onChange={(checked) => update('approvalMode', checked)}
            disabled={readOnly || !settings.enabled}
          />

          <div className="pt-2 pl-1 space-y-1.5">
            <Label className="text-xs font-medium">System Instructions Prompt</Label>
            <Textarea
              value={settings.systemPrompt}
              onChange={(e) => update('systemPrompt', e.target.value)}
              rows={3}
              className="text-xs"
              placeholder="Define agent personality and rules..."
              disabled={readOnly || !settings.enabled}
            />
          </div>
        </div>
      </SettingsCard>

      {/* 2. Knowledge Base */}
      <SettingsCard
        title="Knowledge Base & Grounding"
        description="Feed business documentation, FAQs, and pricing tables for accurate replies."
        action={
          !readOnly && (
            <Button
              type="button"
              size="sm"
              onClick={() => setKbModalOpen(true)}
              className="h-8 gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              Add Knowledge
            </Button>
          )
        }
      >
        <div className="space-y-3">
          {settings.knowledgeSources.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3 text-center">
              No knowledge documents registered. Click &quot;Add Knowledge&quot; to seed information.
            </p>
          ) : (
            settings.knowledgeSources.map((kb) => (
              <div
                key={kb.id}
                className="flex items-start justify-between p-3 rounded-lg border border-border/50 bg-card/60 gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate">
                      {kb.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {kb.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {kb.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={kb.enabled}
                    onCheckedChange={(checked) => toggleKnowledge(kb.id, checked)}
                    disabled={readOnly}
                    aria-label={`Toggle ${kb.title}`}
                  />
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteKnowledge(kb.id)}
                      className="size-7 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SettingsCard>

      {/* 3. Automation Rules (Trigger -> Condition -> Action) */}
      <SettingsCard
        title="Event Automations (Trigger → Condition → Action)"
        description="Automate repetitive CRM tasks based on inbound WhatsApp event patterns."
        action={
          !readOnly && (
            <Button
              type="button"
              size="sm"
              onClick={() => setAutoModalOpen(true)}
              className="h-8 gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              Create Rule
            </Button>
          )
        }
      >
        <div className="space-y-3">
          {settings.automations.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3 text-center">
              No automation rules defined. Click &quot;Create Rule&quot; to build one.
            </p>
          ) : (
            settings.automations.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-lg border border-border/50 bg-card/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Workflow className="size-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {rule.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => toggleAutomation(rule.id, checked)}
                      disabled={readOnly}
                    />
                    {!readOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAutomation(rule.id)}
                        className="size-7 text-muted-foreground hover:text-rose-500"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40 font-mono text-[11px]">
                    {rule.trigger}
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[11px]">
                    If {rule.condition}
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[11px]">
                    Then {rule.action}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </SettingsCard>

      {/* Add Knowledge Modal */}
      <Dialog open={kbModalOpen} onOpenChange={setKbModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Knowledge Source</DialogTitle>
            <DialogDescription>
              Supply textual excerpts, product manuals, or FAQs for LLM contextual awareness.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Document Title</Label>
              <Input
                value={kbTitle}
                onChange={(e) => setKbTitle(e.target.value)}
                placeholder="e.g. Return Policy 2026"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Knowledge Content</Label>
              <Textarea
                value={kbContent}
                onChange={(e) => setKbContent(e.target.value)}
                placeholder="Paste relevant knowledge text here..."
                rows={5}
                className="text-xs font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setKbModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={addKnowledgeSource}
              disabled={!kbTitle.trim() || !kbContent.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Automation Modal */}
      <Dialog open={autoModalOpen} onOpenChange={setAutoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
            <DialogDescription>
              Chain a Trigger, Condition, and Action to execute automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Rule Name</Label>
              <Input
                value={autoName}
                onChange={(e) => setAutoName(e.target.value)}
                placeholder="e.g. Route VIPs to Sales"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Trigger Event</Label>
              <select
                value={autoTrigger}
                onChange={(e) => setAutoTrigger(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="New WhatsApp message">New WhatsApp message</option>
                <option value="New Lead created">New Lead created</option>
                <option value="Conversation marked resolved">Conversation marked resolved</option>
                <option value="Contact tagged">Contact tagged</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Condition</Label>
              <Input
                value={autoCondition}
                onChange={(e) => setAutoCondition(e.target.value)}
                placeholder="e.g. Customer has label 'VIP'"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Action to Perform</Label>
              <Input
                value={autoAction}
                onChange={(e) => setAutoAction(e.target.value)}
                placeholder="e.g. Assign to Senior Sales Team"
                className="h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setAutoModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={addAutomation}
              disabled={!autoName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}
