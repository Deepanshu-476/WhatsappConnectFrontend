'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingRowProps {
  label: string;
  description?: string | ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SettingRow({
  label,
  description,
  badge,
  children,
  className,
  disabled,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between',
        'border-b border-border/50 last:border-b-0',
        disabled && 'opacity-60 pointer-events-none',
        className,
      )}
    >
      <div className="space-y-0.5 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-2">{children}</div>
    </div>
  );
}
