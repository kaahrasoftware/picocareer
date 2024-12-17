import { Link, Github, Globe } from "lucide-react";

interface ProfileLinksProps {
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
}

export function ProfileLinks({ linkedin_url, github_url, website_url }: ProfileLinksProps) {
  if (!linkedin_url && !github_url && !website_url) return null;

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-2">Links</h4>
      <div className="space-y-2">
        {linkedin_url && (
          <a 
            href={linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Link className="h-4 w-4" />
            <span>LinkedIn</span>
          </a>
        )}
        {github_url && (
          <a 
            href={github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        )}
        {website_url && (
          <a 
            href={website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>Website</span>
          </a>
        )}
      </div>
    </div>
  );
}