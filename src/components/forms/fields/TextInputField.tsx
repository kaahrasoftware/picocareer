import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface TextInputFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  type?: "text" | "number";
}

export function TextInputField({
  control,
  name,
  label,
  placeholder,
  description,
  required = false,
  type = "text"
}: TextInputFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              onChange={type === "number" ? 
                (e) => field.onChange(parseFloat(e.target.value)) : 
                field.onChange
              }
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}