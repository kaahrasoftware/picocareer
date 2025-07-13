
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarPicker } from "@/components/ui/avatar-picker";

function generateDefaultAvatar(userId: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`;
}

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
  avatarUrl,
  imageAlt = "Profile",
  size = "md",
  editable = false,
  userId,
  onAvatarUpdate,
}: ProfileAvatarProps) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-16 w-16"
  };

  const displayAvatarUrl = avatarUrl || (userId ? generateDefaultAvatar(userId) : "");

  const handleAvatarClick = () => {
    if (editable && userId) {
      setShowAvatarPicker(true);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    onAvatarUpdate?.(url);
    setShowAvatarPicker(false);
  };

  return (
    <>
      <div className="relative group">
        <Avatar 
          className={`${sizeClasses[size]} ${editable ? 'cursor-pointer' : ''}`}
          onClick={handleAvatarClick}
        >
          <AvatarImage src={displayAvatarUrl} alt={imageAlt} />
          <AvatarFallback>{imageAlt.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        {editable && (
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs">Edit</span>
          </div>
        )}
      </div>

      {showAvatarPicker && userId && onAvatarUpdate && (
        <AvatarPicker
          isOpen={showAvatarPicker}
          onClose={() => setShowAvatarPicker(false)}
          userId={userId}
          onAvatarUpdate={handleAvatarUpdate}
          currentAvatarUrl={displayAvatarUrl}
        />
      )}
    </>
  );
}
