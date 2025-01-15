import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
}

export function ProfileAvatar({ 
  avatarUrl, 
  fallback = "U",
  size = "md", 
  editable = false 
}: ProfileAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl || ''} alt="Profile" />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}