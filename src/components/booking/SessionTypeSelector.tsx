import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SessionType {
  id: string;
  type: string;
  duration: number;
  price: number;
  description: string | null;
}

interface SessionTypeSelectorProps {
  sessionTypes: SessionType[];
  onSessionTypeSelect: (typeId: string) => void;
}

export function SessionTypeSelector({ sessionTypes, onSessionTypeSelect }: SessionTypeSelectorProps) {
  return (
    <div>
      <h4 className="font-semibold mb-2">Session Type</h4>
      <Select onValueChange={onSessionTypeSelect}>
        <SelectTrigger className="w-full bg-kahra-darker border-none">
          <SelectValue placeholder="Select session type" />
        </SelectTrigger>
        <SelectContent className="bg-kahra-darker border-none">
          {sessionTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.type} ({type.duration} min) - ${type.price}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}