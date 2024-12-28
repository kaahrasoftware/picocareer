import { Badge } from "@/components/ui/badge";

interface ProfileKeywordsProps {
  keywords: string[] | null;
}

export function ProfileKeywords({ keywords }: ProfileKeywordsProps) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-2">Keywords</h4>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge 
            key={index}
            className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
          >
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
}