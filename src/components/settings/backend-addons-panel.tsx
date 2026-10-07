"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { SettingsPanelHead } from "./settings-panel-head";

type Addon = {
  title: string;
  endpoint: string;
  listKey?: string;
  summary?: (payload: unknown) => string;
};

const ADDONS: Addon[] = [
  { title: "Opt-outs", endpoint: "/api/opt-outs", listKey: "opt_outs" },
  { title: "Channels", endpoint: "/api/channels", listKey: "channels" },
  { title: "Integrations", endpoint: "/api/integrations", listKey: "integrations" },
  { title: "Billing", endpoint: "/api/billing", listKey: "invoices" },
  {
    title: "Wallet balance",
    endpoint: "/api/wallet/balance",
    summary: (payload) => {
      const data = payload && typeof payload === "object" ? (payload as { data?: { balance?: number } }).data : null;
      return `${data?.balance ?? 0}`;
    },
  },
  { title: "Wallet transactions", endpoint: "/api/wallet", listKey: "transactions" },
  { title: "Webhooks", endpoint: "/api/webhooks", listKey: "webhooks" },
  { title: "Assignments", endpoint: "/api/assignments", listKey: "assignments" },
  { title: "Deliverability", endpoint: "/api/deliverability", listKey: "events" },
  { title: "Lead scoring", endpoint: "/api/lead-scoring", listKey: "scores" },
];

type AddonState = {
  loading: boolean;
  error: string | null;
  value: string;
};

function countPayload(payload: unknown, listKey?: string) {
  if (!payload || typeof payload !== "object") return "0";
  const obj = payload as Record<string, unknown>;
  const value = (listKey ? obj[listKey] : undefined) ?? obj.data ?? obj.items;
  return Array.isArray(value) ? String(value.length) : "0";
}

export function BackendAddonsPanel() {
  const [states, setStates] = useState<Record<string, AddonState>>({});

  const load = useCallback(async () => {
    setStates(
      Object.fromEntries(
        ADDONS.map((addon) => [addon.endpoint, { loading: true, error: null, value: "0" }]),
      ),
    );
    await Promise.all(
      ADDONS.map(async (addon) => {
        try {
          const payload = await apiFetch<unknown>(addon.endpoint);
          setStates((prev) => ({
            ...prev,
            [addon.endpoint]: {
              loading: false,
              error: null,
              value: addon.summary ? addon.summary(payload) : countPayload(payload, addon.listKey),
            },
          }));
        } catch (err) {
          setStates((prev) => ({
            ...prev,
            [addon.endpoint]: {
              loading: false,
              error: err instanceof Error ? err.message : "Failed",
              value: "0",
            },
          }));
        }
      }),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <SettingsPanelHead
        title="Backend add-ons"
        description="Extra Cunnekt-style workspace modules wired to authenticated backend APIs."
      />
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ADDONS.map((addon) => {
          const state = states[addon.endpoint] ?? { loading: true, error: null, value: "0" };
          return (
            <article key={addon.endpoint} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{addon.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{addon.endpoint}</p>
                </div>
                {state.loading ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : state.error ? (
                  <AlertCircle className="size-4 text-destructive" />
                ) : (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {state.value}
                  </span>
                )}
              </div>
              {state.error ? <p className="mt-3 text-xs text-destructive">{state.error}</p> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
