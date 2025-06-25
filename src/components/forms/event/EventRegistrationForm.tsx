
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaginatedSelect } from '@/components/common/PaginatedSelect';

// Form validation schema
const eventRegistrationSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  country: z.string().min(1, 'Country is required'),
  student_or_professional: z.enum(['Student', 'Professional', 'Both']),
  'where did you hear about us': z.string().min(1, 'This field is required'),
  'current academic field/position': z.string().min(1, 'Current academic field/position is required'),
  'current school/company': z.string().min(1, 'Current school/company is required'),
  additional_info: z.string().optional(),
});

type FormData = z.infer<typeof eventRegistrationSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess, onCancel }: EventRegistrationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      first_name: user?.user_metadata?.first_name || '',
      last_name: user?.user_metadata?.last_name || '',
      email: user?.email || '',
    }
  });

  const handleSchoolChange = (schoolId: string) => {
    setValue('current school/company', schoolId);
  };

  const handleMajorChange = (majorId: string) => {
    setValue('current academic field/position', majorId);
  };

  const handleCustomSchoolSubmit = async (schoolName: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([{ 
          name: schoolName, 
          status: 'Pending' as const,
          type: 'university' as const,
          country: 'United States' as const
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "School added successfully and is pending approval.",
      });

      setValue('current school/company', data.id);
    } catch (error) {
      console.error('Error adding school:', error);
      toast({
        title: "Error",
        description: "Failed to add school. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCustomMajorSubmit = async (majorTitle: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('majors')
        .insert([{ 
          title: majorTitle, 
          status: 'Pending' as const,
          description: `Custom major: ${majorTitle}`
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Major added successfully and is pending approval.",
      });

      setValue('current academic field/position', data.id);
    } catch (error) {
      console.error('Error adding major:', error);
      toast({
        title: "Error",
        description: "Failed to add major. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to register for events.",
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
        title: "Registration Successful!",
        description: "You have been registered for this event.",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering for this event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            {...register('first_name')}
            className={errors.first_name ? 'border-red-500' : ''}
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
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
            <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
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
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
          <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="student_or_professional">I am a *</Label>
        <Select onValueChange={(value) => setValue('student_or_professional', value as 'Student' | 'Professional' | 'Both')}>
          <SelectTrigger className={errors.student_or_professional ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select your status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Student">Student</SelectItem>
            <SelectItem value="Professional">Professional</SelectItem>
            <SelectItem value="Both">Both</SelectItem>
          </SelectContent>
        </Select>
        {errors.student_or_professional && (
          <p className="text-red-500 text-sm mt-1">{errors.student_or_professional.message}</p>
        )}
      </div>

      <div>
        <Label>Current School/Company *</Label>
        <PaginatedSelect
          value={watch('current school/company') || ''}
          onValueChange={handleSchoolChange}
          placeholder="Search and select your school/company"
          tableName="schools"
          selectField="name"
          searchField="name"
          allowCustomValue={true}
          onCustomValueSubmit={handleCustomSchoolSubmit}
        />
        {errors['current school/company'] && (
          <p className="text-red-500 text-sm mt-1">{errors['current school/company'].message}</p>
        )}
      </div>

      <div>
        <Label>Current Academic Field/Position *</Label>
        <PaginatedSelect
          value={watch('current academic field/position') || ''}
          onValueChange={handleMajorChange}
          placeholder="Search and select your academic field/position"
          tableName="majors"
          selectField="title"
          searchField="title"
          allowCustomValue={true}
          onCustomValueSubmit={handleCustomMajorSubmit}
        />
        {errors['current academic field/position'] && (
          <p className="text-red-500 text-sm mt-1">{errors['current academic field/position'].message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="where_hear">Where did you hear about us? *</Label>
        <Select onValueChange={(value) => setValue('where did you hear about us', value)}>
          <SelectTrigger className={errors['where did you hear about us'] ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select how you heard about us" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Social Media">Social Media</SelectItem>
            <SelectItem value="Website">Website</SelectItem>
            <SelectItem value="Friend Referral">Friend Referral</SelectItem>
            <SelectItem value="Search Engine">Search Engine</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors['where did you hear about us'] && (
          <p className="text-red-500 text-sm mt-1">{errors['where did you hear about us'].message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="additional_info">Additional Information</Label>
        <Textarea
          id="additional_info"
          {...register('additional_info')}
          placeholder="Any additional information you'd like to share..."
          rows={4}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Registering...' : 'Register for Event'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
