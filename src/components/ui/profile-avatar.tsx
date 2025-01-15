import { useState, useCallback } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProfileAvatarProps {
  avatarUrl: string | null | undefined;
  profileId?: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onAvatarUpdate?: (url: string) => void;
}

export function ProfileAvatar({
  avatarUrl,
  profileId,
  size = "md",
  editable = false,
  onAvatarUpdate
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24"
  };

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      if (!profileId) {
        throw new Error('Profile ID is required for avatar upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profileId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId);

      if (updateError) {
        throw updateError;
      }

      // Update local state immediately
      setCurrentAvatarUrl(publicUrl);
      
      if (onAvatarUpdate) {
        onAvatarUpdate(publicUrl);
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [profileId, onAvatarUpdate, toast]);

  return (
    <div className="relative group">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={currentAvatarUrl || "/placeholder.svg"} alt="Profile" />
        <AvatarFallback>
          {currentAvatarUrl ? "Loading..." : "?"}
        </AvatarFallback>
      </Avatar>
      {editable && (
        <>
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity"
          >
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Camera className="h-5 w-5 text-white" />
          </label>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}