
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginatedSelect } from "@/components/common/PaginatedSelect";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/useAuthSession";

const eventRegistrationSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  country: z.string().min(1, "Please select your country"),
  student_or_professional: z.enum(["Student", "Professional", "Both"]),
  "where did you hear about us": z.string().min(1, "Please select how you heard about us"),
  "current academic field/position": z.string().min(1, "Please enter your current academic field or position"),
  "current school/company": z.string().min(1, "Please enter your current school or company"),
  additional_info: z.string().optional(),
});

type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess, onCancel }: EventRegistrationFormProps) {
  const { session } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: session?.user?.email || "",
      country: "",
      student_or_professional: "Student",
      "where did you hear about us": "",
      "current academic field/position": "",
      "current school/company": "",
      additional_info: "",
    },
  });

  const onSubmit = async (data: EventRegistrationFormData) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to register for events");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting event registration:", data);

      const registrationData = {
        event_id: eventId,
        profile_id: session.user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        country: data.country,
        student_or_professional: data.student_or_professional,
        'where did you hear about us': data["where did you hear about us"],
        'current academic field/position': data["current academic field/position"],
        'current school/company': data["current school/company"],
        additional_info: data.additional_info || "",
      };

      const { error } = await supabase
        .from('event_registrations')
        .insert(registrationData);

      if (error) {
        console.error("Registration error:", error);
        toast.error("Failed to register for event. Please try again.");
        return;
      }

      toast.success("Successfully registered for the event!");
      onSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple handlers for custom values - just set the form field directly
  const handleCustomSchool = (value: string) => {
    form.setValue("current school/company", value);
  };

  const handleCustomMajor = (value: string) => {
    form.setValue("current academic field/position", value);
  };

  const countries = [
    "United States", "Canada", "United Kingdom", "Australia", "Germany", 
    "France", "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark", 
    "Finland", "Switzerland", "Austria", "Belgium", "Ireland", "New Zealand", 
    "Japan", "South Korea", "Singapore", "Other"
  ];

  const hearAboutUsOptions = [
    "Social Media", "Google Search", "Friend/Colleague", "University", 
    "Email Newsletter", "Blog/Article", "Podcast", "YouTube", "LinkedIn", 
    "Twitter", "Instagram", "Facebook", "TikTok", "Discord", "Reddit", 
    "Conference/Event", "Advertisement", "Other"
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Event Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="student_or_professional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="where did you hear about us"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How did you hear about us?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select how you heard about us" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hearAboutUsOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Academic/Professional Information */}
            <FormField
              control={form.control}
              name="current academic field/position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Academic Field/Position</FormLabel>
                  <FormControl>
                    <PaginatedSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select your academic field or enter your position"
                      tableName="majors"
                      selectField="title"
                      searchField="title"
                      allowCustomValue={true}
                      onCustomValueSubmit={async (value: string) => {
                        handleCustomMajor(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current school/company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current School/Company</FormLabel>
                  <FormControl>
                    <PaginatedSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select your school or enter your company"
                      tableName="schools"
                      selectField="name"
                      searchField="name"
                      allowCustomValue={true}
                      onCustomValueSubmit={async (value: string) => {
                        handleCustomSchool(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additional_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information you'd like to share..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register for Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
