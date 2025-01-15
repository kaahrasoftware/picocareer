import { useState } from "react";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  profileId: string;
}

export function ProfileAvatar({ 
  avatarUrl, 
  size = "md", 
  editable = false,
  profileId
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24"
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const fileName = `${profileId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId);

      if (updateError) {
        throw updateError;
      }

      // Invalidate and refetch profile queries
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['profile', profileId] });

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
  };

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
        <img
          src={avatarUrl || "/placeholder.svg"}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      {editable && (
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Camera className="w-6 h-6 text-white" />
        </label>
      )}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}