import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { SESSION_TYPE_OPTIONS, SessionTypeEnum } from "@/types/session";
import { SessionTypeFormData } from "./types";

interface SessionTypeSelectProps {
  form: UseFormReturn<SessionTypeFormData>;
  availableTypes: SessionTypeEnum[];
}

export function SessionTypeSelect({ form, availableTypes }: SessionTypeSelectProps) {
  return (
    <FormField
      control={form.control}
      name="type"
      rules={{ required: "Session type is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Session Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}