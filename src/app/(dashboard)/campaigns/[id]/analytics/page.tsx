'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Send,
  CheckCircle2,
  Eye,
  MessageSquare,
  AlertTriangle,
  Search,
  Download,
  RotateCcw,
  Loader2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CampaignAnalytics } from '@/types/campaign';

interface AnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignAnalyticsPage({ params }: AnalyticsPageProps) {
  const { id } = use(params);

  const [campaignName, setCampaignName] = useState('Campaign Analytics');
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('all');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Load campaign info
      const campRes = await fetch(`/api/campaigns/${id}`);
      if (campRes.ok) {
        const campData = await campRes.json();
        if (campData.campaign?.name) {
          setCampaignName(campData.campaign.name);
        }
      }

      // Load analytics
      const res = await fetch(`/api/campaigns/${id}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        toast.error('Failed to load campaign analytics');
      }
    } catch {
      toast.error('Network error loading analytics');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  // Filter recipients
  const filteredRecipients = (analytics?.recipients || []).filter((r) => {
    const matchesFilter = recipientFilter === 'all' || r.status === recipientFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.phone.includes(q) ||
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.error && r.error.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const exportCSV = () => {
    const recs = analytics?.recipients || [];
    if (recs.length === 0) {
      toast.info('No recipient records to export');
      return;
    }

    const headers = 'Contact,Phone,Status,SentAt,DeliveredAt,ReadAt,RepliedAt,Error\n';
    const rows = recs
      .map(
        (r) =>
          `"${r.name || ''}","${r.phone}","${r.status}","${r.sentAt || ''}","${r.deliveredAt || ''}","${
            r.readAt || ''
          }","${r.repliedAt || ''}","${r.error || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${id}-recipients.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Recipient report exported as CSV');
  };

  const overview = analytics?.overview || {
    totalRecipients: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    replied: 0,
    failed: 0,
    optedOut: 0,
    deliveryRate: 0,
    readRate: 0,
    replyRate: 0,
    failureRate: 0,
    optOutRate: 0,
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/campaigns" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{campaignName}</h1>
            <Badge variant="outline" className="text-xs font-mono ml-2">
              Analytics &amp; Telemetry
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Real-time delivery status, handset read receipts, conversion replies, and contact logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
            className="h-8 gap-1.5 text-xs"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs">Gathering delivery telemetry &amp; recipient events...</p>
        </div>
      ) : (
        <>
          {/* Rate Percentages Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="border-border/60 bg-emerald-500/5">
              <CardContent className="p-3.5 space-y-1 text-center">
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Delivery Rate</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{overview.deliveryRate}%</p>
                <p className="text-[10px] text-muted-foreground">Delivered / Sent</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-sky-500/5">
              <CardContent className="p-3.5 space-y-1 text-center">
                <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">Read Rate</p>
                <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{overview.readRate}%</p>
                <p className="text-[10px] text-muted-foreground">Opened / Delivered</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-indigo-500/5">
              <CardContent className="p-3.5 space-y-1 text-center">
                <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Reply Rate</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{overview.replyRate}%</p>
                <p className="text-[10px] text-muted-foreground">Responses received</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-rose-500/5">
              <CardContent className="p-3.5 space-y-1 text-center">
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Failure Rate</p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{overview.failureRate}%</p>
                <p className="text-[10px] text-muted-foreground">Bounced / Undelivered</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-amber-500/5">
              <CardContent className="p-3.5 space-y-1 text-center">
                <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Opt-Out Rate</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{overview.optOutRate}%</p>
                <p className="text-[10px] text-muted-foreground">Unsubscribe requests</p>
              </CardContent>
            </Card>
          </div>

          {/* Counts Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Users className="h-3.5 w-3.5" />
                <span>Audience</span>
              </div>
              <p className="text-lg font-bold text-foreground">{overview.totalRecipients.toLocaleString()}</p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Send className="h-3.5 w-3.5 text-primary" />
                <span>Sent</span>
              </div>
              <p className="text-lg font-bold text-foreground">{overview.sent.toLocaleString()}</p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Delivered</span>
              </div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {overview.delivered.toLocaleString()}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Eye className="h-3.5 w-3.5 text-sky-600" />
                <span>Read</span>
              </div>
              <p className="text-lg font-bold text-sky-600 dark:text-sky-400">
                {overview.read.toLocaleString()}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                <span>Replies</span>
              </div>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {overview.replied.toLocaleString()}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                <span>Failed</span>
              </div>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                {overview.failed.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 4 Conversion & Delivery Trend Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/60 bg-card/60">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-semibold flex items-center justify-between text-muted-foreground">
                  <span>Delivery Trend</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-foreground">{overview.deliveryRate}%</span>
                  <span className="text-[11px] text-muted-foreground">{overview.delivered} / {overview.sent}</span>
                </div>
                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overview.deliveryRate}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">Percentage of messages successfully delivered to WhatsApp</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-semibold flex items-center justify-between text-muted-foreground">
                  <span>Read Trend</span>
                  <Eye className="h-4 w-4 text-sky-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-foreground">{overview.readRate}%</span>
                  <span className="text-[11px] text-muted-foreground">{overview.read} / {overview.delivered}</span>
                </div>
                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${overview.readRate}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">Percentage of delivered messages opened and read</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-semibold flex items-center justify-between text-muted-foreground">
                  <span>Reply Trend</span>
                  <MessageSquare className="h-4 w-4 text-indigo-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-foreground">{overview.replyRate}%</span>
                  <span className="text-[11px] text-muted-foreground">{overview.replied} responses</span>
                </div>
                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, overview.replyRate * 5)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">Conversations initiated or responses received from campaign</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-semibold flex items-center justify-between text-muted-foreground">
                  <span>Failure Trend</span>
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{overview.failureRate}%</span>
                  <span className="text-[11px] text-muted-foreground">{overview.failed} failed</span>
                </div>
                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${overview.failureRate}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">Bounced or network errors requiring review or retry</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact-level Delivery Report Table */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Contact-Level Delivery Report
                </CardTitle>
                <CardDescription className="text-xs">
                  Inspect the granular transmission lifecycle and response events for each contact.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  {['all', 'delivered', 'read', 'replied', 'failed', 'opted_out'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setRecipientFilter(st)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                        recipientFilter === st
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {st === 'opted_out' ? 'Opted Out' : st}
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
              </div>
            </CardHeader>

            <CardContent>
              {filteredRecipients.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold">No recipient records match criteria</p>
                  <p className="text-[11px]">Once campaign messages are dispatched, contact telemetry will appear here.</p>
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
                        <TableHead className="text-xs">Replied At</TableHead>
                        <TableHead className="text-xs">Last Event / Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecipients.map((rec, i) => (
                        <TableRow key={rec.contactId || i} className="text-xs hover:bg-muted/20">
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
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {rec.repliedAt ? new Date(rec.repliedAt).toLocaleTimeString() : '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[11px]">
                            {rec.error ? (
                              <span className="text-rose-600 font-mono line-clamp-1">{rec.error}</span>
                            ) : (
                              rec.lastEvent || 'Processed'
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
        </>
      )}
    </div>
  );
}
