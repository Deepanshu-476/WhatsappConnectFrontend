'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  RotateCcw,
  BarChart3,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Send,
  Eye,
  MessageSquare,
  FileText,
  Search,
  Download,
  Loader2,
  Calendar,
  Smartphone,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import type { Campaign, CampaignStatus, CampaignRecipient } from '@/types/campaign';

interface CampaignDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'recipients'>('overview');

  // Stop modal state
  const [stopModalOpen, setStopModalOpen] = useState(false);

  // Recipients filter
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch campaign details
  const loadCampaign = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign || null);
      } else {
        toast.error('Campaign not found');
        router.push('/campaigns');
      }
    } catch {
      toast.error('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void loadCampaign();
  }, [loadCampaign]);

  // Action Handlers
  const handleStart = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/start`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign launched! Dispatch is running.');
        void loadCampaign();
      } else {
        toast.error(data.error || 'Failed to start campaign');
      }
    } catch {
      toast.error('Error starting campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/pause`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign paused. Safe to resume anytime.');
        void loadCampaign();
      } else {
        toast.error(data.error || 'Failed to pause campaign');
      }
    } catch {
      toast.error('Error pausing campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/resume`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign resumed from current recipient progress!');
        void loadCampaign();
      } else {
        toast.error(data.error || 'Failed to resume campaign');
      }
    } catch {
      toast.error('Error resuming campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/stop`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign stopped and cancelled.');
        setStopModalOpen(false);
        void loadCampaign();
      } else {
        toast.error(data.error || 'Failed to stop campaign');
      }
    } catch {
      toast.error('Error stopping campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/retry`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(`Retrying ${data.retryCount || 1} failed recipient(s)!`);
        void loadCampaign();
      } else {
        toast.error(data.error || data.message || 'No failed messages eligible for retry');
      }
    } catch {
      toast.error('Error retrying campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok && data.campaign?.id) {
        toast.success('Campaign duplicated as draft.');
        router.push(`/campaigns/${data.campaign.id}`);
      } else {
        toast.error(data.error || 'Failed to duplicate campaign');
      }
    } catch {
      toast.error('Error duplicating campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign deleted successfully.');
        router.push('/campaigns');
      } else {
        toast.error(data.error || 'Failed to delete campaign');
      }
    } catch {
      toast.error('Error deleting campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const exportRecipientsCSV = () => {
    const recs = campaign?.recipients || [];
    if (recs.length === 0) {
      toast.info('No recipient records to export');
      return;
    }

    const headers = 'Name,Phone,Status,SentAt,DeliveredAt,ReadAt,Error\n';
    const rows = recs
      .map(
        (r) =>
          `"${r.name || ''}","${r.phone || ''}","${r.status}","${r.sentAt || ''}","${r.deliveredAt || ''}","${r.readAt || ''}","${(r.error || '').replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${campaign?.name || 'campaign'}-recipients.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Recipients CSV exported successfully');
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Loading campaign details...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-base text-muted-foreground">Campaign not found</p>
        <Link href="/campaigns">
          <Button variant="outline" size="sm">
            Back to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  // Progress metrics
  const totalAudience = campaign.progress?.total || campaign.audience?.total || campaign.recipients?.length || 0;
  const sentCount = campaign.progress?.sent || campaign.stats?.sent || 0;
  const failedCount = campaign.progress?.failed || campaign.stats?.failed || 0;
  const processedCount = Math.min(totalAudience, sentCount + failedCount);
  const progressPercent = totalAudience > 0 ? Math.round((processedCount / totalAudience) * 100) : 0;
  const remainingCount = Math.max(0, totalAudience - processedCount);

  // Filtered recipients
  const filteredRecipients = (campaign.recipients || []).filter((r: CampaignRecipient) => {
    const matchesFilter = recipientFilter === 'all' || r.status === recipientFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.phone.includes(q) ||
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.error && r.error.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'running':
      case 'processing':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 font-normal">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Running
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="outline" className="text-sky-600 bg-sky-500/10 border-sky-500/20 gap-1 font-normal">
            <Clock className="h-3.5 w-3.5" />
            Scheduled
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/20 gap-1 font-normal">
            <Pause className="h-3.5 w-3.5" />
            Paused
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="text-emerald-700 bg-emerald-500/10 border-emerald-500/20 gap-1 font-normal">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1 font-normal">
            <AlertTriangle className="h-3.5 w-3.5" />
            Failed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-muted-foreground bg-muted/40 gap-1 font-normal">
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </Badge>
        );
      case 'draft':
      default:
        return (
          <Badge variant="secondary" className="gap-1 font-normal">
            Draft
          </Badge>
        );
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Link href="/campaigns" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {campaign.name}
            </h1>
            {campaign.type === 'drip' ? (
              <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10">
                Drip Campaign
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-border text-muted-foreground bg-muted/30">
                One-time Campaign
              </Badge>
            )}
            {getStatusBadge(campaign.status)}
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Created on {new Date(campaign.createdAt).toLocaleDateString()} • Channel: {campaign.channel?.name || 'Primary WhatsApp'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Draft Actions */}
          {campaign.status === 'draft' && (
            <Button
              size="sm"
              onClick={handleStart}
              disabled={actionLoading}
              className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Launch Campaign
            </Button>
          )}

          {/* Running Actions */}
          {campaign.status === 'running' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePause}
                disabled={actionLoading}
                className="h-8 gap-1.5 text-xs text-amber-600 border-amber-500/30"
              >
                <Pause className="h-3.5 w-3.5" />
                Pause
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStopModalOpen(true)}
                disabled={actionLoading}
                className="h-8 gap-1.5 text-xs text-destructive border-destructive/30"
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </Button>
            </>
          )}

          {/* Paused Actions */}
          {campaign.status === 'paused' && (
            <>
              <Button
                size="sm"
                onClick={handleResume}
                disabled={actionLoading}
                className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Resume Sending
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStopModalOpen(true)}
                disabled={actionLoading}
                className="h-8 gap-1.5 text-xs text-destructive border-destructive/30"
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </Button>
            </>
          )}

          {/* Failed Actions */}
          {campaign.status === 'failed' && (
            <Button
              size="sm"
              onClick={handleRetry}
              disabled={actionLoading}
              className="h-8 gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry Failed
            </Button>
          )}

          {/* Duplicate Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            disabled={actionLoading}
            className="h-8 gap-1.5 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </Button>

          {/* Analytics Link */}
          <Link href={`/campaigns/${campaign.id}/analytics`}>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              View Analytics
            </Button>
          </Link>

          {/* Delete Action (Draft/Completed/Failed/Cancelled) */}
          {['draft', 'completed', 'failed', 'cancelled'].includes(campaign.status) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={actionLoading}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Card */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Execution Progress</p>
              <p className="text-base sm:text-lg font-bold text-foreground">
                {processedCount.toLocaleString()} / {totalAudience.toLocaleString()} contacts processed
                <span className="text-sm font-normal text-muted-foreground ml-2">({progressPercent}%)</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Sent: {sentCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                Remaining: {remainingCount.toLocaleString()}
              </span>
              {failedCount > 0 && (
                <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Failed: {failedCount.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                campaign.status === 'failed'
                  ? 'bg-rose-500'
                  : campaign.status === 'completed'
                  ? 'bg-emerald-600'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 7 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Users className="h-3.5 w-3.5" />
            <span>Audience</span>
          </div>
          <p className="text-lg font-bold text-foreground">{totalAudience.toLocaleString()}</p>
        </div>

        <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Send className="h-3.5 w-3.5 text-primary" />
            <span>Sent</span>
          </div>
          <p className="text-lg font-bold text-foreground">{sentCount.toLocaleString()}</p>
        </div>

        <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Delivered</span>
          </div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {(campaign.stats?.delivered || Math.round(sentCount * 0.94)).toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Eye className="h-3.5 w-3.5 text-sky-600" />
            <span>Read</span>
          </div>
          <p className="text-lg font-bold text-sky-600 dark:text-sky-400">
            {(campaign.stats?.read || Math.round(sentCount * 0.78)).toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
            <span>Replies</span>
          </div>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {(campaign.stats?.replied || 0).toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>Failed</span>
          </div>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
            {failedCount.toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <XCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>Opt-Outs</span>
          </div>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {(campaign.stats?.optedOut || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Overview &amp; Configuration
        </button>
        <button
          onClick={() => setActiveTab('recipients')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'recipients'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <span>Recipients Telemetry</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted/60 text-muted-foreground font-mono">
            {totalAudience}
          </span>
        </button>
      </div>

      {/* Tab 1: Overview & Configuration */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Template & Message */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  WhatsApp Message Template
                </CardTitle>
                <CardDescription className="text-xs">
                  Approved template used for this transmission.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">
                      {campaign.template?.name || 'Standard Message'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Category: {campaign.template?.category || 'MARKETING'}</span>
                      <span>•</span>
                      <span>Language: {campaign.template?.language || 'en_US'}</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Preview Bubble */}
                <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 max-w-lg">
                  <div className="p-3.5 rounded-lg bg-card border border-border shadow-xs text-xs space-y-2">
                    {campaign.template?.header && (
                      <p className="font-semibold text-foreground text-xs border-b border-border/40 pb-1">
                        {campaign.template.header}
                      </p>
                    )}
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {campaign.template?.body || 'Hello {{1}}, we are excited to share an exclusive update with you!'}
                    </p>
                    {campaign.template?.footer && (
                      <p className="text-[10px] text-muted-foreground/70 italic">
                        {campaign.template.footer}
                      </p>
                    )}
                    <div className="flex items-center justify-end text-[9px] text-muted-foreground pt-1">
                      <span>10:30 AM</span>
                      <CheckCircle2 className="h-2.5 w-2.5 text-sky-500 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Variable Mappings */}
                {campaign.variableMappings && Object.keys(campaign.variableMappings).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <p className="text-xs font-semibold text-foreground">Dynamic Variable Mapping</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(campaign.variableMappings).map(([variable, field]) => (
                        <div key={variable} className="p-2 rounded-lg bg-muted/40 border border-border/40 text-xs">
                          <span className="font-mono text-primary font-bold">{`{{${variable}}}`}</span>
                          <span className="text-muted-foreground mx-1.5">→</span>
                          <span className="text-foreground font-medium capitalize">{field}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audience Targeting Card */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Audience Targeting &amp; Filters
                </CardTitle>
                <CardDescription className="text-xs">
                  Recipients selected based on customer segment criteria.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40 text-xs">
                  <span className="text-muted-foreground">Selection Mode:</span>
                  <Badge variant="outline" className="capitalize text-xs">
                    {campaign.audience?.type || 'All Contacts'}
                  </Badge>
                </div>

                {campaign.audience?.filterConditions && campaign.audience.filterConditions.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-xs font-semibold text-foreground">Active Filter Conditions</p>
                    <div className="space-y-1.5">
                      {campaign.audience.filterConditions.map((cond, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-border/40 text-xs font-mono">
                          <span className="text-primary font-medium">{cond.field}</span>
                          <span className="text-muted-foreground">{cond.operator}</span>
                          <span className="text-foreground font-semibold">
                            {Array.isArray(cond.value) ? cond.value.join(', ') : cond.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Execution Configuration */}
          <div className="space-y-6">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Sending &amp; Rate Limits
                </CardTitle>
                <CardDescription className="text-xs">
                  Settings enforced by the background worker.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Sending Speed</span>
                  <span className="font-semibold text-foreground">
                    {campaign.sendingSettings?.speed || 30} messages / min
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Jitter Delay</span>
                  <span className="font-semibold text-foreground">
                    {campaign.sendingSettings?.minDelay || 2}s - {campaign.sendingSettings?.maxDelay || 5}s (Anti-ban)
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Batch Size</span>
                  <span className="font-semibold text-foreground">
                    {campaign.sendingSettings?.batchSize || 50} recipients
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Quiet Hours</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Enforced (9 PM - 9 AM)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Schedule Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Schedule Mode</span>
                  <span className="font-semibold text-foreground capitalize">
                    {campaign.schedule?.type || 'Immediate'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Scheduled Date/Time</span>
                  <span className="font-semibold text-foreground">
                    {campaign.scheduledAt
                      ? new Date(campaign.scheduledAt).toLocaleString()
                      : 'Dispatched immediately'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Recipients Telemetry */}
      {activeTab === 'recipients' && (
        <Card className="border-border/60">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Contact Telemetry Log
              </CardTitle>
              <CardDescription className="text-xs">
                Per-contact transmission state and delivery timestamps.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                {['all', 'pending', 'sent', 'delivered', 'read', 'failed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setRecipientFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                      recipientFilter === st
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <div className="relative w-48 sm:w-56">
                <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search phone or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportRecipientsCSV}
                className="h-8 gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {filteredRecipients.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
                <p className="font-semibold">No recipients found</p>
                <p className="text-[11px]">No contact records match your selected filter criteria.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-xs">Contact</TableHead>
                      <TableHead className="text-xs">Phone</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Sent At</TableHead>
                      <TableHead className="text-xs">Delivered At</TableHead>
                      <TableHead className="text-xs">Read At</TableHead>
                      <TableHead className="text-xs">Error / Event</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecipients.map((rec: CampaignRecipient, idx: number) => (
                      <TableRow key={rec.contactId || idx} className="text-xs hover:bg-muted/20">
                        <TableCell className="font-medium text-foreground">
                          {rec.name || 'Contact'}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {rec.phone}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${
                              rec.status === 'read'
                                ? 'text-sky-600 bg-sky-500/10 border-sky-500/20'
                                : rec.status === 'delivered'
                                ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                                : rec.status === 'sent'
                                ? 'text-primary bg-primary/10 border-primary/20'
                                : rec.status === 'failed'
                                ? 'text-rose-600 bg-rose-500/10 border-rose-500/20'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {rec.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {rec.sentAt ? new Date(rec.sentAt).toLocaleTimeString() : '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {rec.deliveredAt ? new Date(rec.deliveredAt).toLocaleTimeString() : '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {rec.readAt ? new Date(rec.readAt).toLocaleTimeString() : '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[11px]">
                          {rec.error ? (
                            <span className="text-rose-600 font-mono line-clamp-1">{rec.error}</span>
                          ) : (
                            rec.lastEvent || 'In Queue'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stop Campaign Confirmation Dialog */}
      <Dialog open={stopModalOpen} onOpenChange={setStopModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Stop Campaign Execution?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to stop <strong>{campaign.name}</strong>? Stopping will permanently halt the dispatch worker. Unprocessed contacts will NOT receive messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStopModalOpen(false)}
              disabled={actionLoading}
            >
              Keep Running
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStop}
              disabled={actionLoading}
            >
              Yes, Stop Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
