'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  Loader2,
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

import { CRMSettingsSidebar, CRM_CATEGORIES } from './crm-settings-sidebar';
import { SaveButton } from './save-button';
import { INITIAL_CRM_SETTINGS } from '@/lib/crm-settings-defaults';
import type { CRMSettings, CRMCategoryId } from '@/types/crm-settings';

// Category Sections
import { ConversationSection } from './sections/conversation-section';
import { LeadSection } from './sections/lead-section';
import { ContactSection } from './sections/contact-section';
import { AssignmentSection } from './sections/assignment-section';
import { InboxSection } from './sections/inbox-section';
import { ChannelsSection } from './sections/channels-section';
import { TemplatesSection } from './sections/templates-section';
import { AiSection } from './sections/ai-section';
import { IntegrationsSection } from './sections/integrations-section';
import { NotificationsSection } from './sections/notifications-section';
import { PermissionsSection } from './sections/permissions-section';
import { GeneralSection } from './sections/general-section';

export function CRMSettingsLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canEditSettings } = useAuth();
  const isReadOnly = !canEditSettings;

  // Active Category from search params or default
  const initialCategory = (searchParams.get('category') as CRMCategoryId) || 'conversation';
  const [activeCategory, setActiveCategory] = useState<CRMCategoryId>(initialCategory);

  const [settings, setSettings] = useState<CRMSettings>(INITIAL_CRM_SETTINGS);
  const [initialLoadedSettings, setInitialLoadedSettings] = useState<CRMSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Check dirty state by comparing with loaded settings
  const isDirty = useMemo(() => {
    if (!initialLoadedSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(initialLoadedSettings);
  }, [settings, initialLoadedSettings]);

  // Load settings on mount
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm-settings', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to load CRM settings');
      }
      const data = await res.json();
      if (data?.settings) {
        setSettings(data.settings);
        setInitialLoadedSettings(data.settings);
      }
    } catch (err) {
      console.error('[CRMSettings] fetch error:', err);
      toast.error('Unable to load CRM settings. Using cached defaults.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  // Sync category param with URL without scroll jump
  const handleSelectCategory = (cat: CRMCategoryId) => {
    setActiveCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', cat);
    router.replace(`/settings/crm?${params.toString()}`, { scroll: false });
  };

  // Warn on window unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Save changes
  async function handleSave() {
    if (saving || !isDirty || isReadOnly) return;
    setSaving(true);
    try {
      const res = await fetch('/api/crm-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Unable to save settings. Please try again.');
      }

      if (data?.settings) {
        setSettings(data.settings);
        setInitialLoadedSettings(data.settings);
      } else {
        setInitialLoadedSettings(settings);
      }

      toast.success('Settings saved successfully');
    } catch (err) {
      console.error('[CRMSettings] save error:', err);
      toast.error(err instanceof Error ? err.message : 'Unable to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Revert changes back to loaded
  function handleRevert() {
    if (initialLoadedSettings) {
      setSettings(initialLoadedSettings);
      toast.info('Changes reverted to saved values');
    }
  }

  // Reset to factory defaults
  async function handleResetDefaults() {
    setResetting(true);
    try {
      const res = await fetch('/api/crm-settings/reset', {
        method: 'POST',
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to reset settings');
      }

      if (data?.settings) {
        setSettings(data.settings);
        setInitialLoadedSettings(data.settings);
      } else {
        setSettings(INITIAL_CRM_SETTINGS);
        setInitialLoadedSettings(INITIAL_CRM_SETTINGS);
      }

      setResetModalOpen(false);
      toast.success('CRM settings restored to system defaults');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset settings');
    } finally {
      setResetting(false);
    }
  }

  const activeCategoryMeta = CRM_CATEGORIES.find((c) => c.id === activeCategory) || CRM_CATEGORIES[0];

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* Top Header & Breadcrumbs Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Link href="/settings" className="hover:text-foreground transition-colors">
              Settings
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">CRM Settings</span>
            <ChevronRight className="size-3" />
            <span className="text-primary font-medium">{activeCategoryMeta.label}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <SlidersHorizontal className="size-6 text-primary" />
            CRM Settings
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Configure lifecycle stages, automated routing, WhatsApp channels, and AI intelligence.
          </p>
        </div>

        {/* Global Save / Reset Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetModalOpen(true)}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Reset Defaults
            </Button>
          )}

          <SaveButton
            dirty={isDirty}
            saving={saving}
            onSave={handleSave}
            onReset={handleRevert}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Mobile Category Select Dropdown */}
      <div className="block lg:hidden">
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
          Settings Section:
        </label>
        <Select
          value={activeCategory}
          onValueChange={(val) => handleSelectCategory(val as CRMCategoryId)}
        >
          <SelectTrigger className="w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CRM_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
        {/* Left: Desktop Sidebar Navigation */}
        <div className="hidden lg:block sticky top-4">
          <CRMSettingsSidebar
            activeCategory={activeCategory}
            onSelect={handleSelectCategory}
          />
        </div>

        {/* Right: Active Section Panel */}
        <main className="min-w-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading CRM settings...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeCategory === 'conversation' && (
                <ConversationSection
                  settings={settings.conversationSettings}
                  onChange={(val) => setSettings({ ...settings, conversationSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'leads' && (
                <LeadSection
                  settings={settings.leadSettings}
                  onChange={(val) => setSettings({ ...settings, leadSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'contacts' && (
                <ContactSection
                  settings={settings.contactSettings}
                  onChange={(val) => setSettings({ ...settings, contactSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'assignment' && (
                <AssignmentSection
                  settings={settings.assignmentSettings}
                  onChange={(val) => setSettings({ ...settings, assignmentSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'inbox' && (
                <InboxSection
                  settings={settings.inboxSettings}
                  onChange={(val) => setSettings({ ...settings, inboxSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'channels' && (
                <ChannelsSection
                  settings={settings.whatsappSettings}
                  onChange={(val) => setSettings({ ...settings, whatsappSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'templates' && (
                <TemplatesSection
                  settings={settings.templateSettings}
                  onChange={(val) => setSettings({ ...settings, templateSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'ai' && (
                <AiSection
                  settings={settings.aiSettings}
                  onChange={(val) => setSettings({ ...settings, aiSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'integrations' && (
                <IntegrationsSection
                  settings={settings.integrationSettings}
                  onChange={(val) => setSettings({ ...settings, integrationSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'notifications' && (
                <NotificationsSection
                  settings={settings.notificationSettings}
                  onChange={(val) => setSettings({ ...settings, notificationSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'permissions' && (
                <PermissionsSection
                  settings={settings.permissionSettings}
                  onChange={(val) => setSettings({ ...settings, permissionSettings: val })}
                  readOnly={isReadOnly}
                />
              )}

              {activeCategory === 'general' && (
                <GeneralSection
                  settings={settings.generalSettings}
                  onChange={(val) => setSettings({ ...settings, generalSettings: val })}
                  readOnly={isReadOnly}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Factory Reset Confirmation Dialog */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertCircle className="size-5" />
              Reset CRM Settings to Defaults
            </DialogTitle>
            <DialogDescription>
              This will restore all 12 modules (statuses, stages, assignment algorithms, away messages, and permissions) to system initial defaults. Custom configured fields will revert.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetModalOpen(false)}
              disabled={resetting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleResetDefaults}
              disabled={resetting}
              className="gap-1.5"
            >
              {resetting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset All Modules'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
