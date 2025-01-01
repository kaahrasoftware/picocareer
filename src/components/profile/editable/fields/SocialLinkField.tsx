import { Button } from "@/components/ui/button";
import { Facebook, Github, Globe, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { EditButton } from "../EditButton";
import { TextField } from "./TextField";

interface SocialLinkFieldProps {
  value: string | null;
  fieldName: string;
  onSave: (value: string) => Promise<void>;
  isEditing: boolean;
  onEditClick: () => void;
  onCancelEdit: () => void;
}

export function SocialLinkField({
  value,
  fieldName,
  onSave,
  isEditing,
  onEditClick,
  onCancelEdit
}: SocialLinkFieldProps) {
  if (!value && !isEditing) return null;

  const getSocialIcon = () => {
    switch (fieldName) {
      case 'linkedin_url':
        return <Linkedin className="h-5 w-5" />;
      case 'github_url':
        return <Github className="h-5 w-5" />;
      case 'website_url':
        return <Globe className="h-5 w-5" />;
      case 'X_url':
        return <Twitter className="h-5 w-5" />;
      case 'facebook_url':
        return <Facebook className="h-5 w-5" />;
      case 'instagram_url':
        return <Instagram className="h-5 w-5" />;
      case 'tiktok_url':
        return <span className="font-semibold text-sm">TikTok</span>;
      case 'youtube_url':
        return <Youtube className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (isEditing) {
    return (
      <TextField
        value={value || ''}
        onSave={onSave}
        onCancel={onCancelEdit}
      />
    );
  }

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        asChild
      >
        <a 
          href={value || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label={`${fieldName.replace('_url', '')} Profile`}
        >
          {getSocialIcon()}
        </a>
      </Button>
      <EditButton onClick={onEditClick} />
    </div>
  );
}