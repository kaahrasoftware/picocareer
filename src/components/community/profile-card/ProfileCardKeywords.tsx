
import { Badge } from "@/components/ui/badge";

interface ProfileCardKeywordsProps {
  keywords: string[];
}

export function ProfileCardKeywords({ keywords }: ProfileCardKeywordsProps) {
  return (
    <div className="w-full mb-4">
      <h4 className="text-sm font-medium mb-2">Keywords</h4>
      <div className="flex flex-wrap gap-1.5">
        {keywords.slice(0, 3).map((keyword) => (
          <Badge 
            key={keyword} 
            variant="secondary" 
            className="text-xs bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
          >
            {keyword}
          </Badge>
        ))}
        {keywords.length > 3 && (
          <Badge 
            variant="secondary" 
            className="text-xs bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
          >
            +{keywords.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  );
}
