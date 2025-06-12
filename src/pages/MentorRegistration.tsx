
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MentorRegistrationForm } from "@/components/forms/mentor/MentorRegistrationForm";
import { MentorRegistrationHeader } from "@/components/mentor/registration/MentorRegistrationHeader";
import { useMentorRegistration } from "@/hooks/useMentorRegistration";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function MentorRegistration() {
  const { isSubmitting, onSubmit, careers, companies, schools, majors } = useMentorRegistration();
  const { session, loading } = useAuthSession();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect unauthenticated users to auth page
  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth?tab=signin", {
        state: { 
          redirectUrl: location.pathname 
        },
        replace: true
      });
    }
  }, [session, loading, navigate, location]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="container max-w-2xl py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (user will be redirected)
  if (!session) {
    return null;
  }

  return (
    <div className="container max-w-2xl py-10">
      <MentorRegistrationHeader />

      {session?.user?.id && session.user.app_metadata?.user_type === 'mentor' ? (
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">You are already registered as a mentor</h2>
          <p className="text-muted-foreground">
            Your application is currently being processed. You can go to your profile to check the status.
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link to="/profile">Go to Profile</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <MentorRegistrationForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          careers={careers}
          companies={companies}
          schools={schools}
          majors={majors}
        />
      )}
    </div>
  );
}
