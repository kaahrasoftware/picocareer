
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

// Extract the actual enum values from the database type
type CountryEnum = Database["public"]["Enums"]["country"];
type WhereDidYouHearAboutUsEnum = Database["public"]["Enums"]["where did you hear about us"];

// Convert the enum types to arrays for use in the Select components
const COUNTRIES: CountryEnum[] = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", 
  "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru", "India",
  "China", "Japan", "South Korea", "Singapore", "Malaysia", "Thailand",
  "Philippines", "Indonesia", "Vietnam", "South Africa", "Nigeria", "Kenya",
  "Egypt", "Morocco", "Israel", "Turkey", "Russia", "Poland", "Czech Republic",
  "Hungary", "Romania", "Bulgaria", "Greece", "Portugal", "Ireland", "Belgium",
  "Switzerland", "Austria", "Luxembourg", "New Zealand", "Albania", "Algeria",
  "Andorra", "Angola", "Antigua and Barbuda", "Armenia", "Azerbaijan", "Bahamas",
  "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brunei", "Burkina Faso",
  "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Central African Republic",
  "Chad", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Democratic Republic of Congo", "Djibouti", "Dominica", "Dominican Republic",
  "East Timor", "Ecuador", "El Salvador", "Equatorial Guinea", "Eritrea",
  "Estonia", "Eswatini", "Ethiopia", "Fiji", "Gabon", "Gambia", "Georgia",
  "Ghana", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Iceland", "Iran", "Iraq", "Ivory Coast", "Jamaica", "Jordan",
  "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Madagascar", "Malawi",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Nicaragua", "Niger", "North Korea",
  "North Macedonia", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea",
  "Paraguay", "Qatar", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "Sri Lanka", "Sudan", "Suriname",
  "Syria", "Tajikistan", "Tanzania", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Yemen",
  "Zambia", "Zimbabwe", "Other"
];

const HEAR_ABOUT_OPTIONS: WhereDidYouHearAboutUsEnum[] = [
  "Instagram", "Facebook", "TikTok", "LinkedIn", "X (Twitter)", "WhatsApp", 
  "YouTube", "Search Engine (Google, Bing...)", "RedNote", "Friend/Family", 
  "Other", "Career Fair", "University/School", "Professor/Teacher", 
  "Advertisement", "Blog/Article", "Podcast", "Email Newsletter", 
  "Professional Network", "Alumni Network", "Company Website", "Job Board", 
  "Webinar/Workshop", "Conference", "Discord"
];

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  country: z.enum(COUNTRIES, { required_error: "Please select your country" }),
  "current school/company": z.string().min(1, "Please enter your current school or company"),
  "current academic field/position": z.string().min(1, "Please enter your current academic field or position"),
  student_or_professional: z.enum(["Student", "Professional"], { 
    required_error: "Please select whether you are a student or professional" 
  }),
  "where did you hear about us": z.enum(HEAR_ABOUT_OPTIONS, { 
    required_error: "Please tell us how you heard about us" 
  }),
});

type FormData = z.infer<typeof formSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess, onClose }: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      country: undefined,
      "current school/company": "",
      "current academic field/position": "",
      student_or_professional: undefined,
      "where did you hear about us": undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          ...data,
        });

      if (error) throw error;

      toast.success("Registration successful! You should receive a confirmation email shortly.");
      form.reset();
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Failed to register for event. Please try again.");
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
                <Input type="email" placeholder="Enter your email address" {...field} />
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
                  {COUNTRIES.map((country) => (
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
          name="current school/company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current School/Company</FormLabel>
              <FormControl>
                <Input placeholder="Enter your current school or company" {...field} />
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
              <FormLabel>Current Academic Field/Position</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Computer Science, Marketing Manager, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="student_or_professional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Are you a student or professional?</FormLabel>
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

        <div className="flex gap-3 pt-4">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Registering..." : "Register for Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
