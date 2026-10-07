'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { NotificationSettings } from '@/types/campaign-settings';

interface NotificationsSectionProps {
  settings: NotificationSettings;
  onChange: (updated: Partial<NotificationSettings>) => void;
  disabled?: boolean;
}

export function NotificationsSection({ settings, onChange, disabled }: NotificationsSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Campaign Operational Lifecycle Alerts"
        description="Receive immediate alerts when marketing dispatches change operational execution states."
      >
        <ToggleSetting
          label="On Campaign Started"
          description="Notify campaign creator when background worker commences sending."
          checked={settings.onCampaignStarted}
          onChange={(val) => onChange({ onCampaignStarted: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="On Campaign Completed"
          description="Alert team when all eligible recipients have been successfully processed."
          checked={settings.onCampaignCompleted}
          onChange={(val) => onChange({ onCampaignCompleted: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="On Campaign Paused / Resumed"
          description="Notify when a campaign is paused manually or by quiet hours."
          checked={settings.onCampaignPaused}
          onChange={(val) => onChange({ onCampaignPaused: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="On Campaign Stopped / Cancelled"
          description="Alert when an operator cancels an in-progress dispatch."
          checked={settings.onCampaignStopped}
          onChange={(val) => onChange({ onCampaignStopped: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="On Campaign Execution Failure"
          description="Immediate high-priority alert if worker crashes or Meta token expires."
          checked={settings.onCampaignFailed}
          onChange={(val) => onChange({ onCampaignFailed: val })}
          disabled={disabled}
          badge={<Badge variant="destructive" className="text-[10px]">Critical</Badge>}
        />
      </SettingsCard>

      <SettingsCard
        title="Anomaly & Quality Threshold Alerts"
        description="Early warning signals to detect potential spam reports, unverified lists, or channel quality drops."
      >
        <ToggleSetting
          label="High Failure Rate Alert"
          description="Triggers emergency alert if delivery bounce rate exceeds specified safety threshold."
          checked={settings.highFailureRateAlert}
          onChange={(val) => onChange({ highFailureRateAlert: val })}
          disabled={disabled}
        />

        {settings.highFailureRateAlert && (
          <SettingRow
            label="Failure Rate Threshold"
            description="Campaign worker flags warning when failed / total reaches this percentage."
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={50}
                value={settings.highFailureRateThresholdPercent}
                onChange={(e) =>
                  onChange({ highFailureRateThresholdPercent: parseInt(e.target.value, 10) || 15 })
                }
                disabled={disabled}
                className="w-24 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </SettingRow>
        )}

        <ToggleSetting
          label="High Opt-Out Rate Alert"
          description="Flags warning if unsubscribe volume spikes to safeguard Meta Business Quality tier."
          checked={settings.highOptOutRateAlert}
          onChange={(val) => onChange({ highOptOutRateAlert: val })}
          disabled={disabled}
        />

        {settings.highOptOutRateAlert && (
          <SettingRow
            label="Opt-Out Threshold"
            description="Warning triggered if unsubscribe responses exceed this percentage."
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={25}
                value={settings.highOptOutRateThresholdPercent}
                onChange={(e) =>
                  onChange({ highOptOutRateThresholdPercent: parseInt(e.target.value, 10) || 5 })
                }
                disabled={disabled}
                className="w-24 text-xs font-mono"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </SettingRow>
        )}
      </SettingsCard>

      <SettingsCard
        title="Notification Delivery Channels"
        description="Select where alert dispatches should be broadcasted."
      >
        <ToggleSetting
          label="In-App Notification Feed"
          description="Displays notification badge in portal header bell menu."
          checked={settings.channels?.inApp}
          onChange={(val) =>
            onChange({
              channels: { ...settings.channels, inApp: val },
            })
          }
          disabled={disabled}
        />

        <ToggleSetting
          label="Browser Desktop Push Notifications"
          description="Sends native desktop notifications via Web Push API."
          checked={settings.channels?.browser}
          onChange={(val) =>
            onChange({
              channels: { ...settings.channels, browser: val },
            })
          }
          disabled={disabled}
        />

        <ToggleSetting
          label="Email Digest & Urgent Alerts"
          description="Dispatches email summaries to account administrators."
          checked={settings.channels?.email}
          onChange={(val) =>
            onChange({
              channels: { ...settings.channels, email: val },
            })
          }
          disabled={disabled}
        />
      </SettingsCard>
    </div>
  );
}
