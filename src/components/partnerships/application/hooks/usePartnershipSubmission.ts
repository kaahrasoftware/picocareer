
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PartnershipApplicationFormData } from '../types';

export function usePartnershipSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitApplication = async (data: PartnershipApplicationFormData) => {
    setIsSubmitting(true);
    
    try {
      // Submit the application to the database
      const { data: application, error } = await supabase
        .from('partnership_applications')
        .insert({
          partner_type: data.partner_type,
          organization_name: data.organization_name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          contact_title: data.contact_title,
          organization_size: data.organization_size,
          location: data.location,
          website: data.website,
          established_year: data.established_year,
          focus_areas: data.focus_areas,
          current_programs: data.current_programs,
          accreditation_info: data.accreditation_info,
          partnership_goals: data.partnership_goals,
          collaboration_areas: data.collaboration_areas,
          expected_outcomes: data.expected_outcomes,
          student_population: data.student_population,
          target_audience: data.target_audience,
          supporting_documents: data.supporting_documents,
          terms_accepted: data.terms_accepted,
          terms_accepted_at: new Date().toISOString(),
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          current_step: 5,
          form_data: data,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Application Submitted Successfully!",
        description: `Your partnership application has been submitted. Application number: ${application.application_number}`,
      });

      // Redirect to partnerships page or show success message
      window.location.href = '/partnerships';
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitApplication, isSubmitting };
}
