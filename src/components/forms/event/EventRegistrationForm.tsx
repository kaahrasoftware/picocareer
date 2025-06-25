
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { PaginatedSelect } from '@/components/common/PaginatedSelect';

const eventRegistrationSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  country: z.string().min(1, 'Country is required'),
  student_or_professional: z.enum(['Student', 'Professional', 'Both']),
  'where did you hear about us': z.string().min(1, 'This field is required'),
  'current academic field/position': z.string().min(1, 'This field is required'),
  'current school/company': z.string().min(1, 'This field is required'),
  additional_info: z.string().optional(),
});

type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess, onCancel }: EventRegistrationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: user?.email || '',
      country: '',
      student_or_professional: 'Student',
      'where did you hear about us': '',
      'current academic field/position': '',
      'current school/company': '',
      additional_info: '',
    },
  });

  const studentOrProfessional = watch('student_or_professional');

  const handleAddNewSchool = async (schoolName: string): Promise<void> => {
    try {
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
          status: 'Pending'
        })
        .select('id, name')
        .single();

      if (error) throw error;

      // Set the new school name in the form
      setValue('current school/company', schoolName);
      
      toast({
        title: "School Added",
        description: `${schoolName} has been added and is pending approval.`,
      });
    } catch (error) {
      console.error('Error adding school:', error);
      toast({
        title: "Error",
        description: "Failed to add new school. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleAddNewMajor = async (majorName: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('majors')
        .insert({
          title: majorName,
          description: `Custom major: ${majorName}`,
          status: 'Pending'
        })
        .select('id, title')
        .single();

      if (error) throw error;

      // Set the new major name in the form
      setValue('current academic field/position', majorName);
      
      toast({
        title: "Major Added",
        description: `${majorName} has been added and is pending approval.`,
      });
    } catch (error) {
      console.error('Error adding major:', error);
      toast({
        title: "Error",
        description: "Failed to add new major. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const onSubmit = async (data: EventRegistrationFormData) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for events.",
        variant: "destructive",
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
        'current school/company': data['current school/company'],
        additional_info: data.additional_info || '',
      };

      const { error } = await supabase
        .from('event_registrations')
        .insert(registrationData);

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: "You have been registered for the event!",
      });

      onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering for the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500 mt-1">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                className={errors.last_name ? 'border-red-500' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500 mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              {...register('country')}
              className={errors.country ? 'border-red-500' : ''}
            />
            {errors.country && (
              <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Are you a student or professional? *</Label>
            <RadioGroup
              value={studentOrProfessional}
              onValueChange={(value) => setValue('student_or_professional', value as 'Student' | 'Professional' | 'Both')}
              className="flex flex-col space-y-2 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Professional" id="professional" />
                <Label htmlFor="professional">Professional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Both" id="both" />
                <Label htmlFor="both">Both</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Dynamic fields based on student/professional selection */}
          {(studentOrProfessional === 'Student' || studentOrProfessional === 'Both') && (
            <>
              <div>
                <Label>Current School *</Label>
                <PaginatedSelect
                  value={watch('current school/company') || ''}
                  onValueChange={(value) => setValue('current school/company', value)}
                  placeholder="Search for your school or add new..."
                  tableName="schools"
                  selectField="name"
                  searchField="name"
                  allowCustomValue={true}
                  onCustomValueSubmit={handleAddNewSchool}
                />
                {errors['current school/company'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['current school/company'].message}</p>
                )}
              </div>

              <div>
                <Label>Academic Field of Interest *</Label>
                <PaginatedSelect
                  value={watch('current academic field/position') || ''}
                  onValueChange={(value) => setValue('current academic field/position', value)}
                  placeholder="Search for your major or add new..."
                  tableName="majors"
                  selectField="title"
                  searchField="title"
                  allowCustomValue={true}
                  onCustomValueSubmit={handleAddNewMajor}
                />
                {errors['current academic field/position'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['current academic field/position'].message}</p>
                )}
              </div>
            </>
          )}

          {(studentOrProfessional === 'Professional' || studentOrProfessional === 'Both') && (
            <>
              <div>
                <Label htmlFor="current_company">Current Company *</Label>
                <Input
                  id="current_company"
                  {...register('current school/company')}
                  placeholder="Enter your current company"
                  className={errors['current school/company'] ? 'border-red-500' : ''}
                />
                {errors['current school/company'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['current school/company'].message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="current_position">Current Position *</Label>
                <Input
                  id="current_position"
                  {...register('current academic field/position')}
                  placeholder="Enter your current position"
                  className={errors['current academic field/position'] ? 'border-red-500' : ''}
                />
                {errors['current academic field/position'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['current academic field/position'].message}</p>
                )}
              </div>
            </>
          )}

          <div>
            <Label htmlFor="where_hear">Where did you hear about us? *</Label>
            <Select onValueChange={(value) => setValue('where did you hear about us', value)}>
              <SelectTrigger className={errors['where did you hear about us'] ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Google Search">Google Search</SelectItem>
                <SelectItem value="Friend/Colleague">Friend/Colleague</SelectItem>
                <SelectItem value="University">University</SelectItem>
                <SelectItem value="Professional Network">Professional Network</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors['where did you hear about us'] && (
              <p className="text-sm text-red-500 mt-1">{errors['where did you hear about us'].message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="additional_info">Additional Information (Optional)</Label>
            <Textarea
              id="additional_info"
              {...register('additional_info')}
              placeholder="Any additional information you'd like to share..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register for Event'}
        </Button>
      </div>
    </form>
  );
}
