import { Badge } from "@/components/ui/badge";

interface BadgeSectionProps {
  title: string;
  items?: string[];
  badgeClassName: string;
}

export function BadgeSection({ title, items, badgeClassName }: BadgeSectionProps) {
  if (!items || items.length === 0) return null;

  const displayItems = items.slice(0, 3);
  const remainingCount = items.length - 3;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2 text-left">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {displayItems.map((item) => (
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
            className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200"
          >
            +{remainingCount} more
          </Badge>
        )}
      </div>
    </div>
  );
}