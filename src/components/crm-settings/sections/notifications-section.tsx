'use client';

import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { ToggleSetting } from '../toggle-setting';
import type { NotificationSettings } from '@/types/crm-settings';

interface NotificationsSectionProps {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
  readOnly?: boolean;
}

export function NotificationsSection({
  settings,
  onChange,
  readOnly = false,
}: NotificationsSectionProps) {
  function update<K extends keyof NotificationSettings>(
    key: K,
    val: NotificationSettings[K],
  ) {
    onChange({ ...settings, [key]: val });
  }

  return (
    <SettingsSection
      title="Notification Preferences"
      description="Manage in-app, browser push, sound, and email notifications for customer queries, assignments, and team mentions."
    >
      <SettingsCard
        title="Event Alerts & Trigger Toggles"
        description="Choose which CRM events trigger notification alerts."
      >
        <div className="space-y-1">
          <ToggleSetting
            label="New Inbound Message Alert"
            description="Notify when a customer delivers a new WhatsApp message to your inbox."
            checked={settings.newMessage}
            onChange={(checked) => update('newMessage', checked)}
            disabled={readOnly}
          />

          <ToggleSetting
            label="New Lead Captured Alert"
            description="Alert operators whenever a new prospective lead enters the CRM pipeline."
            checked={settings.newLead}
            onChange={(checked) => update('newLead', checked)}
            disabled={readOnly}
          />

          <ToggleSetting
            label="Chat Assignment Notification"
            description="Send direct alert when a conversation or ticket is delegated to your queue."
            checked={settings.newAssignment}
            onChange={(checked) => update('newAssignment', checked)}
            disabled={readOnly}
          />

          <ToggleSetting
            label="Team Mentions (@user) Alert"
            description="Alert when a colleague mentions your profile in an internal note."
            checked={settings.mentions}
            onChange={(checked) => update('mentions', checked)}
            disabled={readOnly}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Delivery Channels"
        description="Configure standard notification delivery conduits."
      >
        <div className="space-y-1">
          <ToggleSetting
            label="Browser Desktop Notifications"
            description="Deliver HTML5 desktop banner notifications even when the browser tab is in background."
            checked={settings.browserNotifications}
            onChange={(checked) => update('browserNotifications', checked)}
            disabled={readOnly}
          />

          <ToggleSetting
            label="Audible Sound Notifications"
            description="Play audio chime for real-time customer and assignment notifications."
            checked={settings.soundNotifications}
            onChange={(checked) => update('soundNotifications', checked)}
            disabled={readOnly}
          />

          <ToggleSetting
            label="Email Digest Notifications"
            description="Send summary emails for missed queries and daily activity digests."
            checked={settings.emailNotifications}
            onChange={(checked) => update('emailNotifications', checked)}
            disabled={readOnly}
          />
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
