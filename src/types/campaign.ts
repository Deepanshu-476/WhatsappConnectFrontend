export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'processing'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface CampaignAudienceConfig {
  type: 'all' | 'selected' | 'list' | 'segment' | 'tags' | 'lead_status' | 'custom_field';
  contactIds?: string[];
  filterConditions?: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'contains' | 'in';
    value: string | string[];
  }>;
  logicOperator?: 'AND' | 'OR';
  totalCount?: number;
  eligibleCount?: number;
  optedOutCount?: number;
  invalidCount?: number;
  duplicateCount?: number;
}

export interface CampaignTemplateConfig {
  name: string;
  language?: string;
  category?: string;
  header?: string;
  body?: string;
  footer?: string;
  buttons?: Array<{ type: string; text: string }>;
  variables?: string[];
}

export interface CampaignScheduleConfig {
  type: 'now' | 'scheduled' | 'recurring';
  scheduledAt?: string | null;
  timezone?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    daysOfWeek?: number[];
    time?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  replied: number;
  optedOut: number;
}

export interface CampaignRecipient {
  contactId: string;
  name: string;
  phone: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'opted_out';
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  repliedAt?: string | null;
  error?: string | null;
  lastEvent?: string;
  attempt?: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type?: 'single' | 'drip';
  status: CampaignStatus;
  template: CampaignTemplateConfig;
  channel?: {
    id: string;
    name: string;
    phoneNumber?: string;
  };
  audience: {
    total: number;
    type: string;
    eligibleCount?: number;
    optedOutCount?: number;
    invalidCount?: number;
    duplicateCount?: number;
    filterConditions?: Array<{
      field: string;
      operator: string;
      value: string | string[];
    }>;
  };
  stats: CampaignStats;
  progress?: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    replied: number;
    optedOut: number;
    currentIndex: number;
  };
  recipients?: CampaignRecipient[];
  variableMappings?: Record<string, string>;
  schedule?: CampaignScheduleConfig | null;
  scheduledAt?: string | null;
  sendingSettings?: {
    speed?: number;
    minDelay?: number;
    maxDelay?: number;
    randomDelay?: boolean;
    batchSize?: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  pausedAt?: string;
  resumedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface CampaignAnalyticsOverview {
  totalRecipients: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
  optedOut: number;
  deliveryRate: number;
  readRate: number;
  replyRate: number;
  failureRate: number;
  optOutRate: number;
}

export interface CampaignAnalyticsTrend {
  time: string;
  sent: number;
  delivered: number;
  read: number;
}

export interface CampaignAnalytics {
  overview: CampaignAnalyticsOverview;
  trends: CampaignAnalyticsTrend[];
  recipients: CampaignRecipient[];
}
