'use client';

import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { ChannelManager } from '../channel-card';
import { ToggleSetting } from '../toggle-setting';
import { Badge } from '@/components/ui/badge';
import type { WhatsAppSettings } from '@/types/crm-settings';

interface ChannelsSectionProps {
  settings: WhatsAppSettings;
  onChange: (settings: WhatsAppSettings) => void;
  readOnly?: boolean;
}

export function ChannelsSection({
  settings,
  onChange,
  readOnly = false,
}: ChannelsSectionProps) {
  function update<K extends keyof WhatsAppSettings>(
    key: K,
    val: WhatsAppSettings[K],
  ) {
    onChange({ ...settings, [key]: val });
  }

  return (
    <SettingsSection
      title="WhatsApp Channels"
      description="Manage Meta WhatsApp Business Cloud API numbers, register webhook URLs, and review connection diagnostics."
    >
      <SettingsCard
        title="Active WhatsApp Channels"
        description="Official Meta phone numbers configured for customer messaging and outbound broadcasts."
      >
        <ChannelManager
          channels={settings.channels}
          onChange={(newChannels) => update('channels', newChannels)}
          readOnly={readOnly}
        />
      </SettingsCard>

      <SettingsCard
        title="Inbound Opt-Out & Compliance"
        description="Honor carrier and Meta regulations by honoring automated opt-out stop words."
      >
        <div className="space-y-3">
          <ToggleSetting
            label="Enforce Automated Opt-Out Compliance"
            description="Automatically opt-out contacts who reply with STOP, CANCEL, or UNSUBSCRIBE."
            checked={settings.enforceOptOut}
            onChange={(checked) => update('enforceOptOut', checked)}
            disabled={readOnly}
          />

          <div className="pt-2 pl-1">
            <span className="text-xs font-medium text-foreground block mb-2">
              Recognized Opt-Out Keywords
            </span>
            <div className="flex flex-wrap gap-2">
              {settings.optOutKeywords.map((kw) => (
                <Badge
                  key={kw}
                  variant="outline"
                  className="font-mono text-xs px-2.5 py-1 bg-muted/40"
                >
                  {kw}
                </Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              When received, outbound campaigns to this contact are immediately suspended.
            </p>
          </div>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
