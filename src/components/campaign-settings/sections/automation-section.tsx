'use client';

import { useState } from 'react';
import { SettingsCard } from '../settings-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Cpu, Plus, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { AutomationSettings, AutomationRule } from '@/types/campaign-settings';

interface AutomationSectionProps {
  settings: AutomationSettings;
  onChange: (updated: Partial<AutomationSettings>) => void;
  disabled?: boolean;
}

export function AutomationSection({ settings, onChange, disabled }: AutomationSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newTrigger, setNewTrigger] = useState<AutomationRule['trigger']>('campaign_completed');
  const [newMetric, setNewMetric] = useState('delivery_rate');
  const [newOperator, setNewOperator] = useState<'gt' | 'lt' | 'eq'>('gt');
  const [newValue, setNewValue] = useState<string | number>('80');
  const [newActionType, setNewActionType] = useState<AutomationRule['action']['type']>('add_tag');
  const [newTarget, setNewTarget] = useState('Campaign-Success');

  const automations = settings.automations || [];

  const handleToggle = (id: string, enabled: boolean) => {
    const updated = automations.map((a) => (a.id === id ? { ...a, enabled } : a));
    onChange({ automations: updated });
  };

  const handleDelete = (id: string) => {
    const updated = automations.filter((a) => a.id !== id);
    onChange({ automations: updated });
    toast.success('Automation rule removed');
  };

  const handleCreate = () => {
    if (!newRuleName.trim()) {
      toast.error('Please specify a rule name');
      return;
    }

    const newRule: AutomationRule = {
      id: `auto_${Date.now()}`,
      name: newRuleName.trim(),
      trigger: newTrigger,
      condition: {
        metric: newMetric,
        operator: newOperator,
        value: isNaN(Number(newValue)) ? newValue : Number(newValue),
      },
      action: {
        type: newActionType,
        target: newTarget.trim(),
      },
      enabled: true,
    };

    onChange({ automations: [...automations, newRule] });
    setModalOpen(false);
    setNewRuleName('');
    toast.success('Automation rule created');
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Event-Driven Campaign Automations"
        description="Automate post-campaign actions, contact tagging, and team assignments based on delivery or reply performance."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setModalOpen(true)}
            disabled={disabled}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Automation Rule
          </Button>
        }
      >
        <div className="space-y-3">
          {automations.map((rule) => (
            <div
              key={rule.id}
              className="p-3.5 rounded-xl border border-border/50 bg-card hover:border-border transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{rule.name}</span>
                  <Badge variant={rule.enabled ? 'default' : 'secondary'} className="text-[10px] h-4">
                    {rule.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(val) => handleToggle(rule.id, val)}
                    disabled={disabled}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(rule.id)}
                    disabled={disabled}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Trigger -> Condition -> Action Pipeline */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  Trigger: {rule.trigger.replace(/_/g, ' ')}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Condition: {rule.condition.metric} {rule.condition.operator} {String(rule.condition.value)}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Action: {rule.action.type.replace(/_/g, ' ')} &rarr; &ldquo;{rule.action.target}&rdquo;
                </span>
              </div>
            </div>
          ))}

          {automations.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
              <Cpu className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-medium">No active automation workflows</p>
              <p className="text-[11px]">Click &ldquo;New Automation Rule&rdquo; above to set up automated actions.</p>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Create Rule Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create Campaign Automation</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure a trigger event, condition gate, and downstream CRM action.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-medium text-foreground">Rule Name</label>
              <Input
                placeholder="e.g. VIP Campaign Success Followup"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Trigger Event</label>
              <Select
                value={newTrigger}
                onValueChange={(val) => setNewTrigger(val as AutomationRule['trigger'])}
              >
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campaign_completed">Campaign Completed</SelectItem>
                  <SelectItem value="campaign_reply_received">First Reply Received</SelectItem>
                  <SelectItem value="campaign_failed">Campaign Execution Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium text-foreground">Condition Metric</label>
                <Input
                  value={newMetric}
                  onChange={(e) => setNewMetric(e.target.value)}
                  placeholder="delivery_rate"
                  className="mt-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Operator</label>
                <Select
                  value={newOperator}
                  onValueChange={(val) => val && setNewOperator(val as 'gt' | 'lt' | 'eq')}
                >
                  <SelectTrigger className="mt-1 text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gt">&gt; (Greater than)</SelectItem>
                    <SelectItem value="lt">&lt; (Less than)</SelectItem>
                    <SelectItem value="eq">= (Equals)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Threshold Value</label>
                <Input
                  value={String(newValue)}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="80"
                  className="mt-1 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Downstream Action</label>
              <Select
                value={newActionType}
                onValueChange={(val) => setNewActionType(val as AutomationRule['action']['type'])}
              >
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_tag">Add CRM Tag</SelectItem>
                  <SelectItem value="assign_team">Assign Team</SelectItem>
                  <SelectItem value="notify_admin">Notify Admin</SelectItem>
                  <SelectItem value="update_lead_status">Update Lead Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Target / Parameter</label>
              <Input
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="Campaign-Success"
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate}>
              Save Automation Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
