
import { EmailCampaignForm } from "@/components/admin/EmailCampaignForm";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Navigate } from "react-router-dom";
import { CampaignList } from "@/components/admin/CampaignList";

export default function AdminEmailCampaigns() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  if (!profile) return null;
  if (profile.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 shadow-md">
            <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
    </div>
  );
}
