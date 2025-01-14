import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface ProfileAvatarProps {
  avatarUrl?: string | null;
  userId?: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16"
};

export function ProfileAvatar({ 
  avatarUrl, 
  size = "md", 
  editable = false,
  className 
}: ProfileAvatarProps) {
  const getFallbackInitial = () => {
    if (!avatarUrl) return "?";
    const lastPart = avatarUrl.split("/").pop();
    return lastPart?.[0]?.toUpperCase() || "?";
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatarUrl || ""} alt="Profile" />
      <AvatarFallback>{getFallbackInitial()}</AvatarFallback>
    </Avatar>
  );
}