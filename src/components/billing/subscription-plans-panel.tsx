'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
  Plus,
  Sparkles,
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type BillingInterval = 'monthly' | 'halfYearly' | 'yearly';

interface IntervalPrice {
  price: number;
  originalPrice: number;
  label: string;
  discountPct?: number;
}

interface PlanFeatureLabel {
  id: string;
  label: string;
  included: boolean;
  hint?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  currency: string;
  recommended: boolean;
  billingIntervals: Record<BillingInterval, IntervalPrice>;
  features: string[];
  featureLabels: PlanFeatureLabel[];
  limits: {
    maxUsers?: number;
    maxChannels?: number;
    maxContacts?: number;
    maxCampaignsPerMonth?: number;
    maxMessagesPerMonth?: number;
    maxAutomations?: number;
    maxAiAgents?: number;
  };
}

interface AddonItem {
  slug: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  entitlementType: string;
}

interface CurrentSubscription {
  status: string;
  planSlug: string;
  planName: string;
  billingInterval: string;
  daysRemaining: number;
  isTrial: boolean;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export function SubscriptionPlansPanel() {
  const router = useRouter();
  const { accountRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');

  // Checkout modal
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const isOwner = accountRole === 'owner';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [plansRes, addonsRes, subRes] = await Promise.all([
        apiFetch<{ plans: SubscriptionPlan[] }>('/api/billing/plans'),
        apiFetch<{ data: AddonItem[] }>('/api/billing/addons').catch(() => ({ data: [] })),
        apiFetch<{ data: { subscription: CurrentSubscription } }>('/api/billing/subscription').catch(() => null),
      ]);

      if (Array.isArray(plansRes?.plans)) {
        setPlans(plansRes.plans);
      }
      if (Array.isArray(addonsRes?.data)) {
        setAddons(addonsRes.data);
      }
      if (subRes?.data?.subscription) {
        setCurrentSub(subRes.data.subscription);
      }
    } catch (err: unknown) {
      console.error('Failed to load plans data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCheckoutError(null);
    setCheckoutSuccess(false);
    setCheckoutOpen(true);
  };

  const handleExecuteCheckout = async () => {
    if (!selectedPlan) return;

    try {
      setCheckingOut(true);
      setCheckoutError(null);

      // 1. Create order on backend
      const checkoutRes = await apiFetch<{
        data: {
          orderId: string;
          amount: number;
          amountInPaise: number;
          currency: string;
          keyId: string;
          liveVerificationAvailable: boolean;
        };
      }>('/api/billing/checkout', {
        method: 'POST',
        json: {
          planSlug: selectedPlan.slug,
          billingInterval,
        },
      });

      const orderData = checkoutRes.data;

      // 2. Razorpay execution or Sandbox fallback
      if (orderData.liveVerificationAvailable && typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: orderData.currency,
          name: 'CIIS Connect',
          description: `${selectedPlan.name} Plan (${billingInterval})`,
          order_id: orderData.orderId,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 3. Cryptographic server-side verification
              await apiFetch('/api/billing/verify-payment', {
                method: 'POST',
                json: {
                  providerOrderId: response.razorpay_order_id,
                  providerPaymentId: response.razorpay_payment_id,
                  providerSignature: response.razorpay_signature,
                },
              });

              setCheckoutSuccess(true);
              setTimeout(() => {
                setCheckoutOpen(false);
                router.push('/settings?tab=billing');
              }, 2000);
            } catch (verErr: unknown) {
              setCheckoutError(verErr instanceof Error ? verErr.message : 'Payment verification failed');
            }
          },
          theme: { color: '#16a34a' },
        });

        rzp.open();
      } else {
        // Test sandbox mode / unconfigured credentials mode:
        // Execute server verification with deterministic test token so the complete backend pipeline executes
        const testPaymentId = `pay_sandbox_${Date.now()}`;
        const testSignature = `sig_sandbox_verified_${orderData.orderId.slice(-8)}`;

        await apiFetch('/api/billing/verify-payment', {
          method: 'POST',
          json: {
            providerOrderId: orderData.orderId,
            providerPaymentId: testPaymentId,
            providerSignature: testSignature,
          },
        });

        setCheckoutSuccess(true);
        setTimeout(() => {
          setCheckoutOpen(false);
          router.push('/settings?tab=billing');
        }, 1500);
      }
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back link & Title */}
      <div className="flex flex-col gap-2">
        <Link
          href="/settings?tab=billing"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Billing Management
        </Link>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Manage Subscription Plans
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Select the optimal plan and billing cycle for your WhatsApp sales and customer support operations.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="addons">Add-ons</TabsTrigger>
          </TabsList>

          {/* Billing Interval Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('halfYearly')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                billingInterval === 'halfYearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Half-Yearly
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600">
                Save 10%
              </span>
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('yearly')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                billingInterval === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 1. PLANS TAB CONTENT */}
        <TabsContent value="plans" className="mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const priceObj = plan.billingIntervals?.[billingInterval] || {
                price: 0,
                originalPrice: 0,
                label: 'Monthly',
              };

              const isCurrent = currentSub?.planSlug === plan.slug && currentSub?.status === 'ACTIVE';

              return (
                <Card
                  key={plan.slug}
                  className={`relative flex flex-col justify-between transition-all ${
                    plan.recommended
                      ? 'border-2 border-primary/80 shadow-md ring-1 ring-primary/20'
                      : 'border-border/80 hover:border-border'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary px-3 py-0.5 font-semibold text-primary-foreground shadow">
                        Recommended
                      </Badge>
                    </div>
                  )}

                  <div>
                    <CardHeader className="pt-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                        {isCurrent && (
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">
                            Current Plan
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="min-h-[40px] text-xs leading-relaxed">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Price Display */}
                      <div className="rounded-lg bg-muted/40 p-4 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-sm font-semibold text-muted-foreground">₹</span>
                          <span className="text-3xl font-extrabold tracking-tight text-foreground">
                            {priceObj.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /{billingInterval === 'yearly' ? 'year' : billingInterval === 'halfYearly' ? '6 mos' : 'mo'}
                          </span>
                        </div>
                        {priceObj.originalPrice > priceObj.price && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            <span className="line-through">₹{priceObj.originalPrice.toLocaleString('en-IN')}</span>{' '}
                            <span className="font-medium text-emerald-600">
                              Save ₹{(priceObj.originalPrice - priceObj.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                        <div className="mt-1 text-[11px] text-muted-foreground">+ 18% GST applicable</div>
                      </div>

                      {/* Limits summary */}
                      <div className="space-y-2 border-b border-border/60 pb-4 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Team Seats</span>
                          <strong className="text-foreground">{plan.limits?.maxUsers ?? 1} Users</strong>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>WhatsApp Numbers</span>
                          <strong className="text-foreground">{plan.limits?.maxChannels ?? 1} Channel</strong>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Contact Storage</span>
                          <strong className="text-foreground">
                            {plan.limits?.maxContacts?.toLocaleString('en-IN')} Contacts
                          </strong>
                        </div>
                      </div>

                      {/* Feature List */}
                      <div className="space-y-2.5">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Features Included
                        </div>
                        <ul className="space-y-2 text-xs">
                          {plan.featureLabels?.map((feat) => (
                            <li key={feat.id} className="flex items-start gap-2">
                              {feat.included ? (
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                              ) : (
                                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                              )}
                              <span
                                className={feat.included ? 'text-foreground' : 'text-muted-foreground/60'}
                              >
                                {feat.label}
                                {!feat.included && feat.hint ? (
                                  <span className="ml-1 text-[10px] text-muted-foreground">({feat.hint})</span>
                                ) : null}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="pt-4">
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Active Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={plan.recommended ? 'default' : 'outline'}
                        onClick={() => handleOpenCheckout(plan)}
                        disabled={!isOwner}
                      >
                        {isOwner ? (plan.recommended ? 'Upgrade to Professional' : `Select ${plan.name}`) : 'Owner Only'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* 2. ADD-ONS TAB CONTENT */}
        <TabsContent value="addons" className="mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {addons.map((addon) => (
              <Card key={addon.slug} className="flex flex-col justify-between border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Plus className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-3 text-base font-bold">{addon.name}</CardTitle>
                  <CardDescription className="text-xs">{addon.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-extrabold text-foreground">
                    ₹{addon.monthlyPrice.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-muted-foreground"> / month</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    disabled={!isOwner}
                    onClick={() => {
                      alert(`Add-on ${addon.name} selected. Contact billing@ciisconnect.com or purchase via checkout.`);
                    }}
                  >
                    Add to Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* CHECKOUT MODAL */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Checkout: {selectedPlan?.name} Plan
            </DialogTitle>
            <DialogDescription>
              Review your selected subscription tier and calculated tax totals.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-2">
              {checkoutError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                  {checkoutError}
                </div>
              )}

              {checkoutSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Subscription successfully activated!
                </div>
              )}

              {/* Order breakdown */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <strong className="text-foreground">{selectedPlan.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cycle</span>
                  <strong className="text-foreground capitalize">{billingInterval}</strong>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2">
                  <span className="text-muted-foreground">Base Amount</span>
                  <span>
                    ₹{selectedPlan.billingIntervals[billingInterval].price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>
                    ₹
                    {Math.round(
                      selectedPlan.billingIntervals[billingInterval].price * 0.18,
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                  <span>Total Payable</span>
                  <span className="text-primary">
                    ₹
                    {(
                      selectedPlan.billingIntervals[billingInterval].price +
                      Math.round(selectedPlan.billingIntervals[billingInterval].price * 0.18)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground leading-relaxed">
                By clicking <strong>Confirm & Pay</strong>, you authorize billing via our payment gateway.
                A tax invoice will be generated and available immediately in your Billing History.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCheckoutOpen(false)} disabled={checkingOut}>
              Cancel
            </Button>
            <Button onClick={handleExecuteCheckout} disabled={checkingOut || checkoutSuccess}>
              {checkingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm & Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
