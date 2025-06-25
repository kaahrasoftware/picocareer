
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { COUNTRIES } from "@/constants/geography";

// Define the form schema
const eventRegistrationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  country: z.string().min(1, "Country is required"),
  student_or_professional: z.enum(["Student", "Professional", "Both"]),
  "where did you hear about us": z.string().min(1, "Please tell us how you heard about us"),
  "current academic field/position": z.string().min(1, "This field is required"),
  "current school/company": z.string().min(1, "This field is required"),
});

type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;

// Hardcoded options to avoid database dependency issues
const HEAR_ABOUT_OPTIONS = [
  "Social Media (Instagram, Facebook, etc.)",
  "LinkedIn",
  "Twitter/X",
  "YouTube",
  "Google Search",
  "Friend/Family Referral",
  "School/University",
  "Professional Network",
  "Email Newsletter",
  "Blog/Website",
  "Podcast",
  "Conference/Event",
  "Online Community/Forum",
  "Advertisement",
  "Other"
];

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventRegistrationForm({
  eventId,
  onSuccess,
  onCancel
}: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get current user profile
  const { data: profile } = useQuery({
    queryKey: ['current-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const form = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      country: "",
      student_or_professional: "Student",
      "where did you hear about us": "",
      "current academic field/position": "",
      "current school/company": "",
    },
  });

  const onSubmit = async (data: EventRegistrationFormData) => {
    setIsSubmitting(true);
    
    try {
      const registrationData = {
        event_id: eventId,
        profile_id: profile?.id || null,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        country: data.country as any, // Type assertion to handle strict country type
        student_or_professional: data.student_or_professional,
        "where did you hear about us": data["where did you hear about us"] as any, // Type assertion
        "current academic field/position": data["current academic field/position"],
        "current school/company": data["current school/company"],
      };

      const { error } = await supabase
        .from("event_registrations")
        .insert(registrationData);

      if (error) {
        console.error("Registration error:", error);
        toast({
          title: "Registration Failed",
          description: "There was an error submitting your registration. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registration Successful!",
        description: "Thank you for registering. You'll receive a confirmation email shortly.",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCountryChange = (value: string) => {
    form.setValue("country", value);
  };

  const handleStudentProfessionalChange = (value: string) => {
    form.setValue("student_or_professional", value as "Student" | "Professional" | "Both");
  };

  const handleHearAboutChange = (value: string) => {
    form.setValue("where did you hear about us", value);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Event Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...form.register("first_name")}
                placeholder="Enter your first name"
              />
              {form.formState.errors.first_name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...form.register("last_name")}
                placeholder="Enter your last name"
              />
              {form.formState.errors.last_name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter your email address"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select value={form.watch("country")} onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.country && (
              <p className="text-sm text-red-500">
                {form.formState.errors.country.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="student_or_professional">I am a *</Label>
            <Select 
              value={form.watch("student_or_professional")} 
              onValueChange={handleStudentProfessionalChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.student_or_professional && (
              <p className="text-sm text-red-500">
                {form.formState.errors.student_or_professional.message}
              </p>
            )}
          </div>

          {/* Academic/Professional Information - Now Text Fields */}
          <div className="space-y-2">
            <Label htmlFor="academic_field">Current Academic Field/Position *</Label>
            <Input
              id="academic_field"
              {...form.register("current academic field/position")}
              placeholder="e.g., Computer Science, Marketing Manager, Pre-Med Student"
            />
            {form.formState.errors["current academic field/position"] && (
              <p className="text-sm text-red-500">
                {form.formState.errors["current academic field/position"].message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="school_company">Current School/Company *</Label>
            <Input
              id="school_company"
              {...form.register("current school/company")}
              placeholder="e.g., Harvard University, Google Inc., Self-employed"
            />
            {form.formState.errors["current school/company"] && (
              <p className="text-sm text-red-500">
                {form.formState.errors["current school/company"].message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hear_about">Where did you hear about us? *</Label>
            <Select 
              value={form.watch("where did you hear about us")} 
              onValueChange={handleHearAboutChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select how you heard about us" />
              </SelectTrigger>
              <SelectContent>
                {HEAR_ABOUT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors["where did you hear about us"] && (
              <p className="text-sm text-red-500">
                {form.formState.errors["where did you hear about us"].message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register for Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
