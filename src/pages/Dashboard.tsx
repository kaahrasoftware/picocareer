import { DashboardTab } from "@/components/profile/DashboardTab";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <DashboardTab />
      </div>
    </QueryClientProvider>
  );
}