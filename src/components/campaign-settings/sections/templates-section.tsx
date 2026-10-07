'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import type { TemplateSettings } from '@/types/campaign-settings';

interface TemplatesSectionProps {
  settings: TemplateSettings;
  onChange: (updated: Partial<TemplateSettings>) => void;
  disabled?: boolean;
}

export function TemplatesSection({ settings, onChange, disabled }: TemplatesSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="WhatsApp Template Verification"
        description="Enforce Meta WhatsApp Business Account compliance before campaign dispatches are permitted."
      >
        <ToggleSetting
          label="Require Meta-Approved Templates Only"
          description="Prevents launching any campaign configured with draft, rejected, or pending Meta templates."
          checked={settings.requireApprovedOnly}
          onChange={(val) => onChange({ requireApprovedOnly: val })}
          disabled={disabled}
          badge={<Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">Meta Enforced</Badge>}
        />

        <ToggleSetting
          label="Block Campaign Launch on Missing Variables"
          description="If any template parameter (e.g. {{1}}, {{2}}) is unmapped or a contact record lacks the required property, campaign launch is halted."
          checked={settings.blockOnMissingVariables}
          onChange={(val) => onChange({ blockOnMissingVariables: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Auto-Map Standard CRM Variables"
          description="Automatically pairs {{1}} with Contact First Name, {{2}} with Company, and {{3}} with Phone if variable names match."
          checked={settings.autoMapVariables}
          onChange={(val) => onChange({ autoMapVariables: val })}
          disabled={disabled}
        />
      </SettingsCard>

      <SettingsCard
        title="Default Fallback Values for Missing Attributes"
        description="Safe substitute strings used if a contact record lacks specific variable values during dispatch."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingRow
            label="Fallback for First Name ({{1}})"
            description="Used when contact does not have a registered name."
            disabled={disabled}
          >
            <Input
              value={settings.variableFallbacks?.first_name || 'Customer'}
              onChange={(e) =>
                onChange({
                  variableFallbacks: {
                    ...settings.variableFallbacks,
                    first_name: e.target.value,
                  },
                })
              }
              placeholder="Customer"
              disabled={disabled}
              className="w-36 text-xs"
            />
          </SettingRow>

          <SettingRow
            label="Fallback for Company ({{2}})"
            description="Used when company name is empty."
            disabled={disabled}
          >
            <Input
              value={settings.variableFallbacks?.company || 'our valued partner'}
              onChange={(e) =>
                onChange({
                  variableFallbacks: {
                    ...settings.variableFallbacks,
                    company: e.target.value,
                  },
                })
              }
              placeholder="our valued partner"
              disabled={disabled}
              className="w-40 text-xs"
            />
          </SettingRow>
        </div>

        {/* Live Mapping Preview Card */}
        <div className="mt-4 p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" />
              Dynamic Parameter Mapping Example
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
              Approved Template
            </Badge>
          </div>

          <div className="p-3 rounded-lg bg-card border border-border/40 text-xs font-mono space-y-1">
            <p className="text-muted-foreground">Template string:</p>
            <p className="text-foreground">&ldquo;Hello &#123;&#123;1&#125;&#125;, your order &#123;&#123;2&#125;&#125; has been packed and scheduled for dispatch!&rdquo;</p>
            <div className="flex flex-wrap gap-2 pt-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                &#123;&#123;1&#125;&#125; &rarr; Contact.firstName (Fallback: {settings.variableFallbacks?.first_name || 'Customer'})
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                &#123;&#123;2&#125;&#125; &rarr; Order.orderNumber
              </span>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
