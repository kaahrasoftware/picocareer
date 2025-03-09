
import { Badge } from "@/components/ui/badge";

interface ProfileCardInterestsProps {
  fields: string[];
}

export function ProfileCardInterests({ fields }: ProfileCardInterestsProps) {
  return (
    <div className="w-full mb-4">
      <h4 className="text-sm font-medium mb-2">Fields of Interest</h4>
      <div className="flex flex-wrap gap-1.5">
        {fields.slice(0, 3).map((field) => (
          <Badge 
            key={field} 
            variant="secondary" 
            className="text-xs bg-[#E2D4F0] text-[#4B5563] hover:bg-[#D4C4E3] transition-colors border border-[#D4C4E3]"
          >
            {field}
          </Badge>
        ))}
        {fields.length > 3 && (
          <Badge 
            variant="secondary" 
            className="text-xs bg-[#E2D4F0] text-[#4B5563] hover:bg-[#D4C4E3] transition-colors border border-[#D4C4E3]"
          >
            +{fields.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  );
}
