
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginatedSelect } from "@/components/common/PaginatedSelect";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Define the form schema
const eventRegistrationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  country: z.string().min(1, "Country is required"),
  student_or_professional: z.enum(["Student", "Professional", "Both"]),
  "where did you hear about us": z.string().min(1, "Please tell us how you heard about us"),
  "current academic field/position": z.string().min(1, "Current field/position is required"),
  "current school/company": z.string().min(1, "Current school/company is required"),
  additional_info: z.string().optional(),
});

type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Fetch countries from database enum
const fetchCountries = async () => {
  const { data, error } = await supabase
    .rpc('get_enum_values', { enum_name: 'country' })
    .then(async (result) => {
      if (result.error) {
        // Fallback to hardcoded list if RPC fails
        return {
          data: [
            "United States", "Canada", "United Kingdom", "Australia", "Germany", 
            "France", "Spain", "Italy", "Netherlands", "Sweden", "Norway", 
            "Denmark", "Finland", "Switzerland", "Belgium", "Austria", "Poland",
            "Czech Republic", "Portugal", "Ireland", "New Zealand", "Japan",
            "South Korea", "Singapore", "India", "Brazil", "Mexico", "Argentina",
            "Chile", "Colombia", "Peru", "South Africa", "Nigeria", "Egypt",
            "Morocco", "Israel", "United Arab Emirates", "Saudi Arabia", "Turkey",
            "Russia", "Ukraine", "China", "Thailand", "Vietnam", "Philippines",
            "Indonesia", "Malaysia", "Other"
          ],
          error: null
        };
      }
      return result;
    });
  
  if (error) throw error;
  return data || [];
};

// Fetch "where did you hear about us" options from database enum
const fetchHearAboutUsOptions = async () => {
  const { data, error } = await supabase
    .rpc('get_enum_values', { enum_name: 'where did you hear about us' })
    .then(async (result) => {
      if (result.error) {
        // Fallback to hardcoded list if RPC fails
        return {
          data: [
            "Instagram", "Facebook", "X (Twitter)", "LinkedIn", "TikTok", "YouTube",
            "Snapchat", "Search Engine (Google, Bing...)", "Friend/Family", 
            "Colleague/Professional Network", "University/School", "Workshop/Event",
            "Newsletter/Email", "Podcast", "Blog/Article", "Advertisement",
            "Community Forum", "Other"
          ],
          error: null
        };
      }
      return result;
    });
  
  if (error) throw error;
  return data || [];
};

export function EventRegistrationForm({ eventId, onSuccess, onCancel }: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch enum options
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  });

  const { data: hearAboutUsOptions = [] } = useQuery({
    queryKey: ['hear-about-us-options'],
    queryFn: fetchHearAboutUsOptions,
  });

  const form = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: user?.email || "",
      country: "",
      student_or_professional: "Student",
      "where did you hear about us": "",
      "current academic field/position": "",
      "current school/company": "",
      additional_info: "",
    },
  });

  const handleCustomSchoolSubmit = async (value: string) => {
    form.setValue("current school/company", value);
  };

  const handleCustomFieldSubmit = async (value: string) => {
    form.setValue("current academic field/position", value);
  };

  const onSubmit = async (data: EventRegistrationFormData) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to register for events.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure the country value matches the database enum exactly
      const countryValue = countries.includes(data.country) ? data.country : "Other";
      
      // Ensure the "hear about us" value matches the database enum exactly
      const hearAboutUsValue = hearAboutUsOptions.includes(data["where did you hear about us"]) 
        ? data["where did you hear about us"] 
        : "Other";

      const registrationData = {
        event_id: eventId,
        profile_id: user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        country: countryValue as any, // Type assertion to handle enum casting
        student_or_professional: data.student_or_professional,
        "where did you hear about us": hearAboutUsValue as any, // Type assertion to handle enum casting
        "current academic field/position": data["current academic field/position"],
        "current school/company": data["current school/company"],
        additional_info: data.additional_info || "",
      };

      const { error } = await supabase
        .from("event_registrations")
        .insert(registrationData);

      if (error) {
        console.error("Registration error:", error);
        toast({
          title: "Registration Failed",
          description: `Failed to register for event: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registration Successful",
        description: "You have been successfully registered for the event!",
      });

      onSuccess();
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormLabel>Email *</FormLabel>
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
              <Select onValueChange={field.onChange} value={field.value}>
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
              <FormLabel>Are you currently a student or professional? *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
              <FormLabel>Where did you hear about us? *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
                  placeholder="Select or enter your field/position"
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

        <FormField
          control={form.control}
          name="current school/company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current School/Company *</FormLabel>
              <FormControl>
                <PaginatedSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select or enter your school/company"
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

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register for Event"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
