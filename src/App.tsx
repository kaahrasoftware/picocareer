import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/hooks/useAuthSession";
import { ProfileProvider } from "@/hooks/useProfileSession";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Home } from "@/pages/Home";
import { Profile } from "@/pages/Profile";
import { Calendar } from "@/pages/Calendar";
import { Settings } from "@/pages/Settings";
import { SessionFeedbackDialog } from "@/components/profile/feedback/SessionFeedbackDialog";
import { useSessionFeedback } from "@/hooks/useSessionFeedback";
import { useAuthSession } from "@/hooks/useAuthSession";

const queryClient = new QueryClient();

function App() {
  const { session } = useAuthSession();
  const { isOpen, sessionId, feedbackType, fromProfileId, toProfileId, closeFeedbackDialog } = useSessionFeedback();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>

            {session && sessionId && feedbackType && fromProfileId && toProfileId && (
              <SessionFeedbackDialog
                isOpen={isOpen}
                onOpenChange={closeFeedbackDialog}
                sessionId={sessionId}
                feedbackType={feedbackType}
                fromProfileId={fromProfileId}
                toProfileId={toProfileId}
              />
            )}
          </ToastProvider>
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
