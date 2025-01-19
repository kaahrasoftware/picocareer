import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormField } from "./FormField";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database/database.types";

type HearAboutUs = Database["public"]["Enums"]["hear_about_us"];
type Country = Database["public"]["Enums"]["country"];

const COUNTRIES: Country[] = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad",
  "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea North", "Korea South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const HEAR_ABOUT_US_OPTIONS: HearAboutUs[] = [
  "Facebook", "Instagram", "LinkedIn", "Twitter", "TikTok", "YouTube",
  "Google Search", "Friend/Family", "School/University", "Event/Conference",
  "Email", "Other"
];

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
      country: "" as Country,
      hear_about_us: "" as HearAboutUs,
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
              onValueChange={(value: HearAboutUs) => form.setValue('hear_about_us', value)}
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