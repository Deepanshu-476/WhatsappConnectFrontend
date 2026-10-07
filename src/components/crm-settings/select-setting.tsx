'use client';

import { ReactNode } from 'react';
import { SettingRow } from './setting-row';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectSettingProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  badge?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SelectSetting({
  label,
  description,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  badge,
  disabled,
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
        <SelectTrigger className="w-[180px] sm:w-[220px] bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingRow>
  );
}
