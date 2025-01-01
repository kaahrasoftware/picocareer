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
            >
              {availableTypes.map((type) => (
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