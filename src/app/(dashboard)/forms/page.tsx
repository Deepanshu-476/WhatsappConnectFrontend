import { ApiResourcePage } from "@/components/cunnekt/api-resource-page";

export default function FormsPage() {
  return (
    <ApiResourcePage
      title="Forms"
      description="Lead capture and data collection forms persisted through the backend forms API."
      endpoint="/api/forms"
      listKey="forms"
      fields={[
        { key: "name", label: "Form name" },
        { key: "status", label: "Status" },
        { key: "description", label: "Description", multiline: true },
      ]}
      emptyTitle="No forms in the database"
      emptyDescription="Create a form record to start tracking form configuration from the backend."
    />
  );
}
