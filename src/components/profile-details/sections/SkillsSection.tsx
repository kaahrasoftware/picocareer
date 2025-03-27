
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";

interface SkillsSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (field: keyof FormFields, value: any) => void;
  skills: string;
  tools: string;
  keywords: string;
  fieldsOfInterest: string;
}

export function SkillsSection({
  register,
  handleFieldChange,
  skills,
  tools,
  keywords,
  fieldsOfInterest,
}: SkillsSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Skills & Expertise</h4>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Skills (comma-separated)</label>
          <Input
            {...register("skills")}
            onChange={(e) => handleFieldChange("skills", e.target.value)}
            className="mt-1"
            placeholder="React, TypeScript, Node.js"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tools (comma-separated)</label>
          <Input
            {...register("tools_used")}
            onChange={(e) => handleFieldChange("tools_used", e.target.value)}
            className="mt-1"
            placeholder="VS Code, Git, Docker"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Keywords (comma-separated)</label>
          <Input
            {...register("keywords")}
            onChange={(e) => handleFieldChange("keywords", e.target.value)}
            className="mt-1"
            placeholder="web development, backend, frontend"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Fields of Interest (comma-separated)</label>
          <Input
            {...register("fields_of_interest")}
            onChange={(e) => handleFieldChange("fields_of_interest", e.target.value)}
            className="mt-1"
            placeholder="AI, Machine Learning, Web Development"
          />
        </div>
      </div>
    </div>
  );
}
