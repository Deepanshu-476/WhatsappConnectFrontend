'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SelectSetting } from '../select-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Moon } from 'lucide-react';
import type { QuietHoursSettings } from '@/types/campaign-settings';

interface QuietHoursSectionProps {
  settings: QuietHoursSettings;
  onChange: (updated: Partial<QuietHoursSettings>) => void;
  disabled?: boolean;
}

export function QuietHoursSection({ settings, onChange, disabled }: QuietHoursSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Quiet Hours Protection Window"
        description="Prevent marketing messages from disturbing customers during late evening and early morning hours."
        badge={
          <Badge
            variant={settings.enabled ? 'default' : 'secondary'}
            className={settings.enabled ? 'bg-amber-600 text-white' : ''}
          >
            {settings.enabled ? 'Active Window' : 'Disabled'}
          </Badge>
        }
      >
        <ToggleSetting
          label="Enforce Quiet Hours"
          description="Campaign worker halts or postpones dispatch when current local time falls inside the blackout period."
          checked={settings.enabled}
          onChange={(val) => onChange({ enabled: val })}
          disabled={disabled}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <SettingRow
            label="Blackout Start Time (Night)"
            description="Campaign worker stops sending at this time."
            disabled={disabled || !settings.enabled}
          >
            <Input
              type="time"
              value={settings.start}
              onChange={(e) => onChange({ start: e.target.value })}
              disabled={disabled || !settings.enabled}
              className="w-32 text-xs font-mono"
            />
          </SettingRow>

          <SettingRow
            label="Blackout End Time (Morning)"
            description="Outbound dispatches resume after this time."
            disabled={disabled || !settings.enabled}
          >
            <Input
              type="time"
              value={settings.end}
              onChange={(e) => onChange({ end: e.target.value })}
              disabled={disabled || !settings.enabled}
              className="w-32 text-xs font-mono"
            />
          </SettingRow>
        </div>

        <SelectSetting
          label="Worker Behavior on Quiet Hours Encounter"
          description="Action executed by the campaign engine if an active campaign enters quiet hours."
          value={settings.behavior}
          onChange={(val) => onChange({ behavior: val as 'pause' | 'delay' })}
          options={[
            {
              label: 'Pause Campaign',
              value: 'pause',
              description: 'Transitions campaign status to Paused; requires manual resumption or morning auto-trigger',
            },
            {
              label: 'Delay Until Allowed Time',
              value: 'delay',
              description: 'Keeps campaign Running in background and sleeps worker thread until quiet window ends',
            },
          ]}
          disabled={disabled || !settings.enabled}
        />

        {/* Informational banner */}
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
          <Moon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-amber-700 dark:text-amber-300">
              TRAI &amp; Meta Regulatory Compliance
            </p>
            <p className="text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
              In India and several international jurisdictions, sending non-critical promotional
              broadcasts between {settings.start} (9:00 PM) and {settings.end} (9:00 AM) violates
              telecom marketing regulations and can lead to immediate Meta quality demotion or number
              suspension.
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
