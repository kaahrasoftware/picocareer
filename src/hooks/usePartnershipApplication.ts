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
  
  // Step 4: Partnership Requirements
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
  const { toast } = useToast();

  const updateFormData = (newData: Partial<PartnershipFormData>) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    
    // Debug logging
    console.log('Form data updated:', {
      step: 'updateFormData',
      newData,
      fullData: updatedData
    });
    
    // Auto-save to localStorage
    localStorage.setItem('partnership-form-data', JSON.stringify(updatedData));
  };

  const loadSavedData = () => {
    const saved = localStorage.getItem('partnership-form-data');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData(parsedData);
        console.log('Loaded saved form data:', parsedData);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  };

  const clearSavedData = () => {
    localStorage.removeItem('partnership-form-data');
  };

  const submitApplication = async (finalData: PartnershipFormData): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // Debug logging - check what data we're preparing to submit
      console.log('Submitting partnership application:', {
        step: 'submitApplication',
        finalData
      });
      
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
        budget_range: finalData.budget_range || null,
        timeline_expectations: finalData.timeline_expectations || null,
        current_technology: finalData.current_technology || null,
        success_metrics: finalData.success_metrics || null,
        previous_partnerships: finalData.previous_partnerships || null,
        pilot_program_interest: finalData.pilot_program_interest || null,
        additional_info: finalData.additional_info || '',
        status: 'pending'
      };

      // Debug logging - check the exact data being sent to database
      console.log('Database submission data:', {
        step: 'databaseInsert',
        submissionData,
        partnershipRequirementsFields: {
          budget_range: submissionData.budget_range,
          timeline_expectations: submissionData.timeline_expectations,
          current_technology: submissionData.current_technology,
          success_metrics: submissionData.success_metrics,
          previous_partnerships: submissionData.previous_partnerships,
          pilot_program_interest: submissionData.pilot_program_interest
        }
      });

      const { data, error } = await supabase
        .from('partnerships')
        .insert([submissionData])
        .select();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Database insert successful:', data);

      clearSavedData();
      setFormData({});

      toast({
        title: "Application Submitted",
        description: "Your partnership application has been submitted successfully.",
      });

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
    loadSavedData,
    clearSavedData
  };
}
