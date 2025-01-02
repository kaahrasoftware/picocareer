import { Linkedin, Github, Globe, Twitter, Instagram, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaTiktok } from 'react-icons/fa';

interface ProfileLinksProps {
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  xUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  profileId: string;
}

export function ProfileLinks({ 
  linkedinUrl, 
  githubUrl, 
  websiteUrl,
  xUrl,
  instagramUrl,
  facebookUrl,
  youtubeUrl,
  tiktokUrl,
  profileId 
}: ProfileLinksProps) {
  const hasAnyLink = linkedinUrl || githubUrl || websiteUrl || xUrl || 
                     instagramUrl || facebookUrl || youtubeUrl || tiktokUrl;

  if (!hasAnyLink) return null;

  return (
    <div className="bg-muted rounded-lg p-4 space-y-3">
      <h4 className="font-semibold">Links</h4>
      
      <div className="flex flex-wrap gap-2">
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

        {xUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <a 
              href={xUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="X (Twitter) Profile"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </Button>
        )}

        {instagramUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </Button>
        )}

        {facebookUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook Profile"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </Button>
        )}

        {youtubeUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <a 
              href={youtubeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="YouTube Channel"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </Button>
        )}

        {tiktokUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <a 
              href={tiktokUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="TikTok Profile"
            >
              <FaTiktok className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}