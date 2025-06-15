
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface LinksSectionProps {
  form: UseFormReturn<any>;
}

export function LinksSection({ form }: LinksSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Links</h3>
      <div>
        <label className="text-sm font-medium">LinkedIn URL</label>
        <Input
          {...form.register("linkedin_url")}
          className="mt-1"
          type="url"
          placeholder="https://linkedin.com/in/username"
        />
      </div>

      <div>
        <label className="text-sm font-medium">GitHub URL</label>
        <Input
          {...form.register("github_url")}
          className="mt-1"
          type="url"
          placeholder="https://github.com/username"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Website URL</label>
        <Input
          {...form.register("website_url")}
          className="mt-1"
          type="url"
          placeholder="https://yourwebsite.com"
        />
      </div>
    </div>
  );
}
