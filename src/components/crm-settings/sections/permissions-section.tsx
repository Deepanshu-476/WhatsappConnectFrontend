'use client';

import { Shield, Lock, Check, X } from 'lucide-react';
import { SettingsCard } from '../settings-card';
import { SettingsSection } from '../settings-section';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PermissionSettings, RolePermission } from '@/types/crm-settings';

interface PermissionsSectionProps {
  settings: PermissionSettings;
  onChange: (settings: PermissionSettings) => void;
  readOnly?: boolean;
}

const PERMISSION_COLUMNS: { key: keyof Omit<RolePermission, 'role'>; label: string }[] = [
  { key: 'viewCrmSettings', label: 'View CRM Settings' },
  { key: 'editCrmSettings', label: 'Edit CRM Settings' },
  { key: 'manageConversations', label: 'Manage Chats' },
  { key: 'manageLeads', label: 'Manage Leads' },
  { key: 'manageContacts', label: 'Manage Contacts' },
  { key: 'manageWhatsapp', label: 'Manage WhatsApp' },
  { key: 'manageTemplates', label: 'Manage Templates' },
  { key: 'manageAi', label: 'Manage AI & Logic' },
  { key: 'manageIntegrations', label: 'Manage Integrations' },
];

export function PermissionsSection({
  settings,
  onChange,
  readOnly = false,
}: PermissionsSectionProps) {
  function togglePermission(
    roleName: RolePermission['role'],
    permKey: keyof Omit<RolePermission, 'role'>,
  ) {
    if (readOnly || roleName === 'owner') return; // Owner always retains all permissions

    const updatedRoles = settings.roles.map((r) => {
      if (r.role === roleName) {
        return {
          ...r,
          [permKey]: !r[permKey],
        };
      }
      return r;
    });

    onChange({ roles: updatedRoles });
  }

  function getRoleBadge(role: RolePermission['role']) {
    switch (role) {
      case 'owner':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 uppercase text-[10px]">
            Owner
          </Badge>
        );
      case 'admin':
        return (
          <Badge className="bg-primary/10 text-primary border-primary/30 uppercase text-[10px]">
            Admin
          </Badge>
        );
      case 'agent':
        return (
          <Badge variant="secondary" className="uppercase text-[10px]">
            Agent
          </Badge>
        );
      case 'viewer':
        return (
          <Badge variant="outline" className="uppercase text-[10px] text-muted-foreground">
            Viewer
          </Badge>
        );
    }
  }

  return (
    <SettingsSection
      title="Permissions & Role Access"
      description="Define granular feature access policies and administrative privileges across team roles."
    >
      <SettingsCard
        title="Role Access Matrix"
        description="Check permissions allowed for each operational member tier."
      >
        <div className="rounded-lg border border-border/60 overflow-x-auto bg-card/40">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-32 text-xs font-semibold">Role Tier</TableHead>
                {PERMISSION_COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    className="text-xs text-center whitespace-nowrap px-3"
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.roles.map((roleObj) => (
                <TableRow key={roleObj.role} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-medium">
                    <div className="flex items-center gap-2">
                      {roleObj.role === 'owner' ? (
                        <Lock className="size-3 text-amber-500" />
                      ) : (
                        <Shield className="size-3 text-muted-foreground" />
                      )}
                      {getRoleBadge(roleObj.role)}
                    </div>
                  </TableCell>

                  {PERMISSION_COLUMNS.map((col) => {
                    const isGranted = Boolean(roleObj[col.key]);
                    const isOwner = roleObj.role === 'owner';

                    return (
                      <TableCell key={col.key} className="text-center px-3">
                        <button
                          type="button"
                          onClick={() => togglePermission(roleObj.role, col.key)}
                          disabled={readOnly || isOwner}
                          className={`size-6 rounded inline-flex items-center justify-center transition-colors ${
                            isGranted
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-muted text-muted-foreground/40 border border-border/30'
                          } ${isOwner || readOnly ? 'cursor-default opacity-80' : 'cursor-pointer hover:scale-105'}`}
                          title={`${roleObj.role} - ${col.label}: ${isGranted ? 'Allowed' : 'Denied'}`}
                        >
                          {isGranted ? <Check className="size-3.5" /> : <X className="size-3" />}
                        </button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-[11px] text-muted-foreground pt-2">
          Note: Account Owner permissions are permanent and cannot be revoked.
        </p>
      </SettingsCard>
    </SettingsSection>
  );
}
