
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Database } from '@/integrations/supabase/types';

type DatabaseEnums = Database['public']['Enums'];

// Get countries and sort alphabetically
const COUNTRIES = Object.values({
  "Afghanistan": "Afghanistan",
  "Albania": "Albania", 
  "Algeria": "Algeria",
  "Andorra": "Andorra",
  "Angola": "Angola",
  "Antigua and Barbuda": "Antigua and Barbuda",
  "Argentina": "Argentina",
  "Armenia": "Armenia",
  "Australia": "Australia",
  "Austria": "Austria",
  "Azerbaijan": "Azerbaijan",
  "Bahamas": "Bahamas",
  "Bahrain": "Bahrain",
  "Bangladesh": "Bangladesh",
  "Barbados": "Barbados",
  "Belarus": "Belarus",
  "Belgium": "Belgium",
  "Belize": "Belize",
  "Benin": "Benin",
  "Bhutan": "Bhutan",
  "Bolivia": "Bolivia",
  "Bosnia and Herzegovina": "Bosnia and Herzegovina",
  "Botswana": "Botswana",
  "Brazil": "Brazil",
  "Brunei": "Brunei",
  "Bulgaria": "Bulgaria",
  "Burkina Faso": "Burkina Faso",
  "Burundi": "Burundi",
  "Cabo Verde": "Cabo Verde",
  "Cambodia": "Cambodia",
  "Cameroon": "Cameroon",
  "Canada": "Canada",
  "Central African Republic": "Central African Republic",
  "Chad": "Chad",
  "Chile": "Chile",
  "China": "China",
  "Colombia": "Colombia",
  "Comoros": "Comoros",
  "Congo": "Congo",
  "Costa Rica": "Costa Rica",
  "Croatia": "Croatia",
  "Cuba": "Cuba",
  "Cyprus": "Cyprus",
  "Czech Republic": "Czech Republic",
  "Denmark": "Denmark",
  "Djibouti": "Djibouti",
  "Dominica": "Dominica",
  "Dominican Republic": "Dominican Republic",
  "Ecuador": "Ecuador",
  "Egypt": "Egypt",
  "El Salvador": "El Salvador",
  "Equatorial Guinea": "Equatorial Guinea",
  "Eritrea": "Eritrea",
  "Estonia": "Estonia",
  "Eswatini": "Eswatini",
  "Ethiopia": "Ethiopia",
  "Fiji": "Fiji",
  "Finland": "Finland",
  "France": "France",
  "Gabon": "Gabon",
  "Gambia": "Gambia",
  "Georgia": "Georgia",
  "Germany": "Germany",
  "Ghana": "Ghana",
  "Greece": "Greece",
  "Grenada": "Grenada",
  "Guatemala": "Guatemala",
  "Guinea": "Guinea",
  "Guinea-Bissau": "Guinea-Bissau",
  "Guyana": "Guyana",
  "Haiti": "Haiti",
  "Honduras": "Honduras",
  "Hungary": "Hungary",
  "Iceland": "Iceland",
  "India": "India",
  "Indonesia": "Indonesia",
  "Iran": "Iran",
  "Iraq": "Iraq",
  "Ireland": "Ireland",
  "Israel": "Israel",
  "Italy": "Italy",
  "Jamaica": "Jamaica",
  "Japan": "Japan",
  "Jordan": "Jordan",
  "Kazakhstan": "Kazakhstan",
  "Kenya": "Kenya",
  "Kiribati": "Kiribati",
  "Kuwait": "Kuwait",
  "Kyrgyzstan": "Kyrgyzstan",
  "Laos": "Laos",
  "Latvia": "Latvia",
  "Lebanon": "Lebanon",
  "Lesotho": "Lesotho",
  "Liberia": "Liberia",
  "Libya": "Libya",
  "Liechtenstein": "Liechtenstein",
  "Lithuania": "Lithuania",
  "Luxembourg": "Luxembourg",
  "Madagascar": "Madagascar",
  "Malawi": "Malawi",
  "Malaysia": "Malaysia",
  "Maldives": "Maldives",
  "Mali": "Mali",
  "Malta": "Malta",
  "Marshall Islands": "Marshall Islands",
  "Mauritania": "Mauritania",
  "Mauritius": "Mauritius",
  "Mexico": "Mexico",
  "Micronesia": "Micronesia",
  "Moldova": "Moldova",
  "Monaco": "Monaco",
  "Mongolia": "Mongolia",
  "Montenegro": "Montenegro",
  "Morocco": "Morocco",
  "Mozambique": "Mozambique",
  "Myanmar": "Myanmar",
  "Namibia": "Namibia",
  "Nauru": "Nauru",
  "Nepal": "Nepal",
  "Netherlands": "Netherlands",
  "New Zealand": "New Zealand",
  "Nicaragua": "Nicaragua",
  "Niger": "Niger",
  "Nigeria": "Nigeria",
  "North Korea": "North Korea",
  "North Macedonia": "North Macedonia",
  "Norway": "Norway",
  "Oman": "Oman",
  "Pakistan": "Pakistan",
  "Palau": "Palau",
  "Palestine": "Palestine",
  "Panama": "Panama",
  "Papua New Guinea": "Papua New Guinea",
  "Paraguay": "Paraguay",
  "Peru": "Peru",
  "Philippines": "Philippines",
  "Poland": "Poland",
  "Portugal": "Portugal",
  "Qatar": "Qatar",
  "Romania": "Romania",
  "Russia": "Russia",
  "Rwanda": "Rwanda",
  "Saint Kitts and Nevis": "Saint Kitts and Nevis",
  "Saint Lucia": "Saint Lucia",
  "Saint Vincent and the Grenadines": "Saint Vincent and the Grenadines",
  "Samoa": "Samoa",
  "San Marino": "San Marino",
  "Sao Tome and Principe": "Sao Tome and Principe",
  "Saudi Arabia": "Saudi Arabia",
  "Senegal": "Senegal",
  "Serbia": "Serbia",
  "Seychelles": "Seychelles",
  "Sierra Leone": "Sierra Leone",
  "Singapore": "Singapore",
  "Slovakia": "Slovakia",
  "Slovenia": "Slovenia",
  "Solomon Islands": "Solomon Islands",
  "Somalia": "Somalia",
  "South Africa": "South Africa",
  "South Korea": "South Korea",
  "South Sudan": "South Sudan",
  "Spain": "Spain",
  "Sri Lanka": "Sri Lanka",
  "Sudan": "Sudan",
  "Suriname": "Suriname",
  "Sweden": "Sweden",
  "Switzerland": "Switzerland",
  "Syria": "Syria",
  "Taiwan": "Taiwan",
  "Tajikistan": "Tajikistan",
  "Tanzania": "Tanzania",
  "Thailand": "Thailand",
  "Timor-Leste": "Timor-Leste",
  "Togo": "Togo",
  "Tonga": "Tonga",
  "Trinidad and Tobago": "Trinidad and Tobago",
  "Tunisia": "Tunisia",
  "Turkey": "Turkey",
  "Turkmenistan": "Turkmenistan",
  "Tuvalu": "Tuvalu",
  "Uganda": "Uganda",
  "Ukraine": "Ukraine",
  "United Arab Emirates": "United Arab Emirates",
  "United Kingdom": "United Kingdom",
  "United States": "United States",
  "Uruguay": "Uruguay",
  "Uzbekistan": "Uzbekistan",
  "Vanuatu": "Vanuatu",
  "Vatican City": "Vatican City",
  "Venezuela": "Venezuela",
  "Vietnam": "Vietnam",
  "Yemen": "Yemen",
  "Zambia": "Zambia",
  "Zimbabwe": "Zimbabwe",
  "Democratic Republic of Congo": "Democratic Republic of Congo"
} as const).sort();

