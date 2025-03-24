
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
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
  const [formError, setFormError] = useState<string | null>(null);
  const [submissionProgress, setSubmissionProgress] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(mentorRegistrationSchema),
    defaultValues: {
      background_check_consent: false,
      first_name: "",
      last_name: "",
      email: session?.user?.email || "",
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
    },
    mode: "onChange" // Enable validation as fields change
  });

  // Handle submission, delegating to the passed onSubmit function
  const handleSubmit = async (data: FormValues) => {
    console.log('Form submission initiated with data:', { 
      email: data.email,
      consented: data.background_check_consent 
    });
    
    setFormError(null);
    setSubmissionProgress("Preparing your submission...");
    
    if (!data.background_check_consent) {
      setFormError('You must consent to the background check to register as a mentor');
      return;
    }
    
    try {
      setSubmissionProgress("Validating form data...");
      // Additional client-side validation can be added here
      
      setSubmissionProgress("Uploading profile information...");
      await onSubmit(data);
      setSubmissionProgress(null);
    } catch (error: any) {
      console.error('Form submission error:', error);
      setSubmissionProgress(null);
      
      // Enhanced error handling with user-friendly messages
      if (error.code === 'PGRST301') {
        setFormError('You do not have permission to register. Please ensure you are logged in with a valid account.');
      } else if (error.code === '23505') {
        setFormError('An account with this email already exists. Please use a different email or log in to your existing account.');
      } else if (error.message?.includes('row-level security')) {
        setFormError('Authentication issue detected. Please try logging out and logging back in.');
      } else {
        setFormError(error.message || 'An unexpected error occurred. Please try again.');
      }
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

  // Check if form has any validation errors
  const formHasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {formError && (
          <Alert variant="destructive" className="mb-6 animate-in fade-in-50 slide-in-from-top-5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        {submissionProgress && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-800">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
              <AlertTitle>Registration in Progress</AlertTitle>
            </div>
            <AlertDescription>{submissionProgress}</AlertDescription>
          </Alert>
        )}
        
        {formHasErrors && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Form Contains Errors</AlertTitle>
            <AlertDescription>
              Please fix the highlighted fields before submitting.
            </AlertDescription>
          </Alert>
        )}
        
        <PersonalInfoSection control={form.control} fields={personalFields} />
        
        {/* Show password field only for new users who aren't logged in */}
        {!session && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <FormField
              control={form.control}
              name="password"
              label="Password"
              type="password"
              description="Create a secure password with at least 8 characters, including one lowercase letter, one uppercase letter, and one number."
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
            disabled={isSubmitting || !form.watch("background_check_consent") || formHasErrors}
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
