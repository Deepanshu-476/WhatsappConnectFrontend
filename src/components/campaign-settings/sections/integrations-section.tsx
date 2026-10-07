'use client';

import { useState } from 'react';
import { SettingsCard } from '../settings-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Layers,
  FileSpreadsheet,
  Webhook,
  Database,
  Code2,
  ShoppingBag,
  Activity,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { IntegrationSettings, IntegrationItem } from '@/types/campaign-settings';

interface IntegrationsSectionProps {
  settings: IntegrationSettings;
  onChange: (updated: Partial<IntegrationSettings>) => void;
  disabled?: boolean;
}

export function IntegrationsSection({ settings, onChange, disabled }: IntegrationsSectionProps) {
  const [testingId, setTestingId] = useState<string | null>(null);

  const integrations = settings.integrations || [];

  const getIcon = (id: string) => {
    switch (id) {
      case 'whatsapp':
        return Layers;
      case 'google_sheets':
        return FileSpreadsheet;
      case 'webhooks':
        return Webhook;
      case 'external_crm':
        return Database;
      case 'rest_api':
        return Code2;
      case 'shopify':
        return ShoppingBag;
      default:
        return Layers;
    }
  };

  const handleToggle = (id: string, enabled: boolean) => {
    const updated = integrations.map((i) =>
      i.id === id ? { ...i, enabled, status: (enabled ? 'active' : 'inactive') as 'active' | 'inactive' } : i
    );
    onChange({ integrations: updated });
  };

  const handleTestIntegration = async (item: IntegrationItem) => {
    setTestingId(item.id);
    try {
      const res = await fetch('/api/campaign-settings/test-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId: item.id }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(data.message || `Connected to ${item.name}!`);
      } else {
        toast.error(data.error || `Integration check failed for ${item.name}`);
      }
    } catch {
      toast.error('Network error during integration diagnostic');
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Third-Party Integrations & Connectors"
        description="Connect audience sources, webhook pipelines, and eCommerce platforms to enrich marketing campaigns."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {integrations.map((item) => {
            const Icon = getIcon(item.id);
            const isTesting = testingId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border/50 bg-card hover:border-border transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground">{item.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 ${
                              item.connected
                                ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                                : 'text-muted-foreground bg-muted/40'
                            }`}
                          >
                            {item.connected ? 'Connected' : 'Disconnected'}
                          </Badge>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 capitalize">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={item.enabled}
                      onCheckedChange={(val) => handleToggle(item.id, val)}
                      disabled={disabled}
                      aria-label={`Toggle ${item.name}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground capitalize">
                    Status: {item.status}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestIntegration(item)}
                    disabled={disabled || isTesting}
                    className="h-7 text-xs gap-1.5"
                  >
                    {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
                    Test
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}
