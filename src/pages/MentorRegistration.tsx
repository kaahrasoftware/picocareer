import { mentorRegistrationSchema } from "@/components/forms/mentor/MentorFormFields";
import { MentorRegistrationForm } from "@/components/forms/mentor/MentorRegistrationForm";
import { MentorRegistrationHeader } from "@/components/mentor/registration/MentorRegistrationHeader";
import { useMentorRegistration } from "@/components/mentor/registration/useMentorRegistration";
import { MenuSidebar } from "@/components/MenuSidebar";

export default function MentorRegistration() {
  const { isSubmitting, onSubmit, careers, companies, schools, majors } = useMentorRegistration();

  return (
    <div className="min-h-screen bg-background">
      <MenuSidebar />
      <div className="container max-w-2xl py-10">
        <MentorRegistrationHeader />
        <MentorRegistrationForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          careers={careers}
          companies={companies}
          schools={schools}
          majors={majors}
        />
      </div>
    </div>
  );
}