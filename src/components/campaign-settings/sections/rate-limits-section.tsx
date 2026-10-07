'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { RateLimitSettings } from '@/types/campaign-settings';

interface RateLimitsSectionProps {
  settings: RateLimitSettings;
  onChange: (updated: Partial<RateLimitSettings>) => void;
  disabled?: boolean;
}

export function RateLimitsSection({ settings, onChange, disabled }: RateLimitsSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Throughput Rate Limiting"
        description="Enforce global throughput ceilings on the campaign worker engine to comply with WhatsApp Cloud API tier limits."
        badge={
          <Badge
            variant={settings.enabled ? 'default' : 'secondary'}
            className={settings.enabled ? 'bg-emerald-600 text-white' : ''}
          >
            {settings.enabled ? 'Active Enforcement' : 'Limits Disabled'}
          </Badge>
        }
      >
        <ToggleSetting
          label="Enable Global Campaign Rate Limiting"
          description="Campaign worker dynamically throttles outbound queue tasks to stay within the configured thresholds."
          checked={settings.enabled}
          onChange={(val) => onChange({ enabled: val })}
          disabled={disabled}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <SettingRow
            label="Messages per Minute"
            description="Peak per-minute API throughput cap."
            disabled={disabled || !settings.enabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={600}
                value={settings.messagesPerMinute}
                onChange={(e) => onChange({ messagesPerMinute: parseInt(e.target.value, 10) || 30 })}
                disabled={disabled || !settings.enabled}
                className="w-24 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">msg/min</span>
            </div>
          </SettingRow>

          <SettingRow
            label="Messages per Hour"
            description="Sustained per-hour broadcast cap."
            disabled={disabled || !settings.enabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={10}
                max={20000}
                value={settings.messagesPerHour}
                onChange={(e) => onChange({ messagesPerHour: parseInt(e.target.value, 10) || 500 })}
                disabled={disabled || !settings.enabled}
                className="w-24 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">msg/hr</span>
            </div>
          </SettingRow>

          <SettingRow
            label="Daily Dispatch Ceiling"
            description="Total messages allowed in 24 hours."
            disabled={disabled || !settings.enabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={100}
                max={250000}
                value={settings.messagesPerDay}
                onChange={(e) => onChange({ messagesPerDay: parseInt(e.target.value, 10) || 5000 })}
                disabled={disabled || !settings.enabled}
                className="w-28 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">msg/day</span>
            </div>
          </SettingRow>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Concurrency & Channel Caps"
        description="Prevent database connection starvation and channel bandwidth oversubscription."
      >
        <SettingRow
          label="Maximum Concurrent Campaigns"
          description="How many distinct campaigns can execute simultaneously on the backend worker."
          disabled={disabled || !settings.enabled}
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={10}
              value={settings.maxConcurrentSends}
              onChange={(e) => onChange({ maxConcurrentSends: parseInt(e.target.value, 10) || 3 })}
              disabled={disabled || !settings.enabled}
              className="w-24 text-xs font-mono"
            />
            <span className="text-xs text-muted-foreground">campaigns</span>
          </div>
        </SettingRow>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <SettingRow
            label="Per-Channel Daily Ceiling"
            description="Maximum marketing dispatches permitted per registered WhatsApp number per day."
            disabled={disabled || !settings.enabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={100}
                max={100000}
                value={settings.perChannelLimit}
                onChange={(e) => onChange({ perChannelLimit: parseInt(e.target.value, 10) || 2500 })}
                disabled={disabled || !settings.enabled}
                className="w-28 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">msg/day</span>
            </div>
          </SettingRow>

          <SettingRow
            label="Per-User Dispatch Limit"
            description="Cap on total messages any single agent or marketer can trigger per 24h window."
            disabled={disabled || !settings.enabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={50}
                max={50000}
                value={settings.perUserLimit}
                onChange={(e) => onChange({ perUserLimit: parseInt(e.target.value, 10) || 1000 })}
                disabled={disabled || !settings.enabled}
                className="w-28 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">msg/day</span>
            </div>
          </SettingRow>
        </div>
      </SettingsCard>
    </div>
  );
}
