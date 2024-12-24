import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { badgeStyles } from "./BadgeStyles";

interface KeywordsSectionProps {
  keywords?: string[];
}

export function KeywordsSection({ keywords }: KeywordsSectionProps) {
  if (!keywords?.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
        <Tag className="h-5 w-5 text-primary" />
        Keywords
      </h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge 
            key={index}
            variant="outline"
            className={badgeStyles.keyword}
          >
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
}