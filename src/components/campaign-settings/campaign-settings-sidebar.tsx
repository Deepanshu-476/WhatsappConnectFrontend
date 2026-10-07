'use client';

import { useState } from 'react';
import {
  Settings,
  Send,
  Users,
  FileText,
  UserCheck,
  Calendar,
  Gauge,
  Moon,
  RotateCcw,
  UserX,
  BarChart3,
  Bell,
  Cpu,
  Smartphone,
  Layers,
  Webhook,
  ShieldCheck,
  Search,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type CampaignCategoryId =
  | 'general'
  | 'sending'
  | 'audience'
  | 'templates'
  | 'assignment'
  | 'scheduling'
  | 'rate_limits'
  | 'quiet_hours'
  | 'retry'
  | 'opt_out'
  | 'tracking'
  | 'notifications'
  | 'automation'
  | 'channels'
  | 'integrations'
  | 'api_webhooks'
  | 'permissions';

export interface CampaignCategoryItem {
  id: CampaignCategoryId;
  label: string;
  description: string;
  icon: typeof Settings;
  badge?: string;
  group: 'Core' | 'Delivery' | 'Compliance & Safety' | 'Advanced & Integrations';
}

export const CAMPAIGN_CATEGORIES: CampaignCategoryItem[] = [
  // Core
  {
    id: 'general',
    label: 'General Settings',
    description: 'Naming rules, default channel, timezone & limits',
    icon: Settings,
    group: 'Core',
  },
  {
    id: 'audience',
    label: 'Audience & Segments',
    description: 'Contact filters, pre-validation & segments',
    icon: Users,
    group: 'Core',
  },
  {
    id: 'templates',
    label: 'WhatsApp Templates',
    description: 'Approved templates, variables & fallbacks',
    icon: FileText,
    group: 'Core',
  },
  {
    id: 'assignment',
    label: 'Campaign Assignment',
    description: 'Owner assignment & round-robin rules',
    icon: UserCheck,
    group: 'Core',
  },

  // Delivery
  {
    id: 'sending',
    label: 'Campaign Sending',
    description: 'Batch, drip, delay & human-like cadence',
    icon: Send,
    group: 'Delivery',
  },
  {
    id: 'scheduling',
    label: 'Scheduling',
    description: 'Send now, timed schedules & recurring runs',
    icon: Calendar,
    group: 'Delivery',
  },
  {
    id: 'rate_limits',
    label: 'Rate Limits',
    description: 'Min/hour/day caps & concurrent sends',
    icon: Gauge,
    badge: 'Critical',
    group: 'Delivery',
  },
  {
    id: 'quiet_hours',
    label: 'Quiet Hours',
    description: 'Pause or delay sends during night windows',
    icon: Moon,
    group: 'Delivery',
  },
  {
    id: 'retry',
    label: 'Retry & Failures',
    description: 'Auto-retry transient delivery failures',
    icon: RotateCcw,
    group: 'Delivery',
  },

  // Compliance & Safety
  {
    id: 'opt_out',
    label: 'Opt-Out Management',
    description: 'STOP keywords & blacklisted contact registry',
    icon: UserX,
    badge: 'Compliant',
    group: 'Compliance & Safety',
  },
  {
    id: 'tracking',
    label: 'Tracking & Analytics',
    description: 'Delivery rates, read receipts & replies',
    icon: BarChart3,
    group: 'Compliance & Safety',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Alerts on completion, pauses & high failures',
    icon: Bell,
    group: 'Compliance & Safety',
  },

  // Advanced & Integrations
  {
    id: 'automation',
    label: 'Automation',
    description: 'Post-campaign workflows & tagging rules',
    icon: Cpu,
    group: 'Advanced & Integrations',
  },
  {
    id: 'channels',
    label: 'WhatsApp Channels',
    description: 'Connected numbers, quality & tier limits',
    icon: Smartphone,
    group: 'Advanced & Integrations',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'WhatsApp API, Sheets, Webhooks & CRM',
    icon: Layers,
    group: 'Advanced & Integrations',
  },
  {
    id: 'api_webhooks',
    label: 'API & Webhooks',
    description: 'REST endpoints & campaign event dispatchers',
    icon: Webhook,
    group: 'Advanced & Integrations',
  },
  {
    id: 'permissions',
    label: 'Permissions Matrix',
    description: 'Role access for Owner, Admin, Agent & Viewer',
    icon: ShieldCheck,
    group: 'Advanced & Integrations',
  },
];

interface CampaignSettingsSidebarProps {
  activeCategory: CampaignCategoryId;
  onSelectCategory: (id: CampaignCategoryId) => void;
  className?: string;
}

export function CampaignSettingsSidebar({
  activeCategory,
  onSelectCategory,
  className,
}: CampaignSettingsSidebarProps) {
  const [query, setQuery] = useState('');

  const filteredCategories = CAMPAIGN_CATEGORIES.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.group.toLowerCase().includes(query.toLowerCase())
  );

  const groups = Array.from(new Set(filteredCategories.map((c) => c.group)));

  return (
    <aside
      className={cn(
        'w-full lg:w-72 shrink-0 flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-xs shadow-2xs',
        className
      )}
    >
      {/* Header & Section Count */}
      <div className="px-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Settings Sections
        </span>
        <span className="text-[10px] text-muted-foreground/70 font-mono bg-muted/60 px-1.5 py-0.5 rounded">
          {CAMPAIGN_CATEGORIES.length}
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Filter settings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 pr-7 text-xs h-8 bg-muted/40 border-border/60 rounded-lg"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground p-0.5"
            aria-label="Clear filter"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Categories grouped with independent scroll */}
      <nav className="space-y-4 max-h-[calc(100vh-230px)] overflow-y-auto pr-1" aria-label="Campaign Settings Navigation">
        {groups.map((group) => {
          const items = filteredCategories.filter((c) => c.group === group);
          return (
            <div key={group} className="space-y-1">
              <h2 className="px-2 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                {group}
              </h2>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeCategory === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectCategory(item.id)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition-all select-none group',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <div
                        className={cn(
                          'size-6 rounded-md flex items-center justify-center shrink-0 transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-2xs'
                            : 'bg-muted/70 text-muted-foreground group-hover:text-foreground group-hover:bg-muted'
                        )}
                      >
                        <Icon className="size-3.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-xs">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[9px] px-1 py-0 h-3.5 font-normal',
                                item.badge === 'Critical' &&
                                  'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
                                item.badge === 'Compliant' &&
                                  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg">
            No settings match &ldquo;{query}&rdquo;
          </div>
        )}
      </nav>
    </aside>
  );
}
