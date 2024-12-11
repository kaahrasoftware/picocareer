import { Badge } from "@/components/ui/badge";

interface MentorSkillsProps {
  skills?: string[];
  tools?: string[];
}

export function MentorSkills({ skills, tools }: MentorSkillsProps) {
  if (!skills?.length && !tools?.length) return null;

  return (
    <div className="bg-kahra-darker rounded-lg p-4">
      {skills?.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">
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
            {tools.map((tool) => (
              <Badge key={tool} variant="outline">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}