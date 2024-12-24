import { Badge } from "@/components/ui/badge";

interface BadgeSectionProps {
  title: string;
  items?: string[];
  badgeClassName: string;
}

export function BadgeSection({ title, items, badgeClassName }: BadgeSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 3).map((item) => (
          <Badge 
            key={item}
            variant="outline"
            className={badgeClassName}
          >
            {item}
          </Badge>
        ))}
        {items.length > 3 && (
          <Badge 
            variant="outline"
            className={badgeClassName}
          >
            +{items.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  );
}