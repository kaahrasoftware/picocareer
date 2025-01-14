import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface ProfileAvatarProps {
  avatarUrl: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-24 w-24"
};

export function ProfileAvatar({ 
  avatarUrl, 
  fallback,
  size = "md",
  editable = false,
  onClick
}: ProfileAvatarProps) {
  return (
    <Avatar 
      className={cn(
        sizeClasses[size],
        editable && "cursor-pointer hover:opacity-80 transition-opacity",
        "bg-muted"
      )}
      onClick={editable ? onClick : undefined}
    >
      <AvatarImage src={avatarUrl} alt="Profile picture" />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}