'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  ArrowLeft,
  ArrowRight,
  Users,
  Calendar,
  Send,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Clock,
  Sliders,
  Layers,
  Smartphone,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Available Channels
const CHANNELS = [
  { id: 'primary', name: 'Primary WhatsApp API', phone: '+91 9205962984', quality: 'HIGH' },
  { id: 'support', name: 'Customer Support Line', phone: '+91 8800112233', quality: 'HIGH' },
];

// Sample Approved WhatsApp Templates
const APPROVED_TEMPLATES = [
  {
    id: 'diwali_special_offer',
    name: 'diwali_special_offer',
    language: 'en_US',
    category: 'MARKETING',
    header: 'Festive Season Exclusive Offer! 🪔',
    body: 'Hello {{1}}, celebrate this festive season with an exclusive 25% discount at {{2}}! Use coupon code FESTIVE25 at checkout.',
    footer: 'Reply STOP to unsubscribe',
    buttons: [
      { type: 'URL', text: 'Claim Offer Now' },
      { type: 'QUICK_REPLY', text: 'Talk to Sales' },
    ],
    variables: ['1', '2'],
  },
  {
    id: 'service_reminder_v2',
    name: 'service_reminder_v2',
    language: 'en_US',
    category: 'UTILITY',
    header: 'Upcoming Appointment Reminder',
    body: 'Hi {{1}}, this is a friendly reminder that your scheduled consultation with {{2}} is confirmed for tomorrow. Please let us know if you need to reschedule.',
    footer: 'Pure Flow Medical Services',
    buttons: [{ type: 'QUICK_REPLY', text: 'Confirm Appointment' }],
    variables: ['1', '2'],
  },
  {
    id: 'order_status_update',
    name: 'order_status_update',
    language: 'en_US',
    category: 'UTILITY',
    header: 'Your Order Has Shipped 📦',
    body: 'Hello {{1}}, great news! Your order {{2}} has been dispatched and is on its way. Track your package live using the link below.',
    footer: 'Thank you for shopping with us',
    buttons: [{ type: 'URL', text: 'Track Order' }],
    variables: ['1', '2'],
  },
  {
    id: 'vip_exclusive_invite',
    name: 'vip_exclusive_invite',
    language: 'en_US',
    category: 'MARKETING',
    header: 'VIP Member Exclusive Invitation',
    body: 'Dear {{1}}, as a valued VIP partner at {{2}}, you are cordially invited to our exclusive product preview event.',
    footer: 'Valid for active members only',
    buttons: [{ type: 'QUICK_REPLY', text: 'RSVP Now' }],
    variables: ['1', '2'],
  },
];

// Variable Mapping Options
const VARIABLE_OPTIONS = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'email', label: 'Email Address' },
  { value: 'company', label: 'Company / Organization' },
  { value: 'leadStatus', label: 'Lead Status' },
  { value: 'tag', label: 'Contact Tag' },
  { value: 'orderId', label: 'Order ID' },
  { value: 'customField', label: 'Custom Field' },
];

interface FilterRule {
  field: string;
  operator: string;
  value: string;
}

const AUDIENCE_OPTIONS: Array<{
  id: 'all' | 'selected' | 'list' | 'segment' | 'filter' | 'csv';
  title: string;
  desc: string;
}> = [
  { id: 'all', title: 'All Contacts', desc: 'Every contact in account' },
  { id: 'selected', title: 'Selected Contacts', desc: 'Handpicked recipients' },
  { id: 'list', title: 'Contact List', desc: 'Pre-built list' },
  { id: 'segment', title: 'Saved Segment', desc: 'Dynamic group' },
  { id: 'filter', title: 'Filter Contacts', desc: 'Custom rules' },
  { id: 'csv', title: 'Import CSV', desc: 'Upload file' },
];

const LOCAL_STORAGE_KEY = 'wacrm_campaign_new_draft';

