import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { UseFormRegister } from "react-hook-form";

export type FormFieldType = 
  | "text" 
  | "number" 
  | "textarea" 
  | "select" 
  | "checkbox" 
  | "image" 
  | "datetime-local"
  | "degree"
  | "array"
  | "category"
  | "subcategory"
  | "richtext"
  | "email"
  | "password";

export interface FormFieldProps {
  name: string;
  label: string;
  type?: FormFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { label: string; value: string; }[];
  bucket?: string;
  defaultValue?: any;
  register?: UseFormRegister<any>;
  component?: React.ComponentType<any>;
}

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  description,
  required = false,
  options = [],
  bucket,
  defaultValue,
  register,
  component: Component
}: FormFieldProps) {
  if (Component) {
    return <Component {...{ name, label, placeholder, required, register }} />;
  }

  const renderField = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            {...(register ? register(name) : {})}
            className="resize-none"
          />
        );
      case "select":
        return (
          <Select defaultValue={defaultValue} {...(register ? register(name) : {})}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <Checkbox
            {...(register ? register(name) : {})}
          />
        );
      case "image":
        return (
          <ImageUpload
            bucket={bucket || "images"}
            {...(register ? register(name) : {})}
          />
        );
      case "datetime-local":
        return (
          <Input
            type="datetime-local"
            placeholder={placeholder}
            {...(register ? register(name) : {})}
          />
        );
      case "richtext":
        return (
          <RichTextEditor
            {...(register ? register(name) : {})}
            placeholder={placeholder}
          />
        );
      case "email":
      case "password":
      case "text":
      case "number":
        return (
          <Input
            type={type}
            placeholder={placeholder}
            {...(register ? register(name) : {})}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}