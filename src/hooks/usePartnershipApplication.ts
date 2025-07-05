
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface PartnershipFormData {
  // Entity Type Step
  entity_type?: string;
  entity_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Organization Details Step
  website?: string;
  geographic_location?: string;
  student_count?: number;
  description?: string;
  
  // Partnership Goals Step
  partnership_goals?: string;
  preferred_partnership_type?: string[];
  
  // Partnership Requirements Step
  budget_range?: string;
  timeline_expectations?: string;
  current_technology?: string;
  success_metrics?: string;
  previous_partnerships?: string;
  pilot_program_interest?: string;
  
  // Supporting Documents Step
  additional_info?: string;
}

export function usePartnershipApplication() {
  const [formData, setFormData] = useState<PartnershipFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updateFormData = (newData: Partial<PartnershipFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
    
    // Save to localStorage for persistence
    const updatedData = { ...formData, ...newData };
    localStorage.setItem('partnership-application-draft', JSON.stringify(updatedData));
  };

  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem('partnership-application-draft');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      }
    } catch (error) {
      console.error('Error loading saved partnership application data:', error);
    }
  };

  const submitApplication = async (finalData: PartnershipFormData) => {
    setIsSubmitting(true);
    
    try {
      // Here you would typically submit to your backend/Supabase
      // For now, we'll simulate a successful submission
      console.log('Submitting partnership application:', finalData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear saved draft
      localStorage.removeItem('partnership-application-draft');
      
      toast({
        title: "Application Submitted Successfully!",
        description: "We'll review your partnership application and get back to you within 3-5 business days.",
      });
      
      // Reset form data
      setFormData({});
      
    } catch (error) {
      console.error('Error submitting partnership application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateFormData,
    loadSavedData,
    submitApplication,
    isSubmitting,
  };
}
