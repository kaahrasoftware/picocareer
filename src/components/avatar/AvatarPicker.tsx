
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { generateAvatarForType, getAvailableAvatarTypes, type DefaultAvatarType } from "@/utils/avatarGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
}

export function AvatarPicker({ 
  open, 
  onOpenChange, 
  userId, 
  currentAvatarUrl,
  onAvatarUpdate 
}: AvatarPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<DefaultAvatarType | null>(null);
  const { toast } = useToast();

  const avatarTypes = getAvailableAvatarTypes();

  const handleDefaultAvatarSelect = async (type: DefaultAvatarType) => {
    setSelectedType(type);
    const avatarUrl = generateAvatarForType(userId, type);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarUrl,
          avatar_type: 'default'
        })
        .eq('id', userId);

      if (error) throw error;

      onAvatarUpdate(avatarUrl);
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
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
        .update({ 
          avatar_url: publicUrl,
          avatar_type: 'uploaded'
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      onAvatarUpdate(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Upload Custom Image */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Upload Custom Image</h3>
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
              </div>
            </label>
          </div>

          {/* Default Avatar Options */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Choose a Default Avatar</h3>
            <div className="grid grid-cols-4 gap-3">
              {avatarTypes.map((type) => {
                const avatarUrl = generateAvatarForType(userId, type);
                return (
                  <button
                    key={type}
                    onClick={() => handleDefaultAvatarSelect(type)}
                    className={`p-2 rounded-lg border-2 transition-colors hover:bg-gray-50 ${
                      selectedType === type ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={avatarUrl}
                      alt={`${type} avatar`}
                      className="w-full h-16 object-cover rounded"
                    />
                    <p className="text-xs mt-1 capitalize">{type.replace('-', ' ')}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
