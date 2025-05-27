
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { FormField } from './FormField';

// Define proper types for form data
const registrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  current_field: z.string().min(1, 'Current academic field/position is required'),
  student_or_professional: z.enum(['Student', 'Professional']),
  current_organization: z.string().min(1, 'Current school/company is required'),
  country: z.string().min(1, 'Country is required'),
  where_did_you_hear_about_us: z.string().min(1, 'Please tell us how you heard about us')
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const STUDENT_OR_PROFESSIONAL_OPTIONS = [
  { id: 'Student', name: 'Student' },
  { id: 'Professional', name: 'Professional' }
];

const COUNTRY_OPTIONS = [
  { id: 'United States', name: 'United States' },
  { id: 'Canada', name: 'Canada' },
  { id: 'United Kingdom', name: 'United Kingdom' },
  { id: 'Australia', name: 'Australia' },
  { id: 'Germany', name: 'Germany' },
  { id: 'France', name: 'France' },
  { id: 'Other', name: 'Other' }
];

const HEARD_ABOUT_US_OPTIONS = [
  { id: 'Social Media', name: 'Social Media' },
  { id: 'Friend/Colleague', name: 'Friend/Colleague' },
  { id: 'Website', name: 'Website' },
  { id: 'Email Newsletter', name: 'Email Newsletter' },
  { id: 'Search Engine', name: 'Search Engine' },
  { id: 'Other', name: 'Other' }
];

export function EventRegistrationForm({ eventId, onSubmit, onCancel }: EventRegistrationFormProps) {
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema)
  });

  const { control, handleSubmit, formState: { errors, isSubmitting } } = form;

  const onFormSubmit = async (data: RegistrationFormData) => {
    await onSubmit({
      ...data,
      'current academic field/position': data.current_field,
      'current school/company': data.current_organization,
      'where did you hear about us': data.where_did_you_hear_about_us
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register for Event</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="email"
              label="Email Address"
              type="text"
              placeholder="Enter your email address"
              required={true}
            />

            <FormField
              control={control}
              name="first_name"
              label="First Name"
              type="text"
              placeholder="Enter your first name"
              required={true}
            />

            <FormField
              control={control}
              name="last_name"
              label="Last Name"
              type="text"
              placeholder="Enter your last name"
              required={true}
            />

            <FormField
              control={control}
              name="current_field"
              label="Current Academic Field/Position"
              type="text"
              placeholder="Enter your current field or position"
              required={true}
            />

            <FormField
              control={control}
              name="student_or_professional"
              label="Are you a Student or Professional?"
              type="select"
              options={STUDENT_OR_PROFESSIONAL_OPTIONS}
              placeholder="Select student or professional"
              required={true}
            />

            <FormField
              control={control}
              name="current_organization"
              label="Current School/Company"
              type="text"
              placeholder="Enter your current school or company"
              required={true}
            />

            <FormField
              control={control}
              name="country"
              label="Country"
              type="select"
              options={COUNTRY_OPTIONS}
              placeholder="Select your country"
              required={true}
            />

            <FormField
              control={control}
              name="where_did_you_hear_about_us"
              label="Where did you hear about us?"
              type="select"
              options={HEARD_ABOUT_US_OPTIONS}
              placeholder="Select how you heard about us"
              required={true}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
