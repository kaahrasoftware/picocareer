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
      <h4 className="text-sm font-medium mb-2 text-left">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge 
            key={item}
            variant="outline"
            className={badgeClassName}
          >
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}