
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface PersonalInfoSectionProps {
  form: UseFormReturn<any>;
}

export function PersonalInfoSection({ form }: PersonalInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <Input
            {...form.register("first_name")}
            className="mt-1"
            placeholder="Your first name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input
            {...form.register("last_name")}
            className="mt-1"
            placeholder="Your last name"
          />
        </div>
      </div>
    </div>
  );
}
