'use client';

import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { ToggleSetting } from '../toggle-setting';
import { SelectSetting } from '../select-setting';
import { SettingRow } from '../setting-row';
import { StatusManager, type StatusItem } from '../status-manager';
import { TagManager, type LabelItem } from '../tag-manager';
import { Input } from '@/components/ui/input';
import type { ConversationSettings } from '@/types/crm-settings';

interface ConversationSectionProps {
  settings: ConversationSettings;
  onChange: (settings: ConversationSettings) => void;
  readOnly?: boolean;
}

export function ConversationSection({
  settings,
  onChange,
  readOnly = false,
}: ConversationSectionProps) {
  function update<K extends keyof ConversationSettings>(
    key: K,
    val: ConversationSettings[K],
  ) {
    onChange({ ...settings, [key]: val });
  }

  return (
    <SettingsSection
      title="Conversation Management"
      description="Configure conversation lifecycle stages, visual priority tags, auto-assignment workflows, and resolution timeouts."
    >
      {/* 1. Statuses */}
      <SettingsCard
        title="Conversation Statuses"
        description="Define stages a chat progresses through from initial intake to resolution."
      >
        <StatusManager
          title="Lifecycle Stages"
          description="Default and custom conversation stages."
          items={settings.statuses as StatusItem[]}
          onChange={(newStatuses) => update('statuses', newStatuses as ConversationSettings['statuses'])}
          readOnly={readOnly}
        />
      </SettingsCard>

      {/* 2. Labels */}
      <SettingsCard
        title="Conversation Labels"
        description="Color-coded tags that agents can attach to conversations for rapid classification."
      >
        <TagManager
          title="Active Labels"
          description="Assign labels to flag priority, follow-ups, or client sentiment."
          items={settings.labels as LabelItem[]}
          onChange={(newLabels) => update('labels', newLabels as ConversationSettings['labels'])}
          readOnly={readOnly}
        />
      </SettingsCard>

      {/* 3. Conversation Rules & Assignment */}
      <SettingsCard
        title="Conversation Assignment & Timeouts"
        description="Automated assignment rules, idle chat timeouts, and re-opening behaviors."
      >
        <div className="space-y-1">
          <ToggleSetting
            label="Automatic Conversation Assignment"
            description="Automatically route newly created WhatsApp chats to available team members."
            checked={settings.autoAssignment.enabled}
            onChange={(checked) =>
              update('autoAssignment', { ...settings.autoAssignment, enabled: checked })
            }
            disabled={readOnly}
          />

          <SelectSetting
            label="Assignment Method"
            description="Algorithm used to distribute incoming conversations among agents."
            value={settings.autoAssignment.method}
            onChange={(val) =>
              update('autoAssignment', {
                ...settings.autoAssignment,
                method: val as ConversationSettings['autoAssignment']['method'],
              })
            }
            options={[
              { value: 'round_robin', label: 'Round Robin (Even Distribution)' },
              { value: 'team', label: 'Team Queue' },
              { value: 'user', label: 'Specific Default User' },
              { value: 'manual', label: 'Manual Triage (Unassigned)' },
            ]}
            disabled={readOnly || !settings.autoAssignment.enabled}
          />

          <SettingRow
            label="Default Assigned Team"
            description="The primary department assigned to incoming WhatsApp chats."
            disabled={readOnly || !settings.autoAssignment.enabled}
          >
            <Input
              value={settings.autoAssignment.defaultTeam}
              onChange={(e) =>
                update('autoAssignment', {
                  ...settings.autoAssignment,
                  defaultTeam: e.target.value,
                })
              }
              className="w-[180px] sm:w-[220px] h-9 text-xs"
              placeholder="e.g. Sales Team"
            />
          </SettingRow>

          <ToggleSetting
            label="Round-Robin Balanced Routing"
            description="Ensure equal conversation volume across all active and online operators."
            checked={settings.autoAssignment.roundRobin}
            onChange={(checked) =>
              update('autoAssignment', { ...settings.autoAssignment, roundRobin: checked })
            }
            disabled={readOnly || !settings.autoAssignment.enabled}
          />

          <ToggleSetting
            label="Assign Only During Working Hours"
            description="Hold unassigned chats in queue outside business hours until shift begins."
            checked={settings.autoAssignment.workingHoursOnly}
            onChange={(checked) =>
              update('autoAssignment', { ...settings.autoAssignment, workingHoursOnly: checked })
            }
            disabled={readOnly || !settings.autoAssignment.enabled}
          />

          <SettingRow
            label="Conversation Inactivity Timeout"
            description="Hours of inactivity before conversation is marked idle or auto-resolved."
            disabled={readOnly}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="720"
                value={settings.timeout.inactivityHours}
                onChange={(e) =>
                  update('timeout', {
                    ...settings.timeout,
                    inactivityHours: Number(e.target.value) || 24,
                  })
                }
                className="w-20 h-9 text-xs text-right font-mono"
              />
              <span className="text-xs text-muted-foreground">hours</span>
            </div>
          </SettingRow>

          <ToggleSetting
            label="Auto Resolve Inactive Conversations"
            description="Automatically mark conversation as 'Resolved' after inactivity period expires."
            checked={settings.timeout.autoResolve}
            onChange={(checked) =>
              update('timeout', { ...settings.timeout, autoResolve: checked })
            }
            disabled={readOnly}
          />

          <ToggleSetting
            label="Allow Reopen by Agent"
            description="Allow operators to manually reopen closed or resolved conversations."
            checked={settings.allowReopen}
            onChange={(checked) => update('allowReopen', checked)}
            disabled={readOnly}
          />

          <ToggleSetting
            label="Reopen on Inbound Message"
            description="When a customer replies to a previously closed chat, automatically reopen it."
            checked={settings.reopenClosedConversations}
            onChange={(checked) => update('reopenClosedConversations', checked)}
            disabled={readOnly}
          />
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
