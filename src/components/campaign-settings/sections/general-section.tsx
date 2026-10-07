'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SelectSetting } from '../select-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { GeneralCampaignSettings } from '@/types/campaign-settings';

interface GeneralSectionProps {
  settings: GeneralCampaignSettings;
  onChange: (updated: Partial<GeneralCampaignSettings>) => void;
  disabled?: boolean;
}

export function GeneralSection({ settings, onChange, disabled }: GeneralSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="General Campaign Preferences"
        description="Configure default behaviors, naming conventions, and baseline constraints for new campaigns."
      >
        {/* Campaign Name Format */}
        <SettingRow
          label="Campaign Name Format"
          description="Template for automatically generated campaign names. Available placeholders: {{name}}, {{date}}, {{channel}}."
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Input
              value={settings.campaignNameFormat}
              onChange={(e) => onChange({ campaignNameFormat: e.target.value })}
              placeholder="{{name}} - {{date}}"
              disabled={disabled}
              className="w-64 text-xs font-mono"
            />
            <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">
              Preview: Diwali Offer - 2026-10-06
            </Badge>
          </div>
        </SettingRow>

        {/* Default Status */}
        <SelectSetting
          label="Default Initial Status"
          description="Status assigned when a campaign is initially created."
          value={settings.defaultStatus}
          onChange={(val) => onChange({ defaultStatus: val as 'draft' | 'scheduled' })}
          options={[
            { label: 'Draft', value: 'draft', description: 'Requires manual verification and launch' },
            { label: 'Scheduled', value: 'scheduled', description: 'Directly queues for schedule execution' },
          ]}
          disabled={disabled}
        />

        {/* Default Timezone */}
        <SelectSetting
          label="Default Timezone"
          description="Timezone used to calculate schedule windows, quiet hours, and recurring schedules."
          value={settings.defaultTimezone}
          onChange={(val) => onChange({ defaultTimezone: val })}
          options={[
            { label: 'Asia/Kolkata (IST +05:30)', value: 'Asia/Kolkata' },
            { label: 'Asia/Dubai (GST +04:00)', value: 'Asia/Dubai' },
            { label: 'Asia/Singapore (SGT +08:00)', value: 'Asia/Singapore' },
            { label: 'Europe/London (GMT/BST)', value: 'Europe/London' },
            { label: 'America/New_York (EST/EDT)', value: 'America/New_York' },
          ]}
          disabled={disabled}
        />

        {/* Default Country & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <SettingRow
            label="Default Country Code"
            description="Used for phone number normalization."
            disabled={disabled}
          >
            <Input
              value={settings.defaultCountry}
              onChange={(e) => onChange({ defaultCountry: e.target.value.toUpperCase() })}
              placeholder="IN"
              maxLength={2}
              disabled={disabled}
              className="w-24 text-xs font-mono uppercase"
            />
          </SettingRow>

          <SettingRow
            label="Default Template Language"
            description="Default language code for WhatsApp templates."
            disabled={disabled}
          >
            <Input
              value={settings.defaultLanguage}
              onChange={(e) => onChange({ defaultLanguage: e.target.value })}
              placeholder="en_US"
              disabled={disabled}
              className="w-32 text-xs font-mono"
            />
          </SettingRow>
        </div>

        {/* Campaign Expiration */}
        <SettingRow
          label="Campaign Expiration Horizon"
          description="Days after which completed or stale draft campaigns are archived."
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={365}
              value={settings.campaignExpirationDays}
              onChange={(e) => onChange({ campaignExpirationDays: parseInt(e.target.value, 10) || 30 })}
              disabled={disabled}
              className="w-24 text-xs"
            />
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </SettingRow>
      </SettingsCard>

      <SettingsCard
        title="Campaign Workflow & Lifecycle Guardrails"
        description="Control team editing, duplication, and cancellation permissions."
      >
        <ToggleSetting
          label="Allow Campaign Duplication"
          description="Allow team members to clone existing campaigns including variable mappings and audience criteria."
          checked={settings.allowCampaignDuplication}
          onChange={(val) => onChange({ allowCampaignDuplication: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Allow Editing After Scheduling"
          description="Permit audience and template changes on campaigns that are currently scheduled but have not started sending."
          checked={settings.allowEditAfterSchedule}
          onChange={(val) => onChange({ allowEditAfterSchedule: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Allow Campaign Cancellation"
          description="Permit authorized operators to stop in-progress campaigns with permanent cancel state."
          checked={settings.allowCancellation}
          onChange={(val) => onChange({ allowCancellation: val })}
          disabled={disabled}
        />
      </SettingsCard>
    </div>
  );
}
