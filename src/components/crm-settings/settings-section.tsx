'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string | ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  icon,
  action,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <div className={cn('space-y-6 animate-in fade-in-50 duration-200', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            {icon && <span className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</span>}
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
