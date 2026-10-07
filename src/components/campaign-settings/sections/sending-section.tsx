'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SelectSetting } from '../select-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { CampaignSendingSettings } from '@/types/campaign-settings';

interface SendingSectionProps {
  settings: CampaignSendingSettings;
  onChange: (updated: Partial<CampaignSendingSettings>) => void;
  disabled?: boolean;
}

export function SendingSection({ settings, onChange, disabled }: SendingSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Sending Mode & Strategy"
        description="Select the default delivery flow for outbound WhatsApp broadcasts."
      >
        <SelectSetting
          label="Default Sending Mode"
          description="Dictates how messages are dispatched to the WhatsApp Cloud API."
          value={settings.mode}
          onChange={(val) => onChange({ mode: val as CampaignSendingSettings['mode'] })}
          options={[
            { label: 'Immediately', value: 'immediately', description: 'Starts delivery instantly upon launch' },
            { label: 'Scheduled', value: 'scheduled', description: 'Queues to fire at a future specified date & time' },
            { label: 'Batch Sending', value: 'batch', description: 'Splits audience into chunks with inter-batch pauses' },
            { label: 'Drip Campaign', value: 'drip', description: 'Dispatches staggered intervals across multiple hours/days' },
          ]}
          disabled={disabled}
        />

        {settings.mode === 'batch' && (
          <SettingRow
            label="Batch Size"
            description="Number of recipients dispatched in each discrete batch chunk."
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={10}
                max={1000}
                value={settings.batchSize}
                onChange={(e) => onChange({ batchSize: parseInt(e.target.value, 10) || 50 })}
                disabled={disabled}
                className="w-28 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">messages / batch</span>
            </div>
          </SettingRow>
        )}

        {settings.mode === 'drip' && (
          <SettingRow
            label="Drip Interval"
            description="Pause duration between sequential subscriber drip steps."
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={5}
                max={1440}
                value={settings.dripIntervalMinutes}
                onChange={(e) => onChange({ dripIntervalMinutes: parseInt(e.target.value, 10) || 60 })}
                disabled={disabled}
                className="w-28 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">minutes</span>
            </div>
          </SettingRow>
        )}
      </SettingsCard>

      <SettingsCard
        title="Pacing, Delays & Anti-Ban Cadence"
        description="Fine-tune inter-message pauses to emulate natural conversational delivery and protect your WhatsApp Business Quality Rating."
      >
        <ToggleSetting
          label="Send One by One (Sequential Queue)"
          description="Process recipients sequentially with intentional sleep intervals between each HTTP request."
          checked={settings.sendOneByOne}
          onChange={(val) => onChange({ sendOneByOne: val })}
          disabled={disabled}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <SettingRow
            label="Minimum Delay"
            description="Shortest pause between consecutive outbound dispatches."
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.minDelaySeconds}
                onChange={(e) => onChange({ minDelaySeconds: Math.max(1, parseInt(e.target.value, 10) || 2) })}
                disabled={disabled}
                className="w-24 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">sec</span>
            </div>
          </SettingRow>

          <SettingRow
            label="Maximum Delay"
            description="Longest pause between consecutive outbound dispatches."
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={settings.minDelaySeconds}
                max={120}
                value={settings.maxDelaySeconds}
                onChange={(e) => onChange({ maxDelaySeconds: Math.max(settings.minDelaySeconds, parseInt(e.target.value, 10) || 5) })}
                disabled={disabled}
                className="w-24 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">sec</span>
            </div>
          </SettingRow>
        </div>

        <ToggleSetting
          label="Randomize Delay (Anti-Pattern Jitter)"
          description="Introduce pseudo-random millisecond variance between min and max delays to prevent rigid automation signatures."
          checked={settings.randomizeDelay}
          onChange={(val) => onChange({ randomizeDelay: val })}
          disabled={disabled}
          badge={<Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Recommended</Badge>}
        />

        <ToggleSetting
          label="Human-like Delay Algorithm"
          description="Occasionally introduces natural 8–15s pauses after every 15–20 messages to simulate organic human typing and review."
          checked={settings.humanLikeDelay}
          onChange={(val) => onChange({ humanLikeDelay: val })}
          disabled={disabled}
        />
      </SettingsCard>
    </div>
  );
}
