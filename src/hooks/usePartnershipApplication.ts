
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PartnershipFormData {
  // Step 1: Entity Type & Contact
  entity_type?: string;
  entity_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Step 2: Organization Details
  website?: string;
  geographic_location?: string;
  student_count?: number;
  description?: string;
  
  // Step 3: Partnership Goals
  partnership_goals?: string;
  preferred_partnership_type?: string[];
  
  // Step 4: Supporting Documents
  documents?: File[];
  
  // Step 5: Additional Info
  additional_info?: string;
}

export function usePartnershipApplication() {
  const [formData, setFormData] = useState<PartnershipFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updateFormData = (newData: Partial<PartnershipFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const submitApplication = async (finalData: PartnershipFormData) => {
    setIsSubmitting(true);
    
    try {
      const submissionData = {
        entity_type: finalData.entity_type || '',
        entity_name: finalData.entity_name || '',
        contact_name: finalData.contact_name || '',
        contact_email: finalData.contact_email || '',
        contact_phone: finalData.contact_phone || null,
        website: finalData.website || null,
        geographic_location: finalData.geographic_location || null,
        student_count: finalData.student_count || null,
        description: finalData.description || '',
        partnership_goals: finalData.partnership_goals || '',
        preferred_partnership_type: finalData.preferred_partnership_type || null,
        additional_info: finalData.additional_info || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('partnerships')
        .insert([submissionData])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Application Submitted Successfully!",
        description: "We'll review your application and get back to you within 3-5 business days.",
      });

      // Reset form
      setFormData({});
      
      return data;
    } catch (error) {
      console.error('Error submitting partnership application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateFormData,
    submitApplication,
    isSubmitting
  };
}
