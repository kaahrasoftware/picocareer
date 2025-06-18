
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
      // Convert array fields from strings to arrays
      const processedData = {
        ...data,
        notable_programs: Array.isArray(data.notable_programs) 
          ? data.notable_programs 
          : typeof data.notable_programs === 'string' 
            ? data.notable_programs.split(',').map((item: string) => item.trim()).filter(Boolean)
            : [],
        student_population: data.student_population ? parseInt(data.student_population) : null,
        acceptance_rate: data.acceptance_rate ? parseFloat(data.acceptance_rate) : null,
        status: 'Pending'
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
