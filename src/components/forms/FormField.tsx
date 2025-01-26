import { FormControl, FormDescription, FormField as FormFieldUI, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { Checkbox } from "@/components/ui/checkbox";

interface FormFieldProps {
  control: any;
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "image" | "number" | "checkbox" | "richtext" | "datetime-local";
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: string[];
  bucket?: string;
}

export function FormField({ 
  control, 
  name, 
  label, 
  type = "text",
  placeholder,
  description,
  required,
  options,
  bucket
}: FormFieldProps) {
  return (
    <FormFieldUI
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="w-full">
              {type === "textarea" && (
                <Textarea
                  placeholder={placeholder}
                  {...field}
                  className="min-h-[100px]"
                />
              )}
              {type === "richtext" && (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={placeholder}
                />
              )}
              {type === "select" && options && (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {type === "image" && bucket && (
                <ImageUpload
                  control={control}
                  name={name}
                  label={label}
                  description={description}
                  bucket={bucket}
                />
              )}
              {type === "checkbox" && (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
              {(type === "text" || type === "number" || type === "datetime-local") && (
                <Input
                  type={type}
                  placeholder={placeholder}
                  {...field}
                />
              )}
            </div>
          </FormControl>
          {description && (
            <FormDescription>
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}