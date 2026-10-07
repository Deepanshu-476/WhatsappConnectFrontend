'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SelectSetting } from '../select-setting';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import type { AudienceSettings } from '@/types/campaign-settings';

interface AudienceSectionProps {
  settings: AudienceSettings;
  onChange: (updated: Partial<AudienceSettings>) => void;
  disabled?: boolean;
}

export function AudienceSection({ settings, onChange, disabled }: AudienceSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Default Contact Selection & Filtering"
        description="Configure standard target audience criteria for newly drafted marketing campaigns."
      >
        <SelectSetting
          label="Default Audience Source"
          description="Source segment automatically pre-selected when opening campaign creation."
          value={settings.defaultSelection}
          onChange={(val) => onChange({ defaultSelection: val as AudienceSettings['defaultSelection'] })}
          options={[
            { label: 'All Contacts', value: 'all', description: 'Every active CRM contact in the account' },
            { label: 'Selected Contacts', value: 'selected', description: 'Manually chosen individual contacts' },
            { label: 'Contact List', value: 'list', description: 'Pre-curated contact distribution lists' },
            { label: 'Saved Segment', value: 'segment', description: 'Dynamic filtered segment queries' },
            { label: 'Tags', value: 'tags', description: 'Contacts carrying specific tags (e.g. VIP, Hot Lead)' },
            { label: 'Lead Status', value: 'lead_status', description: 'Pipeline stage (e.g. Qualified, Proposal Sent)' },
            { label: 'Custom Field', value: 'custom_field', description: 'Custom attributes matching criteria' },
          ]}
          disabled={disabled}
        />

        <SelectSetting
          label="Default Multiple-Condition Operator"
          description="How multiple filters are combined when configuring audience criteria."
          value={settings.logicOperator}
          onChange={(val) => onChange({ logicOperator: val as 'AND' | 'OR' })}
          options={[
            { label: 'Match ALL filters (AND)', value: 'AND', description: 'Tag = VIP AND Status = Qualified' },
            { label: 'Match ANY filter (OR)', value: 'OR', description: 'Tag = VIP OR Status = Premium' },
          ]}
          disabled={disabled}
        />
      </SettingsCard>

      <SettingsCard
        title="Pre-Launch Audience Validation & Sanitization"
        description="Automated hygiene audits performed on campaign contact lists prior to queue initiation."
      >
        <ToggleSetting
          label="Enable Pre-Launch Audience Validation"
          description="Scans contact records for valid E.164 phone formats, duplicate numbers, and opt-out history."
          checked={settings.preValidationEnabled}
          onChange={(val) => onChange({ preValidationEnabled: val })}
          disabled={disabled}
          badge={<Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">Active</Badge>}
        />

        <ToggleSetting
          label="Auto-Exclude Opted-Out Contacts"
          description="Automatically strips anyone in the opt-out registry who previously responded with STOP/UNSUBSCRIBE."
          checked={settings.excludeOptedOut}
          onChange={(val) => onChange({ excludeOptedOut: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="De-Duplicate Mobile Numbers"
          description="If multiple contact records share the same mobile number, message is sent only once to prevent spam."
          checked={settings.excludeDuplicates}
          onChange={(val) => onChange({ excludeDuplicates: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Filter Invalid Phone Numbers"
          description="Eliminates malformed numbers missing country prefixes or with incorrect digit counts."
          checked={settings.excludeInvalidPhones}
          onChange={(val) => onChange({ excludeInvalidPhones: val })}
          disabled={disabled}
        />

        {/* Validation Preview Card */}
        <div className="mt-4 p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Audience Sanitization Preview Example
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">Sample 1,250 Contacts</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-card border border-border/40">
              <p className="text-[11px] text-muted-foreground">Total Contacts</p>
              <p className="text-base font-bold text-foreground">1,250</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Eligible (94.4%)</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">1,180</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-[11px] text-amber-600 dark:text-amber-400">Opted Out</p>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400">40</p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <p className="text-[11px] text-rose-600 dark:text-rose-400">Invalid Number</p>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400">20</p>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-[11px] text-purple-600 dark:text-purple-400">Duplicates</p>
              <p className="text-base font-bold text-purple-600 dark:text-purple-400">10</p>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
