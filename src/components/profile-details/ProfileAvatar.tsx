import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
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

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        1
      );
    });
  };

  const handleSaveAvatar = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImage();
      await onAvatarUpdate(croppedBlob);
      setCropDialogOpen(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error saving avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="relative w-20 h-20 group">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-picocareer-primary to-picocareer-secondary" />
      <div className="absolute inset-[3px] rounded-full bg-background" />
      <div className="absolute inset-[3px] rounded-full overflow-hidden">
        <Avatar className="h-full w-full">
          <AvatarImage 
            src={profile.avatar_url || ''} 
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

      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative max-h-[500px] overflow-auto">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  src={selectedImage}
                  alt="Crop preview"
                  onLoad={(e) => setImageRef(e.currentTarget)}
                />
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCropDialogOpen(false);
                setSelectedImage(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAvatar} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
