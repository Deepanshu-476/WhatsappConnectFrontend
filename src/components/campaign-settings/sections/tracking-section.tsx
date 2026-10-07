'use client';

import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import type { TrackingSettings } from '@/types/campaign-settings';

interface TrackingSectionProps {
  settings: TrackingSettings;
  onChange: (updated: Partial<TrackingSettings>) => void;
  disabled?: boolean;
}

export function TrackingSection({ settings, onChange, disabled }: TrackingSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Delivery Telemetry & Engagement Tracking"
        description="Enable real-time tracking of message lifecycle events reported via Meta Cloud Webhooks."
      >
        <ToggleSetting
          label="Track Outbound Sent State"
          description="Records timestamp when Meta Cloud API confirms receipt of the outbound payload."
          checked={settings.trackSent}
          onChange={(val) => onChange({ trackSent: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Track Delivery Receipts (Double Gray Check)"
          description="Listens for webhook delivery confirmations to customer handsets."
          checked={settings.trackDelivered}
          onChange={(val) => onChange({ trackDelivered: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Track Read Receipts (Double Blue Check)"
          description="Logs when the recipient opens and reads the WhatsApp campaign message."
          checked={settings.trackRead}
          onChange={(val) => onChange({ trackRead: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Track Customer Inbound Replies"
          description="Associates recipient replies directly with the triggering campaign for attribution."
          checked={settings.trackReplied}
          onChange={(val) => onChange({ trackReplied: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Track Opt-Out Conversions"
          description="Attributes unsubscribe actions to the originating campaign blast."
          checked={settings.trackOptOut}
          onChange={(val) => onChange({ trackOptOut: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Link Click Tracking (URL Shortener)"
          description="Wraps CTA links with trackable click-redirect tokens to monitor click-through rates (CTR)."
          checked={settings.linkTracking}
          onChange={(val) => onChange({ linkTracking: val })}
          disabled={disabled}
          badge={<Badge variant="outline" className="text-[10px]">Beta</Badge>}
        />
      </SettingsCard>

      {/* Analytics Metric Calculation Reference Card */}
      <SettingsCard
        title="Key Performance Indicator (KPI) Formulas"
        description="Standard mathematical definitions used in campaign analytics dashboards and executive reports."
        icon={<TrendingUp className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Delivery Rate</span>
            <p className="text-muted-foreground font-mono text-[11px]">(Delivered / Sent) &times; 100%</p>
            <p className="text-[11px] text-muted-foreground">Measures message deliverability to active subscriber devices.</p>
          </div>

          <div className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1">
            <span className="font-semibold text-sky-600 dark:text-sky-400">Read Rate</span>
            <p className="text-muted-foreground font-mono text-[11px]">(Read / Delivered) &times; 100%</p>
            <p className="text-[11px] text-muted-foreground">Represents user interest and open rates.</p>
          </div>

          <div className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Reply Rate</span>
            <p className="text-muted-foreground font-mono text-[11px]">(Replied / Delivered) &times; 100%</p>
            <p className="text-[11px] text-muted-foreground">Gauges prospect conversational responsiveness and engagement.</p>
          </div>

          <div className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1">
            <span className="font-semibold text-rose-600 dark:text-rose-400">Failure Rate</span>
            <p className="text-muted-foreground font-mono text-[11px]">(Failed / Sent) &times; 100%</p>
            <p className="text-[11px] text-muted-foreground">Flags delivery degradation, blocked numbers, or invalid contacts.</p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
