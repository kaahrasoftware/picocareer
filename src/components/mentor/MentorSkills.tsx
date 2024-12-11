interface MentorSkillsProps {
  skills: string[] | null;
  tools: string[] | null;
  keywords: string[] | null;
}

export function MentorSkills({ skills, tools, keywords }: MentorSkillsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {skills?.map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-primary/10 rounded-md text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Tools</h3>
        <div className="flex flex-wrap gap-2">
          {tools?.map((tool, index) => (
            <span key={index} className="px-2 py-1 bg-primary/10 rounded-md text-sm">
              {tool}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {keywords?.map((keyword, index) => (
            <span key={index} className="px-2 py-1 bg-primary/10 rounded-md text-sm">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}