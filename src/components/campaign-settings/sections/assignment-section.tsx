'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SelectSetting } from '../select-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { AssignmentSettings } from '@/types/campaign-settings';

interface AssignmentSectionProps {
  settings: AssignmentSettings;
  onChange: (updated: Partial<AssignmentSettings>) => void;
  disabled?: boolean;
}

export function AssignmentSection({ settings, onChange, disabled }: AssignmentSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Inbound Campaign Reply Routing"
        description="Define how prospect replies and inquiries triggered by campaigns are assigned to CRM agents."
      >
        <SelectSetting
          label="Assignment Strategy"
          description="Methodology used to route conversations when a recipient responds to an outbound message."
          value={settings.mode}
          onChange={(val) => onChange({ mode: val as AssignmentSettings['mode'] })}
          options={[
            { label: 'Round Robin', value: 'round_robin', description: 'Evenly distributes incoming replies across active team members' },
            { label: 'Assigned Team', value: 'team', description: 'Directs all inquiries to a specific functional team pool' },
            { label: 'Channel Owner', value: 'channel', description: 'Routes to the dedicated manager of the sending WhatsApp number' },
            { label: 'Manual Routing', value: 'manual', description: 'Lands in the unassigned triage inbox for manual pickup' },
          ]}
          disabled={disabled}
        />

        <SettingRow
          label="Default Target Team"
          description="Default group assigned to handle campaign responses."
          disabled={disabled}
        >
          <Input
            value={settings.defaultTeam}
            onChange={(e) => onChange({ defaultTeam: e.target.value })}
            placeholder="Sales Team"
            disabled={disabled}
            className="w-48 text-xs"
          />
        </SettingRow>

        <ToggleSetting
          label="Round Robin Load Balancing"
          description="Distributes consecutive conversation replies sequentially to active online agents to balance workloads."
          checked={settings.roundRobin}
          onChange={(val) => onChange({ roundRobin: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Assign Replies to Campaign Owner First"
          description="If enabled, contacts who reply will be assigned directly to the user who created and launched the campaign."
          checked={settings.assignRepliesToCampaignOwner}
          onChange={(val) => onChange({ assignRepliesToCampaignOwner: val })}
          disabled={disabled}
          badge={<Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Contextual</Badge>}
        />
      </SettingsCard>
    </div>
  );
}
