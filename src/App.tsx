import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppRoutes } from "@/AppRoutes";
import { SessionFeedbackDialog } from "@/components/profile/feedback/SessionFeedbackDialog";
import { useSessionFeedback } from "@/hooks/useSessionFeedback";

function App() {
  const { isOpen, sessionId, feedbackType, fromProfileId, toProfileId, closeFeedbackDialog } = useSessionFeedback();

  return (
    <Router>
      <AppRoutes />
      <Toaster />
      {sessionId && (
        <SessionFeedbackDialog
          sessionId={sessionId}
          isOpen={isOpen}
          onOpenChange={closeFeedbackDialog}
          feedbackType={feedbackType!}
          fromProfileId={fromProfileId!}
          toProfileId={toProfileId!}
        />
      )}
    </Router>
  );
}

export default App;