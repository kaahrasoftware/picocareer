import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { mentorFormFields, mentorRegistrationSchema } from "@/components/forms/mentor/MentorFormFields";
import { Card } from "@/components/ui/card";

interface MentorRegistrationFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  careers?: any[];
  companies?: any[];
  schools?: any[];
  majors?: any[];
}

type FormValues = z.infer<typeof mentorRegistrationSchema>;

export function MentorRegistrationForm({
  onSubmit,
  isSubmitting,
  careers = [],
  companies = [],
  schools = [],
  majors = [],
}: MentorRegistrationFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(mentorRegistrationSchema),
    defaultValues: {
      background_check_consent: false
    }
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Group fields by category for better organization
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
    [
      'linkedin_url', 
      'github_url', 
      'website_url',
      'X_url',
      'facebook_url',
      'instagram_url',
      'tiktok_url',
      'youtube_url'
    ].includes(field.name)
  );

  const renderFieldGroup = (fields: typeof mentorFormFields, options: any[] = []) => {
    return fields.map((field) => {
      let fieldOptions = [];
      if (field.name === "position") fieldOptions = careers;
      else if (field.name === "company_id") fieldOptions = companies;
      else if (field.name === "school_id") fieldOptions = schools;
      else if (field.name === "academic_major_id") fieldOptions = majors;

      return (
        <FormField
          key={field.name}
          control={form.control}
          {...field}
          options={fieldOptions}
        />
      );
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {renderFieldGroup(personalFields)}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Professional Experience</h2>
          <div className="space-y-6">
            {renderFieldGroup(professionalFields)}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Education</h2>
          <div className="space-y-6">
            {renderFieldGroup(educationFields)}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Skills & Expertise</h2>
          <div className="space-y-6">
            {renderFieldGroup(skillsFields)}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Social Links</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {renderFieldGroup(socialFields)}
          </div>
        </Card>

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
            className="w-full sm:w-auto min-w-[200px]" 
            disabled={isSubmitting || !form.watch("background_check_consent")}
          >
            {isSubmitting ? "Submitting..." : "Register as Mentor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}