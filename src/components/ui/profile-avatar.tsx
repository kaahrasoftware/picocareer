import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onAvatarUpdate?: (url: string) => void;
}

export function ProfileAvatar({ 
  avatarUrl, 
  size = "md", 
  editable = false,
  onAvatarUpdate 
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24"
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

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

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) {
        throw updateError;
      }

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
  };

  return (
    <div className="relative group">
      <Avatar className={`${sizeClasses[size]} border-2 border-primary`}>
        <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Profile" />
        <AvatarFallback>
          {avatarUrl ? "Loading..." : "No Image"}
        </AvatarFallback>
      </Avatar>
      
      {editable && (
        <label 
          className={`
            absolute inset-0 flex items-center justify-center 
            bg-black/50 opacity-0 group-hover:opacity-100 
            rounded-full cursor-pointer transition-opacity
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </label>
      )}
    </div>
  );
}