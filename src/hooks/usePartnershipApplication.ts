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
  
  // Step 4: Partnership Requirements (NEW)
  budget_range?: string;
  timeline_expectations?: string;
  current_technology?: string;
  success_metrics?: string;
  previous_partnerships?: string;
  pilot_program_interest?: string;
  
  // Step 5: Supporting Documents
  documents?: File[];
  
  // Step 6: Additional Info
  additional_info?: string;
}

export function usePartnershipApplication() {
  const [formData, setFormData] = useState<PartnershipFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationReference, setApplicationReference] = useState<string | null>(null);
  const { toast } = useToast();

  const updateFormData = (newData: Partial<PartnershipFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    // Auto-save to localStorage
    localStorage.setItem('partnership-form-data', JSON.stringify({ ...formData, ...newData }));
  };

  const loadSavedData = () => {
    const saved = localStorage.getItem('partnership-form-data');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  };

  const clearSavedData = () => {
    localStorage.removeItem('partnership-form-data');
  };

  const generateApplicationReference = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `PCP-${timestamp}-${random}`.toUpperCase();
  };

  const submitApplication = async (finalData: PartnershipFormData): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      const reference = generateApplicationReference();
      
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
        // Use dedicated columns for partnership requirements
        budget_range: finalData.budget_range || null,
        timeline_expectations: finalData.timeline_expectations || null,
        current_technology: finalData.current_technology || null,
        success_metrics: finalData.success_metrics || null,
        previous_partnerships: finalData.previous_partnerships || null,
        pilot_program_interest: finalData.pilot_program_interest || null,
        // Keep additional_info for any extra notes, but add reference
        additional_info: [
          finalData.additional_info || '',
          `Reference: ${reference}`
        ].filter(Boolean).join('\n\n'),
        status: 'pending'
      };

      const { error } = await supabase
        .from('partnerships')
        .insert([submissionData]);

      if (error) {
        throw error;
      }

      setApplicationReference(reference);
      clearSavedData();
      setFormData({});

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
    isSubmitting,
    applicationReference,
    loadSavedData,
    clearSavedData
  };
}
