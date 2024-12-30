import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "../RichTextEditor";

interface TextareaFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  useRichText?: boolean;
}

export function TextareaField({
  control,
  name,
  label,
  placeholder,
  description,
  required = false,
  useRichText = false
}: TextareaFieldProps) {
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
            {useRichText ? (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder={placeholder}
              />
            ) : (
              <Input
                {...field}
                placeholder={placeholder}
                className="min-h-[100px]"
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}