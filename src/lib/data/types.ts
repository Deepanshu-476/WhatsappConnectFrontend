export interface User {
  id: string;
  app_metadata?: Record<string, any>;
  user_metadata?: {
    full_name?: string | null;
    avatar_url?: string | null;
    [key: string]: any;
  };
  aud?: string;
  confirmation_sent_at?: string;
  recovery_sent_at?: string;
  email_change_sent_at?: string;
  new_email?: string;
  invited_at?: string;
  action_link?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  updated_at?: string;
  identities?: any[];
  is_anonymous?: boolean;
  [key: string]: any;
}

export interface Session {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: number;
  refresh_token?: string;
  user: User;
}

export interface AuthError {
  name: string;
  message: string;
  status?: number;
}

export interface DataApiError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface RealtimeChannel {
  on: (...args: any[]) => RealtimeChannel;
  subscribe: (...args: any[]) => RealtimeChannel;
  unsubscribe: () => Promise<any>;
  track?: (...args: any[]) => Promise<any>;
  untrack?: (...args: any[]) => Promise<any>;
}

export type DataClient = any;
export type DbClient = DataClient;
