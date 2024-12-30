import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CategorySelect } from "@/components/blog/filters/CategorySelect";

interface CategoryFieldProps {
  field: any;
  label: string;
  description?: string;
  required?: boolean;
}

export function CategoryField({
  field,
  label,
  description,
  required = false,
}: CategoryFieldProps) {
  return (
    <FormItem>
      <FormLabel>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </FormLabel>
      <FormControl>
        <CategorySelect
          selectedCategory={field.value || "_all"}
          setSelectedCategory={field.onChange}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}