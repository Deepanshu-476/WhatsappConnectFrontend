'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Plus,
  Settings,
  RotateCcw,
  Search,
  Play,
  Pause,
  Square,
  Copy,
  Trash2,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Loader2,
  Users,
  Eye,
  Send,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { Campaign, CampaignStatus } from '@/types/campaign';

const STATUS_TABS: Array<{ label: string; value: string }> = [
  { label: 'All', value: 'all' },
  { label: 'Running', value: 'running' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Draft', value: 'draft' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Stop Confirmation Dialog
  const [stopTarget, setStopTarget] = useState<Campaign | null>(null);
  const [stopping, setStopping] = useState(false);

  // Fetch campaigns from backend
  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      } else {
        toast.error('Failed to load campaigns list');
      }
    } catch {
      toast.error('Network error loading campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  // Actions
  const handleStartCampaign = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/start`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign launched and queued for sending!');
        void loadCampaigns();
      } else {
        toast.error(data.error || 'Failed to start campaign');
      }
    } catch {
      toast.error('Error starting campaign');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePauseCampaign = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/pause`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign paused. Outbound worker halted.');
        void loadCampaigns();
      } else {
        toast.error(data.error || 'Failed to pause campaign');
      }
    } catch {
      toast.error('Error pausing campaign');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResumeCampaign = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/resume`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign resumed from last recipient checkpoint.');
        void loadCampaigns();
      } else {
        toast.error(data.error || 'Failed to resume campaign');
      }
    } catch {
      toast.error('Error resuming campaign');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStopCampaign = async () => {
    if (!stopTarget) return;
    setStopping(true);
    try {
      const res = await fetch(`/api/campaigns/${stopTarget.id}/stop`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign permanently stopped.');
        setStopTarget(null);
        void loadCampaigns();
      } else {
        toast.error(data.error || 'Failed to stop campaign');
      }
    } catch {
      toast.error('Error stopping campaign');
    } finally {
      setStopping(false);
    }
  };

  const handleRetryCampaign = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/retry`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(`Queued ${data.retryCount || 0} failed messages for retry!`);
        void loadCampaigns();
      } else {
        toast.error(data.error || 'Failed to retry campaign');
      }
    } catch {
      toast.error('Error retrying campaign');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDuplicateCampaign = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign duplicated as draft.');
        void loadCampaigns();
      } else {
        toast.error(data.error || 'Failed to duplicate campaign');
      }
    } catch {
      toast.error('Error duplicating campaign');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success('Campaign deleted.');
        void loadCampaigns();
      } else {
        toast.error(data.error || 'Failed to delete campaign');
      }
    } catch {
      toast.error('Error deleting campaign');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.template?.name && c.template.name.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  // Calculate metrics
  const totalCampaigns = campaigns.length;
  const draftCount = campaigns.filter((c) => c.status === 'draft').length;
  const scheduledCount = campaigns.filter((c) => c.status === 'scheduled').length;
  const runningCount = campaigns.filter((c) => c.status === 'running' || c.status === 'processing').length;
  const completedCount = campaigns.filter((c) => c.status === 'completed').length;
  const failedCount = campaigns.filter((c) => c.status === 'failed').length;
  const totalSent = campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.stats?.delivered || 0), 0);
  const avgDeliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 100;

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
            <Clock className="h-3 w-3" />
            Scheduled
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/20 gap-1 font-normal">
            <Pause className="h-3 w-3" />
            Paused
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="text-emerald-700 bg-emerald-500/10 border-emerald-500/20 gap-1 font-normal">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1 font-normal">
            <AlertTriangle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-muted-foreground bg-muted/40 gap-1 font-normal">
            <XCircle className="h-3 w-3" />
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Campaigns</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Create and manage WhatsApp campaigns and reach your customers at scale.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCampaigns}
            disabled={loading}
            className="h-9 gap-1.5 text-xs"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/campaigns/settings">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Settings className="h-3.5 w-3.5" />
              Campaign Settings
            </Button>
          </Link>

          <Link href="/campaigns/new">
            <Button size="sm" className="h-9 gap-1.5 text-xs shadow-xs">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* 8 KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium">Total</span>
              <Megaphone className="h-3.5 w-3.5" />
            </div>
            <p className="text-xl font-bold text-foreground">{totalCampaigns}</p>
            <p className="text-[10px] text-muted-foreground truncate">All campaigns</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium">Draft</span>
              <FileText className="h-3.5 w-3.5" />
            </div>
            <p className="text-xl font-bold text-foreground">{draftCount}</p>
            <p className="text-[10px] text-muted-foreground truncate">In preparation</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
              <span className="text-[11px] font-medium">Scheduled</span>
              <Clock className="h-3.5 w-3.5" />
            </div>
            <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{scheduledCount}</p>
            <p className="text-[10px] text-muted-foreground truncate">Upcoming queue</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-[11px] font-medium">Running</span>
              <Play className="h-3.5 w-3.5 fill-current" />
            </div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{runningCount}</p>
            <p className="text-[10px] text-emerald-600/80 truncate">Active now</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
              <span className="text-[11px] font-medium">Completed</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <p className="text-xl font-bold text-foreground">{completedCount}</p>
            <p className="text-[10px] text-muted-foreground truncate">Finished</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
              <span className="text-[11px] font-medium">Failed</span>
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{failedCount}</p>
            <p className="text-[10px] text-rose-600/80 truncate">Needs review</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-primary">
              <span className="text-[11px] font-medium">Sent</span>
              <Send className="h-3.5 w-3.5" />
            </div>
            <p className="text-xl font-bold text-foreground">{totalSent.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground truncate">Dispatched</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              <span className="text-[11px] font-medium">Delivery</span>
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <p className="text-xl font-bold text-foreground">{avgDeliveryRate}%</p>
            <p className="text-[10px] text-muted-foreground truncate">Avg success</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs">Loading campaign records...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Megaphone className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">No campaigns found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or active status filter.'
                  : 'Create your first WhatsApp marketing campaign to start reaching customers.'}
              </p>
            </div>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/campaigns/new">
                <Button size="sm" className="gap-1.5 text-xs mt-2">
                  <Plus className="h-4 w-4" />
                  New Campaign
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs min-w-[200px]">Campaign Name</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Audience</TableHead>
                  <TableHead className="text-xs">Template</TableHead>
                  <TableHead className="text-xs">Channel</TableHead>
                  <TableHead className="text-xs">Scheduled At</TableHead>
                  <TableHead className="text-xs text-center">Sent</TableHead>
                  <TableHead className="text-xs text-center">Delivered</TableHead>
                  <TableHead className="text-xs text-center">Read</TableHead>
                  <TableHead className="text-xs text-center">Failed</TableHead>
                  <TableHead className="text-xs">Created By</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((camp) => {
                  const isLoading = actionLoadingId === camp.id;

                  return (
                    <TableRow key={camp.id} className="text-xs hover:bg-muted/20 transition-colors">
                      {/* Name */}
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link
                              href={`/campaigns/${camp.id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                            >
                              {camp.name}
                            </Link>
                            {camp.type === 'drip' ? (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10">
                                Drip
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-border text-muted-foreground bg-muted/30">
                                One-time
                              </Badge>
                            )}
                          </div>
                          {camp.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {camp.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(camp.status)}</TableCell>

                      {/* Audience */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          <span>{camp.audience?.total?.toLocaleString() || 0}</span>
                        </div>
                      </TableCell>

                      {/* Template */}
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {camp.template?.name || 'Unassigned'}
                        </Badge>
                      </TableCell>

                      {/* Channel */}
                      <TableCell className="text-muted-foreground font-mono text-[11px]">
                        {camp.channel?.name || 'Primary'}
                      </TableCell>

                      {/* Scheduled At */}
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {camp.scheduledAt
                          ? new Date(camp.scheduledAt).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : 'Immediate'}
                      </TableCell>

                      {/* Stats */}
                      <TableCell className="text-center font-mono font-medium">
                        {camp.stats?.sent?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-center font-mono text-emerald-600 dark:text-emerald-400">
                        {camp.stats?.delivered?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sky-600 dark:text-sky-400">
                        {camp.stats?.read?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-center font-mono text-rose-600 dark:text-rose-400">
                        {camp.stats?.failed?.toLocaleString() || 0}
                      </TableCell>

                      {/* Created By */}
                      <TableCell className="text-muted-foreground">
                        {camp.createdBy || 'Admin'}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Analytics Button */}
                          <Link href={`/campaigns/${camp.id}/analytics`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              title="View Analytics"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </Link>

                          {/* Action Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              disabled={isLoading}
                              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors focus:outline-none"
                              aria-label="Campaign actions"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem
                                onClick={() => router.push(`/campaigns/${camp.id}`)}
                                className="gap-2"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/campaigns/${camp.id}/analytics`)}
                                className="gap-2"
                              >
                                <BarChart3 className="h-3.5 w-3.5" />
                                View Analytics
                              </DropdownMenuItem>

                              {/* Start Draft */}
                              {camp.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => handleStartCampaign(camp.id)}
                                  className="gap-2 text-emerald-600"
                                >
                                  <Play className="h-3.5 w-3.5" />
                                  Launch Campaign
                                </DropdownMenuItem>
                              )}

                              {/* Pause Running */}
                              {camp.status === 'running' && (
                                <DropdownMenuItem
                                  onClick={() => handlePauseCampaign(camp.id)}
                                  className="gap-2 text-amber-600"
                                >
                                  <Pause className="h-3.5 w-3.5" />
                                  Pause Sending
                                </DropdownMenuItem>
                              )}

                              {/* Resume Paused */}
                              {camp.status === 'paused' && (
                                <DropdownMenuItem
                                  onClick={() => handleResumeCampaign(camp.id)}
                                  className="gap-2 text-emerald-600"
                                >
                                  <Play className="h-3.5 w-3.5" />
                                  Resume Sending
                                </DropdownMenuItem>
                              )}

                              {/* Stop Running or Paused */}
                              {(camp.status === 'running' || camp.status === 'paused') && (
                                <DropdownMenuItem
                                  onClick={() => setStopTarget(camp)}
                                  className="gap-2 text-destructive"
                                >
                                  <Square className="h-3.5 w-3.5" />
                                  Stop Campaign
                                </DropdownMenuItem>
                              )}

                              {/* Retry Failed */}
                              {camp.status === 'failed' && (
                                <DropdownMenuItem
                                  onClick={() => handleRetryCampaign(camp.id)}
                                  className="gap-2 text-amber-600"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  Retry Failed
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              {/* Duplicate */}
                              <DropdownMenuItem
                                onClick={() => handleDuplicateCampaign(camp.id)}
                                className="gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Duplicate
                              </DropdownMenuItem>

                              {/* Delete */}
                              {(camp.status === 'draft' ||
                                camp.status === 'completed' ||
                                camp.status === 'cancelled') && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCampaign(camp.id)}
                                  className="gap-2 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Stop Campaign Confirmation Modal */}
      <Dialog open={!!stopTarget} onOpenChange={(open) => !open && setStopTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-destructive">
              Stop Marketing Campaign?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              Are you sure you want to stop <strong>{stopTarget?.name}</strong>?
              This will permanently halt the backend campaign worker and mark the status as
              Cancelled. Remaining recipients will not receive messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="outline" size="sm" onClick={() => setStopTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopCampaign}
              disabled={stopping}
              className="gap-1.5"
            >
              {stopping && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Yes, Stop Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
