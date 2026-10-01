import type { DataApiError } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET ?? "";

function internalHeaders(extra: Record<string, string> = {}) {
  return {
    ...(INTERNAL_API_SECRET ? { "x-internal-api-secret": INTERNAL_API_SECRET } : {}),
    ...extra,
  };
}

class AdminQueryBuilder {
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
    const url = `${API_URL}/api/data/${encodeURIComponent(this.table)}${qs}`;

    try {
      const response = await fetch(url, {
        method: this.method,
        headers: internalHeaders(
          this.bodyData !== null ? { "Content-Type": "application/json" } : {},
        ),
        body: this.bodyData !== null ? JSON.stringify(this.bodyData) : undefined,
      });

      const res = await response.json().catch(() => null);
      let data = res?.data ?? null;

      if (this.isSingle || this.isMaybeSingle) {
        data = Array.isArray(data) ? (data[0] ?? null) : data;
      }

      return {
        data,
        error: res?.error ?? null,
        count:
          res?.count !== undefined && res?.count !== null
            ? res.count
            : Array.isArray(data)
              ? data.length
              : null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: { message: err.message || "Admin query failed" },
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

export function createAdminClient(..._args: any[]): any {
  return {
    from: (table: string) => new AdminQueryBuilder(table),
    async rpc(fn: string, args: any = {}) {
      try {
        const res = await fetch(`${API_URL}/api/data/rpc/${encodeURIComponent(fn)}`, {
          method: "POST",
          headers: internalHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(args),
        });
        const payload = await res.json().catch(() => null);
        return {
          data: payload?.data ?? null,
          error: payload?.error ?? null,
          count: payload?.count ?? null,
        };
      } catch (err: any) {
        return { data: null, error: { message: err.message }, count: null };
      }
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: [], error: null }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: path.startsWith("http") ? path : `/uploads/${path}` },
        }),
      }),
    },
  };
}
