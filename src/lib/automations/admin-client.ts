import { createAdminClient } from "@/lib/data/admin";
import type { DataClient } from "@/lib/data/types";

// Lazy, shared service-role client for automation engine work.
// Mirrors the pattern used by the webhook handler
// (src/app/api/whatsapp/webhook/route.ts).
let _adminClient: DataClient | null = null;

export function dataAdmin(): DataClient {
  if (!_adminClient) {
    _adminClient = createAdminClient();
  }
  return _adminClient;
}
