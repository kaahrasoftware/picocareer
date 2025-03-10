
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { mentorFormFields, mentorRegistrationSchema } from "./MentorFormFields";
import { Card } from "@/components/ui/card";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { ProfessionalSection } from "./sections/ProfessionalSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { SocialSection } from "./sections/SocialSection";
import type { FormValues } from "./types";
import { useAuthSession } from "@/hooks/useAuthSession";

interface MentorRegistrationFormProps {
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting: boolean;
  careers?: any[];
  companies?: any[];
  schools?: any[];
  majors?: any[];
}

export function MentorRegistrationForm({
  onSubmit,
  isSubmitting,
  careers = [],
  companies = [],
  schools = [],
  majors = [],
}: MentorRegistrationFormProps) {
  const { session } = useAuthSession();
  const form = useForm<FormValues>({
    resolver: zodResolver(mentorRegistrationSchema),
    defaultValues: {
      background_check_consent: false,
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      avatar_url: "",
      bio: "",
      years_of_experience: 0,
      position: "",
      company_id: "",
      school_id: "",
      academic_major_id: "",
      highest_degree: "",
      location: "",
      languages: "",
      skills: "",
      tools_used: "",
      keywords: "",
      fields_of_interest: "",
      linkedin_url: "",
      github_url: "",
      website_url: "",
      X_url: "",
      facebook_url: "",
      instagram_url: "",
      tiktok_url: "",
      youtube_url: ""
    }
  });

  // Handle submission, delegating to the passed onSubmit function
  const handleSubmit = async (data: FormValues) => {
    console.log('Form submission initiated with data:', { 
      email: data.email,
      consented: data.background_check_consent 
    });
    
    if (!data.background_check_consent) {
      console.error('Background check consent not provided');
      return;
    }
    
    try {
      await onSubmit(data);
      form.reset();
    } catch (error: any) {
      console.error('Form submission error:', error);
      // Error handling is now managed in the useMentorRegistration hook
    }
  };

  // Get the field groups from mentorFormFields
  const personalFields = mentorFormFields.filter(field => 
    ['first_name', 'last_name', 'email', 'avatar_url'].includes(field.name));
  const professionalFields = mentorFormFields.filter(field => 
    ['bio', 'years_of_experience', 'position', 'company_id', 'location', 'languages'].includes(field.name));
  const educationFields = mentorFormFields.filter(field => 
    ['school_id', 'academic_major_id', 'highest_degree'].includes(field.name));
  const skillsFields = mentorFormFields.filter(field => 
    ['skills', 'tools_used', 'keywords', 'fields_of_interest'].includes(field.name));
  const socialFields = mentorFormFields.filter(field => 
    ['linkedin_url', 'github_url', 'website_url', 'X_url', 'facebook_url', 'instagram_url', 'tiktok_url', 'youtube_url'].includes(field.name));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <PersonalInfoSection control={form.control} fields={personalFields} />
        
        {/* Show password field only for new users who aren't logged in */}
        {!session && (
          <Card className="p-6">
            <FormField
              control={form.control}
              name="password"
              label="Password"
              type="password"
              description="Password must contain at least one lowercase letter, one uppercase letter, and one number."
              required={true}
            />
          </Card>
        )}

        <ProfessionalSection 
          control={form.control} 
          fields={professionalFields}
          careers={careers}
          companies={companies}
        />
        <EducationSection 
          control={form.control} 
          fields={educationFields}
          schools={schools}
          majors={majors}
        />
        <SkillsSection control={form.control} fields={skillsFields} />
        <SocialSection control={form.control} fields={socialFields} />

        <Card className="p-6">
          <FormField
            control={form.control}
            name="background_check_consent"
            type="checkbox"
            label="I consent to a background check"
            description="By checking this box, you agree to allow us to conduct a background check using the information provided above."
          />
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg"
            className="w-full sm:w-auto min-w-[200px]" 
            disabled={isSubmitting || !form.watch("background_check_consent")}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Submitting...</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              "Register as Mentor"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
