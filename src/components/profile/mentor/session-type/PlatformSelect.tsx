import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { SessionTypeFormData } from "./types";

interface PlatformSelectProps {
  form: {
    control: Control<SessionTypeFormData>;
  };
}

export function PlatformSelect({ form }: PlatformSelectProps) {
  return (
    <FormField
      control={form.control}
      name="meeting_platform"
      rules={{ required: "At least one platform is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Meeting Platform</FormLabel>
          <FormControl>
            <Select
              onValueChange={(value) => field.onChange([value])}
              defaultValue={field.value?.[0]}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Google Meet">Google Meet</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Telegram">Telegram</SelectItem>
                <SelectItem value="Phone Call">Phone Call</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}