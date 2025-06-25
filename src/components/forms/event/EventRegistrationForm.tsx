
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { COUNTRIES } from '@/constants/geography';

// Use the exact enum values from the database
const HEAR_ABOUT_OPTIONS = [
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
  "Job Board",
  "Conference",
  "Webinar/Workshop",
  "Company Website",
  "Professional Network",
  "Advertisement",
  "Professor/Teacher",
  "University/School",
  "Mentorship Program",
  "Networking Event",
  "Newsletter",
  "Podcast",
  "Discord"
] as const;

const formSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().optional(),
  country: z.enum(COUNTRIES as any),
  student_or_professional: z.enum(['Student', 'Professional']),
  'current academic field/position': z.string().min(1, 'This field is required'),
  'where did you hear about us': z.enum(HEAR_ABOUT_OPTIONS),
  'anything you want to share with us': z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess }: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_number: '',
      country: undefined,
      student_or_professional: undefined,
      'current academic field/position': '',
      'where did you hear about us': undefined,
      'anything you want to share with us': '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Insert registration into database
      const { data: registration, error: registrationError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone_number || null,
          country: data.country,
          student_or_professional: data.student_or_professional,
          'current academic field/position': data['current academic field/position'],
          'where did you hear about us': data['where did you hear about us'],
          'anything you want to share with us': data['anything you want to share with us'] || null,
        })
        .select()
        .single();

      if (registrationError) {
        console.error('Registration error:', registrationError);
        throw new Error('Failed to register for event');
      }

      console.log('Registration successful:', registration);

      // Send confirmation email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-event-confirmation', {
          body: { registrationId: registration.id }
        });

        if (emailError) {
          console.error('Email sending error:', emailError);
          // Don't fail the whole process if email fails
          toast({
            title: "Registration Successful!",
            description: "You've been registered for the event. However, there was an issue sending the confirmation email. Please check your spam folder or contact support.",
            variant: "default",
          });
        } else {
          toast({
            title: "Registration Successful!",
            description: "You've been registered for the event. A confirmation email has been sent to your email address.",
            variant: "default",
          });
        }
      } catch (emailError) {
        console.error('Email function error:', emailError);
        toast({
          title: "Registration Successful!",
          description: "You've been registered for the event. However, there was an issue sending the confirmation email. Please check your spam folder or contact support.",
          variant: "default",
        });
      }

      // Reset form and call success callback
      form.reset();
      onSuccess?.();

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your phone number" {...field} />
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
              <FormLabel>Are you a student or professional? *</FormLabel>
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
          name="current academic field/position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Academic Field/Position *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Computer Science, Marketing Manager" {...field} />
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
              <FormLabel>Where did you hear about us? *</FormLabel>
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

        <FormField
          control={form.control}
          name="anything you want to share with us"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anything you want to share with us?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share any additional information or questions..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Registering...' : 'Register for Event'}
        </Button>
      </form>
    </Form>
  );
}
