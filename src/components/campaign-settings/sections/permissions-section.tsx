'use client';

import { SettingsCard } from '../settings-card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShieldCheck } from 'lucide-react';
import type { PermissionSettings, RolePermissionItem } from '@/types/campaign-settings';

interface PermissionsSectionProps {
  settings: PermissionSettings;
  onChange: (updated: Partial<PermissionSettings>) => void;
  disabled?: boolean;
}

const PERMISSION_COLUMNS: Array<{ key: keyof RolePermissionItem['permissions']; label: string }> = [
  { key: 'viewCampaigns', label: 'View' },
  { key: 'createCampaign', label: 'Create' },
  { key: 'editCampaign', label: 'Edit' },
  { key: 'deleteCampaign', label: 'Delete' },
  { key: 'startCampaign', label: 'Launch' },
  { key: 'pauseCampaign', label: 'Pause' },
  { key: 'stopCampaign', label: 'Stop' },
  { key: 'exportCampaign', label: 'Export' },
  { key: 'viewAnalytics', label: 'Analytics' },
  { key: 'manageCampaignSettings', label: 'Settings' },
  { key: 'manageOptOut', label: 'Opt-Out' },
  { key: 'manageChannels', label: 'Channels' },
  { key: 'manageIntegrations', label: 'Integrations' },
];

export function PermissionsSection({ settings }: PermissionsSectionProps) {
  const roles = settings.roles || [];

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Role-Based Campaign Access Control (RBAC)"
        description="Review operational privileges allocated to each team membership tier across marketing campaigns."
        icon={<ShieldCheck className="h-4 w-4" />}
      >
        <div className="rounded-lg border border-border/50 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3">Role</th>
                {PERMISSION_COLUMNS.map((col) => (
                  <th key={col.key} className="p-2 text-center whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {roles.map((r) => (
                <tr key={r.role} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-semibold text-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{r.label}</span>
                      <Badge variant="secondary" className="text-[9px] uppercase px-1 py-0">
                        {r.role}
                      </Badge>
                    </div>
                  </td>
                  {PERMISSION_COLUMNS.map((col) => {
                    const granted = r.permissions[col.key];
                    return (
                      <td key={col.key} className="p-2 text-center">
                        {granted ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-muted text-muted-foreground/40 mx-auto flex items-center justify-center">
                            <X className="h-3 w-3" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded-lg border border-border/40 bg-muted/20 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Permission Governance Policy</p>
          <p>
            Owners &amp; Admins possess unrestricted orchestration, channel management, and settings control.
            Agents can launch and monitor campaigns, while Viewers have read-only visibility into analytics.
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}
