'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingsCardProps {
  title: string;
  description?: string | ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SettingsCard({
  title,
  description,
  icon,
  badge,
  action,
  children,
  className,
  contentClassName,
}: SettingsCardProps) {
  return (
    <div className={cn('rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden transition-all', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-muted/25 border-b border-border/50">
        <div className="space-y-0.5">
          <div className="text-sm font-semibold flex items-center gap-2 text-foreground">
            {icon && <span className="text-primary size-4 flex items-center justify-center">{icon}</span>}
            <span>{title}</span>
            {badge}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
      </div>
      <div className={cn('p-5 space-y-4', contentClassName)}>
        {children}
      </div>
    </div>
  );
}
