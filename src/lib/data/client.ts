import { apiFetch } from "@/lib/api/client";
import type {
  AuthError,
  AuthPasswordResponse,
  AuthSessionResponse,
  AuthSubscription,
  AuthUserResponse,
  DataApiError,
  DataClient,
  DynamicValue,
  QueryBuilderLike,
  QueryResult,
  RealtimeChannel,
  User,
} from "./types";

type AuthPayload = {
  user: User;
  profile: unknown;
  account: unknown;
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export class QueryBuilder<T = DynamicValue> implements QueryBuilderLike<T> {
  private table: string;
  private method: "GET" | "POST" | "PATCH" | "DELETE" = "GET";
  private queryParams: Record<string, string> = {};
  private bodyData: unknown = null;
  private isSingle = false;
  private isMaybeSingle = false;

  constructor(table: string) {
    this.table = table;
  }

  select(fields?: string, options?: { count?: string; head?: boolean }): this {
    if (fields) this.queryParams.select = fields;
    if (options?.count) this.queryParams.count = options.count;
    if (options?.head) this.queryParams.head = "true";
    return this;
  }

  insert(values: unknown): this {
    this.method = "POST";
    this.bodyData = values;
    return this;
  }

  update(values: unknown): this {
    this.method = "PATCH";
    this.bodyData = values;
    return this;
  }

  upsert(values: unknown, options?: { onConflict?: string; ignoreDuplicates?: boolean }): this {
    this.method = "POST";
    this.bodyData = values;
    this.queryParams.upsert = "true";
    if (options?.onConflict) this.queryParams.onConflict = options.onConflict;
    return this;
  }

  delete(options?: { count?: string }): this {
    this.method = "DELETE";
    if (options?.count) this.queryParams.count = options.count;
    return this;
  }

  eq(field: string, value: unknown): this {
    if (value !== undefined && value !== null) {
      this.queryParams[`eq.${field}`] = String(value);
    }
    return this;
  }

  neq(field: string, value: unknown): this {
    if (value !== undefined && value !== null) {
      this.queryParams[`neq.${field}`] = String(value);
    }
    return this;
  }

  in(field: string, values: unknown[]): this {
    if (values && Array.isArray(values) && values.length > 0) {
      this.queryParams[`in.${field}`] = values.join(",");
    }
    return this;
  }

  is(field: string, value: unknown): this {
    this.queryParams[`is.${field}`] = String(value);
    return this;
  }

  ilike(field: string, pattern: string): this {
    this.queryParams[`ilike.${field}`] = pattern;
    return this;
  }

  like(field: string, pattern: string): this {
    this.queryParams[`like.${field}`] = pattern;
    return this;
  }

  filter(field: string, operator: string, value: unknown): this {
    this.queryParams[`${operator}.${field}`] = String(value);
    return this;
  }

  or(expression: string): this {
    this.queryParams.or = expression;
    return this;
  }

  contains(field: string, value: unknown): this {
    this.queryParams[`contains.${field}`] = JSON.stringify(value);
    return this;
  }

  gt(field: string, value: unknown): this {
    this.queryParams[`gt.${field}`] = String(value);
    return this;
  }

  gte(field: string, value: unknown): this {
    this.queryParams[`gte.${field}`] = String(value);
    return this;
  }

  lt(field: string, value: unknown): this {
    this.queryParams[`lt.${field}`] = String(value);
    return this;
  }

  lte(field: string, value: unknown): this {
    this.queryParams[`lte.${field}`] = String(value);
    return this;
  }

  order(field: string, options?: { ascending?: boolean; nullsFirst?: boolean }): this {
    const dir = options?.ascending === false ? "desc" : "asc";
    this.queryParams.order = `${field}.${dir}`;
    return this;
  }

  limit(count: number): this {
    this.queryParams.limit = String(count);
    return this;
  }

  range(from: number, to: number): this {
    this.queryParams.offset = String(from);
    this.queryParams.limit = String(to - from + 1);
    return this;
  }

  single(): this {
    this.isSingle = true;
    return this;
  }

  maybeSingle(): this {
    this.isMaybeSingle = true;
    return this;
  }

  async execute(): Promise<QueryResult<T>> {
    const searchParams = new URLSearchParams(this.queryParams);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const path = `/api/data/${encodeURIComponent(this.table)}${qs}`;

    try {
      const res = await apiFetch<{ data: unknown; error: unknown; count?: number }>(path, {
        method: this.method,
        json: this.bodyData !== null ? this.bodyData : undefined,
      });

      let data = res.data;
      if (this.isSingle || this.isMaybeSingle) {
        data = Array.isArray(data) ? (data[0] ?? null) : data;
      }

      return {
        data: data as T | null,
        error: (res.error as DataApiError | null | undefined) ?? null,
        count:
          res.count !== undefined && res.count !== null
            ? res.count
            : Array.isArray(data)
              ? data.length
              : null,
      };
    } catch (err: unknown) {
      return {
        data: null,
        error: { message: errorMessage(err, "Data request failed") },
        count: null,
      };
    }
  }

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

const realtimeChannel: RealtimeChannel = {
  on: (...args: unknown[]) => {
    void args;
    return realtimeChannel;
  },
  subscribe: (callback?: unknown) => {
    if (typeof callback === "function") callback("SUBSCRIBED");
    return realtimeChannel;
  },
  unsubscribe: () => Promise.resolve("ok"),
  track: () => Promise.resolve("ok"),
  untrack: () => Promise.resolve("ok"),
};

export const clientInstance: DataClient = {
  auth: {
    async getSession(): Promise<AuthSessionResponse> {
      try {
        const payload = await apiFetch<AuthPayload>("/api/auth/me");
        return {
          data: {
            session: payload?.user ? { user: payload.user } : null,
          },
          error: null,
        };
      } catch {
        return { data: { session: null }, error: null };
      }
    },
    async getUser(): Promise<AuthUserResponse> {
      try {
        const payload = await apiFetch<AuthPayload>("/api/auth/me");
        return {
          data: { user: payload?.user ?? null },
          error: null,
        };
      } catch {
        return { data: { user: null }, error: null };
      }
    },
    onAuthStateChange(callback?: (event: string, session: import("./types").Session | null) => void): AuthSubscription {
      void callback;
      return {
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      };
    },
    async signOut(args?: unknown): Promise<{ error: AuthError | null }> {
      void args;
      try {
        await apiFetch("/api/auth/logout", { method: "POST" });
        return { error: null };
      } catch (err: unknown) {
        return { error: { message: errorMessage(err, "Sign out failed") } };
      }
    },
    async signInWithPassword({ email, password }: { email: string; password: string }): Promise<AuthPasswordResponse> {
      try {
        const payload = await apiFetch<AuthPayload>("/api/auth/login", {
          method: "POST",
          json: { email, password },
        });
        return {
          data: {
            user: payload.user,
            session: { user: payload.user },
          },
          error: null,
        };
      } catch (err: unknown) {
        return {
          data: { user: null, session: null },
          error: { message: errorMessage(err, "Sign in failed") },
        };
      }
    },
    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: { full_name?: string } };
    }): Promise<AuthPasswordResponse> {
      try {
        const fullName = options?.data?.full_name || email;
        const payload = await apiFetch<AuthPayload>("/api/auth/signup", {
          method: "POST",
          json: { fullName, email, password },
        });
        return {
          data: {
            user: payload.user,
            session: { user: payload.user },
          },
          error: null,
        };
      } catch (err: unknown) {
        return {
          data: { user: null, session: null },
          error: { message: errorMessage(err, "Sign up failed") },
        };
      }
    },
    async resetPasswordForEmail(email: string, options?: unknown): Promise<{ data: unknown; error: AuthError | null }> {
      void options;
      try {
        const data = await apiFetch("/api/auth/forgot-password", {
          method: "POST",
          json: { email },
        });
        return { data, error: null };
      } catch (err: unknown) {
        return { data: null, error: { message: errorMessage(err, "Password reset request failed") } };
      }
    },
    async updateUser(attrs: unknown, options?: unknown, context?: unknown): Promise<{
      data: { user: User | null; ok?: boolean };
      error: AuthError | null;
    }> {
      void options;
      void context;
      try {
        const data = await apiFetch<{ ok?: boolean }>("/api/auth/reset-password", {
          method: "POST",
          json: attrs,
        });
        return { data: { user: null, ...data }, error: null };
      } catch (err: unknown) {
        return { data: { user: null }, error: { message: errorMessage(err, "User update failed") } };
      }
    },
  },
  from<T = DynamicValue>(table: string): QueryBuilderLike<T> {
    return new QueryBuilder<T>(table);
  },
  async rpc<T = DynamicValue>(fn: string, args: unknown = {}): Promise<QueryResult<T>> {
    try {
      const res = await apiFetch<{ data: unknown; error: unknown; count?: number }>(
        `/api/data/rpc/${encodeURIComponent(fn)}`,
        {
          method: "POST",
          json: args,
        },
      );
      return {
        data: (res.data as T | null) ?? null,
        error: (res.error as DataApiError | null | undefined) ?? null,
        count: res.count ?? (Array.isArray(res.data) ? res.data.length : null),
      };
    } catch (err: unknown) {
      return {
        data: null,
        error: { message: errorMessage(err, "RPC request failed") },
        count: null,
      };
    }
  },
  channel(name: string): RealtimeChannel {
    void name;
    return realtimeChannel;
  },
  removeChannel(channel: unknown): Promise<unknown> {
    void channel;
    return Promise.resolve("ok");
  },
  storage: {
    from: (bucket: string) => {
      void bucket;
      return {
        async upload(path: string, file: unknown, options?: unknown): Promise<QueryResult<{ path: string }>> {
          void file;
          void options;
          return { data: { path }, error: null, count: null };
        },
        async remove(paths: string[]): Promise<QueryResult<string[]>> {
          return { data: paths, error: null, count: null };
        },
        getPublicUrl(path: string): { data: { publicUrl: string } } {
          return {
            data: {
              publicUrl: path.startsWith("http") ? path : `/uploads/${path}`,
            },
          };
        },
      };
    },
  },
};

export function createClient(): DataClient {
  return clientInstance;
}
