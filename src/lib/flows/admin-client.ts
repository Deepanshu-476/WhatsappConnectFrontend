import { createAdminClient } from "@/lib/data/admin";
import type { DataClient } from "@/lib/data/types";

// Lazy, shared service-role client for the Flows engine.
// Mirrors src/lib/automations/admin-client.ts — same shape so anyone
// reading either file picks up the convention immediately.
let _adminClient: DataClient | null = null;

export function dataAdmin(): DataClient {
  if (!_adminClient) {
    _adminClient = createAdminClient();
  }
  return _adminClient;
}
