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

  // Get the appropriate badge style based on the icon type
  const getBadgeStyle = () => {
    switch (icon) {
      case "skills":
        return "bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]";
      case "tools":
        return "bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]";
      case "courses":
        return "bg-[#E5DEFF] text-[#4B5563] hover:bg-[#D8D1F2] transition-colors border border-[#D8D1F2]";
      default:
        return "";
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
            className={getBadgeStyle()}
          >
            {item}
          </Badge>
        ))}
        {items.length > 2 && (
          <Badge
            variant="outline"
            className={getBadgeStyle()}
          >
            +{items.length - 2} more
          </Badge>
        )}
      </div>
    </div>
  );
}