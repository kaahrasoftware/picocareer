
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileAvatarProps } from "@/types/availability";

export function ProfileAvatar({ 
  avatarUrl, 
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

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl} alt={imageAlt} />
      <AvatarFallback>{imageAlt[0]}</AvatarFallback>
    </Avatar>
  );
}
