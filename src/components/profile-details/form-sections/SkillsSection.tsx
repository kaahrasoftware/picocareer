
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface SkillsSectionProps {
  form: UseFormReturn<any>;
}

export function SkillsSection({ form }: SkillsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Skills & Expertise</h3>
      <div>
        <label className="text-sm font-medium">Skills (comma-separated)</label>
        <Input
          {...form.register("skills")}
          className="mt-1"
          placeholder="React, TypeScript, Node.js"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tools (comma-separated)</label>
        <Input
          {...form.register("tools_used")}
          className="mt-1"
          placeholder="VS Code, Git, Docker"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Keywords (comma-separated)</label>
        <Input
          {...form.register("keywords")}
          className="mt-1"
          placeholder="web development, backend, frontend"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Fields of Interest (comma-separated)</label>
        <Input
          {...form.register("fields_of_interest")}
          className="mt-1"
          placeholder="AI, Machine Learning, Web Development"
        />
      </div>
    </div>
  );
}
