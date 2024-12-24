import { FormField, FormFieldProps } from "@/components/forms/FormField";
import { Control } from "react-hook-form";
import { CareerFormValues } from "@/lib/validations/blog";

interface BasicCareerInfoProps {
  control: Control<CareerFormValues>;
}

export function BasicCareerInfo({ control }: BasicCareerInfoProps) {
  const fields: FormFieldProps[] = [
    {
      name: "title",
      label: "Career Title",
      type: "text",
      placeholder: "e.g., Software Engineer",
      required: true
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Detailed description of the career path",
      required: true
    },
    {
      name: "image_url",
      label: "Career Image",
      type: "image",
      bucket: "images",
      description: "Upload an image that represents this career"
    },
    {
      name: "salary_range",
      label: "Salary Range",
      type: "text",
      placeholder: "e.g., $50,000 - $100,000"
    }
  ];

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <FormField
          key={field.name}
          control={control}
          {...field}
        />
      ))}
    </div>
  );
}