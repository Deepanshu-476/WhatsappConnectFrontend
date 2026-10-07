'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SelectSetting } from '../select-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { SchedulingSettings } from '@/types/campaign-settings';

interface SchedulingSectionProps {
  settings: SchedulingSettings;
  onChange: (updated: Partial<SchedulingSettings>) => void;
  disabled?: boolean;
}

export function SchedulingSection({ settings, onChange, disabled }: SchedulingSectionProps) {
  const days = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 },
  ];

  const currentDays = settings.recurringOptions?.daysOfWeek || [1, 2, 3, 4, 5];

  const toggleDay = (dayVal: number) => {
    let nextDays: number[];
    if (currentDays.includes(dayVal)) {
      nextDays = currentDays.filter((d) => d !== dayVal);
    } else {
      nextDays = [...currentDays, dayVal].sort();
    }
    onChange({
      recurringOptions: {
        ...settings.recurringOptions,
        daysOfWeek: nextDays,
      },
    });
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Default Scheduling Options"
        description="Configure timing conventions and recurring cadences for scheduled promotional campaigns."
      >
        <SelectSetting
          label="Default Scheduling Mode"
          description="Standard option pre-selected when authoring a new campaign."
          value={settings.defaultScheduleType}
          onChange={(val) => onChange({ defaultScheduleType: val as SchedulingSettings['defaultScheduleType'] })}
          options={[
            { label: 'Send Immediately', value: 'now', description: 'Trigger launch as soon as confirmed' },
            { label: 'One-Time Scheduled', value: 'scheduled', description: 'Schedule for a precise future date and time' },
            { label: 'Recurring Sequence', value: 'recurring', description: 'Repeat on daily, weekly, or custom schedules' },
          ]}
          disabled={disabled}
        />

        <SettingRow
          label="Default Dispatch Time"
          description="Default clock time recommended when scheduling marketing blasts."
          disabled={disabled}
        >
          <Input
            type="time"
            value={settings.defaultSendTime}
            onChange={(e) => onChange({ defaultSendTime: e.target.value })}
            disabled={disabled}
            className="w-32 text-xs font-mono"
          />
        </SettingRow>

        <ToggleSetting
          label="Enable Recurring Campaigns"
          description="Permit scheduling recurring broadcasts (e.g. weekly newsletter, monthly statements)."
          checked={settings.recurringAllowed}
          onChange={(val) => onChange({ recurringAllowed: val })}
          disabled={disabled}
        />

        {settings.recurringAllowed && (
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Standard Recurring Days</span>
              <Badge variant="outline" className="text-[10px]">
                {currentDays.length} days active
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {days.map((d) => {
                const isSelected = currentDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    disabled={disabled}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border/60 hover:bg-muted'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Example schedule: Every Mon&ndash;Fri at {settings.defaultSendTime || '10:00 AM'}{' '}
              ({settings.defaultTimezone || 'Asia/Kolkata'})
            </p>
          </div>
        )}
      </SettingsCard>
    </div>
  );
}
