'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, Clock, Sparkles } from 'lucide-react';

import { apiFetch } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

interface SubscriptionSummary {
  status: string;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  planName: string;
}

export function TrialBanner() {
  const pathname = usePathname();
  const [sub, setSub] = useState<SubscriptionSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    apiFetch<{ data: { subscription: SubscriptionSummary } }>('/api/billing/subscription')
      .then((res) => {
        if (mounted && res?.data?.subscription) {
          setSub(res.data.subscription);
        }
      })
      .catch(() => {
        // Silently skip if user is not authenticated or lacks permission
      });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (!sub) return null;

  // Don't show banner on the billing plans page itself to keep checkout clean
  if (pathname?.includes('/settings/billing/plans')) {
    return null;
  }

  // 1. Expired trial / subscription
  if (sub.isExpired || sub.status === 'EXPIRED') {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive sm:text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <span>
            <strong>Your free trial has ended.</strong> Choose a plan to unlock all WhatsApp CRM capabilities.
          </span>
        </div>
        <Link href="/settings/billing/plans">
          <Button size="sm" variant="destructive" className="h-7 text-xs">
            Choose a Plan
          </Button>
        </Link>
      </div>
    );
  }

  // 2. Active trial ending soon (3 days or less)
  if (sub.isTrial && sub.daysRemaining <= 3) {
    const message =
      sub.daysRemaining === 1
        ? 'Your free trial ends tomorrow.'
        : `Your free trial ends in ${sub.daysRemaining} days.`;

    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300 sm:text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            <strong>{message}</strong> Upgrade today to keep your WhatsApp workflows uninterrupted.
          </span>
        </div>
        <Link href="/settings/billing/plans">
          <Button
            size="sm"
            variant="outline"
            className="h-7 border-amber-500/40 bg-background text-xs font-semibold text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
          >
            <Sparkles className="mr-1.5 h-3 w-3" />
            View Plans
          </Button>
        </Link>
      </div>
    );
  }

  return null;
}

/**
 * Small indicator badge for Header or Dashboard
 */
export function SubscriptionIndicator() {
  const [sub, setSub] = useState<SubscriptionSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    apiFetch<{ data: { subscription: SubscriptionSummary } }>('/api/billing/subscription')
      .then((res) => {
        if (mounted && res?.data?.subscription) {
          setSub(res.data.subscription);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  if (!sub) return null;

  let text = `${sub.planName} · Active`;
  let color = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';

  if (sub.isTrial) {
    text = `Free Trial · ${sub.daysRemaining}d left`;
    color = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  } else if (sub.isExpired || sub.status === 'EXPIRED') {
    text = 'Trial Expired';
    color = 'bg-destructive/10 text-destructive border-destructive/20';
  }

  return (
    <Link
      href="/settings?tab=billing"
      title="Click to manage subscription & billing"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all hover:opacity-80 ${color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {text}
    </Link>
  );
}
