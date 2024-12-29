import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { processImage } from "@/utils/imageProcessing";

interface ProfileAvatarProps {
  profile: {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
  } | null;
  onAvatarUpdate: (blob: Blob) => Promise<void>;
}

export function ProfileAvatar({ profile, onAvatarUpdate }: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null);
  const { toast } = useToast();

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    try {
      setUploading(true);
      
      // Process the image (resize/compress if needed)
      const processedBlob = await processImage(file);
      
      // Create a temporary URL for instant preview
      const tempUrl = URL.createObjectURL(processedBlob);
      setPreviewUrl(tempUrl);
      
      await onAvatarUpdate(processedBlob);
      
      // Clean up the temporary URL after successful upload
      URL.revokeObjectURL(tempUrl);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
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
    </div>
  );
}