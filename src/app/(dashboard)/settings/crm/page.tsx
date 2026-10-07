'use client';

import { Suspense } from 'react';
import { CRMSettingsLayout } from '@/components/crm-settings/crm-settings-layout';

export default function CRMSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <CRMSettingsLayout />
    </Suspense>
  );
}
