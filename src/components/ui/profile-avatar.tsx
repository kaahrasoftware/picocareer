
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ProfileAvatarProps {
  avatarUrl?: string;
  imageAlt?: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onChange?: (file: File) => void;
}

export function ProfileAvatar({ 
  avatarUrl = "", 
  imageAlt = "", 
  size = "md", 
  editable = false, 
  onChange 
}: ProfileAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  const firstLetter = imageAlt?.[0] || (typeof imageAlt === 'string' && imageAlt.length > 0 ? imageAlt[0] : 'U');

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl} alt={imageAlt} />
      <AvatarFallback>{firstLetter}</AvatarFallback>
    </Avatar>
  );
}
