import { Badge } from "@/components/ui/badge";

interface ProfileSkillsProps {
  skills: string[] | null;
  tools: string[] | null;
  keywords?: string[] | null;
  fieldsOfInterest?: string[] | null;
}

export function ProfileSkills({ skills, tools, keywords, fieldsOfInterest }: ProfileSkillsProps) {
  if (!skills?.length && !tools?.length && !keywords?.length && !fieldsOfInterest?.length) return null;

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

      {keywords?.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge 
                key={index} 
                className="bg-[#FDE2E2] text-[#4B5563] hover:bg-[#FACACA] transition-colors border border-[#FAD4D4]"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {fieldsOfInterest?.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Fields of Interest</h4>
          <div className="flex flex-wrap gap-2">
            {fieldsOfInterest.map((field, index) => (
              <Badge 
                key={index} 
                className="bg-[#E2D4F0] text-[#4B5563] hover:bg-[#D4C4E3] transition-colors border border-[#D4C4E3]"
              >
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}