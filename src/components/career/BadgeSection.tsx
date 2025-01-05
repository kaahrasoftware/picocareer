import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface BadgeSectionProps {
  title: string;
  items: string[];
  badgeClassName?: string;
  icon?: ReactNode;
  remainingCount?: number;
}

export function BadgeSection({ 
  title, 
  items, 
  badgeClassName, 
  icon,
  remainingCount = 0
}: BadgeSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge 
            key={`${item}-${index}`}
            className={badgeClassName}
          >
            {item}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge 
            className="bg-muted text-muted-foreground hover:bg-muted/80"
          >
            +{remainingCount} more
          </Badge>
        )}
      </div>
    </div>
  );
}