
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { companyFormFields } from "./CompanyFormFields";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompanyUploadFormProps {
  onSuccess?: () => void;
}

export function CompanyUploadForm({ onSuccess }: CompanyUploadFormProps) {
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      const processedData = {
        ...data,
        status: 'Pending'
      };

      const { error } = await supabase
        .from('companies')
        .insert(processedData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company has been submitted for review.",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting company:', error);
      throw new Error(error.message || 'Failed to submit company');
    }
  };

  return (
    <GenericUploadForm
      fields={companyFormFields}
      onSubmit={handleSubmit}
      buttonText="Submit Company"
    />
  );
}
