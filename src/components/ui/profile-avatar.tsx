
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileAvatarProps } from "@/types/availability";

export function ProfileAvatar({ 
  avatarUrl, 
  imageAlt = "", 
  size = "md", 
  editable = false,
  fallback,
  profileId,
  onChange 
}: ProfileAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  const getFallback = () => {
    if (fallback) return fallback;
    if (imageAlt && imageAlt.length > 0) return imageAlt[0].toUpperCase();
    return 'U';
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl || ""} alt={imageAlt} />
      <AvatarFallback>{getFallback()}</AvatarFallback>
    </Avatar>
  );
}
