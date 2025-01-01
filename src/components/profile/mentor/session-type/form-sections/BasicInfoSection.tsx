import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SESSION_TYPE_OPTIONS } from "@/types/session";
import { UseFormReturn } from "react-hook-form";

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
  availableTypes: string[];
}

export function BasicInfoSection({ form, availableTypes }: BasicInfoSectionProps) {
  console.log('Available session types:', availableTypes);
  
  // Sort availableTypes to match the order in SESSION_TYPE_OPTIONS
  const sortedAvailableTypes = SESSION_TYPE_OPTIONS.filter(type => 
    availableTypes.includes(type)
  );

  return (
    <>
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Session Type</FormLabel>
            <select
              {...field}
              className="w-full p-2 border rounded-md"
              value={field.value || sortedAvailableTypes[0]}
            >
              {sortedAvailableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration (minutes)</FormLabel>
            <Input {...field} type="number" min="15" step="15" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <Textarea {...field} placeholder="Describe what mentees can expect from this session type" />
          </FormItem>
        )}
      />
    </>
  );
}