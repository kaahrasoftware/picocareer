import { mentorRegistrationSchema } from "@/components/forms/mentor/MentorFormFields";
import { MentorRegistrationForm } from "@/components/forms/mentor/MentorRegistrationForm";
import { MentorRegistrationHeader } from "@/components/mentor/registration/MentorRegistrationHeader";
import { useMentorRegistration } from "@/components/mentor/registration/useMentorRegistration";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MentorRegistration() {
  const { isSubmitting, onSubmit, careers, companies, schools, majors } = useMentorRegistration();

  return (
    <BrowserRouter>
      <SidebarProvider>
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
      </SidebarProvider>
    </BrowserRouter>
  );
}