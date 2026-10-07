'use client';

import { SettingsSection } from '../settings-section';
import { IntegrationGrid } from '../integration-card';
import type { IntegrationSettings } from '@/types/crm-settings';

interface IntegrationsSectionProps {
  settings: IntegrationSettings;
  onChange: (settings: IntegrationSettings) => void;
  readOnly?: boolean;
}

export function IntegrationsSection({
  settings,
  onChange,
  readOnly = false,
}: IntegrationsSectionProps) {
  function update<K extends keyof IntegrationSettings>(
    key: K,
    val: IntegrationSettings[K],
  ) {
    onChange({ ...settings, [key]: val });
  }

  return (
    <SettingsSection
      title="Integrations & Connectors"
      description="Connect your WhatsApp CRM to popular external systems, custom webhook endpoints, spreadsheet automations, and enterprise platforms."
    >
      <IntegrationGrid
        integrations={settings.integrations}
        onChange={(newItems) => update('integrations', newItems)}
        readOnly={readOnly}
      />
    </SettingsSection>
  );
}
