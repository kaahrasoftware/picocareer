
import { Badge } from "@/components/ui/badge";

interface ProfileCardSkillsProps {
  skills: string[];
}

export function ProfileCardSkills({ skills }: ProfileCardSkillsProps) {
  return (
    <div className="w-full mb-4">
      <h4 className="text-sm font-medium mb-2">Skills</h4>
      <div className="flex flex-wrap gap-1.5">
        {skills.slice(0, 3).map((skill) => (
          <Badge 
            key={skill} 
            variant="secondary" 
            className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
          >
            {skill}
          </Badge>
        ))}
        {skills.length > 3 && (
          <Badge 
            variant="secondary" 
            className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
          >
            +{skills.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  );
}