const HEAR_ABOUT_US_OPTIONS = [
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
  "Other",
  "Career Fair",
  "University/College",
  "Conference",
  "Workshop/Webinar",
  "Professional Association",
  "Newsletter",
  "Podcast",
  "Blog",
  "Company Website",
  "Job Board",
  "Mentor/Advisor",
  "Online Community",
  "Advertisement",
  "Discord"
] as const;

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  country: z.enum(COUNTRIES as [string, ...string[]]),
  student_or_professional: z.enum(['Student', 'Professional']),
  'current academic field/position': z.string().min(1, 'This field is required'),
  university_or_company: z.string().min(1, 'University or company is required'),
  'where did you hear about us': z.enum(HEAR_ABOUT_US_OPTIONS as [string, ...string[]])
});

type FormData = z.infer<typeof formSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess, isOpen, onClose }: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      country: undefined,
      student_or_professional: undefined,
      'current academic field/position': '',
      university_or_company: '',
      'where did you hear about us': undefined
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Insert registration into database
      const { data: registrationData, error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          country: data.country as DatabaseEnums['country'],
          student_or_professional: data.student_or_professional as DatabaseEnums['student_or_professional'],
          'current academic field/position': data['current academic field/position'],
          university_or_company: data.university_or_company,
          'where did you hear about us': data['where did you hear about us'] as DatabaseEnums['where did you hear about us']
        }])
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email
      let emailSent = false;
      try {
        const { error: emailError } = await supabase.functions.invoke('send-event-confirmation', {
          body: { registrationId: registrationData.id }
        });

        if (emailError) {
          console.error('Email sending failed:', emailError);
        } else {
          emailSent = true;
        }
      } catch (emailError) {
        console.error('Email function error:', emailError);
      }

      // Show success message
      if (emailSent) {
        toast({
          title: 'Registration Successful! 🎉',
          description: 'You have been registered for the event. A confirmation email has been sent to your inbox.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Registration Successful! 🎉',
          description: 'You have been registered for the event. Please note: confirmation email could not be sent.',
          variant: 'default'
        });
      }

      form.reset();
      onClose();
      onSuccess?.();

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register for the event. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Registration</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
              name="student_or_professional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Are you a student or professional?" />
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
              name="current academic field/position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Academic Field/Position</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Computer Science, Marketing Manager" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="university_or_company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University or Company</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name of your university or company" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="where did you hear about us"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Where did you hear about us?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HEAR_ABOUT_US_OPTIONS.map((option) => (
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
