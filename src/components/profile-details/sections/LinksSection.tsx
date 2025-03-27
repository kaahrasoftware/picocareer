
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";

interface LinksSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (field: keyof FormFields, value: any) => void;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
}

export function LinksSection({
  register,
  handleFieldChange,
  linkedinUrl,
  githubUrl,
  websiteUrl,
}: LinksSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Links</h4>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">LinkedIn URL</label>
          <Input
            {...register("linkedin_url")}
            onChange={(e) => handleFieldChange("linkedin_url", e.target.value)}
            className="mt-1"
            type="url"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div>
          <label className="text-sm font-medium">GitHub URL</label>
          <Input
            {...register("github_url")}
            onChange={(e) => handleFieldChange("github_url", e.target.value)}
            className="mt-1"
            type="url"
            placeholder="https://github.com/username"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Website URL</label>
          <Input
            {...register("website_url")}
            onChange={(e) => handleFieldChange("website_url", e.target.value)}
            className="mt-1"
            type="url"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
    </div>
  );
}
