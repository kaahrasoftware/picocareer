import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField, FormFieldProps } from "./FormField";

interface GenericUploadFormProps {
  fields: FormFieldProps[];
  onSubmit: (data: any) => Promise<void>;
  buttonText?: string;
  validationSchema?: any;
}

export function GenericUploadForm({ 
  fields, 
  onSubmit, 
  buttonText = "Upload", 
  validationSchema 
}: GenericUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="space-y-6">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              {...field}
            />
          ))}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Uploading..." : buttonText}
        </Button>
      </form>
    </Form>
  );
}