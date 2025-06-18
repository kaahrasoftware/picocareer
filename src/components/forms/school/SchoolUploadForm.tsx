
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { schoolFormFields } from "./SchoolFormFields";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SchoolUploadFormProps {
  onSuccess?: () => void;
}

export function SchoolUploadForm({ onSuccess }: SchoolUploadFormProps) {
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      // Process array fields from strings to arrays
      const processedData = {
        ...data,
        programs_offered: Array.isArray(data.programs_offered) 
          ? data.programs_offered 
          : typeof data.programs_offered === 'string' 
            ? data.programs_offered.split(',').map((item: string) => item.trim()).filter(Boolean)
            : [],
        notable_programs: Array.isArray(data.notable_programs) 
          ? data.notable_programs 
          : typeof data.notable_programs === 'string' 
            ? data.notable_programs.split(',').map((item: string) => item.trim()).filter(Boolean)
            : [],
        
        // Convert numeric fields
        established_year: data.established_year ? parseInt(data.established_year) : null,
        student_population: data.student_population ? parseInt(data.student_population) : null,
        acceptance_rate: data.acceptance_rate ? parseFloat(data.acceptance_rate) : null,
        tuition_in_state: data.tuition_in_state ? parseInt(data.tuition_in_state) : null,
        tuition_out_of_state: data.tuition_out_of_state ? parseInt(data.tuition_out_of_state) : null,
        tuition_international: data.tuition_international ? parseInt(data.tuition_international) : null,
        room_and_board: data.room_and_board ? parseInt(data.room_and_board) : null,
        application_fee: data.application_fee ? parseInt(data.application_fee) : null,
        sat_range_low: data.sat_range_low ? parseInt(data.sat_range_low) : null,
        sat_range_high: data.sat_range_high ? parseInt(data.sat_range_high) : null,
        act_range_low: data.act_range_low ? parseInt(data.act_range_low) : null,
        act_range_high: data.act_range_high ? parseInt(data.act_range_high) : null,
        gpa_average: data.gpa_average ? parseFloat(data.gpa_average) : null,
        graduation_rate: data.graduation_rate ? parseFloat(data.graduation_rate) : null,
        employment_rate: data.employment_rate ? parseFloat(data.employment_rate) : null,
        average_salary_after_graduation: data.average_salary_after_graduation ? parseInt(data.average_salary_after_graduation) : null,
        featured_priority: data.featured_priority ? parseInt(data.featured_priority) : null,
        
        // Set default values
        status: 'Pending' as const,
        featured: data.featured || false
      };

      const { error } = await supabase
        .from('schools')
        .insert(processedData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "School has been submitted for review.",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting school:', error);
      throw new Error(error.message || 'Failed to submit school');
    }
  };

  return (
    <GenericUploadForm
      fields={schoolFormFields}
      onSubmit={handleSubmit}
      buttonText="Submit School"
    />
  );
}
