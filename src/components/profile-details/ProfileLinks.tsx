import { Linkedin, Github, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      
      <div className="flex gap-2">
        {linkedinUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <a 
              href={linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </Button>
        )}

        {githubUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <a 
              href={githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
        )}

        {websiteUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <a 
              href={websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Personal Website"
            >
              <Globe className="h-5 w-5" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}