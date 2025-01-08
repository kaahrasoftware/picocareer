import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileAvatarProps {
  avatarUrl: string | null;
  fallback: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  userId?: string;  // Made optional
  onAvatarUpdate?: (url: string) => void;
}

export function ProfileAvatar({ 
  avatarUrl, 
  fallback, 
  size = "md", 
  editable = false,
  userId,
  onAvatarUpdate 
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Validate required props when editable is true
  if (editable && (!userId || !onAvatarUpdate)) {
    console.error('userId and onAvatarUpdate are required when editable is true');
    return null;
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-24 w-24"
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!userId || !onAvatarUpdate) return;
      
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}.${fileExt}`;

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
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      onAvatarUpdate(publicUrl);
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
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl || undefined} alt="Profile picture" />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      {editable && (
        <>
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={uploadAvatar}
              disabled={uploading}
            />
            <Upload className="w-6 h-6 text-white" />
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