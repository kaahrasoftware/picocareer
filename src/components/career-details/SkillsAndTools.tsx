import { Wrench, Lightbulb, ArrowRightLeft, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SkillsAndToolsProps {
  required_skills?: string[];
  required_tools?: string[];
  tools_knowledge?: string[];
  skill_match?: string[];
  transferable_skills?: string[];
  required_education?: string[];
}

export function SkillsAndTools({
  required_skills,
  required_tools,
  tools_knowledge,
  skill_match,
  transferable_skills,
  required_education
}: SkillsAndToolsProps) {
  const renderSection = (items: string[] | undefined, title: string, badgeClass: string, icon: React.ReactNode) => {
    if (!items?.length) return null;
    return (
      <div className="space-y-2">
        <h5 className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </h5>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge 
              key={index}
              variant="outline"
              className={badgeClass}
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Wrench className="h-5 w-5 text-primary" />
        Skills & Tools
      </h4>

      {renderSection(
        required_education,
        "Required Education",
        "bg-[#E5DEFF] text-[#4B5563] hover:bg-[#D8D1F2] transition-colors border border-[#D8D1F2]",
        <GraduationCap className="h-4 w-4 text-muted-foreground" />
      )}

      {renderSection(
        required_skills,
        "Required Skills",
        "bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]",
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
      )}

      {renderSection(
        required_tools,
        "Required Tools",
        "bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]",
        <Wrench className="h-4 w-4 text-muted-foreground" />
      )}

      {renderSection(
        tools_knowledge,
        "Tools & Knowledge",
        "bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]",
        <Wrench className="h-4 w-4 text-muted-foreground" />
      )}

      {renderSection(
        skill_match,
        "Skill Match",
        "bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]",
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
      )}

      {renderSection(
        transferable_skills,
        "Transferable Skills",
        "bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]",
        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}