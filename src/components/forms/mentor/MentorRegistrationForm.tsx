import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { mentorFormFields, mentorRegistrationSchema } from "./MentorFormFields";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { ProfessionalSection } from "./sections/ProfessionalSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { SocialSection } from "./sections/SocialSection";
import type { FormValues } from "./types";

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
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(mentorRegistrationSchema),
    defaultValues: {
      background_check_consent: false,
      first_name: "",
      last_name: "",
      email: "",
      avatar_url: "",
      bio: "",
      years_of_experience: 0,
      position: "",
      company_id: "",
      school_id: "",
      academic_major_id: "",
      highest_degree: "",
      location: "",
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

  const handleSubmit = async (data: FormValues) => {
    try {
      console.log('Form data before submission:', data);
      await onSubmit(data);
      
      toast({
        title: "Application Received",
        description: "Thank you for applying to be a mentor! Our team will review your application and conduct a background check. We'll reach out to you soon.",
      });
      
      form.reset({
        background_check_consent: false,
        first_name: "",
        last_name: "",
        email: "",
        avatar_url: "",
        bio: "",
        years_of_experience: 0,
        position: "",
        company_id: "",
        school_id: "",
        academic_major_id: "",
        highest_degree: "",
        location: "",
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
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit mentor application. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Group fields by category
  const personalFields = mentorFormFields.filter(field => 
    ['first_name', 'last_name', 'email', 'avatar_url'].includes(field.name)
  );

  const professionalFields = mentorFormFields.filter(field => 
    ['position', 'company_id', 'years_of_experience', 'bio'].includes(field.name)
  );

  const educationFields = mentorFormFields.filter(field => 
    ['school_id', 'academic_major_id', 'highest_degree'].includes(field.name)
  );

  const skillsFields = mentorFormFields.filter(field => 
    ['skills', 'tools_used', 'keywords', 'fields_of_interest'].includes(field.name)
  );

  const socialFields = mentorFormFields.filter(field => 
    ['linkedin_url', 'github_url', 'website_url', 'X_url', 'facebook_url', 'instagram_url', 'tiktok_url', 'youtube_url'].includes(field.name)
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <PersonalInfoSection control={form.control} fields={personalFields} />
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