import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
  const form = useForm({
    defaultValues: fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.defaultValue || (field.type === "array" ? [] : "")
    }), {})
  });

  const handleSubmit = async (data: any) => {
    try {
      console.log('Submitting form data:', data);
      await onSubmit(data);
      
      // Reset form after successful submission
      form.reset();
      
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
        {fields.map((field, index) => (
          <FormField
            key={index}
            control={form.control}
            {...field}
          />
        ))}
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : buttonText}
        </Button>
      </form>
    </Form>
  );
}