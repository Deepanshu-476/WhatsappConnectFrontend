import { ApiResourcePage } from "@/components/cunnekt/api-resource-page";

export default function ActivitiesPage() {
  return (
    <ApiResourcePage
      title="Activities"
      description="Account-scoped tasks, follow-ups, reminders, and sales activity captured in the backend."
      endpoint="/api/activities"
      listKey="activities"
      fields={[
        { key: "title", label: "Title" },
        { key: "status", label: "Status" },
        { key: "due_date", label: "Due Date" },
        { key: "description", label: "Description", multiline: true },
      ]}
      emptyTitle="No activities in the database"
      emptyDescription="Create a task or reminder here; it will remain after refresh because it is saved through the backend API."
    />
  );
}
