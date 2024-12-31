import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { processImage } from "@/utils/imageProcessing";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  onAvatarUpdate?: (blob: Blob) => Promise<void>;
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-20 w-20",
  xl: "h-24 w-24",
};

export function ProfileAvatar({ 
  avatarUrl, 
  fallback, 
  size = "md",
  editable = false,
  onAvatarUpdate,
  className = ""
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const { toast } = useToast();

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !onAvatarUpdate) return;
    
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
      setPreviewUrl(avatarUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative group ${sizeClasses[size]} ${className}`}>
      {editable && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-picocareer-primary to-picocareer-secondary" />
      )}
      {editable && (
        <div className="absolute inset-[3px] rounded-full bg-background" />
      )}
      <div className={`${editable ? "absolute inset-[6px]" : ""} rounded-full overflow-hidden`}>
        <Avatar className="h-full w-full">
          <AvatarImage 
            src={previewUrl || ''} 
            alt={fallback}
            className="h-full w-full object-cover"
          />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
      </div>
      
      {editable && onAvatarUpdate && (
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
      )}
    </div>
  );
}