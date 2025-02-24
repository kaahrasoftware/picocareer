
import { FormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccessLevelSelectProps {
  control: any;
}

export function AccessLevelSelect({ control }: AccessLevelSelectProps) {
  return (
    <FormField
      control={control}
      name="access_level"
      render={({ field }) => (
        <div className="space-y-2">
          <label className="text-sm font-medium">Access Level</label>
          <Select
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="members">Members Only</SelectItem>
              <SelectItem value="faculty">Faculty Only</SelectItem>
              <SelectItem value="admin">Admin Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
}
