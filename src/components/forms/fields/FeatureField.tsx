import { FormItem } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface FeatureFieldProps {
  field: any;
  label: string;
  description?: string;
}

export function FeatureField({ field, label, description }: FeatureFieldProps) {
  return (
    <FormItem>
      <div className="flex flex-row items-start space-x-3 space-y-0">
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
        <div className="space-y-1 leading-none">
          <div className="text-sm font-medium leading-none">{label}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </FormItem>
  );
}