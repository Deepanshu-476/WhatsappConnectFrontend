'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingRowProps {
  label: string;
  description?: string | ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SettingRow({
  label,
  description,
  badge,
  children,
  disabled,
  className,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 border-b border-border/40 last:border-0 last:pb-0 first:pt-0',
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
    >
      <div className="space-y-0.5 max-w-xl pr-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0 flex items-center sm:justify-end">{children}</div>
    </div>
  );
}
