'use client';

import { useState } from 'react';
import { SettingsCard } from '../settings-card';
import { SelectSetting } from '../select-setting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Smartphone, ShieldCheck, Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ChannelSettings, WhatsAppChannelItem } from '@/types/campaign-settings';

interface ChannelsSectionProps {
  settings: ChannelSettings;
  onChange: (updated: Partial<ChannelSettings>) => void;
  disabled?: boolean;
}

export function ChannelsSection({ settings, onChange, disabled }: ChannelsSectionProps) {
  const [testingId, setTestingId] = useState<string | null>(null);

  const channels = settings.channels || [];

  const handleToggle = (id: string, enabled: boolean) => {
    const updated = channels.map((c) => (c.id === id ? { ...c, enabled } : c));
    onChange({ channels: updated });
  };

  const handleTestChannel = async (channel: WhatsAppChannelItem) => {
    setTestingId(channel.id);
    try {
      const res = await fetch('/api/campaign-settings/test-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channel.id }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(data.message || `Channel ${channel.name} verified successfully!`);
      } else {
        toast.error(data.error || 'Channel health verification failed');
      }
    } catch {
      toast.error('Network error during channel diagnostic test');
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="WhatsApp Channel Routing & Quality"
        description="Select default outbound numbers, review Meta health indicators, and monitor tier utilization."
      >
        <SelectSetting
          label="Default Outbound Marketing Channel"
          description="Default WhatsApp business number assigned to newly created campaigns."
          value={settings.defaultChannelId}
          onChange={(val) => onChange({ defaultChannelId: val })}
          options={channels.map((c) => ({
            label: `${c.name} (${c.phoneNumber})`,
            value: c.id,
            description: `Quality: ${c.qualityRating} • Tier: ${c.messagingLimit}`,
          }))}
          disabled={disabled}
        />
      </SettingsCard>

      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Registered Marketing Phone Numbers
        </h2>

        {channels.map((ch) => {
          const isDefault = settings.defaultChannelId === ch.id;
          const usagePercent = ch.dailyLimit ? Math.round((ch.currentUsage / ch.dailyLimit) * 100) : 0;
          const isTesting = testingId === ch.id;

          return (
            <div
              key={ch.id}
              className="p-4 rounded-xl border border-border/50 bg-card hover:border-border transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{ch.name}</span>
                      {isDefault && (
                        <Badge variant="outline" className="text-[10px] text-primary border-primary/20">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{ch.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      ch.qualityRating === 'GREEN'
                        ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                        : ch.qualityRating === 'YELLOW'
                        ? 'text-amber-600 bg-amber-500/10 border-amber-500/20'
                        : 'text-rose-600 bg-rose-500/10 border-rose-500/20'
                    }`}
                  >
                    Quality: {ch.qualityRating}
                  </Badge>

                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {ch.messagingLimit}
                  </Badge>

                  <div className="flex items-center gap-2 pl-2 border-l border-border/40">
                    <Switch
                      checked={ch.enabled}
                      onCheckedChange={(val) => handleToggle(ch.id, val)}
                      disabled={disabled}
                      aria-label={`Toggle ${ch.name}`}
                    />
                  </div>
                </div>
              </div>

              {/* Tier Usage Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Daily Dispatch Quota: {ch.currentUsage.toLocaleString()} / {ch.dailyLimit.toLocaleString()} messages</span>
                  <span className="font-mono font-medium">{usagePercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, usagePercent)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-border/30">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Meta Cloud API credentials encrypted &amp; isolated
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestChannel(ch)}
                  disabled={disabled || isTesting}
                  className="h-8 gap-1.5 text-xs"
                >
                  {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
                  Test Connection
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
