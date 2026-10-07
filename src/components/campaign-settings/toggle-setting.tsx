'use client';

import type { ReactNode } from 'react';
import { Switch } from '@/components/ui/switch';
import { SettingRow } from './setting-row';

interface ToggleSettingProps {
  label: string;
  description?: string | ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  badge?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ToggleSetting({
  label,
  description,
  checked,
  onChange,
  badge,
  disabled,
  className,
}: ToggleSettingProps) {
  return (
    <SettingRow
      label={label}
      description={description}
      badge={badge}
      disabled={disabled}
      className={className}
    >
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
    </SettingRow>
  );
}
