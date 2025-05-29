
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicInputField } from "@/components/forms/fields/BasicInputField";

interface ResourceFormProps {
  institutionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormFields {
  title: string;
  description: string;
  file_url: string;
}

export function ResourceForm({ 
  institutionId, 
  onSuccess,
  onCancel
}: ResourceFormProps) {
  const { toast } = useToast();

  const form = useForm<FormFields>({
    defaultValues: {
      title: "",
      description: "",
      file_url: ""
    }
  });

  const onSubmit = async (data: FormFields) => {
    try {
      // Since institution_resources table doesn't exist, show placeholder behavior
      console.log('Would create resource:', data);
      
      toast({
        title: "Feature Coming Soon",
        description: "Institution resources will be available in a future update.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error in resource form:', error);
      toast({
        title: "Error",
        description: "This feature is not yet implemented.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInputField
          field={form.register("title")}
          label="Resource Title"
          placeholder="Enter resource title"
          required
        />

        <BasicInputField
          field={form.register("description")}
          label="Description"
          placeholder="Enter resource description"
          required
        />

        <BasicInputField
          field={form.register("file_url")}
          label="File URL"
          placeholder="Enter file URL"
          required
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {form.formState.isSubmitting ? "Saving..." : "Save Resource"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
