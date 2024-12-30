import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: string[];
}

export function MultiSelectField({
  control,
  name,
  label,
  placeholder,
  description,
  required = false,
  options = [] // Provide default empty array
}: MultiSelectFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      defaultValue={[]} // Initialize with empty array
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Command className="border rounded-lg">
              <CommandInput placeholder={placeholder} />
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup className="max-h-48 overflow-auto">
                {(options || []).map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      const values = Array.isArray(field.value) ? field.value : []; // Ensure field.value is an array
                      const newValues = values.includes(option)
                        ? values.filter((v: string) => v !== option)
                        : [...values, option];
                      field.onChange(newValues);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        Array.isArray(field.value) && field.value.includes(option) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </FormControl>
          {Array.isArray(field.value) && field.value.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {field.value.map((value: string) => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    field.onChange(field.value.filter((v: string) => v !== value));
                  }}
                >
                  {value} ×
                </Badge>
              ))}
            </div>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}