'use client';

import { Suspense } from 'react';
import { SubscriptionPlansPanel } from '@/components/billing/subscription-plans-panel';

export default function PlansPage() {
  return (
    <div className="mx-auto max-w-6xl py-4 sm:py-6">
      <Suspense fallback={null}>
        <SubscriptionPlansPanel />
      </Suspense>
    </div>
  );
}
