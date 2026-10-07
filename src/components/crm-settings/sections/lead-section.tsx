'use client';

import { useState } from 'react';
import { Plus, Trash2, Globe } from 'lucide-react';
import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { StatusManager, type StatusItem } from '../status-manager';
import { CustomFieldManager } from '../custom-field-manager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LeadSettings } from '@/types/crm-settings';

interface LeadSectionProps {
  settings: LeadSettings;
  onChange: (settings: LeadSettings) => void;
  readOnly?: boolean;
}

export function LeadSection({
  settings,
  onChange,
  readOnly = false,
}: LeadSectionProps) {
  const [newSourceName, setNewSourceName] = useState('');

  function update<K extends keyof LeadSettings>(key: K, val: LeadSettings[K]) {
    onChange({ ...settings, [key]: val });
  }

  function addSource() {
    if (!newSourceName.trim()) return;
    const newId = newSourceName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const newSource = {
      id: `${newId}_${Date.now()}`,
      name: newSourceName.trim(),
      isDefault: false,
    };
    update('sources', [...settings.sources, newSource]);
    setNewSourceName('');
  }

  function removeSource(id: string) {
    update('sources', settings.sources.filter((s) => s.id !== id));
  }

  return (
    <SettingsSection
      title="Lead Management"
      description="Customize sales pipeline stages, attribution sources, and custom qualification attributes for inbound prospects."
    >
      {/* 1. Lead Stages / Statuses */}
      <SettingsCard
        title="Pipeline Stages (Lead Status)"
        description="Stages a prospective lead moves through from inquiry to Won or Lost deal."
      >
        <StatusManager
          title="Sales Stages"
          description="Drag or reorder stages. Mark terminal stages as Won or Lost."
          items={settings.statuses as StatusItem[]}
          onChange={(newStatuses) => update('statuses', newStatuses as LeadSettings['statuses'])}
          allowWonLost
          readOnly={readOnly}
        />
      </SettingsCard>

      {/* 2. Lead Sources */}
      <SettingsCard
        title="Lead Attribution Sources"
        description="Origin channels tracked when creating new leads or receiving first-touch messages."
      >
        <div className="space-y-4">
          {!readOnly && (
            <div className="flex items-center gap-2 max-w-md">
              <Input
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSource();
                  }
                }}
                placeholder="Add custom source (e.g. LinkedIn Outreach)"
                className="h-8 text-xs"
              />
              <Button
                type="button"
                size="sm"
                onClick={addSource}
                disabled={!newSourceName.trim()}
                className="h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-3.5 mr-1" />
                Add Source
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {settings.sources.map((src) => (
              <div
                key={src.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-card/60 hover:bg-card/90 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Globe className="size-3" />
                  </div>
                  <span className="text-xs font-medium text-foreground truncate">
                    {src.name}
                  </span>
                </div>

                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSource(src.id)}
                    className="size-6 text-muted-foreground hover:text-rose-500"
                    title="Remove Source"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>

      {/* 3. Lead Custom Fields */}
      <SettingsCard
        title="Lead Custom Fields"
        description="Additional properties collected on lead records (e.g. Deal Value, Industry, Budget, Timeline)."
      >
        <CustomFieldManager
          title="Lead Attributes"
          description="Support for Text, Number, Email, Phone, Date, Dropdown, Multi Select, and Boolean."
          fields={settings.customFields}
          onChange={(newFields) => update('customFields', newFields)}
          readOnly={readOnly}
        />
      </SettingsCard>
    </SettingsSection>
  );
}
