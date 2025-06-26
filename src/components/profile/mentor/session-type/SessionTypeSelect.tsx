
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SessionTypeEnum } from "./types";
import { useFormContext } from "react-hook-form";

interface SessionTypeSelectProps {
  availableTypes: any[];
}

export function SessionTypeSelect({ availableTypes }: SessionTypeSelectProps) {
  const { control } = useFormContext();
  
  const getAvailableOptions = () => {
    return Object.entries(SessionTypeEnum).filter(
      ([key, value]) => !availableTypes.includes(value)
    );
  };

  return (
    <FormField
      control={control}
      name="type"
      rules={{ required: "Session type is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Session Type</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableOptions().map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value === 'Custom' ? 'Custom Type' : value.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
