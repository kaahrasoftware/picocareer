
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

// Extract the enum values from the database type
type WhereDidYouHearAboutUsEnum = Database['public']['Enums']['where did you hear about us'];

// Get the enum values as an array
const HEAR_ABOUT_OPTIONS: WhereDidYouHearAboutUsEnum[] = [
  'Social Media',
  'Friend/Family',
  'Search Engine',
  'Advertisement',
  'Word of Mouth',
  'Professional Network',
  'Email Newsletter',
  'Event/Conference',
  'Blog/Article',
  'Other'
];

const COUNTRY_OPTIONS = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 
  'Denmark', 'Brazil', 'Argentina', 'Mexico', 'India', 'China', 
  'Japan', 'South Korea', 'Singapore', 'Other'
];

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  currentSchoolCompany: z.string().optional(),
  currentAcademicFieldPosition: z.string().min(1, "Academic field/position is required"),
  studentOrProfessional: z.enum(["Student", "Professional"], {
    required_error: "Please select student or professional"
  }),
  country: z.enum(['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Brazil', 'Argentina', 'Mexico', 'India', 'China', 'Japan', 'South Korea', 'Singapore', 'Other'] as const).optional(),
  whereDidYouHearAboutUs: z.enum(['Social Media', 'Friend/Family', 'Search Engine', 'Advertisement', 'Word of Mouth', 'Professional Network', 'Email Newsletter', 'Event/Conference', 'Blog/Article', 'Other'] as const).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export function EventRegistrationForm({ eventId, onSuccess }: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return profile;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: userProfile?.first_name || '',
      lastName: userProfile?.last_name || '',
      email: userProfile?.email || '',
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
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
        status: 'registered'
      };

      const { error } = await supabase
        .from('event_registrations')
        .insert([registrationData]);

      if (error) throw error;

      toast.success("Registration successful! You'll receive a confirmation email shortly.");
      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Event Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentSchoolCompany">Current School/Company</Label>
            <Input
              id="currentSchoolCompany"
              {...register("currentSchoolCompany")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentAcademicFieldPosition">Current Academic Field/Position *</Label>
            <Input
              id="currentAcademicFieldPosition"
              {...register("currentAcademicFieldPosition")}
              className={errors.currentAcademicFieldPosition ? "border-red-500" : ""}
            />
            {errors.currentAcademicFieldPosition && (
              <p className="text-sm text-red-500">{errors.currentAcademicFieldPosition.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Student or Professional *</Label>
            <Select
              value={watchedValues.studentOrProfessional || ''}
              onValueChange={(value) => setValue("studentOrProfessional", value as "Student" | "Professional")}
            >
              <SelectTrigger className={errors.studentOrProfessional ? "border-red-500" : ""}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
              </SelectContent>
            </Select>
            {errors.studentOrProfessional && (
              <p className="text-sm text-red-500">{errors.studentOrProfessional.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              value={watchedValues.country || ''}
              onValueChange={(value) => setValue("country", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country..." />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>How did you hear about us?</Label>
            <Select
              value={watchedValues.whereDidYouHearAboutUs || ''}
              onValueChange={(value) => setValue("whereDidYouHearAboutUs", value as WhereDidYouHearAboutUsEnum)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {HEAR_ABOUT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register for Event'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
