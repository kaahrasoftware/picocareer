
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { PaginatedSelect } from '@/components/common/PaginatedSelect';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Enhanced schema with conditional validation
const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  country: z.string().min(1, 'Country is required'),
  student_or_professional: z.enum(['Student', 'Professional', 'Both']),
  'where did you hear about us': z.string().min(1, 'Please tell us where you heard about us'),
  'current academic field/position': z.string().min(1, 'This field is required'),
  'current school/company': z.string().optional(),
  additional_info: z.string().optional(),
}).refine((data) => {
  // Conditional validation for school/company field
  if (data.student_or_professional === 'Student' || data.student_or_professional === 'Both') {
    return data['current school/company'] && data['current school/company'].length > 0;
  }
  if (data.student_or_professional === 'Professional') {
    return data['current school/company'] && data['current school/company'].length > 0;
  }
  return true;
}, {
  message: 'This field is required',
  path: ['current school/company']
});

type FormData = z.infer<typeof formSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 'Italy',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium',
  'Portugal', 'Ireland', 'New Zealand', 'Japan', 'South Korea', 'Singapore', 'Other'
];

const hearAboutUsOptions = [
  'Instagram', 'LinkedIn', 'Twitter/X', 'Facebook', 'TikTok', 'YouTube', 'Google Search',
  'Friend/Family', 'School/University', 'Professional Network', 'Event/Conference',
  'Podcast', 'Blog/Article', 'Email Newsletter', 'Advertisement', 'Other'
];

export function EventRegistrationForm({ eventId, onSuccess, onCancel }: EventRegistrationFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      country: '',
      student_or_professional: 'Student',
      'where did you hear about us': '',
      'current academic field/position': '',
      'current school/company': '',
      additional_info: '',
    },
  });

  const watchedStudentType = form.watch('student_or_professional');

  // Clear conditional fields when user type changes
  React.useEffect(() => {
    form.setValue('current school/company', '');
    form.setValue('current academic field/position', '');
  }, [watchedStudentType, form]);

  // Mutation for adding new schools
  const addSchoolMutation = useMutation({
    mutationFn: async (schoolName: string) => {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          name: schoolName,
          type: 'Other',
          country: 'Unknown',
          state: 'Unknown',
          location: 'Unknown',
          website: '',
          acceptance_rate: 0,
          student_population: 0,
          status: 'Pending',
          author_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      form.setValue('current school/company', data.name);
      toast({
        title: 'School Added',
        description: 'Your school has been added and is pending approval.',
      });
    },
    onError: (error) => {
      console.error('Error adding school:', error);
      toast({
        title: 'Error',
        description: 'Failed to add school. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for adding new majors
  const addMajorMutation = useMutation({
    mutationFn: async (majorName: string) => {
      const { data, error } = await supabase
        .from('majors')
        .insert({
          title: majorName,
          description: `Major in ${majorName}`,
          status: 'Pending',
          author_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['majors'] });
      form.setValue('current academic field/position', data.title);
      toast({
        title: 'Major Added',
        description: 'Your academic field has been added and is pending approval.',
      });
    },
    onError: (error) => {
      console.error('Error adding major:', error);
      toast({
        title: 'Error',
        description: 'Failed to add academic field. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to register for events.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationData = {
        event_id: eventId,
        profile_id: user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        country: data.country,
        student_or_professional: data.student_or_professional,
        'where did you hear about us': data['where did you hear about us'],
        'current academic field/position': data['current academic field/position'],
        'current school/company': data['current school/company'] || '',
        additional_info: data.additional_info || '',
      };

      const { error } = await supabase
        .from('event_registrations')
        .insert(registrationData);

      if (error) throw error;

      toast({
        title: 'Registration Successful!',
        description: 'You have been registered for the event. Check your email for confirmation.',
      });

      onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'There was an error with your registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderConditionalFields = () => {
    const userType = watchedStudentType;

    if (userType === 'Student') {
      return (
        <>
          <FormField
            control={form.control}
            name="current school/company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current School *</FormLabel>
                <FormControl>
                  <PaginatedSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Search for your school or add new..."
                    tableName="schools"
                    selectField="name"
                    searchField="name"
                    allowCustomValue={true}
                    onCustomValueSubmit={(value) => addSchoolMutation.mutate(value)}
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
                <FormLabel>Academic Field of Interest *</FormLabel>
                <FormControl>
                  <PaginatedSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Search for your major or add new..."
                    tableName="majors"
                    selectField="title"
                    searchField="title"
                    allowCustomValue={true}
                    onCustomValueSubmit={(value) => addMajorMutation.mutate(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );
    }

    if (userType === 'Professional') {
      return (
        <>
          <FormField
            control={form.control}
            name="current school/company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Company *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your current company"
                    {...field}
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
                <FormLabel>Current Position *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your current job title/position"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );
    }

    if (userType === 'Both') {
      return (
        <>
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
                    placeholder="Search for your school/company or add new..."
                    tableName="schools"
                    selectField="name"
                    searchField="name"
                    allowCustomValue={true}
                    onCustomValueSubmit={(value) => addSchoolMutation.mutate(value)}
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
                <FormLabel>Academic Field/Position *</FormLabel>
                <FormControl>
                  <PaginatedSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Search for your field/position or add new..."
                    tableName="majors"
                    selectField="title"
                    searchField="title"
                    allowCustomValue={true}
                    onCustomValueSubmit={(value) => addMajorMutation.mutate(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );
    }

    return null;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Event Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
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
                  <FormLabel>I am a *</FormLabel>
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

            {/* Conditional Fields */}
            {renderConditionalFields()}

            <FormField
              control={form.control}
              name="where did you hear about us"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Where did you hear about us? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
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
              name="additional_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Any additional information you'd like to share (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
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
      </CardContent>
    </Card>
  );
}
