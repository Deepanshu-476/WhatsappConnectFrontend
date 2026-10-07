'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className={cn('border-border/60 shadow-xs bg-card/60 backdrop-blur-xs', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            {icon && <span className="text-primary">{icon}</span>}
            {title}
            {badge}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent className={cn('pt-4 space-y-4', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
