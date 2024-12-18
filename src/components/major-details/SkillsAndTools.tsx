import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SkillsAndToolsProps {
  skill_match?: string[];
  tools_knowledge?: string[];
  transferable_skills?: string[];
  interdisciplinary_connections?: string[];
}

export function SkillsAndTools({ 
  skill_match,
  tools_knowledge,
  transferable_skills,
  interdisciplinary_connections
}: SkillsAndToolsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Wrench className="h-5 w-5 text-primary" />
        Skills & Tools
      </h4>

      {skill_match && skill_match.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Key Skills</h5>
          <div className="flex flex-wrap gap-2">
            {skill_match.map((skill, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#F2FCE2] text-[#4B5563] border-[#E2EFD9]"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {tools_knowledge && tools_knowledge.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Tools & Technologies</h5>
          <div className="flex flex-wrap gap-2">
            {tools_knowledge.map((tool, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#D3E4FD] text-[#4B5563] border-[#C1D9F9]"
              >
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {transferable_skills && transferable_skills.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Transferable Skills</h5>
          <div className="flex flex-wrap gap-2">
            {transferable_skills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#F2FCE2] text-[#4B5563]"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {interdisciplinary_connections && interdisciplinary_connections.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Interdisciplinary Connections</h5>
          <div className="flex flex-wrap gap-2">
            {interdisciplinary_connections.map((connection, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#D3E4FD] text-[#4B5563]"
              >
                {connection}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}