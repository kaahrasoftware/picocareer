import { Badge } from "@/components/ui/badge";
import { Briefcase, Wrench, GraduationCap } from "lucide-react";

interface MajorSkillsListProps {
  title: string;
  items?: string[] | null;
  icon: "skills" | "tools" | "courses";
  badgeStyle?: string;
}

export function MajorSkillsList({ title, items, icon, badgeStyle }: MajorSkillsListProps) {
  if (!items || items.length === 0) return null;

  const getIcon = () => {
    switch (icon) {
      case "skills":
        return <Briefcase className="h-4 w-4" />;
      case "tools":
        return <Wrench className="h-4 w-4" />;
      case "courses":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <h4 className="text-sm font-medium">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 2).map((item, index) => (
          <Badge
            key={index}
            variant="outline"
            className={badgeStyle}
          >
            {item}
          </Badge>
        ))}
        {items.length > 2 && (
          <Badge
            variant="outline"
            className={badgeStyle}
          >
            +{items.length - 2} more
          </Badge>
        )}
      </div>
    </div>
  );
}