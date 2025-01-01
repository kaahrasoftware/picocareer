import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormField } from "./FormField";
import { FormFieldProps } from "./FormField";
import { useToast } from "@/hooks/use-toast";

interface GenericUploadFormProps {
  fields: (FormFieldProps & { defaultValue?: any })[];
  onSubmit: (data: any) => Promise<void>;
  buttonText?: string;
  isSubmitting?: boolean;
}

export function GenericUploadForm({ 
  fields, 
  onSubmit, 
  buttonText = "Submit",
  isSubmitting = false 
}: GenericUploadFormProps) {
  const { toast } = useToast();
  const defaultValues = fields.reduce((acc, field) => ({
    ...acc,
    [field.name]: field.defaultValue || ""
  }), {});

  const form = useForm({ defaultValues });

  const handleSubmit = async (data: any) => {
    try {
      console.log('Submitting form data:', data);
      await onSubmit(data);
      
      // Reset form after successful submission
      form.reset(defaultValues);
      
      toast({
        title: "Success",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            {...field}
          />
        ))}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : buttonText}
          </button>
        </div>
      </form>
    </Form>
  );
}