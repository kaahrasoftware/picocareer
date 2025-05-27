import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { FormField } from './FormField';
import { COUNTRIES } from '@/constants/geography';

// Define proper types for form data
const registrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  user_type: z.enum(['High School Student', 'College Student', 'Professional', 'Unemployed'], {
    required_error: 'Please select your current status'
  }),
  academic_major_id: z.string().optional(),
  position: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  where_did_you_hear_about_us: z.string().min(1, 'Please tell us how you heard about us')
}).refine((data) => {
  // Conditional validation: students need major, professionals/unemployed need position
  if (data.user_type === 'High School Student' || data.user_type === 'College Student') {
    return !!data.academic_major_id;
  }
  if (data.user_type === 'Professional' || data.user_type === 'Unemployed') {
    return !!data.position;
  }
  return true;
}, {
  message: "Please complete all required fields for your status",
  path: ["conditional_field"]
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const USER_TYPE_OPTIONS = [
  { id: 'High School Student', name: 'High School Student' },
  { id: 'College Student', name: 'College Student' },
  { id: 'Professional', name: 'Professional' },
  { id: 'Unemployed', name: 'Unemployed' }
];

const COUNTRY_OPTIONS = COUNTRIES.map(country => ({
  id: country,
  name: country
}));

const HEARD_ABOUT_US_OPTIONS = [
  // Social Media Platforms
  { id: 'Facebook', name: 'Facebook' },
  { id: 'Instagram', name: 'Instagram' },
  { id: 'Twitter/X', name: 'Twitter/X' },
  { id: 'LinkedIn', name: 'LinkedIn' },
  { id: 'TikTok', name: 'TikTok' },
  { id: 'YouTube', name: 'YouTube' },
  { id: 'Snapchat', name: 'Snapchat' },
  { id: 'Reddit', name: 'Reddit' },
  { id: 'Discord', name: 'Discord' },
  
  // Professional/Educational Channels
  { id: 'Friend/Colleague', name: 'Friend/Colleague' },
  { id: 'School/University', name: 'School/University' },
  { id: 'Career Fair', name: 'Career Fair' },
  { id: 'Professional Network/Association', name: 'Professional Network/Association' },
  { id: 'Alumni Network', name: 'Alumni Network' },
  
  // Digital Discovery
  { id: 'Google Search', name: 'Google Search' },
  { id: 'Other Search Engine', name: 'Other Search Engine' },
  { id: 'Email Newsletter', name: 'Email Newsletter' },
  { id: 'Blog/Article', name: 'Blog/Article' },
  { id: 'Podcast', name: 'Podcast' },
  { id: 'Online Advertisement', name: 'Online Advertisement' },
  
  // Direct Discovery
  { id: 'Website', name: 'Website' },
  { id: 'Mobile App', name: 'Mobile App' },
  { id: 'QR Code', name: 'QR Code' },
  
  // Other
  { id: 'Other', name: 'Other' }
];

export function EventRegistrationForm({ eventId, onSubmit, onCancel }: EventRegistrationFormProps) {
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema)
  });

  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = form;
  
  // Watch the user_type field to conditionally show fields
  const userType = watch('user_type');

  const onFormSubmit = async (data: RegistrationFormData) => {
    // Transform data to match the database schema
    const transformedData = {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      'current academic field/position': userType === 'High School Student' || userType === 'College Student' 
        ? data.academic_major_id 
        : data.position,
      student_or_professional: userType,
      'current school/company': '', // This field might need to be added later
      country: data.country,
      'where did you hear about us': data.where_did_you_hear_about_us
    };
    
    await onSubmit(transformedData);
  };

  // Helper function to get the conditional field label with clearer messaging
  const getConditionalFieldLabel = () => {
    switch (userType) {
      case 'High School Student':
        return 'Major you are interested in pursuing';
      case 'College Student':
        return 'Major you are currently pursuing';
      case 'Professional':
        return 'Your current career/profession';
      case 'Unemployed':
        return 'Career you are interested in';
      default:
        return '';
    }
  };

  // Helper function to get placeholder text for conditional fields
  const getConditionalFieldPlaceholder = () => {
    switch (userType) {
      case 'High School Student':
        return 'Select the major you want to study';
      case 'College Student':
        return 'Select your current major';
      case 'Professional':
        return 'Select your current career';
      case 'Unemployed':
        return 'Select the career you want to pursue';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register for Event</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
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
            </div>

            {/* Status Selection Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Current Status</h3>
              
              <FormField
                control={control}
                name="user_type"
                label="What is your current status?"
                type="select"
                options={USER_TYPE_OPTIONS}
                placeholder="Select your current status"
                required={true}
              />
            </div>

            {/* Conditional Academic/Career Section */}
            {userType && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {userType === 'High School Student' || userType === 'College Student' 
                    ? 'Academic Information' 
                    : 'Career Information'}
                </h3>
                
                {(userType === 'High School Student' || userType === 'College Student') && (
                  <FormField
                    control={control}
                    name="academic_major_id"
                    label={getConditionalFieldLabel()}
                    type="select"
                    placeholder={getConditionalFieldPlaceholder()}
                    required={true}
                  />
                )}

                {(userType === 'Professional' || userType === 'Unemployed') && (
                  <FormField
                    control={control}
                    name="position"
                    label={getConditionalFieldLabel()}
                    type="select"
                    placeholder={getConditionalFieldPlaceholder()}
                    required={true}
                  />
                )}
              </div>
            )}

            {/* Geographic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location</h3>
              
              <FormField
                control={control}
                name="country"
                label="Country"
                type="select"
                options={COUNTRY_OPTIONS}
                placeholder="Select your country"
                required={true}
              />
            </div>

            {/* Discovery Method Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">How did you find us?</h3>
              
              <FormField
                control={control}
                name="where_did_you_hear_about_us"
                label="Where did you hear about us?"
                type="select"
                options={HEARD_ABOUT_US_OPTIONS}
                placeholder="Select how you heard about us"
                required={true}
              />
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-6 border-t">
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
