
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  { value: 'Student', label: 'Student' },
  { value: 'Professional', label: 'Professional' }
];

const COUNTRY_OPTIONS = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Other', label: 'Other' }
];

const HEARD_ABOUT_US_OPTIONS = [
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Friend/Colleague', label: 'Friend/Colleague' },
  { value: 'Website', label: 'Website' },
  { value: 'Email Newsletter', label: 'Email Newsletter' },
  { value: 'Search Engine', label: 'Search Engine' },
  { value: 'Other', label: 'Other' }
];

export function EventRegistrationForm({ eventId, onSubmit, onCancel }: EventRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema)
  });

  const onFormSubmit = async (data: RegistrationFormData) => {
    await onSubmit({
      ...data,
      'current academic field/position': data.current_field,
      'current school/company': data.current_organization,
      'where did you hear about us': data.where_did_you_hear_about_us
    });
  };

  const formFields = [
    {
      name: 'email' as const,
      label: 'Email Address',
      type: 'text' as const,
      required: true,
      validation: { required: 'Email is required' }
    },
    {
      name: 'first_name' as const,
      label: 'First Name',
      type: 'text' as const,
      required: true,
      validation: { required: 'First name is required' }
    },
    {
      name: 'last_name' as const,
      label: 'Last Name',
      type: 'text' as const,
      required: true,
      validation: { required: 'Last name is required' }
    },
    {
      name: 'current_field' as const,
      label: 'Current Academic Field/Position',
      type: 'text' as const,
      required: true,
      validation: { required: 'Current academic field/position is required' }
    },
    {
      name: 'student_or_professional' as const,
      label: 'Are you a Student or Professional?',
      type: 'select' as const,
      required: true,
      options: STUDENT_OR_PROFESSIONAL_OPTIONS,
      validation: { required: 'Please select student or professional' }
    },
    {
      name: 'current_organization' as const,
      label: 'Current School/Company',
      type: 'text' as const,
      required: true,
      validation: { required: 'Current school/company is required' }
    },
    {
      name: 'country' as const,
      label: 'Country',
      type: 'select' as const,
      required: true,
      options: COUNTRY_OPTIONS,
      validation: { required: 'Country is required' }
    },
    {
      name: 'where_did_you_hear_about_us' as const,
      label: 'Where did you hear about us?',
      type: 'select' as const,
      required: true,
      options: HEARD_ABOUT_US_OPTIONS,
      validation: { required: 'Please tell us how you heard about us' }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register for Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {formFields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              register={register}
              errors={errors}
            />
          ))}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
