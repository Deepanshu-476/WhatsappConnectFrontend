import { CampaignSettingsLayout } from "@/components/campaign-settings/campaign-settings-layout";

export const metadata = {
  title: "Campaign Settings - WhatsApp CRM",
  description: "Configure campaign lifecycle policies, rate limits, quiet hours, and sending settings.",
};

export default function CampaignSettingsPage() {
  return <CampaignSettingsLayout />;
}
