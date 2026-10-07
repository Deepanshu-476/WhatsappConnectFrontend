'use client';

import type { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SettingRow } from './setting-row';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

interface SelectSettingProps {
  label: string;
  description?: string | ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  badge?: ReactNode;
  width?: string;
  className?: string;
}

export function SelectSetting({
  label,
  description,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled,
  badge,
  width = 'w-full sm:w-60',
  className,
}: SelectSettingProps) {
  return (
    <SettingRow
      label={label}
      description={description}
      badge={badge}
      disabled={disabled}
      className={className}
    >
      <Select value={value} onValueChange={(val) => onChange(val ?? '')} disabled={disabled}>
        <SelectTrigger className={cn(width, 'text-xs h-9 bg-background/80 border-border/70 shadow-2xs')}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col py-0.5">
                <span className="font-medium text-xs">{option.label}</span>
                {option.description && (
                  <span className="text-[11px] text-muted-foreground">{option.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingRow>
  );
}
