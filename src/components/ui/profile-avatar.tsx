import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ProfileAvatarProps {
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  fallback?: string;
}

export function ProfileAvatar({ avatarUrl, size = "md", editable = false, fallback = "?" }: ProfileAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl || undefined} alt="Profile" />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}