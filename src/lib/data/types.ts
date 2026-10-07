export type DynamicValue = ReturnType<typeof JSON.parse>;

export interface UserMetadata {
  full_name?: string | null;
  avatar_url?: string | null;
  [key: string]: unknown;
}

export interface User {
  id: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: UserMetadata;
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
  identities?: Array<Record<string, unknown>>;
  is_anonymous?: boolean;
  [key: string]: unknown;
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
  name?: string;
  message: string;
  status?: number;
}

export interface DataApiError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface QueryResult<T = DynamicValue> {
  data: T | null;
  error: DataApiError | null;
  count: number | null;
}

export interface AuthSessionResponse {
  data: {
    session: Session | null;
  };
  error: AuthError | null;
}

export interface AuthUserResponse {
  data: {
    user: User | null;
  };
  error: AuthError | null;
}

export interface AuthPasswordResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

export interface AuthSubscription {
  data: {
    subscription: {
      unsubscribe(): void;
    };
  };
}

export interface QueryBuilderLike<T = DynamicValue> extends PromiseLike<QueryResult<T>> {
  select(fields?: string, options?: { count?: string; head?: boolean }): QueryBuilderLike<T>;
  insert(values: unknown): QueryBuilderLike<T>;
  update(values: unknown): QueryBuilderLike<T>;
  upsert(values: unknown, options?: { onConflict?: string; ignoreDuplicates?: boolean }): QueryBuilderLike<T>;
  delete(options?: { count?: string }): QueryBuilderLike<T>;
  eq(field: string, value: unknown): QueryBuilderLike<T>;
  neq(field: string, value: unknown): QueryBuilderLike<T>;
  in(field: string, values: unknown[]): QueryBuilderLike<T>;
  is(field: string, value: unknown): QueryBuilderLike<T>;
  ilike(field: string, pattern: string): QueryBuilderLike<T>;
  like(field: string, pattern: string): QueryBuilderLike<T>;
  filter(field: string, operator: string, value: unknown): QueryBuilderLike<T>;
  or(expression: string): QueryBuilderLike<T>;
  contains(field: string, value: unknown): QueryBuilderLike<T>;
  gt(field: string, value: unknown): QueryBuilderLike<T>;
  gte(field: string, value: unknown): QueryBuilderLike<T>;
  lt(field: string, value: unknown): QueryBuilderLike<T>;
  lte(field: string, value: unknown): QueryBuilderLike<T>;
  order(field: string, options?: { ascending?: boolean; nullsFirst?: boolean }): QueryBuilderLike<T>;
  limit(count: number): QueryBuilderLike<T>;
  range(from: number, to: number): QueryBuilderLike<T>;
  single(): QueryBuilderLike<T>;
  maybeSingle(): QueryBuilderLike<T>;
  execute(): Promise<QueryResult<T>>;
}

export interface RealtimeChannel {
  on: (...args: unknown[]) => RealtimeChannel;
  subscribe: (...args: unknown[]) => RealtimeChannel;
  unsubscribe: () => Promise<unknown>;
  track?: (...args: unknown[]) => Promise<unknown>;
  untrack?: (...args: unknown[]) => Promise<unknown>;
}

export interface DataClient {
  auth: {
    getSession(): Promise<AuthSessionResponse>;
    getUser(): Promise<AuthUserResponse>;
    onAuthStateChange?(callback: (event: string, session: Session | null) => void): AuthSubscription;
    signOut(args?: unknown): Promise<{ error: AuthError | null }>;
    signInWithPassword(credentials: { email: string; password: string }): Promise<AuthPasswordResponse>;
    signUp(input: {
      email: string;
      password: string;
      options?: { data?: { full_name?: string } };
    }): Promise<AuthPasswordResponse>;
    resetPasswordForEmail(email: string, options?: unknown): Promise<{ data: unknown; error: AuthError | null }>;
    updateUser(attrs: unknown, options?: unknown, context?: unknown): Promise<{
      data: { user: User | null; ok?: boolean };
      error: AuthError | null;
    }>;
  };
  from<T = DynamicValue>(table: string): QueryBuilderLike<T>;
  rpc<T = DynamicValue>(fn: string, args?: unknown): Promise<QueryResult<T>>;
  channel(name: string): RealtimeChannel;
  removeChannel(channel: RealtimeChannel | unknown): Promise<unknown>;
  storage: {
    from(bucket: string): {
      upload(path: string, file: unknown, options?: unknown): Promise<QueryResult<{ path: string }>>;
      remove(paths: string[]): Promise<QueryResult<string[]>>;
      getPublicUrl(path: string): { data: { publicUrl: string } };
    };
  };
}

export type DbClient = DataClient;
