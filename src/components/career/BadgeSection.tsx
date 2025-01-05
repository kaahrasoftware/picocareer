import { Badge } from "@/components/ui/badge";

interface BadgeSectionProps {
  title: string;
  items: string[];
  badgeClassName?: string;
}

export function BadgeSection({ title, items, badgeClassName }: BadgeSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge 
            key={`${item}-${index}`}
            className={badgeClassName}
          >
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}