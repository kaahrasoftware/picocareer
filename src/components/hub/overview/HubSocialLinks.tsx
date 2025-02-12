
import { Twitter, Facebook, Linkedin, Instagram } from "lucide-react";

interface HubSocialLinksProps {
  socialLinks: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export function HubSocialLinks({ socialLinks }: HubSocialLinksProps) {
  return (
    <div className="flex gap-4">
      {socialLinks.twitter && (
        <a 
          href={socialLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Twitter className="h-5 w-5" />
        </a>
      )}
      {socialLinks.facebook && (
        <a 
          href={socialLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Facebook className="h-5 w-5" />
        </a>
      )}
      {socialLinks.linkedin && (
        <a 
          href={socialLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Linkedin className="h-5 w-5" />
        </a>
      )}
      {socialLinks.instagram && (
        <a 
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Instagram className="h-5 w-5" />
        </a>
      )}
    </div>
  );
}
