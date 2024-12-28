import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { type Crop } from 'react-image-crop';
import { useToast } from "@/hooks/use-toast";
import { ImageCropDialog } from "./ImageCropDialog";
import { processImage, MAX_FILE_SIZE } from "@/utils/imageProcessing";

interface ProfileAvatarProps {
  profile: {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
  } | null;
  onAvatarUpdate: (croppedBlob: Blob) => Promise<void>;
}

export function ProfileAvatar({ profile, onAvatarUpdate }: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null);
  const { toast } = useToast();
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const getCroppedImage = async (): Promise<Blob> => {
    if (!imageRef || !crop) {
      throw new Error('No image or crop data');
    }

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;
    
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      imageRef,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
    });

    return processImage(blob);
  };

  const handleSaveAvatar = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImage();
      
      // Create a temporary URL for instant preview
      const tempUrl = URL.createObjectURL(croppedBlob);
      setPreviewUrl(tempUrl);
      
      await onAvatarUpdate(croppedBlob);
      
      // Clean up the temporary URL after successful upload
      URL.revokeObjectURL(tempUrl);
      
      setCropDialogOpen(false);
      setSelectedImage(null);
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: "Error",
        description: "Failed to save profile picture. Please try again.",
        variant: "destructive",
      });
      // Revert to original avatar if update fails
      setPreviewUrl(profile?.avatar_url || null);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="relative w-20 h-20 group">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-picocareer-primary to-picocareer-secondary" />
      <div className="absolute inset-[3px] rounded-full bg-background" />
      <div className="absolute inset-[6px] rounded-full overflow-hidden">
        <Avatar className="h-full w-full">
          <AvatarImage 
            src={previewUrl || ''} 
            alt={profile.full_name || ''}
            className="h-full w-full object-cover"
          />
          <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
        </Avatar>
      </div>
      
      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
          disabled={uploading}
        />
        {uploading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-white" />
        )}
      </label>

      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        selectedImage={selectedImage}
        crop={crop}
        onCropChange={setCrop}
        onImageLoad={setImageRef}
        onSave={handleSaveAvatar}
        uploading={uploading}
      />
    </div>
  );
}