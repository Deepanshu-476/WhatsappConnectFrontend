'use client';

import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { SelectSetting } from '../select-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { GeneralSettings, DayBusinessHours } from '@/types/crm-settings';

interface GeneralSectionProps {
  settings: GeneralSettings;
  onChange: (settings: GeneralSettings) => void;
  readOnly?: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export function GeneralSection({
  settings,
  onChange,
  readOnly = false,
}: GeneralSectionProps) {
  function update<K extends keyof GeneralSettings>(key: K, val: GeneralSettings[K]) {
    onChange({ ...settings, [key]: val });
  }

  function updateDayHours(day: string, field: keyof DayBusinessHours, val: unknown) {
    const prev = settings.businessHours?.[day] || { open: '09:00', close: '18:00', enabled: true };
    const updated = {
      ...settings.businessHours,
      [day]: { ...prev, [field]: val },
    };
    update('businessHours', updated);
  }

  return (
    <SettingsSection
      title="General CRM Settings"
      description="Configure workspace identity, regional formats, business operating schedule, and default currencies."
    >
      {/* 1. Identity & Localization */}
      <SettingsCard
        title="CRM Identity & Regional Formats"
        description="Brand identity and display formats used across dashboards and client reports."
      >
        <div className="space-y-1">
          <SettingRow
            label="CRM System Name"
            description="The title displayed in portal headers and client notifications."
            disabled={readOnly}
          >
            <Input
              value={settings.crmName}
              onChange={(e) => update('crmName', e.target.value)}
              className="w-[180px] sm:w-[240px] h-9 text-xs"
              placeholder="e.g. WhatsApp CRM"
            />
          </SettingRow>

          <SelectSetting
            label="System Timezone"
            description="Reference timezone used for timestamp calculations and daily summaries."
            value={settings.timezone}
            onChange={(val) => update('timezone', val)}
            options={[
              { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +5:30)' },
              { value: 'UTC', label: 'UTC (GMT +0:00)' },
              { value: 'America/New_York', label: 'America/New_York (EST -5:00)' },
              { value: 'Europe/London', label: 'Europe/London (BST +1:00)' },
              { value: 'Asia/Dubai', label: 'Asia/Dubai (GST +4:00)' },
              { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT +8:00)' },
            ]}
            disabled={readOnly}
          />

          <SelectSetting
            label="Date Format"
            description="Calendar format applied across timeline feeds and lead dates."
            value={settings.dateFormat}
            onChange={(val) => update('dateFormat', val)}
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 25/12/2026)' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 12/25/2026)' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-12-25)' },
            ]}
            disabled={readOnly}
          />

          <SelectSetting
            label="Time Format"
            description="Clock representation style."
            value={settings.timeFormat}
            onChange={(val) => update('timeFormat', val as GeneralSettings['timeFormat'])}
            options={[
              { value: '12h', label: '12-Hour Clock (02:30 PM)' },
              { value: '24h', label: '24-Hour Military Clock (14:30)' },
            ]}
            disabled={readOnly}
          />

          <SelectSetting
            label="Default Country Code"
            description="Country code prefixed to raw customer phone entries."
            value={settings.defaultCountry}
            onChange={(val) => update('defaultCountry', val)}
            options={[
              { value: 'IN', label: 'India (+91)' },
              { value: 'US', label: 'United States (+1)' },
              { value: 'GB', label: 'United Kingdom (+44)' },
              { value: 'AE', label: 'United Arab Emirates (+971)' },
              { value: 'SG', label: 'Singapore (+65)' },
              { value: 'AU', label: 'Australia (+61)' },
            ]}
            disabled={readOnly}
          />

          <SelectSetting
            label="Default Account Currency"
            description="Monetary symbol and format for deal valuations and pipeline totals."
            value={settings.currency}
            onChange={(val) => update('currency', val)}
            options={[
              { value: 'INR', label: 'INR (₹) — Indian Rupee' },
              { value: 'USD', label: 'USD ($) — US Dollar' },
              { value: 'EUR', label: 'EUR (€) — Euro' },
              { value: 'GBP', label: 'GBP (£) — British Pound' },
              { value: 'AED', label: 'AED (د.إ) — UAE Dirham' },
            ]}
            disabled={readOnly}
          />

          <SelectSetting
            label="Portal Interface Language"
            description="Localization language for labels and notifications."
            value={settings.defaultLanguage}
            onChange={(val) => update('defaultLanguage', val)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish (Español)' },
              { value: 'hi', label: 'Hindi (हिन्दी)' },
              { value: 'pt', label: 'Portuguese' },
            ]}
            disabled={readOnly}
          />
        </div>
      </SettingsCard>

      {/* 2. Business Operating Hours Table */}
      <SettingsCard
        title="Weekly Business Hours Schedule"
        description="Operating hours dictate automated away responses and shift routing."
      >
        <div className="space-y-2.5">
          {DAYS.map(({ key, label }) => {
            const dayConfig = settings.businessHours?.[key] || {
              open: '09:00',
              close: '18:00',
              enabled: key !== 'saturday' && key !== 'sunday',
            };

            return (
              <div
                key={key}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/40"
              >
                <div className="flex items-center gap-3 w-32">
                  <Switch
                    checked={dayConfig.enabled}
                    onCheckedChange={(checked) => updateDayHours(key, 'enabled', checked)}
                    disabled={readOnly}
                  />
                  <span
                    className={`text-xs font-medium ${
                      dayConfig.enabled ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {dayConfig.enabled ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={dayConfig.open}
                      onChange={(e) => updateDayHours(key, 'open', e.target.value)}
                      disabled={readOnly}
                      className="w-24 h-8 text-xs font-mono"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={dayConfig.close}
                      onChange={(e) => updateDayHours(key, 'close', e.target.value)}
                      disabled={readOnly}
                      className="w-24 h-8 text-xs font-mono"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic pr-4">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
