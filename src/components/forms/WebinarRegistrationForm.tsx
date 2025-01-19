import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the enums based on the database schema
const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "South Africa",
  "Other"
] as const;

const HEAR_ABOUT_US_OPTIONS = [
  "Google Search",
  "Social Media",
  "Friend Referral",
  "School/University",
  "Professional Network",
  "Email Newsletter",
  "Online Advertisement",
  "Blog/Article",
  "Conference/Event",
  "Other"
] as const;

interface WebinarRegistrationFormProps {
  webinarId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function WebinarRegistrationForm({ webinarId, onSubmit, onCancel }: WebinarRegistrationFormProps) {
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      current_field: "",
      student_or_professional: "",
      current_organization: "",
      country: "",
      hear_about_us: "",
    }
  });

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register for webinar",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <ScrollArea className="h-[400px] pr-4">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-w-md mx-auto [&_input]:w-full [&_input:hover]:w-full [&_input:focus]:w-full">
          <FormField
            control={form.control}
            name="first_name"
            label="First Name"
            required
          />
          <FormField
            control={form.control}
            name="last_name"
            label="Last Name"
            required
          />
          <FormField
            control={form.control}
            name="email"
            label="Email"
            type="text"
            required
          />
          <FormField
            control={form.control}
            name="current_field"
            label="Current Academic Field/Position"
            type="text"
          />
          <FormField
            control={form.control}
            name="student_or_professional"
            label="Are you a student or professional?"
            type="text"
          />
          <FormField
            control={form.control}
            name="current_organization"
            label="Current School/Company"
            type="text"
          />
          
          {/* Country Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select
              onValueChange={(value) => form.setValue('country', value)}
              value={form.watch('country')}
            >
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
          </div>

          {/* How did you hear about us Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">How did you hear about us?</label>
            <Select
              onValueChange={(value) => form.setValue('hear_about_us', value)}
              value={form.watch('hear_about_us')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {HEAR_ABOUT_US_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </Form>
  );
}