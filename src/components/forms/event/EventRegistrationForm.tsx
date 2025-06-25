
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginatedSelect } from "@/components/common/PaginatedSelect";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define hardcoded options based on common database enum values
const COUNTRY_OPTIONS = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", 
  "France", "Japan", "South Korea", "India", "China", "Brazil", "Mexico",
  "Netherlands", "Sweden", "Norway", "Denmark", "Switzerland", "Italy",
  "Spain", "Portugal", "Other"
];

const HEAR_ABOUT_OPTIONS = [
  "Social Media", "Google Search", "Friend/Family", "School/University", 
  "Professional Network", "Email", "Advertisement", "Event", "Other"
];

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
  "current school/company": z.string().optional(),
  "current academic field/position": z.string().min(1, "Academic field/position is required"),
  student_or_professional: z.enum(["Student", "Professional"]),
  "where did you hear about us": z.string().min(1, "Please tell us how you heard about us"),
});

type FormData = z.infer<typeof formSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess, onClose }: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      country: "",
      "current school/company": "",
      "current academic field/position": "",
      student_or_professional: "Student",
      "where did you hear about us": "",
    },
  });

  // Set loading to false after component mounts
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleCustomSchoolSubmit = async (schoolName: string) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({ school_name: schoolName, status: 'Pending' })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "School added successfully",
        description: `${schoolName} has been submitted for review.`,
      });

      return data.id;
    } catch (error) {
      console.error('Error adding school:', error);
      toast({
        title: "Error",
        description: "Failed to add school. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleCustomFieldSubmit = async (fieldName: string) => {
    try {
      const { data, error } = await supabase
        .from('majors')
        .insert({ 
          title: fieldName, 
          description: `Custom academic field: ${fieldName}`,
          status: 'Pending' 
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Academic field added successfully",
        description: `${fieldName} has been submitted for review.`,
      });

      return data.id;
    } catch (error) {
      console.error('Error adding academic field:', error);
      toast({
        title: "Error",
        description: "Failed to add academic field. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Validate enum values before submission
      const countryValue = COUNTRY_OPTIONS.includes(data.country) ? data.country : "Other";
      const hearAboutValue = HEAR_ABOUT_OPTIONS.includes(data["where did you hear about us"]) 
        ? data["where did you hear about us"] 
        : "Other";

      const registrationData = {
        event_id: eventId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        country: countryValue,
        "current school/company": data["current school/company"] || "",
        "current academic field/position": data["current academic field/position"],
        student_or_professional: data.student_or_professional,
        "where did you hear about us": hearAboutValue,
        status: "registered"
      };

      const { error } = await supabase
        .from('event_registrations')
        .insert(registrationData);

      if (error) throw error;

      toast({
        title: "Registration successful!",
        description: "You have been registered for the event.",
      });

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading form...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Event Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
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
                      <FormLabel>Last Name *</FormLabel>
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
                    <FormLabel>Email Address *</FormLabel>
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
                    <FormLabel>Country *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRY_OPTIONS.map((country) => (
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
            </div>

            {/* Academic/Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic/Professional Information</h3>
              
              <FormField
                control={form.control}
                name="student_or_professional"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
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
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        placeholder="Select or search for your school/company"
                        tableName="schools"
                        selectField="school_name"
                        searchField="school_name"
                        allowCustomValue={true}
                        onCustomValueSubmit={handleCustomSchoolSubmit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current academic field/position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Academic Field/Position *</FormLabel>
                    <FormControl>
                      <PaginatedSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select or search for your field/position"
                        tableName="majors"
                        selectField="title"
                        searchField="title"
                        allowCustomValue={true}
                        onCustomValueSubmit={handleCustomFieldSubmit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Marketing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">How did you hear about us?</h3>
              
              <FormField
                control={form.control}
                name="where did you hear about us"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select how you heard about this event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HEAR_ABOUT_OPTIONS.map((option) => (
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
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register for Event
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
