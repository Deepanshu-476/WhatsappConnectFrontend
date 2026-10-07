'use client';

import { useState } from 'react';
import {
  PhoneCall,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  Pencil,
  Unplug,
  Activity,
  Loader2,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { WhatsAppChannel } from '@/types/crm-settings';

interface ChannelManagerProps {
  channels: WhatsAppChannel[];
  onChange: (channels: WhatsAppChannel[]) => void;
  readOnly?: boolean;
}

export function ChannelManager({ channels, onChange, readOnly = false }: ChannelManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);

  const [activeChannel, setActiveChannel] = useState<WhatsAppChannel | null>(null);
  const [channelToDisconnect, setChannelToDisconnect] = useState<WhatsAppChannel | null>(null);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPhoneId, setFormPhoneId] = useState('');
  const [formWebhook, setFormWebhook] = useState('/api/webhooks/whatsapp');

  function openCreate() {
    setActiveChannel(null);
    setFormName('');
    setFormPhone('');
    setFormPhoneId('');
    setFormWebhook('/api/webhooks/whatsapp');
    setModalOpen(true);
  }

  function openEdit(ch: WhatsAppChannel) {
    setActiveChannel(ch);
    setFormName(ch.name);
    setFormPhone(ch.phoneNumber);
    setFormPhoneId(ch.phoneNumberId);
    setFormWebhook(ch.webhookUrl || '/api/webhooks/whatsapp');
    setModalOpen(true);
  }

  function handleSave() {
    if (!formName.trim() || !formPhone.trim()) return;

    let updated: WhatsAppChannel[];
    if (activeChannel) {
      updated = channels.map((c) =>
        c.id === activeChannel.id
          ? {
              ...c,
              name: formName.trim(),
              phoneNumber: formPhone.trim(),
              phoneNumberId: formPhoneId.trim() || c.phoneNumberId,
              webhookUrl: formWebhook.trim(),
            }
          : c,
      );
    } else {
      const newChannel: WhatsAppChannel = {
        id: `channel_${Date.now()}`,
        name: formName.trim(),
        phoneNumber: formPhone.trim(),
        phoneNumberId: formPhoneId.trim() || `phone_${Date.now()}`,
        webhookUrl: formWebhook.trim() || '/api/webhooks/whatsapp',
        status: 'configuration_required',
        isDefault: channels.length === 0,
      };
      updated = [...channels, newChannel];
    }

    onChange(updated);
    setModalOpen(false);
    toast.success(activeChannel ? 'Channel details saved' : 'Channel saved. Meta verification is still required.');
  }

  async function handleTestConnection(channel: WhatsAppChannel) {
    setTestingChannelId(channel.id);
    try {
      const res = await fetch('/api/crm-settings/test-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channel.id, phoneNumber: channel.phoneNumber }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        toast.success(data?.message || 'Connection test succeeded! Channel is active.');
      } else {
        toast.error(data?.message || data?.error || 'Channel connection failed');
      }
    } catch {
      toast.error('Channel connection could not be verified because the backend is unavailable.');
    } finally {
      setTestingChannelId(null);
    }
  }

  function confirmDisconnect(ch: WhatsAppChannel) {
    setChannelToDisconnect(ch);
    setDisconnectModalOpen(true);
  }

  function handleDisconnect() {
    if (!channelToDisconnect) return;
    const updated = channels.map((c) =>
      c.id === channelToDisconnect.id ? { ...c, status: 'disconnected' as const } : c,
    );
    onChange(updated);
    setDisconnectModalOpen(false);
    setChannelToDisconnect(null);
    toast.info('Channel disconnected');
  }

  function getStatusBadge(status: WhatsAppChannel['status']) {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1 text-[11px] font-medium">
            <CheckCircle2 className="size-3" />
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="text-muted-foreground border-border gap-1 text-[11px] font-medium">
            <XCircle className="size-3" />
            Disconnected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/30 gap-1 text-[11px] font-medium">
            <AlertTriangle className="size-3" />
            Error
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1 text-[11px] font-medium">
            <Clock className="size-3" />
            Pending
          </Badge>
        );
      case 'configuration_required':
      case 'unknown':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1 text-[11px] font-medium">
            <AlertTriangle className="size-3" />
            Configuration required
          </Badge>
        );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">WhatsApp Channels</h4>
          <p className="text-xs text-muted-foreground">
            Connect official Meta WhatsApp Business phone numbers and webhook listeners.
          </p>
        </div>
        {!readOnly && (
          <Button
            type="button"
            size="sm"
            onClick={openCreate}
            className="h-8 gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            Connect Channel
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden bg-card/40">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs">Channel</TableHead>
              <TableHead className="text-xs">Phone Number</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Webhook</TableHead>
              <TableHead className="w-56 text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                  No WhatsApp channels registered. Click &quot;Connect Channel&quot; to begin.
                </TableCell>
              </TableRow>
            ) : (
              channels.map((ch) => (
                <TableRow key={ch.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <PhoneCall className="size-3.5" />
                      </div>
                      <div>
                        <div>{ch.name}</div>
                        {ch.isDefault && (
                          <span className="text-[10px] text-muted-foreground">Default</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono font-medium text-foreground">
                    {ch.phoneNumber}
                  </TableCell>
                  <TableCell className="text-xs">{getStatusBadge(ch.status)}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[140px]">{ch.webhookUrl}</span>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(ch.webhookUrl);
                          toast.success('Webhook URL copied');
                        }}
                        className="text-muted-foreground hover:text-foreground"
                        title="Copy Webhook"
                      >
                        <Copy className="size-3" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(ch)}
                        disabled={testingChannelId === ch.id}
                        className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
                      >
                        {testingChannelId === ch.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Activity className="size-3" />
                        )}
                        Test
                      </Button>

                      {!readOnly && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(ch)}
                            className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="size-3" />
                            Edit
                          </Button>

                          {ch.status === 'connected' ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDisconnect(ch)}
                              className="h-7 text-xs px-2 gap-1 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            >
                              <Unplug className="size-3" />
                              Disconnect
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTestConnection(ch)}
                              className="h-7 text-xs px-2 gap-1 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                            >
                              <Activity className="size-3" />
                              Verify
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Channel Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeChannel ? 'Configure WhatsApp Channel' : 'Connect WhatsApp Channel'}</DialogTitle>
            <DialogDescription>
              Enter channel details. The channel remains unverified until Meta credentials are checked by the backend.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Channel Display Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Support Hotline"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">WhatsApp Phone Number</Label>
              <Input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="h-9 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Phone Number ID (From Meta Developer Portal)</Label>
              <Input
                value={formPhoneId}
                onChange={(e) => setFormPhoneId(e.target.value)}
                placeholder="1009823487234"
                className="h-9 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Webhook Target Path</Label>
              <Input
                value={formWebhook}
                onChange={(e) => setFormWebhook(e.target.value)}
                placeholder="/api/webhooks/whatsapp"
                className="h-9 text-sm font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!formName.trim() || !formPhone.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {activeChannel ? 'Save Changes' : 'Save Channel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect confirmation modal */}
      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Disconnect Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect &quot;{channelToDisconnect?.name}&quot; ({channelToDisconnect?.phoneNumber})? Inbound messages will cease until reconnected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDisconnectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
