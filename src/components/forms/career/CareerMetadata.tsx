import { FormField, FormFieldProps } from "@/components/forms/FormField";
import { Control } from "react-hook-form";
import { CareerFormValues } from "@/lib/validations/blog";

interface CareerMetadataProps {
  control: Control<CareerFormValues>;
}

export function CareerMetadata({ control }: CareerMetadataProps) {
  const fields: FormFieldProps[] = [
    {
      name: "keywords",
      label: "Keywords",
      type: "array",
      placeholder: "Enter relevant keywords (comma-separated)"
    },
    {
      name: "transferable_skills",
      label: "Transferable Skills",
      type: "array",
      placeholder: "List transferable skills (comma-separated)"
    },
    {
      name: "careers_to_consider_switching_to",
      label: "Alternative Careers",
      type: "array",
      placeholder: "List alternative careers to consider (comma-separated)"
    }
  ];

  const toggleFields: FormFieldProps[] = [
    {
      name: "featured",
      label: "Featured Career",
      type: "checkbox",
      description: "Mark this career as featured"
    },
    {
      name: "rare",
      label: "Rare Career",
      type: "checkbox",
      description: "Mark this as a rare career opportunity"
    },
    {
      name: "popular",
      label: "Popular Career",
      type: "checkbox",
      description: "Mark this as a popular career choice"
    },
    {
      name: "new_career",
      label: "New Career",
      type: "checkbox",
      description: "Mark this as a new career field"
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
      <div className="grid grid-cols-2 gap-4">
        {toggleFields.map((field) => (
          <FormField
            key={field.name}
            control={control}
            {...field}
          />
        ))}
      </div>
    </div>
  );
}