import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuthSession";
import { ProfileProvider } from "@/hooks/useProfileSession";

// Import pages
import { Home } from "@/pages/Home";
import { Profile } from "@/pages/Profile";
import { Calendar } from "@/pages/Calendar";
import { Settings } from "@/pages/Settings";

const queryClient = new QueryClient();

export function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}