import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface BadgeSectionProps {
  title: string;
  items?: string[];
  badgeClassName: string;
  icon?: ReactNode;
}

export function BadgeSection({ title, items, badgeClassName, icon }: BadgeSectionProps) {
  if (!items || items.length === 0) return null;

  const visibleItems = items.slice(0, 3);
  const remainingCount = items.length - 3;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2 text-left flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {visibleItems.map((item) => (
          <Badge 
            key={item}
            variant="outline"
            className={badgeClassName}
          >
            {item}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge 
            variant="outline"
            className={badgeClassName}
          >
            +{remainingCount} more
          </Badge>
        )}
      </div>
    </div>
  );
}