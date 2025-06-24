
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SessionType {
  id: string;
  type: string;
  duration: number;
  description: string | null;
  custom_type_name?: string | null;
}

interface SessionTypeSelectorProps {
  sessionTypes: SessionType[];
  onSessionTypeSelect: (typeId: string) => void;
}

export function SessionTypeSelector({ sessionTypes, onSessionTypeSelect }: SessionTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-base">Session Type</h4>
      <Select onValueChange={onSessionTypeSelect}>
        <SelectTrigger className="w-full bg-white/5">
          <SelectValue placeholder="Select session type" />
        </SelectTrigger>
        <SelectContent>
          {sessionTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              <div className="flex flex-col">
                {/* Show custom type name if available, otherwise use the regular type */}
                <span>{type.type === "Custom" && type.custom_type_name ? type.custom_type_name : type.type}</span>
                <span className="text-sm text-muted-foreground">
                  {type.duration} minutes
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
