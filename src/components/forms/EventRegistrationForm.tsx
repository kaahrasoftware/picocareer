
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "./FormField";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  student_or_professional: z.string().min(1, "Please select your status"),
  "current academic field/position": z.string().min(1, "This field is required"),
  "current school/company": z.string().optional(),
  country: z.string().min(1, "Please select your country"),
  "where did you hear about us": z.string().min(1, "Please select how you heard about us"),
});

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess }: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      student_or_professional: "",
      "current academic field/position": "",
      "current school/company": "",
      country: "",
      "where did you hear about us": "",
    },
  });

  // Fetch careers for the dropdown
  const { data: careers = [] } = useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch majors for the dropdown
  const { data: majors = [] } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch schools for the dropdown
  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch companies for the dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          ...values,
        });

      if (error) throw error;

      toast.success("Registration successful!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentOrProfessionalOptions = [
    { value: "High School Student", label: "High School Student" },
    { value: "College/University Student", label: "College/University Student" },
    { value: "Graduate Student", label: "Graduate Student" },
    { value: "Recent Graduate", label: "Recent Graduate" },
    { value: "Working Professional", label: "Working Professional" },
    { value: "Career Changer", label: "Career Changer" },
    { value: "Other", label: "Other" },
  ];

  const countryOptions = [
    { value: "United States", label: "United States" },
    { value: "Canada", label: "Canada" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Australia", label: "Australia" },
    { value: "Germany", label: "Germany" },
    { value: "France", label: "France" },
    { value: "Netherlands", label: "Netherlands" },
    { value: "Sweden", label: "Sweden" },
    { value: "Denmark", label: "Denmark" },
    { value: "Norway", label: "Norway" },
    { value: "Finland", label: "Finland" },
    { value: "Switzerland", label: "Switzerland" },
    { value: "Austria", label: "Austria" },
    { value: "Belgium", label: "Belgium" },
    { value: "Ireland", label: "Ireland" },
    { value: "New Zealand", label: "New Zealand" },
    { value: "Singapore", label: "Singapore" },
    { value: "Japan", label: "Japan" },
    { value: "South Korea", label: "South Korea" },
    { value: "Hong Kong", label: "Hong Kong" },
    { value: "Other", label: "Other" },
  ];

  const hearAboutUsOptions = [
    { value: "Social Media", label: "Social Media" },
    { value: "Search Engine", label: "Search Engine" },
    { value: "Friend/Colleague", label: "Friend/Colleague" },
    { value: "University/School", label: "University/School" },
    { value: "Professional Network", label: "Professional Network" },
    { value: "Email Newsletter", label: "Email Newsletter" },
    { value: "Advertisement", label: "Advertisement" },
    { value: "Other", label: "Other" },
  ];

  // Format data for FormField components
  const formattedCareers = careers.map(career => ({ value: career.id, label: career.title }));
  const formattedMajors = majors.map(major => ({ value: major.id, label: major.title }));
  const formattedSchools = schools.map(school => ({ value: school.id, label: school.name }));
  const formattedCompanies = companies.map(company => ({ value: company.id, label: company.name }));

  const watchStudentOrProfessional = form.watch("student_or_professional");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            required
          />
          
          <FormField
            control={form.control}
            name="last_name"
            label="Last Name"
            type="text"
            placeholder="Enter your last name"
            required
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email address"
          required
        />

        <FormField
          control={form.control}
          name="student_or_professional"
          label="Current Status"
          type="select"
          placeholder="Select your current status"
          options={studentOrProfessionalOptions}
          required
        />

        {(watchStudentOrProfessional?.includes("Student") || watchStudentOrProfessional === "Recent Graduate") && (
          <>
            <FormField
              control={form.control}
              name="current academic field/position"
              label="Academic Field/Major"
              type="select"
              placeholder="Select your academic field"
              options={formattedMajors}
              required
            />
            
            <FormField
              control={form.control}
              name="current school/company"
              label="Current School"
              type="select"
              placeholder="Select your school"
              options={formattedSchools}
            />
          </>
        )}

        {watchStudentOrProfessional === "Working Professional" && (
          <>
            <FormField
              control={form.control}
              name="current academic field/position"
              label="Current Position/Role"
              type="select"
              placeholder="Select your career field"
              options={formattedCareers}
              required
            />
            
            <FormField
              control={form.control}
              name="current school/company"
              label="Current Company"
              type="select"
              placeholder="Select your company"
              options={formattedCompanies}
            />
          </>
        )}

        {(watchStudentOrProfessional === "Career Changer" || watchStudentOrProfessional === "Other") && (
          <FormField
            control={form.control}
            name="current academic field/position"
            label="Current Field/Position"
            type="text"
            placeholder="Describe your current situation"
            required
          />
        )}

        <FormField
          control={form.control}
          name="country"
          label="Country"
          type="select"
          placeholder="Select your country"
          options={countryOptions}
          required
        />

        <FormField
          control={form.control}
          name="where did you hear about us"
          label="How did you hear about us?"
          type="select"
          placeholder="Select how you heard about us"
          options={hearAboutUsOptions}
          required
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Registering..." : "Register for Event"}
        </Button>
      </form>
    </Form>
  );
}
