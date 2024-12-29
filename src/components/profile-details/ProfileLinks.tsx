import { Link, Github, Globe } from "lucide-react";
import { EditableField } from "@/components/profile/EditableField";

interface ProfileLinksProps {
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  profileId: string;
}

export function ProfileLinks({ linkedinUrl, githubUrl, websiteUrl, profileId }: ProfileLinksProps) {
  if (!linkedinUrl && !githubUrl && !websiteUrl) return null;

  return (
    <div className="bg-muted rounded-lg p-4 space-y-3">
      <h4 className="font-semibold">Links</h4>
      
      <div className="flex items-center gap-2 text-muted-foreground">
        <Link className="h-4 w-4" />
        <EditableField
          label="LinkedIn URL"
          value={linkedinUrl}
          fieldName="linkedin_url"
          profileId={profileId}
        />
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <Github className="h-4 w-4" />
        <EditableField
          label="GitHub URL"
          value={githubUrl}
          fieldName="github_url"
          profileId={profileId}
        />
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <Globe className="h-4 w-4" />
        <EditableField
          label="Website URL"
          value={websiteUrl}
          fieldName="website_url"
          profileId={profileId}
        />
      </div>
    </div>
  );
}