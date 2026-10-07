'use client';

import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { CustomFieldManager } from '../custom-field-manager';
import { TagManager, type LabelItem } from '../tag-manager';
import { SelectSetting } from '../select-setting';
import { ToggleSetting } from '../toggle-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import type { ContactSettings } from '@/types/crm-settings';

interface ContactSectionProps {
  settings: ContactSettings;
  onChange: (settings: ContactSettings) => void;
  readOnly?: boolean;
}

export function ContactSection({
  settings,
  onChange,
  readOnly = false,
}: ContactSectionProps) {
  function update<K extends keyof ContactSettings>(
    key: K,
    val: ContactSettings[K],
  ) {
    onChange({ ...settings, [key]: val });
  }

  return (
    <SettingsSection
      title="Contact Management"
      description="Configure contact custom properties, audience segment tags, deduplication rules, and bulk import/export behaviors."
    >
      {/* 1. Contact Custom Fields */}
      <SettingsCard
        title="Contact Custom Fields"
        description="Attach custom metadata to contacts such as Designation, Company, or Account Tier."
      >
        <CustomFieldManager
          title="Custom Attributes"
          description="CRUD custom field attributes on contact cards."
          fields={settings.customFields}
          onChange={(newFields) => update('customFields', newFields)}
          readOnly={readOnly}
        />
      </SettingsCard>

      {/* 2. Contact Tags */}
      <SettingsCard
        title="Contact Tags & Segmentation"
        description="Label contacts with colored badges for broadcasts and segment filtering."
      >
        <TagManager
          title="Contact Tags"
          description="Tags used to group audiences and filter outbound broadcasts."
          items={settings.tags as LabelItem[]}
          onChange={(newTags) => update('tags', newTags as ContactSettings['tags'])}
          readOnly={readOnly}
        />
      </SettingsCard>

      {/* 3. Deduplication & Import/Export Rules */}
      <SettingsCard
        title="Deduplication & Data Policies"
        description="Handle existing phone number collisions, required fields, and bulk data options."
      >
        <div className="space-y-1">
          <SelectSetting
            label="Duplicate Phone Handling"
            description="What to do when an incoming contact shares an existing phone number."
            value={settings.duplicateHandling}
            onChange={(val) =>
              update('duplicateHandling', val as ContactSettings['duplicateHandling'])
            }
            options={[
              { value: 'update', label: 'Update Existing Contact (Recommended)' },
              { value: 'skip', label: 'Ignore New Record (Keep Old)' },
              { value: 'allow', label: 'Allow Duplicate (Create Separate)' },
            ]}
            disabled={readOnly}
          />

          <ToggleSetting
            label="Skip Duplicates on CSV Import"
            description="Prevent duplicate rows from creating duplicate contacts when uploading CSV files."
            checked={settings.importSettings.skipDuplicates}
            onChange={(checked) =>
              update('importSettings', {
                ...settings.importSettings,
                skipDuplicates: checked,
              })
            }
            disabled={readOnly}
          />

          <SettingRow
            label="Automatic Import Tag"
            description="Tag automatically assigned to newly imported contacts."
            disabled={readOnly}
          >
            <Input
              value={settings.importSettings.autoTag}
              onChange={(e) =>
                update('importSettings', {
                  ...settings.importSettings,
                  autoTag: e.target.value,
                })
              }
              className="w-[180px] sm:w-[220px] h-9 text-xs"
              placeholder="e.g. imported"
            />
          </SettingRow>

          <ToggleSetting
            label="Include Custom Fields in Export"
            description="Append all custom field key-values as extra columns in CSV/JSON exports."
            checked={settings.exportSettings.includeCustomFields}
            onChange={(checked) =>
              update('exportSettings', {
                ...settings.exportSettings,
                includeCustomFields: checked,
              })
            }
            disabled={readOnly}
          />

          <SelectSetting
            label="Default Export Format"
            description="Standard file type downloaded when exporting contact rosters."
            value={settings.exportSettings.format}
            onChange={(val) =>
              update('exportSettings', {
                ...settings.exportSettings,
                format: val as ContactSettings['exportSettings']['format'],
              })
            }
            options={[
              { value: 'csv', label: 'CSV (Comma Separated Values)' },
              { value: 'xlsx', label: 'Excel (XLSX)' },
              { value: 'json', label: 'JSON' },
            ]}
            disabled={readOnly}
          />
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
