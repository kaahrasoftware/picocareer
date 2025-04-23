
import { EmailCampaignForm } from "@/components/admin/EmailCampaignForm";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Navigate } from "react-router-dom";
import { CampaignList } from "@/components/admin/CampaignList";
import { Loader2 } from "lucide-react";

export default function AdminEmailCampaigns() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  if (!profile) return null;
  if (profile.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h1 className="text-2xl font-bold mb-4">Email Campaign Planner</h1>
          <EmailCampaignForm
            adminId={profile.id}
            onCampaignCreated={() => {
              // nothing additional, CampaignList reloads via effect on adminId prop change
            }}
          />
        </div>
        <div className="md:col-span-2">
          <CampaignList adminId={profile.id} />
        </div>
      </div>
    </div>
  );
}
