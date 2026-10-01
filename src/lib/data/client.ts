import { apiFetch } from "@/lib/api/client";
import type { DataApiError, RealtimeChannel, User } from "./types";

type AuthPayload = {
  user: User;
  profile: any;
  account: any;
};

export class QueryBuilder {
  private table: string;
  private method: "GET" | "POST" | "PATCH" | "DELETE" = "GET";
  private queryParams: Record<string, string> = {};
  private bodyData: any = null;
  private isSingle = false;
  private isMaybeSingle = false;

  constructor(table: string) {
    this.table = table;
  }

  select(fields?: string, options?: { count?: string; head?: boolean }) {
    if (fields) this.queryParams.select = fields;
    if (options?.count) this.queryParams.count = options.count;
    if (options?.head) this.queryParams.head = "true";
    return this;
  }

  insert(values: any) {
    this.method = "POST";
    this.bodyData = values;
    return this;
  }

  update(values: any) {
    this.method = "PATCH";
    this.bodyData = values;
    return this;
  }

  upsert(values: any, options?: { onConflict?: string }) {
    this.method = "POST";
    this.bodyData = values;
    this.queryParams.upsert = "true";
    if (options?.onConflict) this.queryParams.onConflict = options.onConflict;
    return this;
  }

  delete() {
    this.method = "DELETE";
    return this;
  }

  eq(field: string, value: any) {
    if (value !== undefined && value !== null) {
      this.queryParams[`eq.${field}`] = String(value);
    }
    return this;
  }

  neq(field: string, value: any) {
    if (value !== undefined && value !== null) {
      this.queryParams[`neq.${field}`] = String(value);
    }
    return this;
  }

  in(field: string, values: any[]) {
    if (values && Array.isArray(values) && values.length > 0) {
      this.queryParams[`in.${field}`] = values.join(",");
    }
    return this;
  }

  is(field: string, value: any) {
    this.queryParams[`is.${field}`] = String(value);
    return this;
  }

  ilike(field: string, pattern: string) {
    this.queryParams[`ilike.${field}`] = pattern;
    return this;
  }

  like(field: string, pattern: string) {
    this.queryParams[`like.${field}`] = pattern;
    return this;
  }

  filter(field: string, operator: string, value: any) {
    this.queryParams[`${operator}.${field}`] = String(value);
    return this;
  }

  or(expression: string) {
    this.queryParams.or = expression;
    return this;
  }

  contains(field: string, value: any) {
    this.queryParams[`contains.${field}`] = JSON.stringify(value);
    return this;
  }

  gt(field: string, value: any) {
    this.queryParams[`gt.${field}`] = String(value);
    return this;
  }

  gte(field: string, value: any) {
    this.queryParams[`gte.${field}`] = String(value);
    return this;
  }

  lt(field: string, value: any) {
    this.queryParams[`lt.${field}`] = String(value);
    return this;
  }

  lte(field: string, value: any) {
    this.queryParams[`lte.${field}`] = String(value);
    return this;
  }

  order(field: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    const dir = options?.ascending === false ? "desc" : "asc";
    this.queryParams.order = `${field}.${dir}`;
    return this;
  }

  limit(count: number) {
    this.queryParams.limit = String(count);
    return this;
  }

  range(from: number, to: number) {
    this.queryParams.offset = String(from);
    this.queryParams.limit = String(to - from + 1);
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async execute(): Promise<{ data: any; error: DataApiError | null; count: number | null }> {
    const searchParams = new URLSearchParams(this.queryParams);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const path = `/api/data/${encodeURIComponent(this.table)}${qs}`;

    try {
      const res = await apiFetch<{ data: any; error: any; count?: number }>(path, {
        method: this.method,
        json: this.bodyData !== null ? this.bodyData : undefined,
      });

      let data = res.data;
      if (this.isSingle || this.isMaybeSingle) {
        data = Array.isArray(data) ? (data[0] ?? null) : data;
      }

      return {
        data,
        error: res.error ?? null,
        count:
          res.count !== undefined && res.count !== null
            ? res.count
            : Array.isArray(data)
              ? data.length
              : null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: { message: err.message || "Data request failed" },
        count: null,
      };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

const realtimeChannel: RealtimeChannel = {
  on: (..._args: any[]) => realtimeChannel,
  subscribe: (callback?: any) => {
    if (typeof callback === "function") callback("SUBSCRIBED");
    return realtimeChannel;
  },
  unsubscribe: () => Promise.resolve("ok"),
  track: () => Promise.resolve("ok"),
  untrack: () => Promise.resolve("ok"),
};

export const clientInstance = {
  auth: {
    async getSession() {
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
    async getUser() {
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
    onAuthStateChange(_callback: any) {
      return {
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      };
    },
    async signOut() {
      try {
        await apiFetch("/api/auth/logout", { method: "POST" });
        return { error: null };
      } catch (err: any) {
        return { error: { message: err.message } };
      }
    },
    async signInWithPassword({ email, password }: any) {
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
      } catch (err: any) {
        return {
          data: { user: null, session: null },
          error: { message: err.message },
        };
      }
    },
    async signUp({ email, password, options }: any) {
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
      } catch (err: any) {
        return {
          data: { user: null, session: null },
          error: { message: err.message },
        };
      }
    },
    async resetPasswordForEmail(_email: string) {
      return { data: {}, error: null };
    },
    async updateUser(_attrs: any) {
      return { data: { user: null }, error: null };
    },
  },
  from(table: string) {
    return new QueryBuilder(table);
  },
  async rpc(fn: string, args: any = {}) {
    try {
      const res = await apiFetch<{ data: any; error: any; count?: number }>(
        `/api/data/rpc/${encodeURIComponent(fn)}`,
        {
          method: "POST",
          json: args,
        },
      );
      return {
        data: res.data ?? null,
        error: res.error ?? null,
        count: res.count ?? (Array.isArray(res.data) ? res.data.length : null),
      };
    } catch (err: any) {
      return {
        data: null,
        error: { message: err.message || "RPC request failed" },
        count: null,
      };
    }
  },
  channel(_name: string) {
    return realtimeChannel;
  },
  removeChannel(_channel: any) {
    return Promise.resolve("ok");
  },
  storage: {
    from: (_bucket: string) => ({
      async upload(path: string, _file: any) {
        return { data: { path }, error: null };
      },
      async remove(paths: string[]) {
        return { data: paths, error: null };
      },
      getPublicUrl(path: string) {
        return {
          data: {
            publicUrl: path.startsWith("http") ? path : `/uploads/${path}`,
          },
        };
      },
    }),
  },
};

export function createClient(): any {
  return clientInstance;
}
