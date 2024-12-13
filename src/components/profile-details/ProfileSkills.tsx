import { Badge } from "@/components/ui/badge";

interface ProfileSkillsProps {
  skills: string[] | null;
  tools: string[] | null;
}

export function ProfileSkills({ skills, tools }: ProfileSkillsProps) {
  if (!skills?.length && !tools?.length) return null;

  return (
    <div className="bg-muted rounded-lg p-4 space-y-4">
      {skills?.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge 
                key={index} 
                className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {tools?.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Tools</h4>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool, index) => (
              <Badge 
                key={index} 
                className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
              >
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}