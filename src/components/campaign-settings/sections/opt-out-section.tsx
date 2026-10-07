'use client';

import { useState, useEffect, useCallback } from 'react';
import { SettingsCard } from '../settings-card';
import { ToggleSetting } from '../toggle-setting';
import { SettingRow } from '../setting-row';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  X,
  Download,
  RotateCcw,
  UserX,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { OptOutSettings, OptOutRecord } from '@/types/campaign-settings';

interface OptOutSectionProps {
  settings: OptOutSettings;
  onChange: (updated: Partial<OptOutSettings>) => void;
  disabled?: boolean;
}

export function OptOutSection({ settings, onChange, disabled }: OptOutSectionProps) {
  const [newKeyword, setNewKeyword] = useState('');
  const [optOuts, setOptOuts] = useState<OptOutRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<OptOutRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch real opt-out records
  const loadOptOuts = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/campaign-settings/opt-outs');
      if (res.ok) {
        const data = await res.json();
        setOptOuts(data.optOuts || []);
      }
    } catch {
      // Mock fallback if network drop
      setOptOuts([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadOptOuts();
  }, [loadOptOuts]);

  // Add custom keyword
  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim().toUpperCase();
    if (!trimmed) return;
    if (settings.keywords.includes(trimmed) || settings.customKeywords.includes(trimmed)) {
      toast.error(`Keyword "${trimmed}" already registered`);
      return;
    }
    onChange({ customKeywords: [...settings.customKeywords, trimmed] });
    setNewKeyword('');
    toast.success(`Keyword "${trimmed}" added`);
  };

  const handleRemoveKeyword = (keyword: string) => {
    onChange({
      customKeywords: settings.customKeywords.filter((k) => k !== keyword),
    });
  };

  // Remove opt-out confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/campaign-settings/opt-outs/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Removed ${deleteTarget.phone} from opt-out list`);
        setOptOuts((prev) => prev.filter((o) => o.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error('Failed to remove opt-out record');
      }
    } catch {
      toast.error('Network error removing opt-out');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered opt-outs
  const filteredOptOuts = optOuts.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.phone.includes(q) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.keyword && item.keyword.toLowerCase().includes(q))
    );
  });

  const exportCSV = () => {
    if (optOuts.length === 0) {
      toast.info('No opt-out records to export');
      return;
    }
    const headers = 'Phone,Name,Keyword,Source,Date\n';
    const rows = optOuts
      .map(
        (o) =>
          `"${o.phone}","${o.name || ''}","${o.keyword || ''}","${o.source || 'keyword'}","${o.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opt-out-registry-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Opt-out list exported');
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Opt-Out Keyword Rules & Unsubscribe System"
        description="Honor WhatsApp recipient consent and prevent unsolicited marketing delivery."
        badge={
          <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/20 text-[10px]">
            GDPR &amp; Meta Compliant
          </Badge>
        }
      >
        <ToggleSetting
          label="Enable Opt-Out Processing Engine"
          description="Monitors incoming messages for designated opt-out keywords and automatically blacklists the phone number."
          checked={settings.enabled}
          onChange={(val) => onChange({ enabled: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Auto-Exclude Opted-Out Contacts from Campaigns"
          description="Campaign worker silently filters out anyone present in the opt-out registry prior to dispatch."
          checked={settings.autoExcludeOptedOut}
          onChange={(val) => onChange({ autoExcludeOptedOut: val })}
          disabled={disabled}
        />

        <ToggleSetting
          label="Require Administrative Confirmation to Remove Opt-Out"
          description="Prevents accidental re-subscription without explicit team confirmation."
          checked={settings.requireConfirmationToRemove}
          onChange={(val) => onChange({ requireConfirmationToRemove: val })}
          disabled={disabled}
        />

        {/* Standard Keywords */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-foreground">Standard WhatsApp Keywords</span>
          <p className="text-xs text-muted-foreground">Standardized keywords recognized universally across carriers.</p>
          <div className="flex flex-wrap gap-1.5">
            {settings.keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="font-mono text-xs px-2 py-0.5">
                {kw}
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Keywords */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-foreground">Custom Opt-Out Keywords</span>
          <p className="text-xs text-muted-foreground">Additional keywords that trigger the unsubscribe workflow.</p>
          <div className="flex items-center gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="e.g. STOPALL, CANCELME"
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
              disabled={disabled}
              className="w-48 text-xs font-mono uppercase"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddKeyword}
              disabled={disabled || !newKeyword.trim()}
              className="h-9 gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Keyword
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {settings.customKeywords.map((kw) => (
              <Badge key={kw} variant="outline" className="font-mono text-xs pl-2 pr-1 py-0.5 gap-1">
                {kw}
                {!disabled && (
                  <button
                    onClick={() => handleRemoveKeyword(kw)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Confirmation Message */}
        <SettingRow
          label="Unsubscribe Auto-Reply Message"
          description="Immediate WhatsApp confirmation reply sent to the customer upon receiving an opt-out keyword."
          disabled={disabled}
        >
          <Input
            value={settings.confirmationMessage}
            onChange={(e) => onChange({ confirmationMessage: e.target.value })}
            placeholder="You have been unsubscribed from marketing messages."
            disabled={disabled}
            className="w-80 text-xs"
          />
        </SettingRow>
      </SettingsCard>

      {/* Opt-Out Registry Table Card */}
      <SettingsCard
        title="Active Opt-Out Registry"
        description="All contacts currently blacklisted from marketing broadcasts."
        badge={
          <Badge variant="secondary" className="font-mono text-[10px]">
            {optOuts.length} Contacts
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadOptOuts}
              className="h-8 gap-1.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              className="h-8 gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        }
      >
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search phone number, name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        {loadingList ? (
          <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading opt-out registry...
          </div>
        ) : filteredOptOuts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
            <UserX className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-medium">No contacts opted out</p>
            <p className="text-[11px]">When customers reply with STOP or UNSUBSCRIBE, they will appear here.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs">Contact</TableHead>
                  <TableHead className="text-xs">Phone Number</TableHead>
                  <TableHead className="text-xs">Keyword</TableHead>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs">Opt-Out Date</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOptOuts.map((record) => (
                  <TableRow key={record.id} className="text-xs">
                    <TableCell className="font-medium text-foreground">
                      {record.name || 'Anonymous Contact'}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {record.phone}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {record.keyword || 'STOP'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {record.source || 'keyword'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(record)}
                        disabled={disabled}
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SettingsCard>

      {/* Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Remove from Opt-Out Registry?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              Are you sure you want to remove <strong>{deleteTarget?.phone}</strong> from the
              opt-out blacklist? This will re-enable marketing broadcasts to this mobile number.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirm Removal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
