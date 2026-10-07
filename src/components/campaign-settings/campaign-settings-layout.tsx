'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  RotateCcw,
  AlertCircle,
  Loader2,
  Megaphone,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import {
  CampaignSettingsSidebar,
  CAMPAIGN_CATEGORIES,
  type CampaignCategoryId,
} from './campaign-settings-sidebar';
import { SaveButton } from '../crm-settings/save-button';
import { DEFAULT_CAMPAIGN_SETTINGS_DATA } from '@/lib/campaign-settings-defaults';
import type { CampaignSettingsData } from '@/types/campaign-settings';

// Sections
import { GeneralSection } from './sections/general-section';
import { SendingSection } from './sections/sending-section';
import { AudienceSection } from './sections/audience-section';
import { TemplatesSection } from './sections/templates-section';
import { AssignmentSection } from './sections/assignment-section';
import { SchedulingSection } from './sections/scheduling-section';
import { RateLimitsSection } from './sections/rate-limits-section';
import { QuietHoursSection } from './sections/quiet-hours-section';
import { RetrySection } from './sections/retry-section';
import { OptOutSection } from './sections/opt-out-section';
import { TrackingSection } from './sections/tracking-section';
import { NotificationsSection } from './sections/notifications-section';
import { AutomationSection } from './sections/automation-section';
import { ChannelsSection } from './sections/channels-section';
import { IntegrationsSection } from './sections/integrations-section';
import { WebhooksSection } from './sections/webhooks-section';
import { PermissionsSection } from './sections/permissions-section';

