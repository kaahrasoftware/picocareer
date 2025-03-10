
import { MentorRegistrationForm } from "@/components/forms/mentor/MentorRegistrationForm";
import { MentorRegistrationHeader } from "@/components/mentor/registration/MentorRegistrationHeader";
import { useMentorRegistration } from "@/hooks/useMentorRegistration";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function MentorRegistration() {
  const { isSubmitting, onSubmit, careers, companies, schools, majors } = useMentorRegistration();
  const { session } = useAuthSession();

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
