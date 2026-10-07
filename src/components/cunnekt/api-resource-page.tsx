"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ExternalLink, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ResourceRecord = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  status?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

type Field = {
  key: string;
  label: string;
  multiline?: boolean;
};

type ActionLink = {
  href: string;
  label: string;
};

function recordId(record: ResourceRecord) {
  return String(record.id ?? record._id ?? "");
}

function displayName(record: ResourceRecord) {
  return String((record.name ?? record.title ?? record.key ?? recordId(record)) || "Untitled");
}

function getList(payload: unknown, listKey: string): ResourceRecord[] {
  if (!payload || typeof payload !== "object") return [];
  const obj = payload as Record<string, unknown>;
  const value = obj[listKey] ?? obj.data ?? obj.items;
  return Array.isArray(value) ? (value as ResourceRecord[]) : [];
}

export function ApiResourcePage({
  title,
  description,
  endpoint,
  listKey,
  fields,
  primaryAction,
  secondaryAction,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  endpoint: string;
  listKey: string;
  fields: Field[];
  primaryAction?: ActionLink;
  secondaryAction?: ActionLink;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const initialForm = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.key, ""])),
    [fields],
  );
  const [records, setRecords] = useState<ResourceRecord[]>([]);
  const [form, setForm] = useState<Record<string, string>>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiFetch<unknown>(endpoint);
      setRecords(getList(payload, listKey));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load records");
    } finally {
      setLoading(false);
    }
  }, [endpoint, listKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createRecord() {
    const clean = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()]),
    );
    if (!Object.values(clean).some(Boolean)) return;
    setSaving(true);
    try {
      const payload = await apiFetch<{ data?: ResourceRecord; item?: ResourceRecord }>(endpoint, {
        method: "POST",
        json: clean,
      });
      const created = payload.data ?? payload.item;
      if (created) setRecords((prev) => [created, ...prev]);
      else await load();
      setForm(initialForm);
      toast.success(`${title} saved`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(record: ResourceRecord) {
    const id = recordId(record);
    if (!id) return;
    try {
      await apiFetch(`${endpoint}/${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((item) => recordId(item) !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {secondaryAction ? <PageLink action={secondaryAction} variant="secondary" /> : null}
          {primaryAction ? <PageLink action={primaryAction} /> : null}
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {fields.map((field) =>
            field.multiline ? (
              <Textarea
                key={field.key}
                aria-label={field.label}
                value={form[field.key] ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                className="min-h-10 md:col-span-2"
              />
            ) : (
              <Input
                key={field.key}
                aria-label={field.label}
                value={form[field.key] ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
              />
            ),
          )}
          <Button onClick={createRecord} disabled={saving} className="xl:w-fit">
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
            Add
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {fields.map((field) => (
            <span key={field.key}>{field.label}</span>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-lg border border-border">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="font-medium text-foreground">{emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {records.map((record) => (
            <article key={recordId(record)} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-foreground">{displayName(record)}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {record.status ? `Status: ${String(record.status)}` : "Saved in backend"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteRecord(record)} className="text-destructive">
                  <Trash2 className="size-4" />
                </Button>
              </div>
              {record.description ? (
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{String(record.description)}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PageLink({ action, variant = "default" }: { action: ActionLink; variant?: "default" | "secondary" }) {
  return (
    <Link href={action.href} className={cn(buttonVariants({ size: "sm", variant }))}>
      <ExternalLink className="mr-2 size-4" />
      {action.label}
    </Link>
  );
}
