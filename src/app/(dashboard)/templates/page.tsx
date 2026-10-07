import { ApiResourcePage } from "@/components/cunnekt/api-resource-page";

export default function TemplatesPage() {
  return (
    <ApiResourcePage
      title="Templates"
      description="WhatsApp template records from the backend. The full existing Meta sync and submit workflow remains available in Settings."
      endpoint="/api/templates"
      listKey="templates"
      fields={[
        { key: "name", label: "Template name" },
        { key: "language", label: "Language" },
        { key: "category", label: "Category" },
      ]}
      primaryAction={{ href: "/settings?tab=templates", label: "Manage templates" }}
      emptyTitle="No templates returned by the backend"
      emptyDescription="Sync or submit templates from Settings, or add a backend template record here."
    />
  );
}