export default function NewCampaignWizard() {
  const router = useRouter();

  // Wizard Step (1 to 5)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [launching, setLaunching] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Step 1: Campaign Details
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0].id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [campaignType, setCampaignType] = useState<'single' | 'drip'>('single');

  // Step 2: Audience
  const [audienceType, setAudienceType] = useState<
    'all' | 'selected' | 'list' | 'segment' | 'filter' | 'csv'
  >('all');
  const [logicOperator, setLogicOperator] = useState<'AND' | 'OR'>('AND');
  const [filterRules, setFilterRules] = useState<FilterRule[]>([
    { field: 'tags', operator: 'contains', value: 'VIP' },
  ]);
  const [validatingAudience, setValidatingAudience] = useState(false);
  const [audienceStats, setAudienceStats] = useState({
    total: 1250,
    eligibleCount: 1180,
    optedOutCount: 40,
    invalidCount: 20,
    duplicateCount: 10,
  });

  // Step 3: WhatsApp Template & Variables
  const [selectedTemplateId, setSelectedTemplateId] = useState(APPROVED_TEMPLATES[0].id);
  const [variableMappings, setVariableMappings] = useState<Record<string, string>>({
    '1': 'firstName',
    '2': 'company',
  });

  // Step 4: Scheduling & Sending
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule' | 'recurring'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [sendingSpeed, setSendingSpeed] = useState(30);
  const [minDelay, setMinDelay] = useState(2);
  const [maxDelay, setMaxDelay] = useState(5);
  const [randomDelay, setRandomDelay] = useState(true);
  const [batchSize, setBatchSize] = useState(50);

  // Active Template Object
  const activeTemplate =
    APPROVED_TEMPLATES.find((t) => t.id === selectedTemplateId) || APPROVED_TEMPLATES[0];

  // Restore saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.campaignType) setCampaignType(parsed.campaignType);
        if (parsed.audienceType) setAudienceType(parsed.audienceType);
        if (parsed.selectedTemplateId) setSelectedTemplateId(parsed.selectedTemplateId);
        if (parsed.variableMappings) setVariableMappings(parsed.variableMappings);
        if (parsed.scheduleMode) setScheduleMode(parsed.scheduleMode);
      }
    } catch {
      // Ignore draft read errors
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    try {
      const draft = {
        name,
        description,
        campaignType,
        audienceType,
        selectedTemplateId,
        variableMappings,
        scheduleMode,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore quota errors
    }
  }, [name, description, campaignType, audienceType, selectedTemplateId, variableMappings, scheduleMode]);

  // Run Audience Validation
  const runAudienceValidation = useCallback(async () => {
    setValidatingAudience(true);
    try {
      const formattedFilters =
        audienceType === 'filter'
          ? filterRules.map((r) => ({
              field: r.field,
              operator: r.operator,
              value: r.value,
            }))
          : [];

      const res = await fetch('/api/campaigns/validate-audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audienceType: audienceType === 'filter' ? 'tags' : audienceType,
          filterConditions: formattedFilters,
          logicOperator,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAudienceStats({
          total: data.total ?? data.totalContacts ?? 1250,
          eligibleCount: data.eligible ?? data.eligibleCount ?? 1180,
          optedOutCount: data.optedOut ?? data.optedOutCount ?? 40,
          invalidCount: data.invalid ?? data.invalidCount ?? 20,
          duplicateCount: data.duplicate ?? data.duplicateCount ?? 10,
        });
      }
    } catch {
      // Soft fallback
    } finally {
      setValidatingAudience(false);
    }
  }, [audienceType, filterRules, logicOperator]);

  useEffect(() => {
    if (step === 2 || step === 5) {
      void runAudienceValidation();
    }
  }, [step, runAudienceValidation]);

  // Add / Remove Filter Rules
  const handleAddRule = () => {
    setFilterRules([...filterRules, { field: 'leadStatus', operator: 'is', value: 'Qualified' }]);
  };

  const handleRemoveRule = (index: number) => {
    const updated = filterRules.filter((_, i) => i !== index);
    setFilterRules(updated);
  };

  const handleRuleChange = (index: number, key: keyof FilterRule, val: string) => {
    const updated = [...filterRules];
    updated[index][key] = val;
    setFilterRules(updated);
  };

  // Generate live WhatsApp preview text
  const getRenderedPreviewBody = () => {
    let body = activeTemplate.body;
    const sampleValues: Record<string, string> = {
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '+91 92059 62984',
      email: 'rahul@acmecorp.in',
      company: 'Acme Technologies',
      leadStatus: 'Qualified Lead',
      tag: 'VIP Client',
      orderId: 'ORD-98231',
      customField: 'Bangalore',
    };

    activeTemplate.variables.forEach((v) => {
      const mappedField = variableMappings[v] || 'firstName';
      const replacement = sampleValues[mappedField] || `[${mappedField}]`;
      body = body.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), replacement);
    });

    return body;
  };

  // Step Nav Validation
  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error('Please enter a campaign name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Validate template variables are all mapped
      const unmapped = activeTemplate.variables.filter((v) => !variableMappings[v]);
      if (unmapped.length > 0) {
        toast.error('Please map all required template variables before continuing.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (scheduleMode === 'schedule') {
        if (!scheduledDate || !scheduledTime) {
          toast.error('Please select both date and time for scheduled launch');
          return;
        }
        const scheduledTimestamp = new Date(`${scheduledDate}T${scheduledTime}:00`).getTime();
        if (isNaN(scheduledTimestamp) || scheduledTimestamp <= Date.now()) {
          toast.error('Scheduled time must be in the future.');
          return;
        }
      }
      setStep(5);
    }
  };

  // Final Campaign Launch
  const handleFinalLaunch = async () => {
    setLaunching(true);
    try {
      const scheduledAt =
        scheduleMode === 'schedule' && scheduledDate
          ? `${scheduledDate}T${scheduledTime}:00`
          : null;

      const payload = {
        name: name.trim(),
        description: description.trim(),
        type: campaignType,
        channel: CHANNELS.find((c) => c.id === selectedChannel) || CHANNELS[0],
        status: scheduleMode === 'now' ? 'running' : 'scheduled',
        template: {
          name: activeTemplate.name,
          language: activeTemplate.language,
          category: activeTemplate.category,
          header: activeTemplate.header,
          body: activeTemplate.body,
          footer: activeTemplate.footer,
          buttons: activeTemplate.buttons,
          variables: activeTemplate.variables,
        },
        audience: {
          type: audienceType,
          totalCount: audienceStats.total,
          eligibleCount: audienceStats.eligibleCount,
          optedOutCount: audienceStats.optedOutCount,
          invalidCount: audienceStats.invalidCount,
          duplicateCount: audienceStats.duplicateCount,
          filterConditions: filterRules,
          logicOperator,
        },
        variableMappings,
        schedule: {
          type: scheduleMode,
          scheduledAt,
          timezone,
          recurring:
            scheduleMode === 'recurring'
              ? { frequency: recurringFrequency, time: scheduledTime }
              : undefined,
        },
        scheduledAt,
        sendingSettings: {
          speed: sendingSpeed,
          minDelay,
          maxDelay,
          randomDelay,
          batchSize,
        },
        launchImmediately: scheduleMode === 'now',
      };

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.campaign) {
        // Clear saved draft
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch {}

        if (scheduleMode === 'now') {
          // Trigger worker execution
          await fetch(`/api/campaigns/${data.campaign.id}/start`, { method: 'POST' });
          toast.success('Campaign launched! Sending started.');
        } else {
          toast.success('Campaign scheduled successfully!');
        }

        setConfirmModalOpen(false);
        router.push(`/campaigns/${data.campaign.id}`);
      } else {
        toast.error(data.error || 'Failed to create campaign');
      }
    } catch {
      toast.error('Network error during campaign launch');
    } finally {
      setLaunching(false);
    }
  };

  // Stepper Config
  const STEPS = [
    { num: 1, label: 'Campaign Details' },
    { num: 2, label: 'Audience' },
    { num: 3, label: 'WhatsApp Template' },
    { num: 4, label: 'Scheduling' },
    { num: 5, label: 'Review & Launch' },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/campaigns" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Create Campaign
            </h1>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Send personalized promotional and service messages to your customers at scale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/campaigns">
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              Cancel
            </Button>
          </Link>
          <Link href="/campaigns/settings">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Sliders className="h-3.5 w-3.5" />
              Campaign Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stepper (Desktop Horizontal / Mobile Compact) */}
      <div className="bg-card border border-border/60 rounded-xl p-4 shadow-2xs">
        {/* Desktop Stepper */}
        <div className="hidden md:flex items-center justify-between max-w-4xl mx-auto">
          {STEPS.map((st, idx) => {
            const isCompleted = step > st.num;
            const isCurrent = step === st.num;

            return (
              <div key={st.num} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => {
                    if (step > st.num) setStep(st.num as 1 | 2 | 3 | 4 | 5);
                  }}
                  className={`flex items-center gap-2.5 text-xs font-medium transition-colors ${
                    isCurrent
                      ? 'text-primary font-bold'
                      : isCompleted
                      ? 'text-foreground hover:text-primary cursor-pointer'
                      : 'text-muted-foreground cursor-not-allowed opacity-60'
                  }`}
                >
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : st.num}
                  </span>
                  <span>{st.label}</span>
                </button>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-colors ${
                      step > st.num ? 'bg-emerald-600' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Stepper */}
        <div className="flex md:hidden items-center justify-between text-xs">
          <span className="font-semibold text-primary">
            Step {step} of 5: {STEPS[step - 1].label}
          </span>
          <div className="flex items-center gap-1">
            {STEPS.map((s) => (
              <span
                key={s.num}
                className={`h-2 rounded-full transition-all ${
                  step === s.num
                    ? 'w-6 bg-primary'
                    : step > s.num
                    ? 'w-2 bg-emerald-600'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Form (Col 8) + Live Campaign Details Summary (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Content (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: CAMPAIGN DETAILS */}
          {step === 1 && (
            <div className="space-y-6">
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                    Campaign Details
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define the campaign name, sender channel, and transmission model.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Select Channel */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Select WhatsApp Channel *
                    </label>
                    <Select
                      value={selectedChannel}
                      onValueChange={(val) => val && setSelectedChannel(val)}
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANNELS.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id} className="text-xs">
                            {ch.name} ({ch.phone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campaign Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Campaign Name *
                    </label>
                    <Input
                      placeholder="e.g. Diwali Offer Campaign"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-xs h-9"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      A clear name helps organize reports and recipient logs.
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Description (Optional)
                    </label>
                    <Textarea
                      placeholder="Add internal notes, marketing objective, or promotional context..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="text-xs resize-none"
                    />
                  </div>

                  {/* Choose Campaign Type Cards (Cunnekt Reference) */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-foreground">
                      Choose Campaign Type *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* One-time Campaign Card */}
                      <div
                        onClick={() => setCampaignType('single')}
                        className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
                          campaignType === 'single'
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border/70 hover:border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                            <Send className="h-4 w-4" />
                          </div>
                          {campaignType === 'single' && (
                            <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-foreground">One-time Campaign</h4>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          Send a campaign once to the selected audience immediately or on schedule.
                        </p>
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          <Badge variant="outline" className="text-[9px] bg-card text-muted-foreground">
                            One-time message
                          </Badge>
                          <Badge variant="outline" className="text-[9px] bg-card text-muted-foreground">
                            Schedule delivery
                          </Badge>
                        </div>
                      </div>

                      {/* Drip Campaign Card */}
                      <div
                        onClick={() => setCampaignType('drip')}
                        className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
                          campaignType === 'drip'
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border/70 hover:border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2">
                            <Layers className="h-4 w-4" />
                          </div>
                          {campaignType === 'drip' && (
                            <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-foreground">Drip Campaign</h4>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          Send messages according to a staged sequence, recurring schedule, or automation triggers.
                        </p>
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          <Badge variant="outline" className="text-[9px] bg-card text-muted-foreground">
                            Multi-stage delivery
                          </Badge>
                          <Badge variant="outline" className="text-[9px] bg-card text-muted-foreground">
                            Drip logic
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 2: AUDIENCE & SEGMENTATION */}
          {step === 2 && (
            <div className="space-y-6">
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Who will receive this campaign?
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Target contacts from your directory, saved segments, or custom conditions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Selectable Audience Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {AUDIENCE_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setAudienceType(opt.id)}
                        className={`cursor-pointer rounded-xl border p-3 transition-all ${
                          audienceType === opt.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border/70 hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-foreground">{opt.title}</h4>
                          {audienceType === opt.id && <Check className="h-3 w-3 text-primary" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Condition Builder (when Filter Contacts is active) */}
                  {audienceType === 'filter' && (
                    <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          Contact Filter Rules
                        </span>
                        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setLogicOperator('AND')}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                              logicOperator === 'AND'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            AND
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogicOperator('OR')}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                              logicOperator === 'OR'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            OR
                          </button>
                        </div>
                      </div>

                      {/* Rule Rows */}
                      <div className="space-y-2.5">
                        {filterRules.map((rule, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Select
                              value={rule.field}
                              onValueChange={(val) => val && handleRuleChange(idx, 'field', val)}
                            >
                              <SelectTrigger className="w-36 text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tags">Tag</SelectItem>
                                <SelectItem value="leadStatus">Lead Status</SelectItem>
                                <SelectItem value="country">Country</SelectItem>
                                <SelectItem value="city">City</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select
                              value={rule.operator}
                              onValueChange={(val) => val && handleRuleChange(idx, 'operator', val)}
                            >
                              <SelectTrigger className="w-28 text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="is">is</SelectItem>
                                <SelectItem value="contains">contains</SelectItem>
                                <SelectItem value="is not">is not</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              placeholder="Value (e.g. VIP, Qualified)"
                              value={rule.value}
                              onChange={(e) => handleRuleChange(idx, 'value', e.target.value)}
                              className="text-xs h-8 flex-1"
                            />

                            {filterRules.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveRule(idx)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddRule}
                          className="h-8 text-xs gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Condition
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Real-time Audience Count Breakdown Card */}
                  <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">Audience Summary</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={runAudienceValidation}
                        disabled={validatingAudience}
                        className="h-7 text-[11px] gap-1"
                      >
                        <RefreshCw className={`h-3 w-3 ${validatingAudience ? 'animate-spin' : ''}`} />
                        Refresh Count
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                        <p className="text-[10px] text-muted-foreground">Total Contacts</p>
                        <p className="text-base font-bold text-foreground">
                          {audienceStats.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Eligible</p>
                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          {audienceStats.eligibleCount.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Opted Out</p>
                        <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                          {audienceStats.optedOutCount.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <p className="text-[10px] text-rose-700 dark:text-rose-300 font-medium">Invalid</p>
                        <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                          {audienceStats.invalidCount.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                        <p className="text-[10px] text-muted-foreground">Duplicates</p>
                        <p className="text-base font-bold text-foreground">
                          {audienceStats.duplicateCount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 3: WHATSAPP TEMPLATE & ATTRIBUTE MAPPING */}
          {step === 3 && (
            <div className="space-y-6">
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    Select WhatsApp Template
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Choose an approved template registered with your WhatsApp Business Account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Template Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">
                      Approved Templates *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {APPROVED_TEMPLATES.map((tmpl) => (
                        <div
                          key={tmpl.id}
                          onClick={() => {
                            setSelectedTemplateId(tmpl.id);
                            // Initialize default variable mappings for template
                            const defaultMaps: Record<string, string> = {};
                            tmpl.variables.forEach((v, i) => {
                              defaultMaps[v] = i === 0 ? 'firstName' : 'company';
                            });
                            setVariableMappings(defaultMaps);
                          }}
                          className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                            selectedTemplateId === tmpl.id
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-border/70 hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-foreground font-mono">
                              {tmpl.name}
                            </span>
                            <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                              Approved
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                            {tmpl.body}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
                            <span>{tmpl.category}</span>
                            <span>•</span>
                            <span>{tmpl.language}</span>
                            <span>•</span>
                            <span>{tmpl.variables.length} variable(s)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Template Variable Mapping */}
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-foreground">Map Template Variables</h4>
                        <p className="text-[11px] text-muted-foreground">
                          Map placeholders like {'{{1}}'} and {'{{2}}'} to your CRM contact attributes.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {activeTemplate.variables.map((v) => (
                        <div
                          key={v}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20"
                        >
                          <div className="font-mono text-xs font-bold text-primary w-16">
                            {`{{${v}}}`}
                          </div>
                          <span className="text-muted-foreground text-xs">maps to</span>
                          <Select
                            value={variableMappings[v] || 'firstName'}
                            onValueChange={(val) =>
                              val && setVariableMappings({ ...variableMappings, [v]: val })
                            }
                          >
                            <SelectTrigger className="w-56 text-xs h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VARIABLE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 4: SCHEDULING & SENDING OPTIONS */}
          {step === 4 && (
            <div className="space-y-6">
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    When should this campaign be sent?
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure dispatch timing, rate limits, and quiet hours compliance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Scheduling Mode Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setScheduleMode('now')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        scheduleMode === 'now'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border/70 hover:bg-muted/30'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-foreground">Send Now</h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Start transmission immediately after review.
                      </p>
                    </div>

                    <div
                      onClick={() => setScheduleMode('schedule')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        scheduleMode === 'schedule'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border/70 hover:bg-muted/30'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-foreground">Schedule</h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Dispatch on a specific future date and time.
                      </p>
                    </div>

                    <div
                      onClick={() => setScheduleMode('recurring')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        scheduleMode === 'recurring'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border/70 hover:bg-muted/30'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-foreground">Recurring</h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Run daily, weekly, or monthly sequence.
                      </p>
                    </div>
                  </div>

                  {/* Scheduled Inputs */}
                  {scheduleMode === 'schedule' && (
                    <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">Date *</label>
                          <Input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">Time *</label>
                          <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">Timezone</label>
                          <Select value={timezone} onValueChange={(val) => val && setTimezone(val)}>
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recurring Inputs */}
                  {scheduleMode === 'recurring' && (
                    <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">Frequency</label>
                          <Select
                            value={recurringFrequency}
                            onValueChange={(val) =>
                              val && setRecurringFrequency(val as 'daily' | 'weekly' | 'monthly')
                            }
                          >
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly (Monday - Friday)</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">Dispatch Time</label>
                          <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sending Settings */}
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <h4 className="text-xs font-bold text-foreground">Sending Rate Limits &amp; Jitter</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Speed (Messages per Minute)
                        </label>
                        <Input
                          type="number"
                          value={sendingSpeed}
                          onChange={(e) => setSendingSpeed(Number(e.target.value))}
                          className="text-xs h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Batch Size
                        </label>
                        <Input
                          type="number"
                          value={batchSize}
                          onChange={(e) => setBatchSize(Number(e.target.value))}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">Anti-ban Random Delay</p>
                        <p className="text-[11px] text-muted-foreground">
                          Random delay ({minDelay}s - {maxDelay}s) helps distribute message delivery naturally within configured limits.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={randomDelay}
                        onChange={(e) => setRandomDelay(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </div>

                    {randomDelay && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Min Delay (sec)</label>
                          <Input
                            type="number"
                            value={minDelay}
                            onChange={(e) => setMinDelay(Number(e.target.value))}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Max Delay (sec)</label>
                          <Input
                            type="number"
                            value={maxDelay}
                            onChange={(e) => setMaxDelay(Number(e.target.value))}
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quiet Hours Banner */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                    <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <p className="font-semibold">Quiet Hours Compliance Active</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Messages are paused between 9:00 PM and 9:00 AM. If scheduled send time falls inside quiet hours, the campaign will hold until sending hours begin.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 5: REVIEW & LAUNCH */}
          {step === 5 && (
            <div className="space-y-6">
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Review &amp; Launch Campaign
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Verify all targeting, template variables, and transmission parameters before launching.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                      <span className="font-bold text-foreground">Campaign Details</span>
                      <div className="space-y-1 text-muted-foreground">
                        <p><strong className="text-foreground">Name:</strong> {name}</p>
                        <p><strong className="text-foreground">Type:</strong> {campaignType === 'single' ? 'One-time Campaign' : 'Drip Campaign'}</p>
                        <p><strong className="text-foreground">Channel:</strong> {CHANNELS.find((c) => c.id === selectedChannel)?.name}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                      <span className="font-bold text-foreground">Audience Breakdown</span>
                      <div className="space-y-1 text-muted-foreground">
                        <p><strong className="text-foreground">Selection:</strong> {audienceType.toUpperCase()}</p>
                        <p><strong className="text-emerald-600">Eligible Recipients:</strong> {audienceStats.eligibleCount.toLocaleString()}</p>
                        <p><strong className="text-amber-600">Opted Out (Excluded):</strong> {audienceStats.optedOutCount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                      <span className="font-bold text-foreground">WhatsApp Template</span>
                      <div className="space-y-1 text-muted-foreground">
                        <p><strong className="text-foreground">Template:</strong> {activeTemplate.name}</p>
                        <p><strong className="text-foreground">Category:</strong> {activeTemplate.category}</p>
                        <p><strong className="text-foreground">Variables:</strong> {activeTemplate.variables.length} mapped</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                      <span className="font-bold text-foreground">Schedule &amp; Limits</span>
                      <div className="space-y-1 text-muted-foreground">
                        <p><strong className="text-foreground">Mode:</strong> {scheduleMode.toUpperCase()}</p>
                        <p><strong className="text-foreground">Speed:</strong> {sendingSpeed} messages / min</p>
                        <p><strong className="text-foreground">Delay Jitter:</strong> {minDelay}s - {maxDelay}s</p>
                      </div>
                    </div>
                  </div>

                  {/* Pre-launch checklist */}
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2 text-xs">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      Pre-Launch Validation Checklist
                    </p>
                    <div className="space-y-1 text-emerald-700 dark:text-emerald-400">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>WhatsApp Business Template is approved by Meta</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>All {activeTemplate.variables.length} dynamic template variables are mapped to contact fields</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{audienceStats.eligibleCount.toLocaleString()} verified recipients ready for transmission</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((Math.max(1, step - 1) as 1 | 2 | 3 | 4 | 5))}
                className="gap-1.5 text-xs h-9"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button size="sm" onClick={handleNext} className="gap-1.5 text-xs h-9 shadow-xs">
                Next: {STEPS[step].label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setConfirmModalOpen(true)}
                className="gap-1.5 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Launch Campaign
              </Button>
            )}
          </div>
        </div>

        {/* Right Sticky Sidebar: Campaign Details & Live Preview (4 Columns) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Campaign Details Live Summary Card (Cunnekt Reference) */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Campaign Details</span>
                <Badge variant="outline" className="text-[10px] font-normal">
                  Step {step} of 5
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Account / Channel</span>
                <p className="font-semibold text-foreground truncate">
                  {CHANNELS.find((c) => c.id === selectedChannel)?.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {CHANNELS.find((c) => c.id === selectedChannel)?.phone}
                </p>
              </div>

              <div className="space-y-0.5 pt-2 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Campaign Name</span>
                <p className="font-bold text-foreground">
                  {name.trim() || <span className="text-muted-foreground italic">Untitled Campaign</span>}
                </p>
              </div>

              <div className="space-y-0.5 pt-2 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Type</span>
                <div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {campaignType === 'single' ? 'One-time Campaign' : 'Drip Campaign'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-0.5 pt-2 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Audience</span>
                <p className="font-semibold text-foreground capitalize">
                  {audienceType.replace('_', ' ')}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {audienceStats.eligibleCount.toLocaleString()} eligible contacts
                </p>
              </div>

              <div className="space-y-0.5 pt-2 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Template</span>
                <p className="font-mono text-xs text-foreground font-semibold">
                  {activeTemplate.name}
                </p>
              </div>

              <div className="space-y-0.5 pt-2 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Schedule</span>
                <p className="font-semibold text-foreground capitalize">
                  {scheduleMode === 'now' ? 'Immediate Launch' : `${scheduleMode} (${scheduledTime})`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Interactive WhatsApp Live Phone Mockup Preview */}
          <div className="rounded-2xl border-2 border-border bg-card p-3 shadow-md">
            {/* Phone Top Notch */}
            <div className="flex items-center justify-between px-2 pb-2 text-[10px] text-muted-foreground border-b border-border/40">
              <span className="font-semibold text-foreground">9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>WhatsApp</span>
              </div>
            </div>

            {/* Chat Header */}
            <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg mt-2">
              <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                WA
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-bold text-foreground">
                  {CHANNELS.find((c) => c.id === selectedChannel)?.name || 'Verified Business'}
                </p>
                <p className="text-[9px] text-emerald-600 font-medium">Online</p>
              </div>
            </div>

            {/* Message Chat Bubble */}
            <div className="p-3 my-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2 text-xs">
              {activeTemplate.header && (
                <p className="font-bold text-foreground text-[11px] border-b border-border/30 pb-1">
                  {activeTemplate.header}
                </p>
              )}
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[11px]">
                {getRenderedPreviewBody()}
              </p>
              {activeTemplate.footer && (
                <p className="text-[9px] text-muted-foreground italic">
                  {activeTemplate.footer}
                </p>
              )}
              <div className="flex items-center justify-end gap-1 text-[8px] text-muted-foreground pt-0.5">
                <span>Just now</span>
                <CheckCircle2 className="h-2.5 w-2.5 text-sky-500" />
              </div>
            </div>

            {/* Action Buttons */}
            {activeTemplate.buttons && (
              <div className="space-y-1">
                {activeTemplate.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded-lg bg-card border border-border text-center text-[11px] text-primary font-semibold shadow-2xs"
                  >
                    {btn.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Launch Confirmation Dialog */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-emerald-600">
              <Play className="h-5 w-5 fill-current" />
              Ready to Launch Campaign?
            </DialogTitle>
            <DialogDescription className="text-xs space-y-2 pt-2">
              <p>
                You are about to launch <strong>{name}</strong> to{' '}
                <strong className="text-foreground">
                  {audienceStats.eligibleCount.toLocaleString()} eligible contacts
                </strong>.
              </p>
              <p className="text-muted-foreground">
                Dispatch will execute adhering to rate limits of{' '}
                <strong>{sendingSpeed} messages/min</strong> with anti-ban jitter delays.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmModalOpen(false)}
              disabled={launching}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleFinalLaunch}
              disabled={launching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {launching ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Launching...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Launch Campaign
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
