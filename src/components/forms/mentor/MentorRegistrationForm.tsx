
import { useForm, Controller } from "react-hook-form";
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
import { processFormDataForSubmission } from "./utils/formDataProcessing";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { FormValues } from "./types";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useFormDebug } from "@/hooks/mentor/useFormDebug";

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
      years_of_experience: "0",
      position: "",
      company_id: "",
      school_id: "",
      academic_major_id: "",
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
    mode: "onChange"
  });

  // Add form debugging
  useFormDebug(form);

  // Handle submission with form data processing
  const handleSubmit = async (data: FormValues) => {
    console.log('Form submission initiated with data:', { 
      email: data.email,
      consented: data.background_check_consent,
      formState: form.formState,
      errors: form.formState.errors
    });
    
    setFormError(null);
    setSubmissionProgress("Preparing your submission...");
    
    if (!data.background_check_consent) {
      setFormError('You must consent to the background check to register as a mentor');
      setSubmissionProgress(null);
      return;
    }
    
    try {
      setSubmissionProgress("Validating form data...");
      
      // Process form data to convert textarea fields to arrays
      const processedData = processFormDataForSubmission(data);
      
      setSubmissionProgress("Uploading profile information...");
      await onSubmit(processedData);
      
      // The referral processing will now happen automatically via the database trigger
      // when the profile is updated with the mentor user_type
      
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

  // Check if form has any validation errors
  const formHasErrors = Object.keys(form.formState.errors).length > 0;
  
  // Debug form state
  console.log('Form validation state:', {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    values: form.watch(),
    hasErrors: formHasErrors,
    backgroundConsent: form.watch("background_check_consent")
  });

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
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="mt-2">
                  <strong>Issues found in:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {Object.entries(form.formState.errors).map(([field, error]) => (
                      <li key={field} className="text-sm">
                        {field}: {error?.message || 'Invalid value'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <PersonalInfoSection control={form.control} />
        
        {/* Show password field only for new users who aren't logged in */}
        {!session && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <Controller
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormField
                  name="password"
                  field={field}
                  label="Password"
                  type="password"
                  description="Create a secure password with at least 8 characters, including one lowercase letter, one uppercase letter, and one number."
                  required={true}
                />
              )}
            />
          </Card>
        )}

        <ProfessionalSection 
          control={form.control}
          careers={careers}
          companies={companies}
        />
        <EducationSection 
          control={form.control}
          schools={schools}
          majors={majors}
        />
        <SkillsSection control={form.control} />
        <SocialSection control={form.control} />

        <Card className="p-6">
          <Controller
            control={form.control}
            name="background_check_consent"
            render={({ field }) => (
              <FormField
                name="background_check_consent"
                field={field}
                type="checkbox"
                label="I consent to a background check"
                description="By checking this box, you agree to allow us to conduct a background check using the information provided above."
              />
            )}
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
