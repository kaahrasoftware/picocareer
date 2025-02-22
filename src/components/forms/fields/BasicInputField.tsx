import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface BasicInputFieldProps {
  field: any;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number" | "datetime-local";
  required?: boolean;
}

export function BasicInputField({
  field,
  label,
  placeholder,
  description,
  type = "text",
  required = false,
}: BasicInputFieldProps) {
  return (
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
          onChange={type === "number" 
            ? (e) => field.onChange(parseFloat(e.target.value))
            : field.onChange
          }
          className="placeholder:text-gray-400"
        />
      </FormControl>
      {description && (
        <FormDescription className="text-sky-600/70">
          {description}
        </FormDescription>
      )}
      <FormMessage />
    </FormItem>
  );
}