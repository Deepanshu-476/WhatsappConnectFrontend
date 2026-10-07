'use client';

import { useState } from 'react';
import { SettingsCard } from '../settings-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Code2,
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ApiWebhookSettings, WebhookEndpoint } from '@/types/campaign-settings';

interface WebhooksSectionProps {
  settings: ApiWebhookSettings;
  onChange: (updated: Partial<ApiWebhookSettings>) => void;
  disabled?: boolean;
}

const SUPPORTED_EVENTS = [
  'campaign.created',
  'campaign.started',
  'campaign.completed',
  'campaign.paused',
  'campaign.stopped',
  'campaign.message.sent',
  'campaign.message.delivered',
  'campaign.message.read',
  'campaign.message.failed',
  'campaign.contact.replied',
  'campaign.contact.opted_out',
];

const API_ENDPOINTS = [
  { method: 'POST', path: '/api/campaigns', desc: 'Create new marketing campaign' },
  { method: 'GET', path: '/api/campaigns/:id', desc: 'Fetch campaign record and summary' },
  { method: 'PUT', path: '/api/campaigns/:id', desc: 'Update draft or scheduled campaign' },
  { method: 'POST', path: '/api/campaigns/:id/start', desc: 'Launch or trigger campaign worker' },
  { method: 'POST', path: '/api/campaigns/:id/pause', desc: 'Pause active campaign dispatches' },
  { method: 'POST', path: '/api/campaigns/:id/resume', desc: 'Resume campaign from remaining contacts' },
  { method: 'POST', path: '/api/campaigns/:id/stop', desc: 'Permanently cancel campaign' },
  { method: 'GET', path: '/api/campaigns/:id/analytics', desc: 'Retrieve full KPI metrics and recipient telemetry' },
];

export function WebhooksSection({ settings, onChange, disabled }: WebhooksSectionProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  const webhooks = settings.webhooks || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    toast.success('Endpoint copied to clipboard');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleToggle = (id: string, active: boolean) => {
    const updated = webhooks.map((w) => (w.id === id ? { ...w, active } : w));
    onChange({ webhooks: updated });
  };

  const handleDelete = (id: string) => {
    const updated = webhooks.filter((w) => w.id !== id);
    onChange({ webhooks: updated });
    toast.success('Webhook endpoint removed');
  };

  const handleAddWebhook = () => {
    if (!newUrl.trim() || !newUrl.startsWith('http')) {
      toast.error('Please enter a valid HTTP/HTTPS webhook destination URL');
      return;
    }

    const newEndpoint: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      name: newName.trim() || 'Webhook Destination',
      url: newUrl.trim(),
      events: [...SUPPORTED_EVENTS],
      secret: 'whsec_••••••••••••••••••••••••',
      active: true,
    };

    onChange({ webhooks: [...webhooks, newEndpoint] });
    setNewUrl('');
    setNewName('');
    toast.success('Webhook endpoint registered');
  };

  return (
    <div className="space-y-6">
      {/* Campaign REST API Reference */}
      <SettingsCard
        title="Campaign REST API Reference"
        description="Programmatically orchestrate marketing campaigns from backend microservices or third-party CRM systems."
        icon={<Code2 className="h-4 w-4" />}
      >
        <div className="rounded-lg border border-border/50 overflow-hidden font-mono text-xs">
          {API_ENDPOINTS.map((ep, idx) => (
            <div
              key={ep.path + ep.method}
              className={`p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'
              } border-b border-border/30 last:border-0`}
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] w-14 justify-center font-bold ${
                    ep.method === 'POST'
                      ? 'text-emerald-600 border-emerald-500/30'
                      : ep.method === 'PUT'
                      ? 'text-amber-600 border-amber-500/30'
                      : 'text-sky-600 border-sky-500/30'
                  }`}
                >
                  {ep.method}
                </Badge>
                <span className="text-foreground font-semibold">{ep.path}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground font-sans">{ep.desc}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(ep.path)}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  {copiedPath === ep.path ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Outbound Webhook Subscriptions */}
      <SettingsCard
        title="Outbound Webhook Event Dispatchers"
        description="Receive signed real-time JSON payloads whenever a campaign event occurs."
        icon={<Webhook className="h-4 w-4" />}
      >
        <div className="space-y-3">
          {/* Add Webhook Form */}
          <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-3">
            <span className="text-xs font-semibold text-foreground">Register Outgoing Webhook</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                placeholder="Destination Name (e.g. Analytics Pipeline)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={disabled}
                className="text-xs"
              />
              <Input
                placeholder="https://api.yourdomain.com/webhooks/campaigns"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                disabled={disabled}
                className="text-xs font-mono"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleAddWebhook}
              disabled={disabled || !newUrl.trim()}
              className="h-8 gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Webhook Endpoint
            </Button>
          </div>

          {/* Webhook Endpoints List */}
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="p-4 rounded-xl border border-border/50 bg-card hover:border-border transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground">{wh.name}</span>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">{wh.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={wh.active}
                    onCheckedChange={(val) => handleToggle(wh.id, val)}
                    disabled={disabled}
                    aria-label={`Toggle ${wh.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(wh.id)}
                    disabled={disabled}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Supported Events Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {wh.events.map((ev) => (
                  <Badge key={ev} variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                    {ev}
                  </Badge>
                ))}
              </div>

              <div className="pt-2 border-t border-border/30 text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Secret: <code className="font-mono">{wh.secret || 'whsec_••••••••••••••••'}</code></span>
                <span>Payload: JSON HMAC-SHA256 Signed</span>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
