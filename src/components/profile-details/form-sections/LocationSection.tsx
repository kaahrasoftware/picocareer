
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface LocationSectionProps {
  form: UseFormReturn<any>;
}

export function LocationSection({ form }: LocationSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Location</h3>
      <div>
        <Input
          {...form.register("location")}
          className="mt-1"
          placeholder="City, Country"
        />
      </div>
    </div>
  );
}
