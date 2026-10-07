'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Webhook,
  FileSpreadsheet,
  Database,
  Code2,
  CheckCircle2,
  XCircle,
  Activity,
  Settings as SettingsIcon,
  Loader2,
  PlugZap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { IntegrationItem } from '@/types/crm-settings';

interface IntegrationGridProps {
  integrations: IntegrationItem[];
  onChange: (items: IntegrationItem[]) => void;
  readOnly?: boolean;
}

const ICON_MAP: Record<string, typeof MessageSquare> = {
  whatsapp: MessageSquare,
  bot: Bot,
  webhook: Webhook,
  sheet: FileSpreadsheet,
  database: Database,
  code: Code2,
};

export function IntegrationGrid({
  integrations,
  onChange,
  readOnly = false,
}: IntegrationGridProps) {
  const [configureItem, setConfigureItem] = useState<IntegrationItem | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [formWebhook, setFormWebhook] = useState('');
  const [formApiKey, setFormApiKey] = useState('');

  function openConfigure(item: IntegrationItem) {
    setConfigureItem(item);
    setFormWebhook(item.webhookUrl || '');
    setFormApiKey(typeof item.config?.apiKey === 'string' ? item.config.apiKey : '');
  }

  function handleSaveConfigure() {
    if (!configureItem) return;
    const updated = integrations.map((it) => {
      if (it.id === configureItem.id) {
        return {
          ...it,
          webhookUrl: formWebhook.trim() || undefined,
          config: {
            ...it.config,
            ...(formApiKey ? { apiKey: formApiKey.trim() } : {}),
          },
          status: 'configuration_required' as const,
          enabled: false,
        };
      }
      return it;
    });
    onChange(updated);
    setConfigureItem(null);
    toast.success(`${configureItem.name} configured successfully`);
  }

  function toggleIntegration(id: string, enabled: boolean) {
    const updated = integrations.map((it) => {
      if (it.id === id) {
        return {
          ...it,
          enabled: enabled && it.status === 'connected',
          status: enabled && it.status === 'connected' ? ('connected' as const) : ('configuration_required' as const),
        };
      }
      return it;
    });
    onChange(updated);
    toast.info(enabled ? 'Integration requires verification before it can be enabled' : 'Integration disabled');
  }

  async function testConnection(item: IntegrationItem) {
    setTestingId(item.id);
    try {
      const res = await fetch('/api/crm-settings/test-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId: item.id, key: item.key }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        toast.success(data?.message || `${item.name} connection test succeeded!`);
      } else {
        toast.error(data?.message || data?.error || `Failed to connect to ${item.name}`);
      }
    } catch {
      toast.error(`${item.name} could not be verified because the backend is unavailable.`);
    } finally {
      setTestingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">External Connectors & APIs</h4>
          <p className="text-xs text-muted-foreground">
            Connect third-party apps, productivity tools, and webhook destinations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => {
          const Icon = ICON_MAP[item.icon] || PlugZap;
          const isConnected = item.status === 'connected' && item.enabled;

          return (
            <Card
              key={item.id}
              className="border-border/60 bg-card/60 hover:bg-card/90 transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1 text-[10px]">
                        <CheckCircle2 className="size-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-[10px]">
                        <XCircle className="size-3" />
                        Disconnected
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-sm font-semibold mt-3 text-foreground">
                  {item.name}
                </CardTitle>
                <div className="text-[11px] font-medium text-primary">
                  {item.category}
                  {item.status === 'configuration_required' ? ' · Configuration required' : ''}
                </div>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2 min-h-8">
                  {item.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 border-t border-border/40 mt-auto">
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.enabled}
                      onCheckedChange={(checked) => toggleIntegration(item.id, checked)}
                      disabled={readOnly}
                      aria-label={`Toggle ${item.name}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => testConnection(item)}
                      disabled={testingId === item.id}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      title="Test Connection"
                    >
                      {testingId === item.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Activity className="size-3" />
                      )}
                    </Button>

                    {!readOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openConfigure(item)}
                        className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <SettingsIcon className="size-3" />
                        Configure
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configure Modal */}
      <Dialog open={Boolean(configureItem)} onOpenChange={(open) => !open && setConfigureItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {configureItem?.name}</DialogTitle>
            <DialogDescription>
              Update connection parameters, endpoint URLs, and authentication tokens.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Webhook / Callback URL</Label>
              <Input
                value={formWebhook}
                onChange={(e) => setFormWebhook(e.target.value)}
                placeholder="https://api.yourdomain.com/webhooks"
                className="h-9 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">API Key / Token (Masked & Encrypted)</Label>
              <Input
                type="password"
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                placeholder="Enter new token to update"
                className="h-9 text-sm font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Credentials are masked in responses and cannot be retrieved after saving.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => setConfigureItem(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveConfigure}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
