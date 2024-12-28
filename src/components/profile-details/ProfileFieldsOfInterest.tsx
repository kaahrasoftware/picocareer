import { Badge } from "@/components/ui/badge";

interface ProfileFieldsOfInterestProps {
  fields: string[] | null;
}

export function ProfileFieldsOfInterest({ fields }: ProfileFieldsOfInterestProps) {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-2">Fields of Interest</h4>
      <div className="flex flex-wrap gap-2">
        {fields.map((field, index) => (
          <Badge 
            key={index}
            className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
          >
            {field}
          </Badge>
        ))}
      </div>
    </div>
  );
}