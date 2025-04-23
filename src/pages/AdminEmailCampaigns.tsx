
import { EmailCampaignForm } from "@/components/admin/EmailCampaignForm";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Navigate } from "react-router-dom";

/**
 * AdminEmailCampaigns page for admins to plan and schedule spotlight emails.
 */
export default function AdminEmailCampaigns() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  if (!profile) return null;
  if (profile.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Email Campaign Planner</h1>
      <EmailCampaignForm adminId={profile.id} />
    </div>
  );
}
