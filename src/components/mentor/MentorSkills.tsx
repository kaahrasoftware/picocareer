interface MentorSkillsProps {
  skills: string[];
  tools: string[];
  keywords: string[];
}

export function MentorSkills({ skills, tools, keywords }: MentorSkillsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="bg-kahra-darker px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Tools</h3>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <span key={tool} className="bg-kahra-darker px-3 py-1 rounded-full text-sm">
              {tool}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <span key={keyword} className="bg-kahra-darker px-3 py-1 rounded-full text-sm">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}