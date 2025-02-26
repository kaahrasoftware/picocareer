
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/forms/RichTextEditor";

interface BasicInputFieldProps {
  name: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "textarea" | "richtext";
  required?: boolean;
  disabled?: boolean;
}

export function BasicInputField({
  name,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}: BasicInputFieldProps) {
  if (type === "textarea") {
    return (
      <Textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="min-h-[100px]"
      />
    );
  }

  if (type === "richtext") {
    return (
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        uploadConfig={{
          bucket: "hub_resources",
          folderPath: "content"
        }}
      />
    );
  }

  return (
    <Input
      type={type}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="placeholder:text-gray-400"
    />
  );
}
