
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileAvatarProps {
  avatarUrl?: string;
  imageAlt?: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onChange?: (file: File) => void;
  userId?: string;
  onAvatarUpdate?: (url: string) => void;
  onEditClick?: () => void;
  isAdmin?: boolean;
}

export function ProfileAvatar({ 
  avatarUrl = "", 
  imageAlt = "", 
  size = "md", 
  editable = false,
  onChange,
  userId,
  onAvatarUpdate,
  onEditClick,
  isAdmin = false
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  const getFirstLetter = () => {
    if (!imageAlt) return 'U';
    return typeof imageAlt === 'string' && imageAlt.length > 0 ? imageAlt[0].toUpperCase() : 'U';
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      if (onChange) {
        onChange(file);
        setUploading(false);
        return;
      }
      
      if (!userId) {
        throw new Error('User ID is required for avatar upload');
      }

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

      // If admin is updating someone else's profile
      if (isAdmin) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Regular user updating their own profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }
      }

      if (onAvatarUpdate) {
        onAvatarUpdate(publicUrl);
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl} alt={imageAlt} />
        <AvatarFallback>{getFirstLetter()}</AvatarFallback>
      </Avatar>
      
      {editable && (
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-full">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
          <Upload className="w-4 h-4 text-white" />
        </label>
      )}
      
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
