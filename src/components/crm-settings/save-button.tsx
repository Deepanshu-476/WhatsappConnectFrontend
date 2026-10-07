'use client';

import { Loader2, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SaveButtonProps {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SaveButton({
  dirty,
  saving,
  onSave,
  onReset,
  disabled,
  className,
}: SaveButtonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 transition-all duration-200',
        className,
      )}
    >
      {dirty && (
        <Badge
          variant="outline"
          className="border-amber-500/40 bg-amber-500/10 text-amber-500 animate-pulse text-[11px] font-medium"
        >
          Unsaved Changes
        </Badge>
      )}

      {onReset && dirty && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={saving || disabled}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
          Revert
        </Button>
      )}

      <Button
        type="button"
        size="sm"
        onClick={onSave}
        disabled={saving || !dirty || disabled}
        className={cn(
          'h-8 px-3.5 text-xs font-semibold gap-1.5 transition-colors',
          dirty
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
            : 'bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed',
        )}
      >
        {saving ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="size-3.5" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}
