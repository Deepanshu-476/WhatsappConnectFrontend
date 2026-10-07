export interface GeneralCampaignSettings {
  campaignNameFormat: string;
  defaultStatus: 'draft' | 'scheduled';
  defaultChannelId: string;
  defaultTemplate: string;
  defaultTimezone: string;
  defaultCountry: string;
  defaultLanguage: string;
  campaignExpirationDays: number;
  allowCampaignDuplication: boolean;
  allowEditAfterSchedule: boolean;
  allowCancellation: boolean;
}

export interface CampaignSendingSettings {
  mode: 'immediately' | 'scheduled' | 'batch' | 'drip';
  sendOneByOne: boolean;
  batchSending: boolean;
  batchSize: number;
  delayBetweenMessages: number;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  randomizeDelay: boolean;
  humanLikeDelay: boolean;
  dripIntervalMinutes: number;
}

export interface RateLimitSettings {
  enabled: boolean;
  messagesPerMinute: number;
  messagesPerHour: number;
  messagesPerDay: number;
  maxConcurrentSends: number;
  perChannelLimit: number;
  perUserLimit: number;
}

export interface AudienceFilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'contains' | 'in';
  value: string | string[];
}

export interface AudienceSettings {
  defaultSelection: 'all' | 'selected' | 'list' | 'segment' | 'tags' | 'lead_status' | 'custom_field';
  preValidationEnabled: boolean;
  excludeOptedOut: boolean;
  excludeDuplicates: boolean;
  excludeInvalidPhones: boolean;
  defaultFilters: AudienceFilterCondition[];
  logicOperator: 'AND' | 'OR';
}

export interface TemplateSettings {
  requireApprovedOnly: boolean;
  defaultLanguage: string;
  autoMapVariables: boolean;
  blockOnMissingVariables: boolean;
  variableFallbacks: Record<string, string>;
}

export interface AssignmentSettings {
  mode: 'manual' | 'team' | 'round_robin' | 'channel';
  defaultTeam: string;
  defaultUserId: string | null;
  roundRobin: boolean;
  assignRepliesToCampaignOwner: boolean;
}

export interface SchedulingSettings {
  defaultScheduleType: 'now' | 'scheduled' | 'recurring';
  defaultTimezone: string;
  recurringAllowed: boolean;
  defaultSendTime: string;
  recurringOptions: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    daysOfWeek: number[];
  };
}

export interface QuietHoursSettings {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
  behavior: 'pause' | 'delay';
}

export interface RetrySettings {
  enabled: boolean;
  maxRetries: number;
  retryDelayMinutes: number;
  retryableFailures: string[];
}

export interface OptOutSettings {
  enabled: boolean;
  keywords: string[];
  customKeywords: string[];
  autoExcludeOptedOut: boolean;
  requireConfirmationToRemove: boolean;
  confirmationMessage: string;
}

export interface TrackingSettings {
  trackSent: boolean;
  trackDelivered: boolean;
  trackRead: boolean;
  trackReplied: boolean;
  trackOptOut: boolean;
  linkTracking: boolean;
}

export interface NotificationSettings {
  onCampaignStarted: boolean;
  onCampaignCompleted: boolean;
  onCampaignFailed: boolean;
  onCampaignPaused: boolean;
  onCampaignStopped: boolean;
  highFailureRateAlert: boolean;
  highFailureRateThresholdPercent: number;
  highOptOutRateAlert: boolean;
  highOptOutRateThresholdPercent: number;
  channels: {
    inApp: boolean;
    browser: boolean;
    email: boolean;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'campaign_completed' | 'campaign_reply_received' | 'campaign_failed';
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq';
    value: string | number | boolean;
  };
  action: {
    type: 'add_tag' | 'assign_team' | 'notify_admin' | 'update_lead_status';
    target: string;
  };
  enabled: boolean;
}

export interface AutomationSettings {
  automations: AutomationRule[];
}

export interface WhatsAppChannelItem {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'connected' | 'disconnected' | 'flagged';
  qualityRating: 'GREEN' | 'YELLOW' | 'RED';
  messagingLimit: string;
  dailyLimit: number;
  currentUsage: number;
  enabled: boolean;
}

export interface ChannelSettings {
  defaultChannelId: string;
  channels: WhatsAppChannelItem[];
}

export interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  enabled: boolean;
  category: 'messaging' | 'productivity' | 'developer' | 'crm' | 'ecommerce';
  status: 'active' | 'inactive';
}

export interface IntegrationSettings {
  integrations: IntegrationItem[];
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
}

export interface ApiWebhookSettings {
  webhooks: WebhookEndpoint[];
}

export interface RolePermissionItem {
  role: 'owner' | 'admin' | 'agent' | 'viewer';
  label: string;
  permissions: {
    viewCampaigns: boolean;
    createCampaign: boolean;
    editCampaign: boolean;
    deleteCampaign: boolean;
    startCampaign: boolean;
    pauseCampaign: boolean;
    stopCampaign: boolean;
    exportCampaign: boolean;
    viewAnalytics: boolean;
    manageCampaignSettings: boolean;
    manageOptOut: boolean;
    manageChannels: boolean;
    manageIntegrations: boolean;
  };
}

export interface PermissionSettings {
  roles: RolePermissionItem[];
}

export interface CampaignSettingsData {
  generalSettings: GeneralCampaignSettings;
  sendingSettings: CampaignSendingSettings;
  rateLimitSettings: RateLimitSettings;
  audienceSettings: AudienceSettings;
  templateSettings: TemplateSettings;
  assignmentSettings: AssignmentSettings;
  schedulingSettings: SchedulingSettings;
  quietHoursSettings: QuietHoursSettings;
  retrySettings: RetrySettings;
  optOutSettings: OptOutSettings;
  trackingSettings: TrackingSettings;
  notificationSettings: NotificationSettings;
  automationSettings: AutomationSettings;
  channelSettings: ChannelSettings;
  integrationSettings: IntegrationSettings;
  apiWebhookSettings: ApiWebhookSettings;
  permissionSettings: PermissionSettings;
}

export interface OptOutRecord {
  id: string;
  contactId?: string;
  phone: string;
  name?: string;
  keyword?: string;
  source: string;
  reason?: string;
  createdAt: string;
}
