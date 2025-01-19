import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ProfileAvatarProps {
  avatarUrl: string | null;
  profileId?: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  fallback?: string;
}

export function ProfileAvatar({ 
  avatarUrl, 
  size = "md",
  editable = false,
  fallback = "U"
}: ProfileAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage 
        src={avatarUrl || "/placeholder.svg"} 
        alt="Profile" 
      />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}