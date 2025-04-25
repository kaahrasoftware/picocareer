
import { useState } from "react";
import { EmailCampaignForm, EmailTemplateSettingsTab } from "@/components/admin/EmailCampaignForm";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Navigate } from "react-router-dom";
import { CampaignList } from "@/components/admin/CampaignList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminEmailCampaigns() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [activeTab, setActiveTab] = useState("campaigns");

  if (!profile) return null;
  if (profile.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="template-settings">Template Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8 shadow-md">
                <h1 className="text-2xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Email Campaign Planner
                </h1>
                <EmailCampaignForm
                  adminId={profile.id}
                  onCampaignCreated={() => {
                    // nothing additional, CampaignList reloads via effect on adminId prop change
                  }}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <CampaignList adminId={profile.id} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="template-settings">
          <EmailTemplateSettingsTab adminId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
