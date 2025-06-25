
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Extract the enum values from the database type
type WhereDidYouHearAboutUs = Database["public"]["Enums"]["where did you hear about us"];

// Convert the enum type to an array of values for the select component
const HEAR_ABOUT_OPTIONS: WhereDidYouHearAboutUs[] = [
  "Social Media (Instagram, Facebook, Twitter)",
  "Search Engine (Google, Bing, Yahoo)",
  "Friend or Family Member",
  "Online Advertisement",
  "Email Newsletter",
  "Word of Mouth",
  "Professional Network (LinkedIn)",
  "Blog or Article",
  "Podcast",
  "YouTube",
  "University/School Counselor",
  "Career Fair",
  "Online Forum or Community",
  "Webinar or Online Event",
  "Print Advertisement (Newspaper, Magazine)",
  "Television or Radio",
  "Referral from Another Organization",
  "Mobile App Store",
  "Direct Mail",
  "Billboard or Outdoor Advertising",
  "Influencer or Celebrity Endorsement",
  "Partnership with Another Company",
  "Press Release or News Coverage",
  "Trade Show or Conference",
  "Cold Outreach (Phone, Email)",
  "Other"
];

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", 
  "Japan", "China", "India", "Brazil", "Mexico", "South Africa", "Nigeria", 
  "Kenya", "Egypt", "Other"
] as const;

const eventRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  currentSchoolCompany: z.string().optional(),
  currentAcademicFieldPosition: z.string().min(1, 'This field is required'),
  studentOrProfessional: z.enum(['Student', 'Professional'], {
    required_error: 'Please select whether you are a student or professional',
  }),
  country: z.enum(COUNTRIES, {
    required_error: 'Please select your country',
  }).optional(),
  whereDidYouHearAboutUs: z.enum([HEAR_ABOUT_OPTIONS[0], ...HEAR_ABOUT_OPTIONS.slice(1)], {
    required_error: 'Please select how you heard about us',
  }).optional(),
});

type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess, onCancel }: EventRegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      currentSchoolCompany: '',
      currentAcademicFieldPosition: '',
      studentOrProfessional: undefined,
      country: undefined,
      whereDidYouHearAboutUs: undefined,
    },
  });

  const onSubmit = async (data: EventRegistrationFormData) => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const registrationData = {
        event_id: eventId,
        profile_id: user?.id || null,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        'current school/company': data.currentSchoolCompany || '',
        'current academic field/position': data.currentAcademicFieldPosition,
        student_or_professional: data.studentOrProfessional,
        country: data.country || null,
        'where did you hear about us': data.whereDidYouHearAboutUs || null,
        status: 'registered',
      };

      const { error } = await supabase
        .from('event_registrations')
        .insert(registrationData);

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      toast({
        title: 'Registration Successful!',
        description: 'You have been successfully registered for this event.',
      });

      onSuccess();
    } catch (error) {
      console.error('Error during registration:', error);
      toast({
        title: 'Registration Failed',
        description: 'There was an error processing your registration. Please try again.',
        variant: 'destructive',
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
            name="firstName"
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
            name="lastName"
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
                <Input type="email" placeholder="Enter your email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentSchoolCompany"
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
          name="currentAcademicFieldPosition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Academic Field/Position *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Computer Science Student, Marketing Manager" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="studentOrProfessional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Are you a Student or Professional? *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select one" />
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
          name="whereDidYouHearAboutUs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How did you hear about us?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
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

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Registering...' : 'Register for Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
