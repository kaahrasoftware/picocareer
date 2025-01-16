import { DashboardTab } from "@/components/profile/DashboardTab";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function Dashboard() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  
  if (!profile) {
    return null;
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