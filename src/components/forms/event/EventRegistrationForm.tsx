
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { COUNTRIES } from '@/constants/geography';

// Define the form schema with conditional validation
const createFormSchema = (userType: string) => {
  const baseSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    country: z.enum(COUNTRIES as [string, ...string[]], {
      required_error: 'Please select a country',
    }),
    student_or_professional: z.enum(['Student', 'Professional', 'Both'], {
      required_error: 'Please select an option',
    }),
    'where did you hear about us': z.enum([
      'Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube',
      'Google Search', 'Bing Search', 'Yahoo Search', 'DuckDuckGo',
      'Friend/Family', 'Colleague', 'Professor/Teacher', 'Academic Advisor',
      'Career Counselor', 'Mentor', 'Alumni Network', 'Professional Network',
      'Conference/Event', 'Workshop/Seminar', 'Webinar', 'Podcast',
      'Blog/Article', 'Newsletter', 'Email Campaign', 'Discord'
    ], {
      required_error: 'Please let us know how you heard about us',
    }),
    additional_info: z.string().optional(),
  });

  // Add conditional fields based on user type
  if (userType === 'Student') {
    return baseSchema.extend({
      current_school: z.string().min(1, 'Current school is required'),
      academic_field_of_interest: z.string().min(1, 'Academic field of interest is required'),
    });
  } else if (userType === 'Professional') {
    return baseSchema.extend({
      current_company: z.string().min(1, 'Current company is required'),
      current_position: z.string().min(1, 'Current position is required'),
    });
  } else if (userType === 'Both') {
    return baseSchema.extend({
      current_school: z.string().optional(),
      current_company: z.string().optional(),
      academic_field_of_interest: z.string().optional(),
      current_position: z.string().optional(),
    });
  }

  return baseSchema;
};

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess, onCancel }: EventRegistrationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(createFormSchema('Student')), // Default schema
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      country: undefined,
      student_or_professional: undefined,
      'where did you hear about us': undefined,
      additional_info: '',
      current_school: '',
      current_company: '',
      academic_field_of_interest: '',
      current_position: '',
    },
  });

  // Watch the user type selection to update validation and clear fields
  const userType = form.watch('student_or_professional');

  // Update form schema when user type changes
  React.useEffect(() => {
    if (userType) {
      const newSchema = createFormSchema(userType);
      form.clearErrors();
      
      // Clear fields that are not relevant to the selected type
      if (userType === 'Student') {
        form.setValue('current_company', '');
        form.setValue('current_position', '');
      } else if (userType === 'Professional') {
        form.setValue('current_school', '');
        form.setValue('academic_field_of_interest', '');
      }
    }
  }, [userType, form]);

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to register for events.",
          variant: "destructive",
        });
        return;
      }

      // Prepare the registration data, mapping form fields to database columns
      const registrationData = {
        event_id: eventId,
        profile_id: user.id,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        country: values.country,
        student_or_professional: values.student_or_professional,
        'where did you hear about us': values['where did you hear about us'],
        additional_info: values.additional_info || null,
      };

      // Add conditional fields based on user type
      if (userType === 'Student') {
        Object.assign(registrationData, {
          'current school/company': values.current_school || '',
          'current academic field/position': values.academic_field_of_interest || '',
        });
      } else if (userType === 'Professional') {
        Object.assign(registrationData, {
          'current school/company': values.current_company || '',
          'current academic field/position': values.current_position || '',
        });
      } else if (userType === 'Both') {
        // For "Both", combine the information appropriately
        const schoolOrCompany = [values.current_school, values.current_company]
          .filter(Boolean)
          .join(' / ');
        const fieldOrPosition = [values.academic_field_of_interest, values.current_position]
          .filter(Boolean)
          .join(' / ');
        
        Object.assign(registrationData, {
          'current school/company': schoolOrCompany,
          'current academic field/position': fieldOrPosition,
        });
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert([registrationData]);

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: "You have been registered for the event!",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderConditionalFields = () => {
    if (!userType) return null;

    if (userType === 'Student') {
      return (
        <>
          <FormField
            control={form.control}
            name="current_school"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current School *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your current school or university" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="academic_field_of_interest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Field of Interest *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Computer Science, Business, Engineering" 
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

    if (userType === 'Professional') {
      return (
        <>
          <FormField
            control={form.control}
            name="current_company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Company *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your current company or organization" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="current_position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Position/Role *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Software Engineer, Marketing Manager" 
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
            name="current_school"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current School</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your current school (if applicable)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="current_company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Company</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your current company (if applicable)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="academic_field_of_interest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Field of Interest</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your field of study (if applicable)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="current_position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Position/Role</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your current job title (if applicable)" 
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

    return null;
  };

  return (
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
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email address" {...field} />
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
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
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Google Search">Google Search</SelectItem>
                  <SelectItem value="Bing Search">Bing Search</SelectItem>
                  <SelectItem value="Yahoo Search">Yahoo Search</SelectItem>
                  <SelectItem value="DuckDuckGo">DuckDuckGo</SelectItem>
                  <SelectItem value="Friend/Family">Friend/Family</SelectItem>
                  <SelectItem value="Colleague">Colleague</SelectItem>
                  <SelectItem value="Professor/Teacher">Professor/Teacher</SelectItem>
                  <SelectItem value="Academic Advisor">Academic Advisor</SelectItem>
                  <SelectItem value="Career Counselor">Career Counselor</SelectItem>
                  <SelectItem value="Mentor">Mentor</SelectItem>
                  <SelectItem value="Alumni Network">Alumni Network</SelectItem>
                  <SelectItem value="Professional Network">Professional Network</SelectItem>
                  <SelectItem value="Conference/Event">Conference/Event</SelectItem>
                  <SelectItem value="Workshop/Seminar">Workshop/Seminar</SelectItem>
                  <SelectItem value="Webinar">Webinar</SelectItem>
                  <SelectItem value="Podcast">Podcast</SelectItem>
                  <SelectItem value="Blog/Article">Blog/Article</SelectItem>
                  <SelectItem value="Newsletter">Newsletter</SelectItem>
                  <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                  <SelectItem value="Discord">Discord</SelectItem>
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
                <Textarea 
                  placeholder="Any additional information you'd like to share..."
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register for Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
