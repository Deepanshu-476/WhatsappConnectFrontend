'use client';

import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { SelectSetting } from '../select-setting';
import { ToggleSetting } from '../toggle-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import type { AssignmentSettings } from '@/types/crm-settings';

interface AssignmentSectionProps {
  settings: AssignmentSettings;
  onChange: (settings: AssignmentSettings) => void;
  readOnly?: boolean;
}

export function AssignmentSection({
  settings,
  onChange,
  readOnly = false,
}: AssignmentSectionProps) {
  function update<K extends keyof AssignmentSettings>(
    key: K,
    val: AssignmentSettings[K],
  ) {
    onChange({ ...settings, [key]: val });
  }

  return (
    <SettingsSection
      title="Assignment Settings"
      description="Design automated routing topologies to dispatch new customer queries across teams, agents, and time shifts."
    >
      {/* 1. Assignment Workflow Strategy */}
      <SettingsCard
        title="Routing Strategy & Queues"
        description="Select how incoming chats find their assigned handler."
      >
        <div className="space-y-1">
          <SelectSetting
            label="Routing Mechanism"
            description="The primary routing algorithm applied to new conversations."
            value={settings.mode}
            onChange={(val) =>
              update('mode', val as AssignmentSettings['mode'])
            }
            options={[
              { value: 'round_robin', label: 'Round Robin (Even Distribution across Active Agents)' },
              { value: 'team_based', label: 'Team Based (Assigned to Department Pool)' },
              { value: 'user_based', label: 'User Based (Always to Specific Operator)' },
              { value: 'manual', label: 'Manual Triage (Held in Unassigned Inbox)' },
            ]}
            disabled={readOnly}
          />

          <ToggleSetting
            label="Enable Automatic Assignment"
            description="Toggle whether the system auto-assigns or leaves new chats for manual pickup."
            checked={settings.autoAssignment}
            onChange={(checked) => update('autoAssignment', checked)}
            disabled={readOnly}
          />

          <SettingRow
            label="Default Department / Team"
            description="Target group receiving auto-routed conversations."
            disabled={readOnly}
          >
            <Input
              value={settings.defaultTeam}
              onChange={(e) => update('defaultTeam', e.target.value)}
              className="w-[180px] sm:w-[220px] h-9 text-xs"
              placeholder="e.g. Sales Team"
            />
          </SettingRow>

          <ToggleSetting
            label="Round-Robin Load Balancing"
            description="Distribute conversations cyclically to prevent operator overload."
            checked={settings.roundRobin}
            onChange={(checked) => update('roundRobin', checked)}
            disabled={readOnly}
          />
        </div>
      </SettingsCard>

      {/* 2. Working Hours Gate */}
      <SettingsCard
        title="Working Hours & Shift Schedules"
        description="Define operational times when agents are available to accept automated chats."
      >
        <div className="space-y-1">
          <ToggleSetting
            label="Enforce Working Hours"
            description="Hold new conversations in an after-hours queue when sent outside work hours."
            checked={settings.workingHours.enabled}
            onChange={(checked) =>
              update('workingHours', { ...settings.workingHours, enabled: checked })
            }
            disabled={readOnly}
          />

          <SelectSetting
            label="Operating Timezone"
            description="Reference timezone for shift calculations."
            value={settings.workingHours.timezone}
            onChange={(val) =>
              update('workingHours', { ...settings.workingHours, timezone: val })
            }
            options={[
              { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +5:30)' },
              { value: 'UTC', label: 'UTC (GMT +0:00)' },
              { value: 'America/New_York', label: 'America/New_York (EST -5:00)' },
              { value: 'Europe/London', label: 'Europe/London (BST +1:00)' },
              { value: 'Asia/Dubai', label: 'Asia/Dubai (GST +4:00)' },
              { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT +8:00)' },
            ]}
            disabled={readOnly || !settings.workingHours.enabled}
          />

          <SettingRow
            label="Daily Shift Range"
            description="Start and end times of normal operation."
            disabled={readOnly || !settings.workingHours.enabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={settings.workingHours.start}
                onChange={(e) =>
                  update('workingHours', { ...settings.workingHours, start: e.target.value })
                }
                className="w-28 h-9 text-xs"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="time"
                value={settings.workingHours.end}
                onChange={(e) =>
                  update('workingHours', { ...settings.workingHours, end: e.target.value })
                }
                className="w-28 h-9 text-xs"
              />
            </div>
          </SettingRow>
        </div>
      </SettingsCard>

      {/* 3. Reassignment Rules */}
      <SettingsCard
        title="Reassignment & Escalation Rules"
        description="Define what happens if an assigned agent fails to respond to a customer in time."
      >
        <div className="space-y-1">
          <ToggleSetting
            label="Enable Inactivity Reassignment"
            description="Automatically pull the conversation from unresponsive operators."
            checked={settings.reassignmentRules.enabled}
            onChange={(checked) =>
              update('reassignmentRules', {
                ...settings.reassignmentRules,
                enabled: checked,
              })
            }
            disabled={readOnly}
          />

          <SettingRow
            label="Unresponsive Reassignment Timeout"
            description="Minutes before an unacknowledged conversation is re-assigned."
            disabled={readOnly || !settings.reassignmentRules.enabled}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="5"
                max="1440"
                value={settings.reassignmentRules.timeoutMinutes}
                onChange={(e) =>
                  update('reassignmentRules', {
                    ...settings.reassignmentRules,
                    timeoutMinutes: Number(e.target.value) || 30,
                  })
                }
                className="w-20 h-9 text-xs text-right font-mono"
              />
              <span className="text-xs text-muted-foreground">minutes</span>
            </div>
          </SettingRow>

          <ToggleSetting
            label="Reassign Back to Queue"
            description="Push unresponded chats back to the general shared inbox queue."
            checked={settings.reassignmentRules.reassignToQueue}
            onChange={(checked) =>
              update('reassignmentRules', {
                ...settings.reassignmentRules,
                reassignToQueue: checked,
              })
            }
            disabled={readOnly || !settings.reassignmentRules.enabled}
          />

          <ToggleSetting
            label="Notify Team Lead on Timeout"
            description="Send an alert when an agent fails to respond within the escalation limit."
            checked={settings.reassignmentRules.notifyTeam}
            onChange={(checked) =>
              update('reassignmentRules', {
                ...settings.reassignmentRules,
                notifyTeam: checked,
              })
            }
            disabled={readOnly || !settings.reassignmentRules.enabled}
          />
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
