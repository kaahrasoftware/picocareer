
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { AvatarPicker } from "@/components/avatar/AvatarPicker";
import { generateDefaultAvatar } from "@/utils/avatarGenerator";

export interface ProfileAvatarProps {
  avatarUrl?: string;
  imageAlt?: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onChange?: (file: File) => void;
  userId?: string;
  onAvatarUpdate?: (url: string) => void;
}

export function ProfileAvatar({ 
  avatarUrl = "", 
  imageAlt = "", 
  size = "md", 
  editable = false,
  onChange,
  userId,
  onAvatarUpdate
}: ProfileAvatarProps) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  const firstLetter = imageAlt?.[0] || (typeof imageAlt === 'string' && imageAlt.length > 0 ? imageAlt[0] : 'U');

  // Use default avatar if no avatar URL is provided and we have a user ID
  const displayAvatarUrl = avatarUrl || (userId ? generateDefaultAvatar(userId) : "");

  const handleAvatarClick = () => {
    if (editable && userId) {
      setShowAvatarPicker(true);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    if (onAvatarUpdate) {
      onAvatarUpdate(url);
    }
    setShowAvatarPicker(false);
  };

  return (
    <>
      <div className="relative group">
        <Avatar 
          className={`${sizeClasses[size]} ${editable ? 'cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200' : ''}`} 
          onClick={handleAvatarClick}
          title={editable ? "Click to change profile picture" : undefined}
        >
          <AvatarImage src={displayAvatarUrl} alt={imageAlt} />
          <AvatarFallback>{firstLetter}</AvatarFallback>
        </Avatar>
        
        {editable && (
          <>
            {/* Main hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 rounded-full">
              <Upload className="w-4 h-4 text-white drop-shadow-sm" />
            </div>
            
            {/* Small edit indicator */}
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 opacity-80 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
              <Upload className="w-3 h-3" />
            </div>
          </>
        )}
      </div>

      {userId && (
        <AvatarPicker
          open={showAvatarPicker}
          onOpenChange={setShowAvatarPicker}
          userId={userId}
          currentAvatarUrl={avatarUrl}
          onAvatarUpdate={handleAvatarUpdate}
        />
      )}
    </>
  );
}
