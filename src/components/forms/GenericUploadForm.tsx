import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";

export interface FormFieldProps {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "image" | "number" | "checkbox" | "datetime-local" | "degree" | "array" | "category" | "subcategory" | "richtext" | "email" | "password";
  placeholder?: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
}

export interface GenericUploadFormProps {
  fields: FormFieldProps[];
  onSubmit: (data: any) => Promise<void>;
  buttonText?: string;
  isSubmitting?: boolean;
}

export function GenericUploadForm({ fields, onSubmit, buttonText = "Submit", isSubmitting = false }: GenericUploadFormProps) {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: any = {};
    fields.forEach(field => {
      data[field.name] = formData.get(field.name);
    });
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(field => (
        <FormField key={field.name} {...field} />
      ))}
      <Button type="submit" disabled={isSubmitting}>
        {buttonText}
      </Button>
    </form>
  );
}
