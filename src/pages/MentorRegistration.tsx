import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormField } from "@/components/forms/FormField";
import { useQuery } from "@tanstack/react-query";
import { mentorFormFields } from "@/components/forms/mentor/MentorFormFields";

const mentorRegistrationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  avatar_url: z.string().min(1, "Profile picture is required"),
  bio: z.string().min(50, "Bio should be at least 50 characters long"),
  years_of_experience: z.number().min(0, "Years of experience cannot be negative"),
  linkedin_url: z.string().url("Please enter a valid LinkedIn URL"),
  github_url: z.string().url("Please enter a valid GitHub URL").optional(),
  website_url: z.string().url("Please enter a valid website URL").optional(),
  skills: z.string(),
  tools_used: z.string(),
  keywords: z.string(),
  fields_of_interest: z.string(),
  highest_degree: z.enum([
    "No Degree",
    "High School",
    "Associate",
    "Bachelor",
    "Master",
    "MD",
    "PhD"
  ]),
  position: z.string().min(1, "Please select your current position"),
  company_id: z.string().min(1, "Please select your company"),
  school_id: z.string().min(1, "Please select your school"),
  academic_major_id: z.string().min(1, "Please select your major"),
  location: z.string().min(1, "Please enter your location"),
});

export default function MentorRegistration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(mentorRegistrationSchema),
  });

  // Fetch data queries
  const { data: careers } = useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('id, title')
        .eq('status', 'Approved');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'Approved');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'Approved');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .eq('status', 'Approved');
      
      if (error) throw error;
      return data;
    }
  });

  const onSubmit = async (data: z.infer<typeof mentorRegistrationSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to register as a mentor",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Update profile with mentor data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          avatar_url: data.avatar_url,
          bio: data.bio,
          years_of_experience: data.years_of_experience,
          linkedin_url: data.linkedin_url,
          github_url: data.github_url,
          website_url: data.website_url,
          skills: data.skills.split(',').map(s => s.trim()),
          tools_used: data.tools_used.split(',').map(s => s.trim()),
          keywords: data.keywords.split(',').map(s => s.trim()),
          fields_of_interest: data.fields_of_interest.split(',').map(s => s.trim()),
          highest_degree: data.highest_degree,
          position: data.position,
          company_id: data.company_id,
          school_id: data.school_id,
          academic_major_id: data.academic_major_id,
          location: data.location,
          user_type: 'mentor'
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Your mentor profile has been created successfully",
      });

      navigate("/profile");
    } catch (error) {
      console.error('Error registering mentor:', error);
      toast({
        title: "Error",
        description: "Failed to register as mentor. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Become a Mentor</h1>
        <p className="text-muted-foreground mt-2">
          Share your expertise and help others grow in their careers
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {mentorFormFields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              {...field}
            />
          ))}

          <Button type="submit" className="w-full">
            Register as Mentor
          </Button>
        </form>
      </Form>
    </div>
  );
}