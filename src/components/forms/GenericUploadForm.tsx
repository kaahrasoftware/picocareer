import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "./FormField";
import { FormFieldProps } from "./FormField";

interface GenericUploadFormProps {
  fields: (FormFieldProps & { defaultValue?: any })[];
  onSubmit: (data: any) => void;
  buttonText?: string;
  isSubmitting?: boolean;
}

export function GenericUploadForm({ 
  fields, 
  onSubmit, 
  buttonText = "Submit",
  isSubmitting = false 
}: GenericUploadFormProps) {
  const form = useForm({
    defaultValues: fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.defaultValue || (field.type === "array" ? [] : "")
    }), {})
  });

  const handleSubmit = async (data: any) => {
    await onSubmit(data);
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