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
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  const handleSubmit = async (data: FormValues) => {
    try {
      // First check if user is logged in
      const { data: session } = await supabase.auth.getSession();
      const userEmail = data.email.toLowerCase();

      // Check profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_type, email')
        .eq('email', userEmail)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Check auth users table
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
        filters: {
          email: userEmail
        }
      });

      if (authError) {
        throw authError;
      }

      const existingAuthUser = users && users.length > 0 ? users[0] : null;

      // Handle different scenarios
      if (existingProfile) {
        // User exists in profiles
        if (existingProfile.user_type === 'mentor') {
          toast({
            title: "Already Registered",
            description: "You are already registered as a mentor. Your application is under review.",
            variant: "destructive",
          });
          return;
        }

        if (!session?.user) {
          toast({
            title: "Login Required",
            description: "Please login to your existing account to continue with mentor registration.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
      }

      if (existingAuthUser && !session?.user) {
        toast({
          title: "Login Required",
          description: "An account with this email already exists. Please login to continue.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // If we get here, either:
      // 1. User doesn't exist at all (new registration)
      // 2. User exists but is not a mentor (updating profile)
      await onSubmit(data);

      if (!existingProfile && !existingAuthUser) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your spam folder if you don't see it.",
        });
      } else {
        toast({
          title: "Application Received",
          description: "Thank you for applying to be a mentor! Our team will review your application.",
        });
      }

      form.reset();
    } catch (error: any) {
      console.error('Error in mentor registration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit mentor application. Please try again.",
        variant: "destructive",
      });
    }
  };

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