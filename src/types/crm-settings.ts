export interface ConversationStatus {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
  isSystem?: boolean;
  order: number;
}

export interface ConversationLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
  order: number;
}

export interface AutoAssignmentConfig {
  enabled: boolean;
  method: 'round_robin' | 'team' | 'user' | 'manual';
  defaultUserId: string | null;
  defaultTeam: string;
  roundRobin: boolean;
  workingHoursOnly: boolean;
}

export interface ConversationTimeoutConfig {
  enabled: boolean;
  inactivityHours: number;
  autoResolve: boolean;
}

export interface ConversationSettings {
  statuses: ConversationStatus[];
  labels: ConversationLabel[];
  autoAssignment: AutoAssignmentConfig;
  timeout: ConversationTimeoutConfig;
  allowReopen: boolean;
  reopenClosedConversations: boolean;
}

export interface LeadStatus {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
  isWon?: boolean;
  isLost?: boolean;
}

export interface LeadSource {
  id: string;
  name: string;
  isDefault?: boolean;
}

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'dropdown'
  | 'multiselect'
  | 'boolean';

export interface CustomField {
  id: string;
  name: string;
  key: string;
  type: CustomFieldType;
  required: boolean;
  options: string[];
}

export interface LeadSettings {
  statuses: LeadStatus[];
  sources: LeadSource[];
  customFields: CustomField[];
}

export interface ContactTag {
  id: string;
  name: string;
  color: string;
}

export interface ImportSettings {
  defaultSource: string;
  autoTag: string;
  skipDuplicates: boolean;
}

export interface ExportSettings {
  includeCustomFields: boolean;
  format: 'csv' | 'json' | 'xlsx';
}

export interface ContactSettings {
  customFields: CustomField[];
  tags: ContactTag[];
  contactStatus: string[];
  requiredFields: string[];
  duplicateHandling: 'update' | 'skip' | 'allow';
  importSettings: ImportSettings;
  exportSettings: ExportSettings;
}

export interface WorkingHoursConfig {
  enabled: boolean;
  timezone: string;
  start: string;
  end: string;
  days: number[];
}

export interface ReassignmentRules {
  enabled: boolean;
  timeoutMinutes: number;
  reassignToQueue: boolean;
  fallbackUserId: string | null;
  notifyTeam: boolean;
}

export interface AssignmentSettings {
  mode: 'manual' | 'automatic' | 'round_robin' | 'team_based' | 'user_based';
  autoAssignment: boolean;
  roundRobin: boolean;
  teamBased: boolean;
  userBased: boolean;
  defaultTeam: string;
  defaultUserId: string | null;
  workingHours: WorkingHoursConfig;
  reassignmentRules: ReassignmentRules;
}

export interface AutoReplyConfig {
  enabled: boolean;
  message: string;
}

export interface AwayMessageConfig {
  enabled: boolean;
  message: string;
  outsideWorkingHours: boolean;
}

export interface ReadUnreadConfig {
  markReadOnOpen: boolean;
  markUnreadOnReassign: boolean;
}

export interface InternalNotesConfig {
  enabled: boolean;
  notifyMentions: boolean;
}

export interface AgentAvailabilityConfig {
  enabled: boolean;
  autoAwayMinutes: number;
}

export interface InboxSettings {
  defaultInbox: 'all' | 'assigned' | 'unassigned';
  defaultStatus: string;
  autoReply: AutoReplyConfig;
  awayMessage: AwayMessageConfig;
  conversationTimeoutHours: number;
  readUnreadSettings: ReadUnreadConfig;
  internalNotes: InternalNotesConfig;
  agentAvailability: AgentAvailabilityConfig;
  typingIndicator: boolean;
  messageNotification: boolean;
  soundNotification: boolean;
}

export interface WhatsAppChannel {
  id: string;
  name: string;
  phoneNumber: string;
  phoneNumberId: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending' | 'configuration_required' | 'unknown';
  webhookUrl: string;
  isDefault: boolean;
  connectedAt?: string;
}

export interface WhatsAppSettings {
  channels: WhatsAppChannel[];
  defaultChannelId: string | null;
  enforceOptOut: boolean;
  optOutKeywords: string[];
}

export interface TemplateSettings {
  autoSync: boolean;
  syncIntervalHours: number;
  defaultLanguage: string;
  categories: string[];
}

export interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  type: string;
  enabled: boolean;
  lastIndexed: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface AiSettings {
  enabled: boolean;
  provider: 'openai' | 'anthropic';
  apiKey: string;
  hasApiKey: boolean;
  model: string;
  temperature: number;
  maxResponseLength: number;
  autoReply: boolean;
  approvalMode: boolean;
  systemPrompt: string;
  knowledgeSources: KnowledgeSource[];
  automations: AutomationRule[];
}

export interface IntegrationItem {
  id: string;
  name: string;
  key: string;
  category: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'configuration_required';
  enabled: boolean;
  requiresConfiguration?: boolean;
  webhookUrl?: string;
  config?: Record<string, unknown>;
}

export interface IntegrationSettings {
  integrations: IntegrationItem[];
}

export interface NotificationSettings {
  newMessage: boolean;
  newLead: boolean;
  newAssignment: boolean;
  mentions: boolean;
  emailNotifications: boolean;
  browserNotifications: boolean;
  soundNotifications: boolean;
}

export interface RolePermission {
  role: 'owner' | 'admin' | 'agent' | 'viewer';
  viewCrmSettings: boolean;
  editCrmSettings: boolean;
  manageConversations: boolean;
  manageLeads: boolean;
  manageContacts: boolean;
  manageWhatsapp: boolean;
  manageTemplates: boolean;
  manageAi: boolean;
  manageIntegrations: boolean;
}

export interface PermissionSettings {
  roles: RolePermission[];
}

export interface DayBusinessHours {
  open: string;
  close: string;
  enabled: boolean;
}

export interface GeneralSettings {
  crmName: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  defaultCountry: string;
  currency: string;
  workingHours: string;
  businessHours: Record<string, DayBusinessHours>;
  defaultLanguage: string;
}

export interface CRMSettings {
  accountId?: string;
  conversationSettings: ConversationSettings;
  leadSettings: LeadSettings;
  contactSettings: ContactSettings;
  assignmentSettings: AssignmentSettings;
  inboxSettings: InboxSettings;
  whatsappSettings: WhatsAppSettings;
  templateSettings: TemplateSettings;
  aiSettings: AiSettings;
  integrationSettings: IntegrationSettings;
  notificationSettings: NotificationSettings;
  permissionSettings: PermissionSettings;
  generalSettings: GeneralSettings;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type CRMCategoryId =
  | 'conversation'
  | 'leads'
  | 'contacts'
  | 'assignment'
  | 'inbox'
  | 'channels'
  | 'templates'
  | 'ai'
  | 'integrations'
  | 'notifications'
  | 'permissions'
  | 'general';
