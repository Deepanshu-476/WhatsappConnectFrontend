"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Bot, Loader2, RefreshCw, Workflow, Zap } from "lucide-react";

import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

type Row = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  status?: string;
  is_active?: boolean;
};

function label(row: Row) {
  return row.name ?? row.title ?? row.id ?? row._id ?? "Untitled";
}

export default function ChatbotPage() {
  const [flows, setFlows] = useState<Row[]>([]);
  const [automations, setAutomations] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [flowsPayload, automationsPayload] = await Promise.all([
        fetch("/api/flows", { credentials: "include" }).then((res) => res.json()),
        apiFetch<{ automations?: Row[]; data?: Row[] }>("/api/automations"),
      ]);
      setFlows(flowsPayload.flows ?? flowsPayload.data ?? []);
      setAutomations(automationsPayload.automations ?? automationsPayload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load chatbot workflows");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Chatbot</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            A lightweight control hub over the existing Flows and Automations engines. No duplicate builder code.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/flows" />} size="sm">
            <Workflow className="mr-2 size-4" />
            Flows
          </Button>
          <Button nativeButton={false} render={<Link href="/automations" />} size="sm" variant="secondary">
            <Zap className="mr-2 size-4" />
            Automations
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-lg border border-border">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <WorkflowList title="Flows" icon={Workflow} rows={flows} href="/flows" empty="No flows saved yet." />
          <WorkflowList title="Automations" icon={Zap} rows={automations} href="/automations" empty="No automations saved yet." />
        </div>
      )}
    </div>
  );
}

function WorkflowList({
  title,
  icon: Icon,
  rows,
  href,
  empty,
}: {
  title: string;
  icon: typeof Bot;
  rows: Row[];
  href: string;
  empty: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>
        <Button nativeButton={false} render={<Link href={href} />} size="sm" variant="outline">
          Open
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-2">
          {rows.slice(0, 8).map((row) => (
            <div key={row.id ?? row._id ?? label(row)} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm font-medium text-foreground">{label(row)}</span>
              <span className="text-xs text-muted-foreground">{row.is_active ? "Active" : row.status ?? "Saved"}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
