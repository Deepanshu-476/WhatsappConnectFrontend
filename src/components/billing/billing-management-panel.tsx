'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Check,
  Clock,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';

import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SubscriptionData {
  id: string;
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'PAYMENT_FAILED' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  planSlug: string;
  planName: string;
  billingInterval: string;
  trialStartAt?: string;
  trialEndAt?: string;
  currentPeriodStartAt?: string;
  currentPeriodEndAt?: string;
  nextBillingAt?: string;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string;
  daysRemaining: number;
  trialDaysRemaining: number;
  isTrial: boolean;
  isExpired: boolean;
  isActive: boolean;
  usage?: {
    users: number;
    channels: number;
  };
  plan?: {
    name: string;
    description: string;
    features: string[];
    limits: {
      maxUsers?: number;
      maxChannels?: number;
      maxContacts?: number;
      maxCampaignsPerMonth?: number;
      maxAutomations?: number;
    };
  };
}

interface BusinessDetailsData {
  companyName: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  gstNumber?: string;
  billingEmail?: string;
  contactPhone?: string;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  planName: string;
  billingPeriod: string;
  type: string;
  totalAmount: number;
  currency: string;
  status: string;
  issuedAt: string;
}

export function BillingManagementPanel() {
  const { accountRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetailsData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

  // Dialog states
  const [editBizOpen, setEditBizOpen] = useState(false);
  const [savingBiz, setSavingBiz] = useState(false);
  const [bizForm, setBizForm] = useState<BusinessDetailsData>({
    companyName: '',
    gstNumber: '',
    billingEmail: '',
    contactPhone: '',
    billingAddress: { street: '', city: '', state: '', postalCode: '', country: 'India' },
  });
  const [bizError, setBizError] = useState<string | null>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isOwner = accountRole === 'owner';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [subRes, bizRes, invRes] = await Promise.all([
        apiFetch<{ data: { subscription: SubscriptionData } }>('/api/billing/subscription'),
        apiFetch<{ data: BusinessDetailsData | null }>('/api/billing/business-details').catch(() => ({ data: null })),
        apiFetch<{ invoices: InvoiceItem[] }>('/api/billing/invoices').catch(() => ({ invoices: [] })),
      ]);

      if (subRes?.data?.subscription) {
        setSubscription(subRes.data.subscription);
      }
      if (bizRes?.data) {
        setBusinessDetails(bizRes.data);
        setBizForm(bizRes.data);
      }
      if (Array.isArray(invRes?.invoices)) {
        setInvoices(invRes.invoices);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load billing information';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveBusinessDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setBizError(null);

    if (!bizForm.companyName.trim()) {
      setBizError('Company name is required');
      return;
    }

    if (bizForm.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(bizForm.gstNumber.trim().toUpperCase())) {
      setBizError('Invalid GST number format (must be 15-character GSTIN, e.g. 29ABCDE1234F1Z5)');
      return;
    }

    try {
      setSavingBiz(true);
      const res = await apiFetch<{ data: BusinessDetailsData }>('/api/billing/business-details', {
        method: 'PUT',
        json: {
          companyName: bizForm.companyName.trim(),
          gstNumber: bizForm.gstNumber?.trim().toUpperCase(),
          billingEmail: bizForm.billingEmail?.trim().toLowerCase(),
          contactPhone: bizForm.contactPhone?.trim(),
          billingAddress: bizForm.billingAddress,
        },
      });

      setBusinessDetails(res.data);
      setEditBizOpen(false);
    } catch (err: unknown) {
      setBizError(err instanceof Error ? err.message : 'Failed to update business details');
    } finally {
      setSavingBiz(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      await apiFetch('/api/billing/subscription/cancel', {
        method: 'POST',
        json: { immediate: false },
      });
      setCancelOpen(false);
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    try {
      await apiFetch('/api/billing/subscription/reactivate', { method: 'POST' });
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reactivate subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-destructive">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Unable to load billing data</h3>
        </div>
        <p className="mt-2 text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchData} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const statusBadge = () => {
    if (!subscription) return null;
    switch (subscription.status) {
      case 'TRIALING':
        return (
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-500">
            Free Trial · {subscription.daysRemaining} days left
          </Badge>
        );
      case 'ACTIVE':
        return (
          <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500">
            Active
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="destructive">
            Trial Expired
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="secondary">
            Cancelled
          </Badge>
        );
      case 'PAST_DUE':
        return (
          <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">
            Payment Past Due
          </Badge>
        );
      default:
        return <Badge variant="secondary">{subscription.status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Billing Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your CIIS Connect subscription plan, company tax credentials, and billing invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings/billing/plans">
            <Button className="bg-primary text-primary-foreground shadow hover:bg-primary/90">
              <Sparkles className="mr-2 h-4 w-4" />
              Manage Subscription Plans
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. CURRENT SUBSCRIPTION CARD */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Subscription
              </span>
              <CardTitle className="mt-1 flex items-center gap-3 text-2xl font-bold">
                {subscription?.planName || 'Free Trial'}
                {statusBadge()}
              </CardTitle>
            </div>
            {subscription?.cancelAtPeriodEnd ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500">
                Scheduled to cancel on{' '}
                {subscription.currentPeriodEndAt
                  ? new Date(subscription.currentPeriodEndAt).toLocaleDateString('en-IN')
                  : 'period end'}
              </div>
            ) : null}
          </div>
          <CardDescription>
            {subscription?.plan?.description ||
              'Access team WhatsApp messaging, automated contact syncing, and campaign broadcasts.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                {subscription?.isTrial ? 'Trial Expiry' : 'Next Renewal'}
              </div>
              <div className="mt-2 text-lg font-bold text-foreground">
                {subscription?.currentPeriodEndAt
                  ? new Date(subscription.currentPeriodEndAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {subscription?.daysRemaining ?? 0} days remaining
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Billing Frequency
              </div>
              <div className="mt-2 text-lg font-bold capitalize text-foreground">
                {subscription?.billingInterval || 'Monthly'}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {subscription?.isTrial ? '7-Day Free Trial' : 'Recurring Billing'}
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                Team Seat Limit
              </div>
              <div className="mt-2 text-lg font-bold text-foreground">
                {subscription?.usage?.users ?? 1} / {subscription?.plan?.limits?.maxUsers ?? 2}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">Active team members</div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                WhatsApp Channels
              </div>
              <div className="mt-2 text-lg font-bold text-foreground">
                {subscription?.usage?.channels ?? 0} / {subscription?.plan?.limits?.maxChannels ?? 1}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">Connected numbers</div>
            </div>
          </div>

          {/* Feature Summary */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Included Feature Entitlements
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(subscription?.plan?.features || ['campaigns', 'leads', 'templates', 'quick_replies']).map(
                (feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    <Check className="h-3 w-3 text-emerald-500" />
                    {feat.replace(/_/g, ' ')}
                  </span>
                ),
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/10 py-3.5">
          <div className="text-xs text-muted-foreground">
            {subscription?.isTrial ? (
              <span>Your trial gives full access to Professional features.</span>
            ) : (
              <span>Protected by 256-bit automated encryption.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {subscription?.cancelAtPeriodEnd ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReactivate}
                disabled={!isOwner}
                className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
              >
                Reactivate Subscription
              </Button>
            ) : subscription?.status === 'ACTIVE' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelOpen(true)}
                disabled={!isOwner}
                className="text-muted-foreground hover:text-destructive"
              >
                Cancel Subscription
              </Button>
            ) : null}

            <Link href="/settings/billing/plans">
              <Button size="sm" variant="default">
                {subscription?.isTrial || subscription?.isExpired ? 'Choose a Paid Plan' : 'Change Plan'}
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* 2. BUSINESS DETAILS CARD */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-bold">Business Details</CardTitle>
            <CardDescription>
              Company invoice information, registered address, and GSTIN identification.
            </CardDescription>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBizError(null);
                setEditBizOpen(true);
              }}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Company Name</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {businessDetails?.companyName || 'Not configured'}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground">GST Identification Number (GSTIN)</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {businessDetails?.gstNumber || 'Not provided (Non-registered)'}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground">Billing Email</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {businessDetails?.billingEmail || 'Not configured'}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground">Contact Phone</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {businessDetails?.contactPhone || 'Not configured'}
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs font-medium text-muted-foreground">Registered Billing Address</div>
              <div className="mt-1 text-sm text-foreground">
                {businessDetails?.billingAddress?.street ? (
                  <span>
                    {businessDetails.billingAddress.street}, {businessDetails.billingAddress.city},{' '}
                    {businessDetails.billingAddress.state} - {businessDetails.billingAddress.postalCode},{' '}
                    {businessDetails.billingAddress.country}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Address not specified</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. BILLING HISTORY TABLE */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Billing History</CardTitle>
          <CardDescription>
            Download official tax invoices for subscription activations, renewals, and add-ons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="mt-3 font-semibold text-foreground">No invoices yet</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Tax invoices will appear here automatically when a payment is processed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(inv.issuedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-sm">{inv.type || 'Subscription'}</TableCell>
                      <TableCell className="font-semibold text-foreground">
                        ₹{Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            inv.status === 'Paid'
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                          }
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={`/api/billing/invoices/${inv.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Invoice
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EDIT BUSINESS DETAILS DIALOG */}
      <Dialog open={editBizOpen} onOpenChange={setEditBizOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Business Billing Details</DialogTitle>
            <DialogDescription>
              These details will be printed on all future and downloadable tax invoices.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBusinessDetails} className="space-y-4 py-2">
            {bizError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {bizError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="companyName">Legal Company Name *</Label>
              <Input
                id="companyName"
                value={bizForm.companyName}
                onChange={(e) => setBizForm({ ...bizForm, companyName: e.target.value })}
                placeholder="e.g. Acme Technologies Pvt Ltd"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="gstNumber">GSTIN (Optional)</Label>
                <Input
                  id="gstNumber"
                  value={bizForm.gstNumber}
                  onChange={(e) => setBizForm({ ...bizForm, gstNumber: e.target.value.toUpperCase() })}
                  placeholder="29ABCDE1234F1Z5"
                  maxLength={15}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billingEmail">Billing Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  value={bizForm.billingEmail}
                  onChange={(e) => setBizForm({ ...bizForm, billingEmail: e.target.value })}
                  placeholder="accounts@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={bizForm.contactPhone}
                onChange={(e) => setBizForm({ ...bizForm, contactPhone: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={bizForm.billingAddress?.street || ''}
                onChange={(e) =>
                  setBizForm({
                    ...bizForm,
                    billingAddress: { ...bizForm.billingAddress, street: e.target.value },
                  })
                }
                placeholder="Building, street, suite"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={bizForm.billingAddress?.city || ''}
                  onChange={(e) =>
                    setBizForm({
                      ...bizForm,
                      billingAddress: { ...bizForm.billingAddress, city: e.target.value },
                    })
                  }
                  placeholder="City"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={bizForm.billingAddress?.state || ''}
                  onChange={(e) =>
                    setBizForm({
                      ...bizForm,
                      billingAddress: { ...bizForm.billingAddress, state: e.target.value },
                    })
                  }
                  placeholder="State"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="postalCode">PIN Code</Label>
                <Input
                  id="postalCode"
                  value={bizForm.billingAddress?.postalCode || ''}
                  onChange={(e) =>
                    setBizForm({
                      ...bizForm,
                      billingAddress: { ...bizForm.billingAddress, postalCode: e.target.value },
                    })
                  }
                  placeholder="PIN"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditBizOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingBiz}>
                {savingBiz ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Business Details
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CANCEL SUBSCRIPTION CONFIRMATION DIALOG */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription>
              Your subscription and team access will remain active until the end of your current billing
              period:{' '}
              <strong className="text-foreground">
                {subscription?.currentPeriodEndAt
                  ? new Date(subscription.currentPeriodEndAt).toLocaleDateString('en-IN')
                  : 'the end of the cycle'}
              </strong>
              . You won&apos;t be billed again after this date.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={cancelling}>
              {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
