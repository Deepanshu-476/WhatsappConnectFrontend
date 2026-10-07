import { cookies } from "next/headers";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

class ServerQueryBuilder<T = DynamicValue> implements QueryBuilderLike<T> {
  private table: string;
  private method: "GET" | "POST" | "PATCH" | "DELETE" = "GET";
  private queryParams: Record<string, string> = {};
  private bodyData: unknown = null;
  private isSingle = false;
  private isMaybeSingle = false;
  private cookieHeader: string;

  constructor(table: string, cookieHeader: string) {
    this.table = table;
    this.cookieHeader = cookieHeader;
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
    const url = `${API_URL}/api/data/${encodeURIComponent(this.table)}${qs}`;

    try {
      const response = await fetch(url, {
        method: this.method,
        headers: {
          ...(this.bodyData !== null ? { "Content-Type": "application/json" } : {}),
          Cookie: this.cookieHeader,
        },
        body: this.bodyData !== null ? JSON.stringify(this.bodyData) : undefined,
      });

      const res = await response.json().catch(() => null);
      let data = res?.data ?? null;

      if (this.isSingle || this.isMaybeSingle) {
        data = Array.isArray(data) ? (data[0] ?? null) : data;
      }

      return {
        data: data as T | null,
        error: (res?.error as DataApiError | null | undefined) ?? null,
        count:
          res?.count !== undefined && res?.count !== null
            ? res.count
            : Array.isArray(data)
              ? data.length
              : null,
      };
    } catch (err: unknown) {
      return {
        data: null,
        error: { message: errorMessage(err, "Server query failed") },
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

export async function createClient(): Promise<DataClient> {
  let sessionToken = "";
  try {
    const cookieStore = await cookies();
    sessionToken = cookieStore.get("wacrm_session")?.value ?? "";
  } catch {
    // If called outside request context
  }

  const cookieHeader = sessionToken ? `wacrm_session=${sessionToken}` : "";

  const serverRealtimeChannel: RealtimeChannel = {
    on: (...args: unknown[]) => {
      void args;
      return serverRealtimeChannel;
    },
    subscribe: (...args: unknown[]) => {
      void args;
      return serverRealtimeChannel;
    },
    unsubscribe: () => Promise.resolve("ok"),
  };

  return {
    auth: {
      async getUser(): Promise<AuthUserResponse> {
        if (!sessionToken) return { data: { user: null }, error: null };
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Cookie: cookieHeader },
          });
          const payload = await res.json().catch(() => null);
          return { data: { user: (payload?.user as User | null) ?? null }, error: null };
        } catch {
          return { data: { user: null }, error: null };
        }
      },
      async getSession(): Promise<AuthSessionResponse> {
        if (!sessionToken) return { data: { session: null }, error: null };
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Cookie: cookieHeader },
          });
          const payload = await res.json().catch(() => null);
          return {
            data: { session: payload?.user ? { user: payload.user as User } : null },
            error: null,
          };
        } catch {
          return { data: { session: null }, error: null };
        }
      },
      onAuthStateChange(): AuthSubscription {
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async signOut(): Promise<{ error: AuthError | null }> {
        return { error: null };
      },
      async signInWithPassword(): Promise<AuthPasswordResponse> {
        return { data: { user: null, session: null }, error: null };
      },
      async signUp(): Promise<AuthPasswordResponse> {
        return { data: { user: null, session: null }, error: null };
      },
      async resetPasswordForEmail(): Promise<{ data: unknown; error: AuthError | null }> {
        return { data: null, error: null };
      },
      async updateUser(): Promise<{ data: { user: User | null; ok?: boolean }; error: AuthError | null }> {
        return { data: { user: null }, error: null };
      },
    },
    from: <T = DynamicValue>(table: string): QueryBuilderLike<T> =>
      new ServerQueryBuilder<T>(table, cookieHeader),
    async rpc<T = DynamicValue>(fn: string, args: unknown = {}): Promise<QueryResult<T>> {
      try {
        const res = await fetch(`${API_URL}/api/data/rpc/${encodeURIComponent(fn)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
          body: JSON.stringify(args),
        });
        const payload = await res.json().catch(() => null);
        return {
          data: (payload?.data as T | null) ?? null,
          error: (payload?.error as DataApiError | null | undefined) ?? null,
          count: payload?.count ?? null,
        };
      } catch (err: unknown) {
        return { data: null, error: { message: errorMessage(err, "Request failed") }, count: null };
      }
    },
    storage: {
      from: () => ({
        upload: (path?: string, file?: unknown, options?: unknown) => {
          void path;
          void file;
          void options;
          return Promise.resolve({ data: path ? { path } : null, error: null, count: null });
        },
        remove: () => Promise.resolve({ data: [], error: null, count: null }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: path.startsWith("http") ? path : `/uploads/${path}` },
        }),
      }),
    },
    channel(): RealtimeChannel {
      return serverRealtimeChannel;
    },
    removeChannel(): Promise<unknown> {
      return Promise.resolve("ok");
    },
  };
}
