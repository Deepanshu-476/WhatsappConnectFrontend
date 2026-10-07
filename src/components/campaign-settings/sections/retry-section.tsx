'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { RetrySettings } from '@/types/campaign-settings';

interface RetrySectionProps {
  settings: RetrySettings;
  onChange: (updated: Partial<RetrySettings>) => void;
  disabled?: boolean;
}

export function RetrySection({ settings, onChange, disabled }: RetrySectionProps) {
  const failureOptions = [
    { id: 'temporary', label: 'Temporary Server Hiccups (HTTP 500/503)' },
    { id: 'rate_limited', label: 'Meta API Rate Limited (HTTP 429)' },
    { id: 'network_error', label: 'Network Timeout / Socket Drops' },
    { id: 'whatsapp_error', label: 'WhatsApp Upstream Gateway Errors' },
  ];

  const currentTypes = settings.retryableFailures || [];

  const toggleType = (typeId: string) => {
    let nextTypes: string[];
    if (currentTypes.includes(typeId)) {
      nextTypes = currentTypes.filter((t) => t !== typeId);
    } else {
      nextTypes = [...currentTypes, typeId];
    }
    onChange({ retryableFailures: nextTypes });
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Automated Retry & Fault Tolerance"
        description="Configure automatic retry behaviors for intermittent transmission dropouts and Meta API rate spikes."
      >
        <ToggleSetting
          label="Auto-Retry Transient Failures"
          description="Automatically re-queues messages that failed due to temporary network or Meta gateway faults."
          checked={settings.enabled}
          onChange={(val) => onChange({ enabled: val })}
          disabled={disabled}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <SettingRow
            label="Maximum Retry Attempts"
            description="Number of re-attempts before flagging contact as permanently failed."
            disabled={disabled || !settings.enabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={5}
                value={settings.maxRetries}
                onChange={(e) => onChange({ maxRetries: parseInt(e.target.value, 10) || 3 })}
                disabled={disabled || !settings.enabled}
                className="w-24 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">attempts</span>
            </div>
          </SettingRow>

          <SettingRow
            label="Retry Backoff Delay"
            description="Cooldown period before attempting retry dispatch."
            disabled={disabled || !settings.enabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.retryDelayMinutes}
                onChange={(e) => onChange({ retryDelayMinutes: parseInt(e.target.value, 10) || 5 })}
                disabled={disabled || !settings.enabled}
                className="w-24 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">minutes</span>
            </div>
          </SettingRow>
        </div>

        {/* Retryable Error Types */}
        <div className="space-y-2.5 pt-2">
          <span className="text-xs font-semibold text-foreground">
            Retryable Error Conditions
          </span>
          <p className="text-xs text-muted-foreground">
            Permanent failures like <code className="text-[11px] font-mono bg-muted px-1 py-0.5 rounded">INVALID_PHONE</code> or <code className="text-[11px] font-mono bg-muted px-1 py-0.5 rounded">USER_NOT_ON_WHATSAPP</code> are never retried.
          </p>
          <div className="space-y-2 pt-1">
            {failureOptions.map((opt) => {
              const checked = currentTypes.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg border border-border/40 hover:bg-muted/40 cursor-pointer text-xs"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleType(opt.id)}
                    disabled={disabled || !settings.enabled}
                  />
                  <span className="font-medium text-foreground">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