export function CampaignSettingsLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canEditSettings } = useAuth();
  const isReadOnly = !canEditSettings;

  const initialCategory = (searchParams.get('category') as CampaignCategoryId) || 'general';
  const [activeCategory, setActiveCategory] = useState<CampaignCategoryId>(initialCategory);

  const [settings, setSettings] = useState<CampaignSettingsData>(DEFAULT_CAMPAIGN_SETTINGS_DATA);
  const [initialLoadedSettings, setInitialLoadedSettings] = useState<CampaignSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Dirty state comparison
  const isDirty = useMemo(() => {
    if (!initialLoadedSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(initialLoadedSettings);
  }, [settings, initialLoadedSettings]);

  // Load settings on mount
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaign-settings', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to load Campaign settings');
      }
      const data = await res.json();
      if (data?.settings) {
        setSettings(data.settings);
        setInitialLoadedSettings(data.settings);
      }
    } catch (err) {
      console.error('[CampaignSettings] fetch error:', err);
      toast.error('Unable to load campaign settings. Using cached defaults.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  // Category switch
  const handleSelectCategory = (cat: CampaignCategoryId) => {
    setActiveCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', cat);
    router.replace(`/campaigns/settings?${params.toString()}`, { scroll: false });
  };

  // Save changes
  const handleSave = async () => {
    if (isReadOnly) {
      toast.error('You do not have permission to modify campaign settings.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/campaign-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save settings');
      }

      const data = await res.json();
      if (data?.settings) {
        setSettings(data.settings);
        setInitialLoadedSettings(data.settings);
      }
      toast.success('Campaign settings updated successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error saving settings';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Revert changes back to server state
  const handleRevert = () => {
    if (initialLoadedSettings) {
      setSettings(initialLoadedSettings);
      toast.info('Changes reverted to last saved state.');
    }
  };

  // Reset to factory defaults
  const handleResetToDefaults = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/campaign-settings/reset', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to reset settings to defaults');
      }

      const data = await res.json();
      if (data?.settings) {
        setSettings(data.settings);
        setInitialLoadedSettings(data.settings);
      }
      setResetModalOpen(false);
      toast.success('Campaign settings reset to initial defaults.');
    } catch {
      toast.error('Unable to reset campaign settings.');
    } finally {
      setResetting(false);
    }
  };

  const activeMeta = useMemo(() => {
    return (
      CAMPAIGN_CATEGORIES.find((c) => c.id === activeCategory) ||
      CAMPAIGN_CATEGORIES[0]
    );
  }, [activeCategory]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Header & Breadcrumbs Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/50">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Link href="/campaigns" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Megaphone className="h-3.5 w-3.5 text-primary" />
              Campaigns
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-foreground font-medium">Settings</span>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-primary font-medium">{activeMeta.label}</span>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Megaphone className="size-6 text-primary" />
              Campaign Settings
            </h1>
            {isReadOnly && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Read Only
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Global operational policies, rate limits, opt-out rules, and scheduling cadence for all campaigns.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            disabled={loading || saving || isReadOnly}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset Defaults
          </Button>

          <SaveButton
            dirty={isDirty}
            saving={saving}
            onSave={handleSave}
            onReset={handleRevert}
            disabled={isReadOnly || loading}
          />
        </div>
      </div>

      {/* Mobile Category Dropdown */}
      <div className="block lg:hidden">
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
          Settings Section:
        </label>
        <Select
          value={activeCategory}
          onValueChange={(val) => handleSelectCategory(val as CampaignCategoryId)}
        >
          <SelectTrigger className="w-full text-xs h-9 bg-card">
            <SelectValue placeholder="Select section..." />
          </SelectTrigger>
          <SelectContent>
            {CAMPAIGN_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label} ({cat.group})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block sticky top-4">
          <CampaignSettingsSidebar
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* Right Configuration Panel */}
        <main className="min-w-0 space-y-6" aria-live="polite">
          {/* Active Section Header Banner */}
          <div className="flex flex-col gap-1 pb-3 border-b border-border/40 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <activeMeta.icon className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{activeMeta.label}</h2>
                  {activeMeta.badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px] px-1.5 py-0 h-4 font-normal',
                        activeMeta.badge === 'Critical' &&
                          'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
                        activeMeta.badge === 'Compliant' &&
                          'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      )}
                    >
                      {activeMeta.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{activeMeta.description}</p>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-primary" />
                <p className="text-xs">Loading campaign configurations...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeCategory === 'general' && (
                  <GeneralSection
                    settings={settings.generalSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'sending' && (
                  <SendingSection
                    settings={settings.sendingSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        sendingSettings: { ...prev.sendingSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'audience' && (
                  <AudienceSection
                    settings={settings.audienceSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        audienceSettings: { ...prev.audienceSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'templates' && (
                  <TemplatesSection
                    settings={settings.templateSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        templateSettings: { ...prev.templateSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'assignment' && (
                  <AssignmentSection
                    settings={settings.assignmentSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        assignmentSettings: { ...prev.assignmentSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'scheduling' && (
                  <SchedulingSection
                    settings={settings.schedulingSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        schedulingSettings: { ...prev.schedulingSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'rate_limits' && (
                  <RateLimitsSection
                    settings={settings.rateLimitSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        rateLimitSettings: { ...prev.rateLimitSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'quiet_hours' && (
                  <QuietHoursSection
                    settings={settings.quietHoursSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        quietHoursSettings: { ...prev.quietHoursSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'retry' && (
                  <RetrySection
                    settings={settings.retrySettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        retrySettings: { ...prev.retrySettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'opt_out' && (
                  <OptOutSection
                    settings={settings.optOutSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        optOutSettings: { ...prev.optOutSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'tracking' && (
                  <TrackingSection
                    settings={settings.trackingSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        trackingSettings: { ...prev.trackingSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'notifications' && (
                  <NotificationsSection
                    settings={settings.notificationSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        notificationSettings: { ...prev.notificationSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'automation' && (
                  <AutomationSection
                    settings={settings.automationSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        automationSettings: { ...prev.automationSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'channels' && (
                  <ChannelsSection
                    settings={settings.channelSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        channelSettings: { ...prev.channelSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'integrations' && (
                  <IntegrationsSection
                    settings={settings.integrationSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        integrationSettings: { ...prev.integrationSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'api_webhooks' && (
                  <WebhooksSection
                    settings={settings.apiWebhookSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        apiWebhookSettings: { ...prev.apiWebhookSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}

                {activeCategory === 'permissions' && (
                  <PermissionsSection
                    settings={settings.permissionSettings}
                    onChange={(updated) =>
                      setSettings((prev) => ({
                        ...prev,
                        permissionSettings: { ...prev.permissionSettings, ...updated },
                      }))
                    }
                    disabled={isReadOnly}
                  />
                )}
              </div>
            )}
          </main>
        </div>

      {/* Floating Save Bar when dirty */}
      {isDirty && !loading && (
        <div className="fixed bottom-6 right-6 z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-3 bg-card/90 backdrop-blur-md border border-border shadow-lg rounded-xl flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs font-medium text-foreground">You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-2 border-l border-border/40 pl-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRevert}
                disabled={saving}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="h-8 text-xs gap-1.5"
              >
                {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                Save Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              Reset Campaign Settings?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              This action will reset all 16 campaign configurations (general, sending rules, rate
              limits, quiet hours, retry intervals, and automation) back to initial factory
              defaults. Any custom keyword lists or delay overrides will be overwritten.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetModalOpen(false)}
              disabled={resetting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetToDefaults}
              disabled={resetting}
              className="gap-1.5"
            >
              {resetting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset to Factory Defaults'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
