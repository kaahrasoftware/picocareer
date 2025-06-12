
import { DashboardTab } from "@/components/profile/dashboard/tabs/DashboardTab";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function Dashboard() {
  const { session } = useAuthSession();
  const { data: profile, isLoading } = useUserProfile(session);

  // Always call hooks in the same order - no early returns
  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <p>No profile found</p>
        </div>
      </div>
    );
  }

  if (profile.user_type !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardTab />
    </div>
  );
}
