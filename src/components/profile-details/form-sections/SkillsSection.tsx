import { Input } from "@/components/ui/input";

interface SkillsSectionProps {
  skills: string;
  tools: string;
  keywords: string;
  fieldsOfInterest: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SkillsSection({
  skills,
  tools,
  keywords,
  fieldsOfInterest,
  handleInputChange,
}: SkillsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Skills & Expertise</h3>
      <div>
        <label className="text-sm font-medium">Skills (comma-separated)</label>
        <Input
          name="skills"
          value={skills}
          onChange={handleInputChange}
          className="mt-1"
          placeholder="React, TypeScript, Node.js"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tools (comma-separated)</label>
        <Input
          name="tools_used"
          value={tools}
          onChange={handleInputChange}
          className="mt-1"
          placeholder="VS Code, Git, Docker"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Keywords (comma-separated)</label>
        <Input
          name="keywords"
          value={keywords}
          onChange={handleInputChange}
          className="mt-1"
          placeholder="web development, backend, frontend"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Fields of Interest (comma-separated)</label>
        <Input
          name="fields_of_interest"
          value={fieldsOfInterest}
          onChange={handleInputChange}
          className="mt-1"
          placeholder="AI, Machine Learning, Web Development"
        />
      </div>
    </div>
  );
}