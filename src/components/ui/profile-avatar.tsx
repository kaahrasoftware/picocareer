import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageCropDialog } from "@/components/profile-details/ImageCropDialog";
import type { Crop } from 'react-image-crop';

interface ProfileAvatarProps {
  avatarUrl: string | null;
  fallback: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onAvatarUpdate?: (url: string) => void;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-24 h-24"
};

const borderClasses = {
  sm: "border-2",
  md: "border-2",
  lg: "border-4"
};

export function ProfileAvatar({ 
  avatarUrl, 
  fallback, 
  size = "md", 
  editable = false,
  onAvatarUpdate 
}: ProfileAvatarProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 100, height: 100, x: 0, y: 0 });
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Get current user to check permissions
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  });

  // Get user role to check if admin
  const { data: userRole } = useQuery({
    queryKey: ['user-role', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', currentUser.id)
        .single();
      if (error) throw error;
      return data?.user_type;
    },
    enabled: !!currentUser?.id,
  });

  const canEdit = editable && (
    currentUser?.id === fallback || // User is editing their own avatar
    userRole === 'admin' // User is an admin
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleImageLoad = (img: HTMLImageElement) => {
    setImageRef(img);
  };

  const handleSave = async () => {
    if (!imageRef || !selectedImage || !currentUser) {
      return;
    }

    try {
      setUploading(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = imageRef.naturalWidth / imageRef.width;
      const scaleY = imageRef.naturalHeight / imageRef.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        imageRef,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 1);
      });

      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      const fileExt = 'jpg';
      const filePath = `${currentUser.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (onAvatarUpdate) {
        onAvatarUpdate(publicUrl);
      }

      setSelectedImage(null);
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
      <div className={cn(
        "rounded-full overflow-hidden",
        sizeClasses[size],
        borderClasses[size],
        "bg-gradient-to-br from-blue-900 to-blue-700"
      )}>
        <img
          src={avatarUrl || "/placeholder.svg"}
          alt="Profile"
          className="w-full h-full object-cover"
        />
        {canEdit && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-full">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <Upload className="w-6 h-6 text-white" />
          </label>
        )}
      </div>
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <ImageCropDialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
        selectedImage={selectedImage}
        crop={crop}
        onCropChange={setCrop}
        onImageLoad={handleImageLoad}
        onSave={handleSave}
        uploading={uploading}
      />
    </div>
  );
}