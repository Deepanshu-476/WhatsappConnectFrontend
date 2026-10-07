'use client';

import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { SelectSetting } from '../select-setting';
import { ToggleSetting } from '../toggle-setting';
import { Textarea } from '@/components/ui/textarea';
import type { InboxSettings } from '@/types/crm-settings';

interface InboxSectionProps {
  settings: InboxSettings;
  onChange: (settings: InboxSettings) => void;
  readOnly?: boolean;
}

export function InboxSection({
  settings,
  onChange,
  readOnly = false,
}: InboxSectionProps) {
  function update<K extends keyof InboxSettings>(key: K, val: InboxSettings[K]) {
    onChange({ ...settings, [key]: val });
  }

  return (
    <SettingsSection
      title="Inbox & Chat Settings"
      description="Fine-tune agent chat experience, automated greetings, away messages, typing indicators, and notification sounds."
    >
      {/* 1. Default Inbox Views */}
      <SettingsCard
        title="Default Views & Statuses"
        description="Initial display presets when agents open the shared inbox."
      >
        <div className="space-y-1">
          <SelectSetting
            label="Default Inbox Filter"
            description="The tab loaded by default when landing on /inbox."
            value={settings.defaultInbox}
            onChange={(val) =>
              update('defaultInbox', val as InboxSettings['defaultInbox'])
            }
            options={[
              { value: 'all', label: 'All Conversations' },
              { value: 'assigned', label: 'Assigned to Me' },
              { value: 'unassigned', label: 'Unassigned Queue' },
            ]}
            disabled={readOnly}
          />

          <SelectSetting
            label="Default Intake Status"
            description="Initial status given to freshly generated conversations."
            value={settings.defaultStatus}
            onChange={(val) => update('defaultStatus', val)}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'pending', label: 'Pending' },
              { value: 'in_progress', label: 'In Progress' },
            ]}
            disabled={readOnly}
          />
        </div>
      </SettingsCard>

      {/* 2. Automated Replies & Away Greeting */}
      <SettingsCard
        title="Auto Reply & Away Greetings"
        description="Instant confirmation messages delivered when customers send WhatsApp inquiries."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <ToggleSetting
              label="Instant Auto-Reply"
              description="Immediately send an acknowledgment message upon receiving a new inbound query."
              checked={settings.autoReply.enabled}
              onChange={(checked) =>
                update('autoReply', { ...settings.autoReply, enabled: checked })
              }
              disabled={readOnly}
            />
            {settings.autoReply.enabled && (
              <div className="pt-2 pl-2">
                <Textarea
                  value={settings.autoReply.message}
                  onChange={(e) =>
                    update('autoReply', { ...settings.autoReply, message: e.target.value })
                  }
                  rows={3}
                  className="text-xs"
                  placeholder="Type auto-reply text..."
                  disabled={readOnly}
                />
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border/50 space-y-2">
            <ToggleSetting
              label="Out-of-Office Away Message"
              description="Send automated away message when queries arrive outside business hours."
              checked={settings.awayMessage.enabled}
              onChange={(checked) =>
                update('awayMessage', { ...settings.awayMessage, enabled: checked })
              }
              disabled={readOnly}
            />
            {settings.awayMessage.enabled && (
              <div className="pt-2 pl-2 space-y-2">
                <ToggleSetting
                  label="Deliver Only Outside Working Hours"
                  description="Checks against configured schedule before sending away message."
                  checked={settings.awayMessage.outsideWorkingHours}
                  onChange={(checked) =>
                    update('awayMessage', {
                      ...settings.awayMessage,
                      outsideWorkingHours: checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Textarea
                  value={settings.awayMessage.message}
                  onChange={(e) =>
                    update('awayMessage', {
                      ...settings.awayMessage,
                      message: e.target.value,
                    })
                  }
                  rows={3}
                  className="text-xs"
                  placeholder="Type out-of-office message..."
                  disabled={readOnly}
                />
              </div>
            )}
          </div>
        </div>
      </SettingsCard>

      {/* 3. Chat Mechanics & Feedback */}
      <SettingsCard
        title="Agent Collaboration & Sound FX"
        description="Internal notes, typing indicators, read markers, and notification audio."
      >
        <div className="space-y-1">
          <ToggleSetting
            label="Mark Read on Open"
            description="Clear unread badge as soon as an agent clicks into a conversation."
            checked={settings.readUnreadSettings.markReadOnOpen}
            onChange={(checked) =>
              update('readUnreadSettings', {
                ...settings.readUnreadSettings,
                markReadOnOpen: checked,
              })
            }
            disabled={readOnly}
          />

          <ToggleSetting
            label="Mark Unread on Reassign"
            description="Flag conversations as unread when transferred to a different teammate."
            checked={settings.readUnreadSettings.markUnreadOnReassign}
            onChange={(checked) =>
              update('readUnreadSettings', {
                ...settings.readUnreadSettings,
                markUnreadOnReassign: checked,
              })
            }
            disabled={readOnly}
          />

          <ToggleSetting
            label="Internal Collaboration Notes"
            description="Allow team members to leave private yellow sticky notes within chat threads."
            checked={settings.internalNotes.enabled}
            onChange={(checked) =>
              update('internalNotes', { ...settings.internalNotes, enabled: checked })
            }
            disabled={readOnly}
          />

          <ToggleSetting
            label="Live Typing Indicators"
            description="Broadcast typing indicator dots across active agent screens."
            checked={settings.typingIndicator}
            onChange={(checked) => update('typingIndicator', checked)}
            disabled={readOnly}
          />

          <ToggleSetting
            label="Inbound Message Sound Notification"
            description="Play an audible chime when new customer messages land in the inbox."
            checked={settings.soundNotification}
            onChange={(checked) => update('soundNotification', checked)}
            disabled={readOnly}
          />
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
