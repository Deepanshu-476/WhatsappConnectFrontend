"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Lead = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  stage?: string;
  status?: string;
  description?: string;
};

const STAGES = ["new", "qualified", "proposal", "won", "lost"] as const;

function leadId(lead: Lead) {
  return String(lead.id ?? lead._id ?? "");
}

function stageOf(lead: Lead) {
  const stage = String(lead.stage ?? lead.status ?? "new").toLowerCase();
  return STAGES.includes(stage as (typeof STAGES)[number]) ? stage : "new";
}

function titleOf(lead: Lead) {
  return lead.name ?? lead.title ?? lead.company ?? lead.phone ?? "Untitled lead";
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    company: "",
    phone: "",
    description: "",
  });

  const columns = useMemo(
    () => STAGES.map((stage) => ({ stage, leads: leads.filter((lead) => stageOf(lead) === stage) })),
    [leads],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiFetch<{ leads?: Lead[]; data?: Lead[] }>("/api/leads");
      setLeads(payload.leads ?? payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createLead() {
    const body = {
      name: draft.name.trim(),
      company: draft.company.trim(),
      phone: draft.phone.trim(),
      description: draft.description.trim(),
      stage: "new",
    };
    if (!body.name && !body.company && !body.phone) return;
    setSaving(true);
    try {
      const payload = await apiFetch<{ data?: Lead; item?: Lead }>("/api/leads", {
        method: "POST",
        json: body,
      });
      const created = payload.data ?? payload.item;
      if (created) setLeads((prev) => [created, ...prev]);
      else await load();
      setDraft({ name: "", company: "", phone: "", description: "" });
      toast.success("Lead saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lead save failed");
    } finally {
      setSaving(false);
    }
  }

  async function moveLead(lead: Lead, nextStage: string) {
    const id = leadId(lead);
    if (!id) return;
    const previous = leads;
    setLeads((current) =>
      current.map((item) => (leadId(item) === id ? { ...item, stage: nextStage, status: nextStage } : item)),
    );
    try {
      await apiFetch(`/api/leads/${id}`, {
        method: "PATCH",
        json: { stage: nextStage, status: nextStage },
      });
    } catch (err) {
      setLeads(previous);
      toast.error(err instanceof Error ? err.message : "Stage update failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leads</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Cunnekt-style lead board backed by `/api/leads`. Existing deal pipelines stay available.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/pipelines" />} size="sm" variant="secondary">
            Open pipelines
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input aria-label="Lead name" value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} />
          <Input aria-label="Company" value={draft.company} onChange={(event) => setDraft((prev) => ({ ...prev, company: event.target.value }))} />
          <Input aria-label="Phone" value={draft.phone} onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))} />
          <Textarea aria-label="Description" value={draft.description} onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))} className="min-h-10" />
          <Button onClick={createLead} disabled={saving}>
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
            Add lead
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Name</span>
          <span>Company</span>
          <span>Phone</span>
          <span>Description</span>
        </div>
      </section>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-border">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="font-medium text-foreground">No leads in the database</p>
          <p className="mt-1 text-sm text-muted-foreground">Add a lead above or keep using the existing Pipelines module for deals.</p>
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-5">
          {columns.map((column) => (
            <section key={column.stage} className="min-h-80 rounded-lg border border-border bg-muted/30 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold capitalize text-foreground">{column.stage}</h2>
                <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">{column.leads.length}</span>
              </div>
              <div className="space-y-2">
                {column.leads.map((lead) => {
                  const currentIndex = STAGES.indexOf(stageOf(lead) as (typeof STAGES)[number]);
                  const nextStage = STAGES[Math.min(currentIndex + 1, STAGES.length - 1)];
                  return (
                    <article key={leadId(lead)} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                      <h3 className="text-sm font-medium text-foreground">{titleOf(lead)}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{lead.company || lead.phone || lead.email || "Saved lead"}</p>
                      {lead.description ? <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{lead.description}</p> : null}
                      {nextStage !== column.stage ? (
                        <Button className="mt-3 w-full" size="sm" variant="outline" onClick={() => moveLead(lead, nextStage)}>
                          Move to {nextStage}
                          <ArrowRight className="ml-2 size-3.5" />
                        </Button>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
