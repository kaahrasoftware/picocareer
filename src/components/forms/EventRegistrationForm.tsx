import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormField } from "./FormField";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type HearAboutUs = Database["public"]["Enums"]["where did you hear about us"];
type Country = Database["public"]["Enums"]["country"];

// Get all countries from the database enum
const COUNTRIES: Country[] = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
  "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
  "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe"
];

// Get all options from the database enum
const HEAR_ABOUT_US_OPTIONS: HearAboutUs[] = [
  "Instagram",
  "Facebook",
  "TikTok",
  "LinkedIn",
  "X (Twitter)",
  "WhatsApp",
  "YouTube",
  "Search Engine (Google, Bing...)",
  "RedNote",
  "Friend/Family",
  "Other"
];

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  student_or_professional: z.string().min(1, "Please specify if you are a student or professional"),
  "current academic field/position": z.string().min(1, "Current academic field/position is required"),
  "current school/company": z.string().min(1, "Current school/company is required"),
  country: z.string().optional(),
  "where did you hear about us": z.string().optional(),
});

interface EventRegistrationFormProps {
  eventId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function EventRegistrationForm({ eventId, onSubmit, onCancel }: EventRegistrationFormProps) {
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      student_or_professional: "",
      "current academic field/position": "",
      "current school/company": "",
      country: "" as Country,
      "where did you hear about us": "" as HearAboutUs,
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
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <ScrollArea className="h-[400px] pr-4">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            type="email"
            required
          />
          <FormField
            control={form.control}
            name="student_or_professional"
            label="Are you a student or professional?"
            required
          />
          <FormField
            control={form.control}
            name="current academic field/position"
            label="Current Academic Field/Position"
            required
          />
          <FormField
            control={form.control}
            name="current school/company"
            label="Current School/Company"
            required
          />
          
          {/* Country Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select
              onValueChange={(value: Country) => form.setValue('country', value)}
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
              onValueChange={(value: HearAboutUs) => form.setValue('where did you hear about us', value)}
              value={form.watch('where did you hear about us')}
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
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </Form>
  );
}
