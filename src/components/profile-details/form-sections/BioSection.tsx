
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface BioSectionProps {
  form: UseFormReturn<any>;
}

export function BioSection({ form }: BioSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Bio</h3>
      <div>
        <Textarea
          {...form.register("bio")}
          className="mt-1"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );
}
