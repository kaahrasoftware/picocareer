import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SubcategorySelect } from "@/components/blog/filters/SubcategorySelect";
import { Database } from "@/integrations/supabase/types";

type Categories = Database["public"]["Enums"]["categories"];

interface SubcategoryFieldProps {
  field: any;
  label: string;
  description?: string;
  required?: boolean;
  selectedCategory: Categories | "_all";
}

export function SubcategoryField({
  field,
  label,
  description,
  required = false,
  selectedCategory,
}: SubcategoryFieldProps) {
  return (
    <FormItem>
      <FormLabel>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </FormLabel>
      <FormControl>
        <SubcategorySelect
          selectedCategory={selectedCategory}
          selectedSubcategory={field.value || "_all"}
          setSelectedSubcategory={field.onChange}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}