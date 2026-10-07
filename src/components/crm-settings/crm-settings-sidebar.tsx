'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  GitBranch,
  Users,
  UserCheck,
  Inbox,
  PhoneCall,
  FileText,
  Bot,
  PlugZap,
  Bell,
  Shield,
  Settings,
  Search,
  ChevronRight,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CRMCategoryId } from '@/types/crm-settings';

export interface CategoryItem {
  id: CRMCategoryId;
  label: string;
  description: string;
  icon: typeof MessageSquare;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline';
}

export const CRM_CATEGORIES: CategoryItem[] = [
  {
    id: 'conversation',
    label: 'Conversation Management',
    description: 'Statuses, labels, auto-resolve & reopen rules',
    icon: MessageSquare,
  },
  {
    id: 'leads',
    label: 'Lead Management',
    description: 'Lead stages, sources & custom fields',
    icon: GitBranch,
  },
  {
    id: 'contacts',
    label: 'Contact Management',
    description: 'Custom fields, tags & duplicate handling',
    icon: Users,
  },
  {
    id: 'assignment',
    label: 'Assignment Settings',
    description: 'Round-robin, team routing & business hours',
    icon: UserCheck,
  },
  {
    id: 'inbox',
    label: 'Inbox & Chat',
    description: 'Auto-reply, away messages & sounds',
    icon: Inbox,
  },
  {
    id: 'channels',
    label: 'WhatsApp Channels',
    description: 'Connected phone numbers & webhooks',
    icon: PhoneCall,
    badge: 'Live',
    badgeVariant: 'secondary',
  },
  {
    id: 'templates',
    label: 'WhatsApp Templates',
    description: 'Meta approved broadcast templates',
    icon: FileText,
  },
  {
    id: 'ai',
    label: 'AI & Automation',
    description: 'Assistant model, knowledge base & rules',
    icon: Bot,
    badge: 'AI',
    badgeVariant: 'default',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Webhooks, Google Sheets & external CRMs',
    icon: PlugZap,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Alert toggles, email & browser sounds',
    icon: Bell,
  },
  {
    id: 'permissions',
    label: 'Permissions',
    description: 'Role access matrix & security policies',
    icon: Shield,
  },
  {
    id: 'general',
    label: 'General CRM Settings',
    description: 'Business hours, timezone & localization',
    icon: Settings,
  },
];

interface CRMSettingsSidebarProps {
  activeCategory: CRMCategoryId;
  onSelect: (id: CRMCategoryId) => void;
  className?: string;
}

export function CRMSettingsSidebar({
  activeCategory,
  onSelect,
  className,
}: CRMSettingsSidebarProps) {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return CRM_CATEGORIES;
    const q = search.toLowerCase();
    return CRM_CATEGORIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <aside
      className={cn(
        'w-full lg:w-64 shrink-0 flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-xs',
        className,
      )}
    >
      <div className="px-1 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            CRM Modules
          </h3>
          <span className="text-[11px] text-muted-foreground/70 font-mono">
            {CRM_CATEGORIES.length} sections
          </span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter settings..."
          className="h-8 pl-8 text-xs bg-muted/40 border-border/50"
        />
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-0.5">
        {filteredCategories.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No matching categories.
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.id === activeCategory;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelect(cat.id)}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                <div
                  className={cn(
                    'size-7 rounded-md flex items-center justify-center shrink-0 transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/80 text-muted-foreground group-hover:text-foreground group-hover:bg-muted',
                  )}
                >
                  <Icon className="size-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs">{cat.label}</span>
                    {cat.badge && (
                      <Badge
                        variant={cat.badgeVariant || 'outline'}
                        className="text-[9px] px-1 py-0 h-3.5 font-normal"
                      >
                        {cat.badge}
                      </Badge>
                    )}
                  </div>
                </div>

                {isActive && (
                  <ChevronRight className="size-3.5 shrink-0 text-primary opacity-80" />
                )}
              </button>
            );
          })
        )}
      </nav>

      <div className="mt-4 pt-3 border-t border-border px-2 space-y-1">
        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Billing & Usage
        </div>
        <Link
          href="/settings?tab=billing"
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <CreditCard className="size-3.5 shrink-0" />
          <span>Billing Management</span>
        </Link>
        <Link
          href="/settings?tab=wallet"
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Wallet className="size-3.5 shrink-0" />
          <span>My Wallet</span>
        </Link>
      </div>
    </aside>
  );
}
