import { Badge } from "@/components/ui/badge";
import { Lightbulb, Wrench, BookOpen } from "lucide-react";

interface MajorSkillsListProps {
  title: string;
  items?: string[];
  icon: "skills" | "tools" | "courses";
  badgeStyle: string;
}

export function MajorSkillsList({ title, items, icon, badgeStyle }: MajorSkillsListProps) {
  if (!items?.length) return null;

  const getIcon = () => {
    switch (icon) {
      case "skills":
        return <Lightbulb className="h-4 w-4 text-primary" />;
      case "tools":
        return <Wrench className="h-4 w-4 text-primary" />;
      case "courses":
        return <BookOpen className="h-4 w-4 text-primary" />;
    }
  };

  const getFirstThree = (arr: string[]) => arr.slice(0, 3);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {getFirstThree(items).map((item, index) => (
          <Badge 
            key={index}
            variant="secondary"
            className={`text-xs ${badgeStyle}`}
          >
            {item}
          </Badge>
        ))}
        {items.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{items.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}