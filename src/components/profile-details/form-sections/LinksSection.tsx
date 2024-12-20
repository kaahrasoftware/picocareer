import { Input } from "@/components/ui/input";

interface LinksSectionProps {
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LinksSection({
  linkedinUrl,
  githubUrl,
  websiteUrl,
  handleInputChange,
}: LinksSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Links</h3>
      <div>
        <label className="text-sm font-medium">LinkedIn URL</label>
        <Input
          name="linkedin_url"
          value={linkedinUrl}
          onChange={handleInputChange}
          className="mt-1"
          type="url"
          placeholder="https://linkedin.com/in/username"
        />
      </div>

      <div>
        <label className="text-sm font-medium">GitHub URL</label>
        <Input
          name="github_url"
          value={githubUrl}
          onChange={handleInputChange}
          className="mt-1"
          type="url"
          placeholder="https://github.com/username"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Website URL</label>
        <Input
          name="website_url"
          value={websiteUrl}
          onChange={handleInputChange}
          className="mt-1"
          type="url"
          placeholder="https://yourwebsite.com"
        />
      </div>
    </div>
  );
}